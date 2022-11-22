const { slugify, processText } = require("./utilities.js");
const { getMediaData } = require("./get-media-data.js");
const { getArticles } = require("./content-api.js");
const { getUtilityColors } = require("./colors.js");

const RESERVED_COLUMN_NAMES = new Set([
	"name",
	"bullets",
	"blurbs",
	"title",
	"description",
	"image_layout",
	"image",
	"thumbnail",
	"category",
	"labels",
	"rank",
	"id",
	"links",
	"kicker",
	"badge",
	"color_accent",
	"color_accent_text",
	"color_accent_screen",
	"color_accent_screen_text",
]);

const DEFAULT_LINK_TEXT = "More";

/**
 *
 * Processes one character.
 *
 * @param {Object} row A single row from the characters tab of the spreadsheet
 * @param {Array} columns The complete columns configuration tab
 * @param {Object} top The complete top tab
 * @param {Array} labels The complete labels configuration tab
 * @returns {Object} A fully-processed character object.
 */
async function character(row, columns = {}, top = {}, labels = {}) {
	const {
		searchable: searchableColumns,
		image_ratio,
		thumbnail_image_ratio,
		character_sort_by = null,
	} = top;

	// Anything not on this list will be deleted at the very end.
	//
	const columns_to_keep = [
		...Array.from(RESERVED_COLUMN_NAMES),
		...Array.from(searchableColumns),
		character_sort_by,
	];

	// Put all our keys to lower case, properly slugged
	row = Object.keys(row).reduce((acc, cur) => {
		acc[slugify(cur)] = row[cur];
		return acc;
	}, {});

	// Set a slugged ID base on name
	// Defer to what's in the spreadsheet, otherwise put one there.
	// This is needed for filtering. Let's slugify the sheet ID
	// to clean it up, in case it has bad characters, spaces, or something.
	row.id = slugify(row.id) || slugify(row.name);

	// Markdown for the description
	row.description = processText({ txt: row.description || "" });

	// Handle colors
	if (row.theme_color) row = processColors(row);

	// Our holders for the custom columns
	let bullets = [];
	let blurbs = [];
	let links = [];
	// Fill the custom column holders by looping through each column configuration at a time.
	for (c of columns) {
		// Deconstruct our column information
		const { column, type = "", header = "" } = c;

		// Only work on this column name/column if this character has something for it
		if (!!row[column]) {
			let text = "";
			// Handle the types of columns, and delete from the main data object
			switch (type.toLowerCase()) {
				case "text":
					// Our character names are h4s, so any subhedes should be h5s
					blurbs.push({
						header,
						text: processText({ txt: row[column] }),
					});
					break;
				case "bullet":
					// Add to our list of bullets with optional header as a bold lead-in
					bullets.push({
						header,
						text: processText({ txt: row[column], inline: true }),
					});
					break;
				case "link":
				case "relative_link":
					// This will be our link text
					let text = !!header ? header : DEFAULT_LINK_TEXT;
					try {
						// Try parsing the URL. If it works, then it is valid and should be used.
						let link = new URL(row[column]).toString();
						links.push({ link, text });
					} catch (e) {
						// Not a link. Must be a presto ID
						// If _this_ fails, then something else is wrong. Console that error.
						let info = await getArticles(row[column]).catch(console.error);
						if (info?.assets[0]?.pageURL?.long) {
							// If the story is unpublished, then it will not appear here and
							// `info` will be `null`. Only add it if we have a url
							// If the link type is `relative_link`, then we just want the
							// pathname so that people stay on their originating new property.
							const u = new URL(info.assets[0].pageURL.long);
							links.push({
								link: type.includes("relative") ? u.pathname : u.toString(),
								text,
							});
						}
					}
					break;
				case "badge":
					// If we want a badge, i.e. rankings, add it here. A badge takes no header.
					row.badge = row[column];
					break;
				case "kicker":
					// Add our  kicker to the data, with the header if one is configured.
					row.kicker = !!header ? `${header}: ${row[column]}` : row[column];
					break;
				case "title":
					// Add a title (really, it's more of a subtitle) to the mix
					row.title = !!header ? `${header}: ${row[column]}` : row[column];
					break;
			}
		}
	}

	// Add our bullets, blurbs, kickers and links if they have any.
	// Links will be limited to 6 total. This is an arbitrary guardrail.
	if (bullets.length > 0) row.bullets = bullets;
	if (blurbs.length > 0) row.blurbs = blurbs;
	if (links.length > 0) row.links = links.slice(0, 6);

	if (row.labels) {
		row.labels = row.labels
			.trim()
			.split(/;|,\s*/)
			.filter(l => l.length)
			.reduce((result, current) => {
				// Make sure each label is in our labels tab. Ignore anything not configured.
				current = current.toLowerCase();
				if (current in labels) {
					result.push(current);
				}
				return result;
			}, []);
	} else {
		row.labels = [];
	}
	if (row.image) {
		// Gather all the pieces for a well-formed image, including src, alt text and dimensions
		const { name, image_alt, image } = row;
		const { src, height, width, aspectRatio, alt } = await getMediaData({
			crop: image_ratio,
			image: image,
			alt: image_alt ? image_alt : `Photo of ${name}`,
		});
		row.image = { src, height, width, aspectRatio, alt };
	} else {
		delete row.image;
	}

	// Gather all the pieces for a well-formed image, including src, alt text and dimensions
	if (row.thumbnail) {
		const { name, thumbnail, thumbnail_alt } = row;
		row.thumbnail = await getMediaData({
			crop: thumbnail_image_ratio,
			image: thumbnail,
			alt: thumbnail_alt ? thumbnail_alt : `Photo of ${name}`,
		});
	} else {
		delete row.thumbnail;
	}

	// And now, finally, clean up the character by removing anything we don't need.
	// If it is empty/falsey or not a `column_to_keep` then it goes. This keeps the payload
	// as trim as possible.

	return Object.entries(row).reduce((a, [key, value]) => {
		if (columns_to_keep.includes(key) && !!value) {
			a[key] = value;
		}
		return a;
	}, {});
}

// Returns true if character meets all our minimum requirements.
function isValidCharacter(row = {}) {
	// We support a kind of "draft mode" where characters can be _in_
	// the `characters` tab but will not publish. This can be used to facilitate
	// incremental publishes (day 1, day 2, etc.) or draft/incomplete characters.
	// We will publish ANYTHING except draft. So everything else, even mispellings
	// of draft, get published
	const { publish_status = "publish" } = row;
	if (publish_status === "draft") return false;

	// Right now, just needs a name. Everything else is optional
	if (row.name === undefined) {
		console.error("!! INVALID CHARACTER: There is no name");
		console.error(row);
		return false;
	}

	// It's all good.
	return true;
}

/**
 *
 * @param {Object} row A character row
 * @returns {Object} Three css hex values for the color, a suitab;e BG screen and a suitable text color
 */
function processColors(row = {}) {
	const { theme_color = null } = row;

	// No color is defined. Skip this.
	if (!theme_color) return row;

	const { main, screen, main_text, screen_text } = getUtilityColors(theme_color);
	return {
		...row,
		color_accent: main,
		color_accent_text: main_text,
		color_accent_screen: screen,
		color_accent_screen_text: screen_text,
	};
}

module.exports = { character, isValidCharacter };
