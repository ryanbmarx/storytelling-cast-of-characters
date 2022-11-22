#!/usr/bin/env node
/*
Update stored content by pulling from a Google Sheet
*/
const path = require("path");
const fs = require("fs/promises");
const functions = require("firebase-functions");

const { character, isValidCharacter } = require("./utils/character.js");
const { top } = require("./utils/top.js");
const { makeIndex, validate, auth, truthy } = require("./utils/utilities.js");

const settings = require("../settings.json");
const CAST_PROJECT = process.env.CAST_PROJECT || null;

process.env.GAPI_CLIENT_EMAIL =
	process.env.GAPI_CLIENT_EMAIL || functions.config().GAPI_CLIENT_EMAIL;
process.env.GAPI_PRIVATE_KEY =
	process.env.GAPI_PRIVATE_KEY || functions.config().GAPI_PRIVATE_KEY;

// For validating labels
const REQUIRED_LABEL_FIELDS = ["id", "name"];

// For validating the categories
const REQUIRED_CATEGORY_FIELDS = ["id", "name"];
const DEFAULT_CHARACTER_LAYOUT = "default";
const AVAILABLE_CHARACTER_LAYOUTS = new Set([
	DEFAULT_CHARACTER_LAYOUT,
	"medium",
	"wide",
	"card",
	"card_reverse",
	"card_side_by_side",
	"card_side_by_side_reverse",
]);

// SET OUR TIME ZONE
process.env.TZ = "US/Eastern";

const OUTPUT = path.join(__dirname, "data", "content.json");

// sheet callbacks, defined here so they're easier to change later
// each sheet gets passed to a function, which takes an array of rows
const SHEETS = {
	top,
	categories,
	labels,
};

/**
 *
 * Categories data doesn't need any processing, just validation. This validates the existence of required fields.
 *
 * @param {Array} categories The array of rows from the `categories` tab
 * @returns Same.
 */
function categories(categories, top, characters) {
	// BEGIN BY VALIDATING categories
	validate(categories, REQUIRED_CATEGORY_FIELDS, "categories");

	// REMOVE UNUSED CATEGORIES FROM THE MAIN LIST
	// -------------------------------------------

	// We will cycle through the categories one at a time.
	categories = categories.reduce((accumulator, current) => {
		// Search the characters one by one, looking for the first instance of the category being used
		for (let { category } of characters) {
			if (category === current.id) {
				// This character uses this category, so add it to our list
				accumulator.push(current);
				// Quit looping
				break;
			}
		}
		// Move on to the next category
		return accumulator;
	}, []);

	// MANAGE CHARACTER LAYOUTS/DEFAULT
	// --------------------------------

	// Nab the global character layout if it is configured.
	const { character_layout = "" } = top;

	for (let category of categories) {
		if (
			!category.character_layout ||
			!AVAILABLE_CHARACTER_LAYOUTS.has(category.character_layout)
		) {
			// If the layout is not set, or is set to something we don't support,
			// then set it to the global layout set in the top sheet. If that isn't
			// set, then use the default.
			category.character_layout = character_layout
				? character_layout
				: DEFAULT_CHARACTER_LAYOUT;
		}
	}
	return categories;
}

