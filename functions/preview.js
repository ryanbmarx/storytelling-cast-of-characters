#!/usr/bin/env node
/*
Generate a preview index.html for local dev
*/
require = require("esm")(module);
require("svelte/register");

const path = require("path");
const fs = require("fs/promises");
const minify = require("html-minifier").minify;
const App = require("../src/App.svelte").default;
const { getUtilityColors } = require("./utils/colors.js");

const CONTENT = path.join(__dirname, "data", "content.json");
const OUTPUT = path.join(__dirname, "..", "public", "index.html");

// Change protocol and port to match your environment, then `make preview`
const INDEPTH_PATH = `https://localhost:8443/static/`;

async function preview() {
	const content = await fs.readFile(CONTENT).then(JSON.parse);

	const template = await fs.readFile(path.join(__dirname, "template.html"), {
		encoding: "utf-8",
	});

	const indepthCSS = content.top.next_story_id
		? `<link rel=\"stylesheet\" href=\"${INDEPTH_PATH}css/in-depth/base.css\" />`
		: "";

	const indepthJS = content.top.next_story_id
		? `<script defer src=\"${INDEPTH_PATH}in-depth.js\"></script>`
		: "";

	return template
		.replace("%title%", content.top.title)
		.replace("%html%", renderHTML({ content }))
		.replace("%indepthcss%", indepthCSS)
		.replace("%indepthjs%", indepthJS);
}

async function main() {
	const html = await preview();

	return fs.writeFile(OUTPUT, html);
}

/**
 * One function to render all of the HTML we would want for an initial state.
 * It's good for both SSR and preview rendering
 *
 * @param {Object} options
 * @param {Object} options.content | The fully processed data blob with options and content defined.
 * @returns {String} The complete app content as a string of rendered HTML, rendered in the pageload state
 */
function renderHTML({ content = {} }) {
	const {
		theme_color = "#009bff",
		background_color = "#ffffff",
		theme_color_text,
		image_ratio,
		required_status,
	} = content.top;

	let contentString = JSON.stringify(content);

	console.log(
		"++ This project is for %s readers. Rendering it as %s.",
		required_status,
		required_status === "any" ? "free" : "roadblocked"
	);

	// Get our HTML rendered in the roadblocked state
	// If it is set to no CPS, then true, otherwise, not.
	const { html } = App.render({
		meets_required_status: required_status === "any",
		...content,
	});

	// HANDLE COLORS
	let styles = [];
	const { main, screen, main_text, screen_text } = getUtilityColors(theme_color);

	// Put our theme color variations on the main container
	styles.push(`--color-accent:${main}`);
	if (theme_color_text) {
		styles.push(`--color-accent-text:${theme_color_text}`);
	} else {
		// FIND THEME COLOR TEXT, if not set.
		styles.push(`--color-accent-text:${main_text}`);
	}
	styles.push(`--color-accent-screen:${screen}`);
	styles.push(`--color-accent-screen-text:${screen_text}`);

	if (background_color) styles.push(`--color-background:${background_color}`);

	if (image_ratio) {
		// Set our CSS variables for photo ratio, defaulting to 16x9 in the event of bestCrop (i.e. ratio is unset)
		let [width = 16, height = 9] = image_ratio.split("_");
		if (width === "bestCrop") width = 16;
		styles.push(`--image-ratio-height: ${height}`);
		styles.push(`--image-ratio-width: ${width}`);
	}

	return minify(
		`<div id="cast" style="${styles.join(
			";"
		)}">${html}</div><script type="application/json" id="cast-of-characters-data">${contentString}</script>`,
		{
			minifyCSS: true,
			minifyJS: true,
			collapseWhitespace: true,
		}
	);
}

if (require.main === module) {
	main().catch(console.error);
}

module.exports = { preview, renderHTML };
