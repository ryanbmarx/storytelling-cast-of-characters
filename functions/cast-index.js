#!/usr/bin/env node
/*
Update stored content by pulling from a Google Sheet
*/
const path = require("path");
const fetch = require("node-fetch");
const fs = require("fs/promises");
const functions = require("firebase-functions");
const { auth, truthy } = require("./utils/utilities.js");
const { update } = require("./update.js");
const { format } = require("date-fns-tz");

console.log = () => {}; // Suppress the logging from the spreadsheet updating

// This is a clock
const RECENT_PROJECT_ICON = "&#128337;";

process.env.GAPI_CLIENT_EMAIL =
	process.env.GAPI_CLIENT_EMAIL || functions.config().GAPI_CLIENT_EMAIL;
process.env.GAPI_PRIVATE_KEY =
	process.env.GAPI_PRIVATE_KEY || functions.config().GAPI_PRIVATE_KEY;

// SET OUR TIME ZONE
process.env.TZ = "US/Eastern";

// The main google spreadsheet
// https://docs.google.com/spreadsheets/d/113MVUEgFYh89M1OIR5oWDs5eQ-tXRzr4sQp3iD8L5jc/edit#gid=967841973
const INDEX_SPREADSHEET_KEY = "113MVUEgFYh89M1OIR5oWDs5eQ-tXRzr4sQp3iD8L5jc";
const SETTINGS = path.join(__dirname, "../settings.json");

// FOR UNIFYING OUR LABELS.
const LABELS = {
	// CPS
	PREMIUM: "cps-premium",
	FREE: "cps-free",
	REGISTERED: "cps-registered",

	// LAYOUTS
	LAYOUT_CARD: "layout-card",
	LAYOUT_WIDE: "layout-wide",
	LAYOUT_MEDIUM: "layout-medium",
	LAYOUT_DEFAULT: "layout-default",

	// ORGANIZATION
	ORGANIZATION_LABELS: "labels",
	ORGANIZATION_CATEGORIES: "categories",
	ORGANIZATION_BADGES: "badges",
	ORGANIZATION_NONE: "no-controls",
};

// if we run this from the command line like so, then it will update everything:
// `FORCE="true" node ./functions/cast-index.js`
const FORCE_UPDATE = truthy(process.env.FORCE, false);