async function update(docId, cast_project, writeToFile = true) {
	if (!docId) return;

	// make sure we have a content directory
	await fs.mkdir(path.dirname(OUTPUT), { recursive: true });

	const goot = await auth();
	const data = await goot.parse.table(docId).catch(error => {
		console.error("!!! Gootenberg error: A blank spreadsheet tab will fail here.");
		console.error(error);
		process.exit();
	});

	const sheets = {};
	for (const [name, cb] of Object.entries(SHEETS)) {
		sheets[name] = await cb(data[name] || [], sheets.top, data.characters);
	}

	// Get our columns config
	let columns = data.columns || {};

	// Make an array of columns, if any, that should be full-text searchable
	// If no columns are selected, then this will be an empty array.
	sheets.top.searchable = columns.reduce((result, { searchable, column }) => {
		if (truthy(searchable, false)) result.push(column);
		return result;
	}, []);

	// Now run our character function
	// We'll do it here instead of using the handler function system
	// we set up earlier because characters are a special case with
	// particular needs.

	sheets.characters = await Promise.all(
		data.characters.filter(isValidCharacter).map(async c => {
			return await character(c, columns, sheets.top, sheets.labels);
		})
	);
	// Next, look for duplicate character IDs. This could mean duplicate rows, two different characters with
	// matching slugified names, or just a data entry error. This is important because duplicates will disrupt
	// filtering, which is based on unique IDs, and possible direct linking.
	sheets.characters = dedupeCharacters(sheets.characters);

	// Then, sort the characters. If a sort column is not configured, then the spreadsheet order will be used
	const { character_sort_by = null, character_sort_direction = "ascending" } =
		sheets.top;
	if (character_sort_by) {
		const ascending = character_sort_direction === "ascending";
		console.log(
			"++ Sorting by %s in %s order",
			character_sort_by,
			character_sort_direction
		);

		if (!isNaN(parseFloat(sheets.characters[0][character_sort_by]))) {
			// If the sorting value for the first character parses as a float, assume the sorting property is a number, such as rank
			sheets.characters = sheets.characters.sort((a, b) => {
				if (parseFloat(a[character_sort_by]) < parseFloat(b[character_sort_by])) {
					return ascending ? -1 : 1;
				}
				return ascending ? 1 : -1;
			});
		} else {
			// It looks like alphabetical sorting.
			sheets.characters = sheets.characters.sort((a, b) => {
				if (a[character_sort_by] < b[character_sort_by]) return ascending ? -1 : 1;
				return ascending ? 1 : -1;
			});
		}
	}

	// Note whether we are using images
	// Note: This will fail if there are no characters.
	// Next Note: If there are no characters, then a required column probably is missing and ALL characters are failing validation.
	try {
		// Iterate through all the characters until we find one with an image.
		sheets.top.hasImages = sheets.characters.reduce((acc, current) => {
			if (!acc) {
				acc = "image" in current;
			}
			return acc;
		}, false);
	} catch (e) {
		console.error(
			`Error checking for images. Are there any characters? Maybe there is a required column missing.`
		);
		console.error(e);
	}

	// Add  the  project slug for our analytics
	sheets.top.cast_project = cast_project;

	sheets.top.site_code = settings[CAST_PROJECT || cast_project].site_code;

	console.log(
		`++ Good news everybody: There are ${sheets.characters.length} total characters`
	);

	// We want to write to external file.
	if (writeToFile) {
		return fs.writeFile(OUTPUT, JSON.stringify(sheets, null, 2));
	}
	// We just want the data back
	return sheets;
}

/**
 *
 * Processes labels to ensure the list has all valid information and used in the list of characters
 *
 * @param {*} labels
 * @returns
 */
function labels(labels, top = {}, characters = []) {
	// Remove any labels that lack required information
	validate(labels, REQUIRED_LABEL_FIELDS, "labels");

	// Remove any labels from the main list that are not used in at least one character.
	const processedLabels = labels.reduce((accumulator, current) => {
		for (let character of characters) {
			if (character.labels && character.labels.indexOf(current.id) > -1) {
				// The id string is found, as a substring, within the list of labels.  Move on.

				//  Normalize to lower case.
				current.id = current.id.toLowerCase();
				accumulator.push(current);
				break;
			}
		}
		return accumulator;
	}, []);

	// Return a lookup of labels
	return makeIndex(processedLabels);
}

/**
 *	This function ensures each character ID is unique in the data. Duplicate IDs are flagged in the console,
 *	and adjusted to be unique the way I update my passwords: password-1, password-2, etc. Ultimately,
 *	most duplicate IDs will result from duplicate slugified names and should somehow be fixed there, for clarity's sake.
 *
 * @param {Array} characters An array of characters
 *
 * @returns {Array} The adjusted array
 */
function dedupeCharacters(characters = []) {
	// Sets are slightly quicker to reference than arrays. This will keep track of character IDs in use.
	const countedCharacters = new Set();

	// Cycle through each character.
	for (let char of characters) {
		// Check the id property. We assume there is one since the character processing adds one if missing.
		if (countedCharacters.has(char.id)) {
			// UH OH. This ID already is in ise
			console.warn(
				`!!!! POSSIBLE DUPLICATE ID: The character ID "${char.id}" appears in multiple characters.`
			);

			// make the character ID unique by appending a 1.
			let index = 1;
			let id = `${char.id}-${index}`;

			// In the event of multiple duplicates, count upward until
			// the resulting ID is not a duplicate.
			while (countedCharacters.has(id)) {
				index++;
				id = `${char.id}-${index}`;
			}

			// We've arrived at a unique ID. Use it.
			char.id = id;
		}

		// This ID is not in use, possibly because we've altered it. Add it to our watchlist.
		countedCharacters.add(char.id);
	}

	// One final check for duplicates. Any at this step will be very edge/weird because we've already checked for them.
	if (characters.length !== countedCharacters.size) {
		console.error("!!! There still is a duplicate character ID somewhere.");
	}

	return characters;
}

if (require.main === module) {
	// Make sure we have a project in out settings
	if (CAST_PROJECT in settings) {
		// get the spreadsheet key
		const { spreadsheet_key } = settings[CAST_PROJECT];

		console.log(`++ Updating ${CAST_PROJECT}`);
		// Update the data source
		update(spreadsheet_key, CAST_PROJECT).catch(console.error);
	} else {
		console.error(
			`!!! A Cast of Characters project should be specified with the CAST_PROJECT environment variable. Got: ${CAST_PROJECT}`
		);
	}
}

module.exports = { update };
