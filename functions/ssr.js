#!/usr/bin/env node
require = require("esm")(module);
require("svelte/register");
const fs = require("fs/promises");
const path = require("path");
const UW = require("./utils/uw.js");
const App = require("../src/App.svelte").default;
const { renderHTML } = require("./preview.js");

const settings = require("../settings.json");
const { json_ld } = require("./utils/json-ld.js");
const { justGetPhotoURL } = require("./utils/get-media-data.js");

const TARGETS = {
	staging: "dev",
	dev: "dev",
	preprod: "production",
	preview: "production",
	production: "production",
	master: "production",
	main: "production",
};

// A lookup for taking required_status and turning it into a `contentProtectionStatus` suitable for Gannett's Google Analytics CD27
const CONTENT_PROTECTION_STATES = {
	subscriber: "premium",
	registered: "free",
	metered: "metered",
	any: "free",
};

const CONTENT = path.join(__dirname, "data", "content.json");

async function render({
	target = "staging",
	domain = "usatoday.com",
	slug = "",
	site_code = "",
	twitter = "",
	canonical_override,
}) {
	const t = TARGETS[target] || TARGETS.staging;
	const ASSET_PATH = `https://www.gannett-cdn.com/usat-storytelling/grid/${t}/`;
	const INDEPTH_PATH = `https://www.gannett-cdn.com/usat-storytelling/lab-microservices-master/static/`;

	const content = await fs.readFile(CONTENT).then(JSON.parse);

	console.log(`++ Rendering UW response for ${content.top.cast_project} (${target})`);

	// Get our metadata
	const top = content.top || {};

	// CPS
	const contentProtectionState =
		CONTENT_PROTECTION_STATES[top.required_status] || "free";

	const scripts = [
		{
			type: "text/javascript",
			src: new URL(`bundle.js?t=${Date.now()}`, ASSET_PATH),
			defer: "defer",
		},
	];

	if (top.display_ads) {
		scripts.push({
			async: "async",
			type: "text/javascript",
			id: "advertisement-library",
			src: `https://www.gannett-cdn.com/ads/scripts/framework/basic.min.js`,
		});
	}

	const styles = [
		new URL(`bundle.css?t=${Date.now()}`, ASSET_PATH),
		new URL(`global.css?t=${Date.now()}`, ASSET_PATH),
	];

	// check for next story
	if (content.top.next_story_id) {
		styles.push(new URL(`css/in-depth/base.css?t=${Date.now()}`, INDEPTH_PATH));
		scripts.push({
			defer: "defer",
			type: "text/javascript",
			src: new URL(`in-depth.js?t=${Date.now()}`, INDEPTH_PATH),
		});
	}

	// Set the canonical URL
	let url = "";
	if (canonical_override) {
		// Allow specific ones defined via settings.json
		try {
			url = new URL(canonical_override).toString();
		} catch (e) {
			console.error(e);
			if (!domain.includes(".com") && !domain.includes(".net"))
				domain = `${domain}.com`;
			url = `https://www.${domain}/storytelling/grid/${slug}/`;
		}
	} else {
		if (!domain.includes(".com") && !domain.includes(".net")) domain = `${domain}.com`;
		url = `https://www.${domain}/storytelling/grid/${slug}/`;
	}

	const modified = top.updated || top.published;

	let share_image;
	try {
		if (top.share_image) {
			// Start by using the configured image
			share_image = await justGetPhotoURL(top.share_image);
		} else if (top.image) {
			// No configured share image, but we DO have a top-of-page image
			share_image = await justGetPhotoURL(top.image);
		}
	} catch (e) {
		console.error("!! Problem getting share image: %s", e);
	}

	// HANDLE SSTS, ETC.
	let ssts = top.ssts || "";
	let cst = top.cst || top.ssts || "";

	const jsonld = json_ld({
		ssts: top.ssts,
		date_modified: new Date(modified).toISOString(),
		date_published: new Date(top.published).toISOString(),
		title: top.title,
		canonical_url: url,
		site_code,
		share_image,
		is_accessible_for_free: contentProtectionState === "free",
		paywalled_content_css_selector: [".characters"],
	});

	const metadata = {
		scripts,
		styles,
		headline: top.headline,
		title: top.title,
		description: top.description,
		share_text: top.share_text || "",
		share_image,
		ssts,
		cst,
		url,
		jsonld,
		twitter,
		date_published: new Date(top.published).toISOString(),
		includesVideo: top.includesVideo || false,
		contentProtectionState,
		contentId: top.presto_id || null,
	};
	const response = UW({
		html: renderHTML({ content }),
		...metadata,
	});

	return fs.writeFile(`public/uw/${slug}.json`, JSON.stringify(response));
}

if (require.main === module) {
	const REQUIRED = ["domain", "site_code", "slug"];
	const { CAST_PROJECT, TARGET = (process.env.GIT_BRANCH = "dev") } = process.env;

	// Make sure we have settings for this project
	if (!settings[CAST_PROJECT]) {
		console.error(`${CAST_PROJECT} is not a valid cast project`);
	}
	// Alert and end if any required setting is missing
	for (let R of REQUIRED) {
		if (!settings[CAST_PROJECT][R]) {
			console.error(`${CAST_PROJECT} is missing required setting: ${R}`);
			process.exit(2);
		}
	}

	// Render the UW response.
	const {
		slug,
		domain,
		site_code,
		twitter = "",
		canonical_override,
	} = settings[CAST_PROJECT];
	render({
		target: TARGET,
		domain,
		slug,
		site_code,
		twitter,
		canonical_override,
	}).catch(console.error);
}

module.exports = {
	render,
};
