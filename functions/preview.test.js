const { test, describe } = require("node:test");

const assert = require("assert/strict");
const cheerio = require("cheerio");

const { renderHTML } = require("./preview.js");
const fs = require("fs/promises");

console.log = () => {}; // Suppress the logging from the rendering

const H_TEST_CONTENTS = {
	"voter-guide": [
		{ selector: "header > h1", expectedCount: 1 },
		{ selector: "h2", expectedCount: 52 },
		{ selector: "h3", expectedCount: 0 },
		{ selector: "h4", expectedCount: 0 },
		{ selector: "h5", expectedCount: 0 },
	],
	"florida-election-endorsements-2022": [
		{ selector: "header > h1", expectedCount: 1 },
		{ selector: "h2", expectedCount: 10 },
		{ selector: "h3", expectedCount: 16 },
		{ selector: "h4", expectedCount: 0 },
		{ selector: "h5", expectedCount: 0 },
	],
	"jan-6-riot": [
		{ selector: "header > h1", expectedCount: 1 },
		{ selector: "h2", expectedCount: 856 },
		{ selector: "h3", expectedCount: 2320 },
		{ selector: "h4", expectedCount: 0 },
		{ selector: "h5", expectedCount: 0 },
	],
	"title-ix": [
		{ selector: "header > h1", expectedCount: 1 },
		{ selector: "h2", expectedCount: 1 },
		{ selector: "h3", expectedCount: 13 },
		{ selector: "h4", expectedCount: 107 },
		{ selector: "h5", expectedCount: 214 },
	],
	"hagerstown-football": [
		{ selector: "header > h1", expectedCount: 1 },
		{ selector: "h2", expectedCount: 12 },
		{ selector: "h3", expectedCount: 62 },
		{ selector: "h4", expectedCount: 0 },
		{ selector: "h5", expectedCount: 0 },
	],
};

describe("Rendering H tags", () => {
	for (const [file, testCounts] of Object.entries(H_TEST_CONTENTS)) {
		test(file, async () => {
			const [content] = await Promise.all([
				fs.readFile(`./testData/${file}.json`, { encoding: "utf-8" }).then(JSON.parse),
			]).catch(console.error);

			// We need to tweak the CPS so that it renders the full page (not roadblocked)
			content.top.required_status = "any";

			const rendered = renderHTML({ content });
			const $content = cheerio.load(rendered, {}, false);

			for (let { selector, expectedCount } of testCounts) {
				assert.strictEqual($content(selector).length, expectedCount);
			}
		});
	}
});

describe("Display CTA logic", async () => {
	const CTA_TEST_CASES = [
		{ required_status: "any", cta_match_premium_state: true, expected: 2 },
		{ required_status: "subscriber", cta_match_premium_state: true, expected: 0 },
		{ required_status: "any", cta_match_premium_state: false, expected: 2 },
		{ required_status: "registered", cta_match_premium_state: false, expected: 2 },
		{ required_status: "registered", cta_match_premium_state: true, expected: 0 },
	];
	const content = await fs
		.readFile(`./testData/hagerstown-football.json`, { encoding: "utf-8" })
		.then(JSON.parse)
		.catch(console.error);

	for (let { required_status, cta_match_premium_state, expected } of CTA_TEST_CASES) {
		test(`required_status: ${required_status} // cta_match_premium_state: ${cta_match_premium_state}`, () => {
			content.top.cta_match_premium_state = cta_match_premium_state;
			content.top.required_status = required_status;
			const $content = cheerio.load(renderHTML({ content }), {}, false);

			assert.strictEqual($content(".cta").length, expected);
		});
	}
});
