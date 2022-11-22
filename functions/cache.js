#!/usr/bin/env node

require = require("esm")(module);

const FastlyPurge = require("fastly-purge");
const SETTINGS = require("../settings.json");
const fs = require("fs/promises");
const { URL } = require("url");

const { CAST_PROJECT } = process.env;
/**
 *
 * Wrapper async function that lets us read file directories and such, then busts the cache like there is no tomorrow.
 * Pulls the canonical URL from the UW responses and purges them
 *
 * @returns nothing
 */
async function bust() {
	// Make sure we are accessing a known project:
	if (!(CAST_PROJECT in SETTINGS)) {
		console.error(
			`!!! ${CAST_PROJECT} is not a known quiz project. Can't bust that cache`
		);
		return;
	}

	// See what we have to purge
	let files = await fs.readdir("./public/uw/").catch(console.error);

	if (files.length) {
		files.forEach(async file => {
			// Read each UW response available
			const uw = await fs
				.readFile(`./public/uw/${file}`)
				.then(JSON.parse)
				.catch(console.error);

			const { url } = uw.meta;

			// Decide which API key we need
			const KEY = url.includes("usatoday.com") ? "USAT_AUTH" : "USCP_AUTH";

			if (KEY in process.env) {
				// Create our auth
				const AUTH = Buffer.from(process.env[KEY] || "", "base64").toString();
				const [user, password] = AUTH.split(":");
				// Do the purge
				await purge(url, false, user, password)
					.then(d => {
						console.log(`++ Purged: ${url}`);
					})
					.catch(console.error);
			}
		});
	}
}

/**
 *	Does a fastly purge on a given URL
 *
 * @param {string} url The url to be purged
 * @param {boolean} softPurge If true, will only bea soft purge. Defaults to true.
 * @param {string} user
 * @param {string} password
 * @returns {Promise<void>}
 */
async function purge(url, softPurge = true, user, password) {
	const fastly = new FastlyPurge();
	url = new URL(url);
	url.username = user;
	url.password = password;

	return new Promise((resolve, reject) => {
		fastly.url(url.toString(), { softPurge }, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

if (require.main === module) {
	bust();
}

module.exports = { bust };