// A function that collects all the details about each Cast project and updates a spreadsheet.
async function makeIndex() {
	console.log("MAKING INDEX");
	const [goot, settings] = await Promise.all([
		auth(),
		fs.readFile(SETTINGS, { encoding: "utf8" }).then(JSON.parse),
	]);

	const { characters } = await goot.parse
		.table(INDEX_SPREADSHEET_KEY)
		.catch(console.error);

	const existingProjectData = characters.reduce((acc, current) => {
		acc[current.project_slug] = current;
		return acc;
	}, {});

	// To update a spreadsheet, Google's API wants an array of arrays:
	// [
	// 	[Row1ColumnA, Row1ColumnB, Row1ColumnC],
	// 	[Row2ColumnA, Row2ColumnB, Row2ColumnC],
	// 	[Row3ColumnA, Row3ColumnB, Row3ColumnC],
	// ]
	const projects = [];
	// Cycle through each configured project ...
	for (const [project_slug, details] of Object.entries(settings)) {
		// Skip our index. That's a bit too Inception-esque.
		if (project_slug === "cast-of-characters-index") continue;

		console.debug(`--------------------------------------------`);
		console.debug(`+++++ INDEXING ${project_slug.toUpperCase()}`);

		// Get the initial details
		const {
			spreadsheet_key,
			slug,
			canonical_override = null,
			domain = "usatoday.com",
			private = "false",
		} = details;

		// These are the details we want for each project
		let values = [];

		// Format our preprod URL
		const preprod_url = `https://preprod-uw.${domain}/storytelling/qa/grid/${slug}/`;

		// The production UW response
		const nextStorySource = `https://www.gannett-cdn.com/usat-storytelling/grid/production/uw/${slug}.json`;

		// We're going to use labels in our cast of characters. Let's make an array of them.
		const castLabels = [];

		// Get the latest UW response. if it exists, then we consider this published. If it fails then we consider it unpublished
		const isPublished = await fetch(nextStorySource)
			.then(d => d.json())
			.catch(e => {
				console.error(`!! ${project_slug} appears to be unpublished`);
			});

		// If the story is unpublished and marked private, skip.
		if (!isPublished && truthy(private)) {
			console.debug(`++ ${project_slug} is unpublished and marked private. Skipping.`);
			continue;
		}

		// The modified date from the UW response, just YYYY-MM-DD. If there is no published response, then
		// just go with null so we can do some logic with it.
		const publishedModified = isPublished
			? new Date(/\d{4}-\d{2}-\d{2}/.exec(isPublished.jsonld.dateModified)[0])
			: null;

		// The modified date as noted in the spreadsheet, also normalized to just the date
		const spreadSheetModified = new Date(
			existingProjectData[project_slug].updated_for_humans
		);

		spreadSheetModified.setHours(0);
		spreadSheetModified.setMinutes(0);
		spreadSheetModified.setSeconds(0);

		// If all of these are true:
		// - It's published
		// - The modified date in the published response is NOT more recent than what is in the spreadsheet
		// - We are not forcing an update
		// Then:  Use what we already have.
		if (publishedModified && spreadSheetModified > publishedModified && !FORCE_UPDATE) {
			console.debug(`Using existing data for ${project_slug}`);

			// USe our existing values
			values = Object.values(existingProjectData[project_slug]);

			// Update the recent icon
			values[14] = isRecent(isPublished.jsonld.datePublished)
				? RECENT_PROJECT_ICON
				: "";

			projects.push(Object.values(existingProjectData[project_slug]));
		} else {
			console.debug(`Refreshing data for ${project_slug}`, {
				publishedModified,
				spreadSheetModified,
			});

			// Generate the data for a cast:
			const {
				top = {},
				characters = [],
				labels = {},
				categories = [],
			} = await update(spreadsheet_key, project_slug, false).catch(console.error);

			// Ensure we have a updated
			if (!top.updated) top.updated = Date.now();

			// 	/*
			// 	Start adding things to the project details. The items need to be in the same order as the columns in the spreadsheet, so:
			// 		[
			// 			headline,
			// 			domain,
			// 			slug,
			// 			meta description,
			//			image,
			// 			preprod url,
			// 			production url,
			// 			spreadsheet url,
			// 			nextStorySource url,
			// 			category id,
			// 			pub date in machine format,
			// 			pub date in human format,
			// 			modified date in machine format,
			// 			modified date in human format,
			//			Do we consider this a _recent_?,
			// 			list of labels as single string CSV list (will come later in this process)
			// 		]
			// 	*/

			// Get the prod url for published casts
			values.push(
				...[
					isPublished
						? isPublished.meta.headline
						: top.headline || top.title || "Headline TK",
					domain,
					project_slug,
					top.description || "Description TK",
					top.share_image || "",
					preprod_url,
					isPublished ? isPublished.meta.url : "",
					nextStorySource,
					`https://docs.google.com/spreadsheets/d/${spreadsheet_key}/`,
					isPublished ? "published" : "unpublished",
					isPublished
						? new Date(isPublished.jsonld.datePublished).getTime()
						: new Date().getTime(),
					isPublished ? formattedDate(isPublished.jsonld.datePublished) : "",
					isPublished
						? new Date(isPublished.jsonld.dateModified).getTime()
						: new Date(top.updated).getTime(),
					isPublished
						? formattedDate(isPublished.jsonld.dateModified)
						: formattedDate(top.updated),
					isPublished && isRecent(isPublished.jsonld.datePublished)
						? RECENT_PROJECT_ICON
						: "",
				]
			);

			// --------------------
			// LABELS!

			let noOrganizationalTechniques = true;

			// Do we use badges?
			const usesBadges = characters.reduce((accumulator, current) => {
				return accumulator || current.badge;
			}, false);
			if (usesBadges) {
				noOrganizationalTechniques = false;
				castLabels.push(LABELS.ORGANIZATION_BADGES);
			}
			// Do we use categories
			if (categories.length) {
				noOrganizationalTechniques = false;
				castLabels.push(LABELS.ORGANIZATION_CATEGORIES);
			}

			// Do we use labels
			if (Object.entries(labels).length) {
				noOrganizationalTechniques = false;
				castLabels.push(LABELS.ORGANIZATION_LABELS);
			}

			// Do we use nothing at all?
			if (noOrganizationalTechniques) castLabels.push(LABELS.ORGANIZATION_NONE);

			// Check premium status and add to labels array
			switch (top.required_status) {
				case "subscriber":
					castLabels.push(LABELS.PREMIUM);
					break;
				case "registered":
					castLabels.push(LABELS.REGISTERED);
					break;
				case "any":
					castLabels.push(LABELS.FREE);
					break;
			}

			// Get the layout
			switch (top.character_layout) {
				case "medium":
					castLabels.push(LABELS.LAYOUT_MEDIUM);
					break;
				case "wide":
					castLabels.push(LABELS.LAYOUT_WIDE);
					break;
				case "card":
				case "card_reverse":
				case "card_side_by_side":
				case "card_side_by_side_reverse":
					castLabels.push(LABELS.LAYOUT_CARD);
					break;
				default:
					castLabels.push(LABELS.LAYOUT_DEFAULT);
			}

			// Add our labels to the array
			values.push(castLabels.join(","));

			// Add the project the spreadsheet
			projects.push(values);
		}
	}

	// Now, update the spreadsheet
	updateSpreadsheet(goot, projects);
}

