const Gootenberg = require("gootenberg");
const cheerio = require("cheerio");
const marked = require("marked");

/*
Index rows by key
*/
function makeIndex(rows = [], key = "id") {
	return rows.reduce((m, d) => {
		m[d[key]] = d;
		return m;
	}, Object.create(null));
}

/*
Turn a sheet with key and value columns into a key-value object
*/
function kv(rows = []) {
	return rows.reduce((m, d) => {
		if (d.value && d.value != "") m[d.key] = d.value;
		return m;
	}, Object.create(null));
}

/**
 *
 * Takes an array of rows and an array of required fields. Each required field is confirmed in each row, or else a fatal error is thrown.
 * @param {array} rows
 * @param {array} required
 * @param {string} identifier
 * @returns Nothing
 */
function validate(rows, required, identifier = "") {
	console.log(`++ Validating ${identifier}`);

	// For each row ...
	for ([index, row] of Object.entries(rows)) {
		// ... for each required field ...
		for (let field of required) {
			// ... and stop everything with a helpful error if anything is missing
			if (!row[field]) {
				throwError(
					"1",
					`!!! ${identifier} index No. ${index} is missing or has invalid \`${field}\``
				);
			}
		}
	}
}

/**
 *
 * This function throws a fatal error (to stop the build process) and sends a message to MSFT Teams
 *
 * @param {String} exitCode | The node exit code we want. Non-zero should be fatal to processes
 * @param {String} text | The error text
 */
function throwError(exitCode = "1", text = "") {
	process.exitCode = exitCode; // Set the exit code to prevent future calls.
	if (text) throw text; // Scream real loud!
	// TODO: Ping teams.
}

async function auth() {
	const goot = new Gootenberg();
	return goot.auth.jwt();
}

/**
 *
 * @param {*} val A value to be coerced from vernacular English into a javascript boolean value.
 * @param {boolean} def The default value (true or false) if a boolean cannot be determined. Defaults to false.
 *
 * @returns {boolean} an acutal boolean, true or false
 */
function truthy(val = "", def = false) {
	const bools = {
		false: false,
		no: false,
		n: false,
		true: true,
		yes: true,
		y: true,
	};

	// If it already is a boolean, then return it.
	if (val === true || val === false) return val;

	// If we account for it in our list, then use that value
	if (val.toLowerCase() in bools) return bools[val.toLowerCase()];

	return def;
}

/**
 *	Util function that takes a string and makes it a nice, slugified version. To do this, we:
	- split the words, then join on hyphens
	- make it lower case
	- pull punctuation
 * 
 * @param  {String} words A string with as many words as you want.
 * @returns {String} Slugified version of `words`
 */
function slugify(words = null) {
	if (!words) return;
	let slug = words
		.trim()
		.split(" ")
		.join("-") // Effective replaces all whitespace with dashes
		.toLowerCase()
		.replace(/[^a-z0-9-_]/g, "") // Deletes all non alphanumeric characters, except dashes and underscores
		.replace(/^-|-$|^_|_$/, ""); // Deletes any leading or trailing dashes or underscores
	return slug;
}

/**
 * Renders a stirng of text as markdown (which includes straight-up HTML). As a utility,
 * forces all anchor links to open in a new window and adds the proper rels.
 *
 * @param {string} txt A string of text, potentially with markdown or HTML
 */

function processText({ txt, inline = false, smartypants = true }) {
	// Enable smart quotes
	marked.setOptions({
		smartypants,
	});

	// Run it through markdown, optionally omitting the block elements, like header or <p> tags
	let processedText = inline ? marked.parseInline(txt) : marked.parse(txt);
	// Make all the links open in new tabs
	processedText = makeLinksNewWindow(processedText);
	// Remove newlines because they don't matter in HTML and will make tests easier.
	return processedText.replace(/\n/g, "");
}

// Scrapes a string of HTML and makes the anchor links all open in new windows.
function makeLinksNewWindow(txt) {
	const $ = cheerio.load(txt, {}, false);

	const links = $("a");

	// Bail since we have no links to worry about.
	if (links.length < 1) return txt;

	links.each(function () {
		let rel = $(this).attr("rel") || "";
		// Make it an array
		rel = rel.split(" ");
		// Add the things we want to the array
		rel.push("noopener", "noreferrer");
		// Flatten and dedupe our array of rel values
		rel = Array.from(new Set(rel));
		// Set our attributes
		$(this).attr("rel", rel.join(" ").trim());
		$(this).attr("target", "_blank");

		$(this).addClass("cast-inline-link");
	});
	return $.html();
}

module.exports = { kv, makeIndex, validate, auth, truthy, slugify, processText };
