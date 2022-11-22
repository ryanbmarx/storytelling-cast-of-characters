const { domains } = require("./utils/sites.js");
const { truthy } = require("./utils/utilities.js");
const fs = require("fs/promises");

// https://docs.google.com/spreadsheets/d/1_fP0XpZLVa8vcyMayrJyc9KHt1jWn3FAXFtuvZAuidM/edit#gid=967841973
const TEMPLATE_ID = "1_fP0XpZLVa8vcyMayrJyc9KHt1jWn3FAXFtuvZAuidM";

async function create({ github = {}, context = {}, fetch }) {
	// Grab and sanitize things
	let {
		domain = "usatoday.com",
		SEO_slug,
		spreadsheet_key,
		private,
	} = context.payload.inputs;

	const { project_slug } = process.env;

	// Assign a url slugging if one wasn't provided.
	if (!SEO_slug) SEO_slug = project_slug;

	// Default site code
	let site_code = "USAT";

	// Normalize the private decision
	private = truthy(private, false);

	// Check the list of domains for the one selected
	if (domain in domains) {
		// Use that site code
		site_code = domains[domain];
	} else {
		console.error(`Not a known domain: ${domain}`);
		process.exit(1);
	}

	// DOUBLE CHECK THE SPREADSHEET KEY
	if (spreadsheet_key === TEMPLATE_ID) {
		console.error(`This is the template spreadsheet! Duplicate it and use a new one`);
		process.exit(1);
	}

	// PROCEED ...
	const { owner, name } = context.payload.repository;
	const { status, data } = await github.request(
		`GET /repos/${owner.login}/${name}/contents/settings.json`
	);

	if (status == 200) {
		const settings = JSON.parse(Buffer.from(data.content, "base64").toString());

		// Check if slug is in use.
		if (!(project_slug in settings)) {
			newProjectSettings = {
				slug: SEO_slug,
				site_code,
				spreadsheet_key,
				domain,
				private,
			};

			// Get stuff from platform config
			const platformConfig = await fetch(
				`https://gannett-platform-config.production.gannettdigital.com/deployments/prod/${site_code.toUpperCase()}-TANGENT.json`
			)
				.then(d => d.json())
				.catch(console.error);

			newProjectSettings.twitter =
				platformConfig?.social?.twitter?.primary_account ?? null;
			settings[project_slug] = newProjectSettings;

			// UPDATE SETTINGS FILE
			await fs.writeFile("./settings.json", JSON.stringify(settings, null, 2), "utf-8");

			return {
				settings,
				project_slug,
				site_code,
				SEO_slug,
				domain,
				spreadsheet_key,
				sha: data.sha,
			};
		} else {
			console.error(
				`Project slug already in use. Please choose a unique name: ${project_slug}`
			);
			return {};
		}
	}

	return {};
}

async function pr({ github, context }) {
	const { owner, name } = context.payload.repository;
	return await github.request(`POST /repos/${owner.login}/${name}/pulls`, {
		title: `Adding new project: ${process.env.project_slug}`,
		head: `new-project-${process.env.project_slug}`,
		base: "main",
		body: `Creates new Cast of Characters project for ${
			process.env.project_slug
		}. Spreadsheet: ${process.env.spreadsheet_url.replace(/\"|'/g, "")}`,
	});
}

async function spreadsheet({ github = {}, context = {}, goot = {}, fetch = {} }) {
	// Get our config values we want from the project's settings
	const { domain, project_slug, SEO_slug, spreadsheet_key } = JSON.parse(
		process.env.SETTINGS
	);
	try {
		// Create our JSON payload
		let settings = {
			DOMAIN: domain,
			CAST_PROJECT: project_slug,
			SLUG: SEO_slug,
		};
		const values = [[JSON.stringify(settings, null, 2)]];

		// Make the request to update the spreadsheet
		const { data } = await goot.sheetsAPI.spreadsheets.values.append({
			auth: goot.client,
			spreadsheetId: spreadsheet_key,
			range: "_PUBLISHING_SETTINGS!A1",
			insertDataOption: "INSERT_ROWS",
			valueInputOption: "RAW",
			resource: {
				majorDimension: "ROWS",
				values,
			},
		});
	} catch (err) {
		// Ooops. Something went wrong.
		console.error(err);
	}
}

module.exports = { create, pr, spreadsheet };