async function updateSpreadsheet(goot, projects) {
	try {
		// CLEAR THE CHARACTERS TAB
		// Delete row 2 through a very large number of rows.
		// Google API can't just do "everything after the first row"
		// so we need to provide an explicit range
		const { clear } = await goot.sheetsAPI.spreadsheets.values.clear({
			auth: goot.client,
			spreadsheetId: INDEX_SPREADSHEET_KEY,
			range: "characters!2:500000",
			resource: {},
		});

		// Put our fresh data in the spreadsheet;
		const { data } = await goot.sheetsAPI.spreadsheets.values.append({
			auth: goot.client,
			spreadsheetId: INDEX_SPREADSHEET_KEY,
			range: `characters!2:${projects.length + 1}`,
			insertDataOption: "INSERT_ROWS",
			valueInputOption: "RAW",
			resource: {
				majorDimension: "ROWS",
				values: projects,
			},
		});
	} catch (e) {
		console.error(e);
	}
}

/**
 *
 * Returns `true` if the date provided is within `days` days of now.
 *
 * @param {Date|String} published A pub date for a cast in machine-parseable format.
 * @param {Number} days The time gap you want
 * @returns {Boolean}
 */
function isRecent(published = null, days = 7) {
	if (!published) return;

	//					NOW - 		PUB / 					H   M     S   MS
	const timeDiff = (Date.now() - new Date(published)) / (24 * 60 * 60 * 1000);

	return timeDiff >= 0 && timeDiff <= days;
}

// Gives a nice, mostly AP style to dates
function formattedDate(d) {
	d = new Date(d);

	const AP_MONTHS = [
		"Jan.",
		"Feb.",
		"March",
		"April",
		"May",
		"June",
		"July",
		"Aug.",
		"Sept.",
		"Oct.",
		"Nov.",
		"Dec.",
	];
	const DATE_FORMAT = "d, yyyy";
	const TIME_FORMAT = "h:mm aa zzz";

	let date = format(d, DATE_FORMAT);
	let time = format(d, TIME_FORMAT);
	let month = AP_MONTHS[d.getMonth()];

	let formatted = `${time}, ${month} ${date}`;

	return formatted;
}

if (require.main === module) {
	makeIndex().catch(console.error);
}

module.exports = { makeIndex };
