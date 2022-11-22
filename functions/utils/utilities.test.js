const { test, describe } = require("node:test");
const assert = require("assert/strict");

const { slugify, processText } = require("./utilities.js");

describe("Various text munging functions", () => {
	const TEST_CASES = [
		{ input: "Foo bar.", expected: "<p>Foo bar.</p>", inline: false },
		{
			input: "Foo <strong>bar.</strong>",
			expected: "<p>Foo <strong>bar.</strong></p>",
			inline: false,
		},
		{
			input: "Foo **bar.**",
			expected: "<p>Foo <strong>bar.</strong></p>",
			inline: false,
		},
		{
			input: "Foo **bar.**",
			expected: "Foo <strong>bar.</strong>",
			inline: true,
		},
		{
			input:
				"Lorem [ipsum dolor](https://usatoday.com) sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			inline: false,
			expected: `<p>Lorem <a href="https://usatoday.com" rel="noopener noreferrer" target="_blank" class="cast-inline-link">ipsum dolor</a> sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
		},
		{
			input: `<p>Lorem <a href="https://usatoday.com" rel="foo" target="_top">ipsum dolor</a> sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
			inline: false,
			expected: `<p>Lorem <a href="https://usatoday.com" rel="foo noopener noreferrer" target="_blank" class="cast-inline-link">ipsum dolor</a> sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
		},
		{
			input: `<p>Lorem <a class="lotsOfClass" href="https://usatoday.com" rel="foo" target="_top">ipsum dolor</a> sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
			inline: false,
			expected: `<p>Lorem <a class="lotsOfClass cast-inline-link" href="https://usatoday.com" rel="foo noopener noreferrer" target="_blank">ipsum dolor</a> sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>`,
		},
	];
	test("Test processText()", () => {
		for (let { input, inline, expected } of TEST_CASES) {
			assert.strictEqual(processText({ txt: input, inline }), expected);
		}
	});

	test("Test slugify()", () => {
		const TEST_CASES = [
			{
				input: "fooBar",
				expected: "foobar",
			},
			{
				input: "foo Bar",
				expected: "foo-bar",
			},
			{
				input: "foo Bar ?!?!?",
				expected: "foo-bar",
			},
			{
				input: `Julius "Groucho" Marx III`,
				expected: "julius-groucho-marx-iii",
			},
			{
				input: `Bob 1`,
				expected: "bob-1",
			},
			{
				input: `Bob 2`,
				expected: "bob-2",
			},
		];
		for (let { input, expected } of TEST_CASES) {
			assert.strictEqual(slugify(input), expected);
		}
	});
});
