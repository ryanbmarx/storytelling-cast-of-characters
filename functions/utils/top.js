const { getOverlayColor } = require("./colors.js");
const { getMediaData } = require("./get-media-data.js");
const { getArticles } = require("./content-api.js");
const { kv, truthy, processText } = require("./utilities.js");

const CONTENT_PROTECTION_STATES = new Set(["any", "registered", "subscriber"]);
const DEFAULT_CONTENT_PROTECTION_STATE = "any";
const DEFAULT_MAX_CHARACTERS = 0;
const DEFAULT_LABEL_SIGN_IN = "Sign in";
const DEFAULT_LABEL_SIGN_UP_REGISTER = "Create account";
const DEFAULT_LABEL_SIGN_UP_SUBSCRIBE = "Subscribe now";

const DEFAULT_HEADLINE_LABEL_PREMIUM = "Subscriber exclusive";
const DEFAULT_HEADLINE_LABEL_PREVIEW = "A preview of a subscriber exclusive";

const DEFAULT_LABEL_DOES_NOT_MEET_REQUIREMENTS_SUBSCRIBER =
	"This is for subscribers only. Join now for great journalism like this.";
const DEFAULT_LABEL_DOES_NOT_MEET_REQUIREMENTS_REGISTERED =
	"This is for registered readers only. Create your free account now.";

// These defaults are pretty straightfoward, and will be validated elsewhere, if at all.
const STANDARD_DEFAULTS = {
	theme: "light",
	theme_color: "#009bff",
	background_color: "#ffffff",
	byline: "Staff",
	organization: "USA TODAY NETWORK",
	intro_image_position: "bottom",
	serif: "false",
	ssts: "news",
	ad_topic: null,
	display_ads: "yes",
	top_ad: "default",
	brandlock: "no",
	card_image_mask: "yes",
	card_name_position: "top",
	card_text_alignment: "center",
	cta_button_text: "More",
	cta_match_premium_state: "no",
};

/**
 *
 * The the main function used to process the "top" tab and create our metadata lookup
 *
 * @param {Array} rows The gootenberg array of objects that is a spreadsheet tab
 * @returns {Object} An object of key/value pairs with all the needed defaults and validation
 */
async function top(rows) {
	// Create our table object, assigning defaults as needed
	let table = Object.assign(Object.create({}), STANDARD_DEFAULTS, kv(rows));

	table = processContentProtection(table);

	// Various things we'll want to check. Access them here, with sensible defaults.
	let { description = "", intro = "" } = table;

	// HEADER: Manage page intro. We definitely want _something_ up there because
	// Google really appreciates it. No intro is set, so use the meta description
	if (!intro) intro = description;
	table.intro = processText({ txt: intro });

	// NOMRMALIZE THE IMAGE RATIOS
	["image_ratio", "thumbnail_image_ratio"].forEach(r => {
		if (table[r]) {
			// Make sure we're using the ratio format CAPI prefers
			table[r] = table[r].replace(/x|X|:/, "_");
		} else {
			// Without a ratio set, default to bestCrop.
			table[r] = r === "thumbnail_image_ratio" ? "4_3" : "bestCrop";
		}
	});
	// MANAGE OUR PUB TIMES
	if (table.published) table.published = new Date(table.published).getTime();
	if (table.updated) table.updated = new Date(table.updated).getTime();

	// COLORS ------------
	// Set appropriate text color for use over the theme color
	table.theme_color_text = getOverlayColor(table.theme_color);

	// Based on the BG color, let's automatically
	// decide if we should use light or dark theme, regardless of what is configured.
	// If the background color requires white text, then use the dark theme.
	table.theme = getOverlayColor(table.background_color) === "white" ? "dark" : "light";

	// CTA
	table.cta_match_premium_state = truthy(table.cta_match_premium_state, false);

	// TEXT ------

	table.serif = truthy(table.serif, false);

	// PROCESS CONTRIBUTING TAG
	if (table.contributing) table.contributing = processText({ txt: table.contributing });

	// MANAGE HEADER IMAGE
	table = await processIntroImage(table);

	// HANDLE PROJECT RECIRCULATION
	table = await processRecirculationLinks(table);

	// ADVERTS: MAKE SURE WE HAVE SECTION VALUES

	// SSTS is "news" by default. CST will pick up ssts if needed.
	table.cst = table.cst || table.ssts;

	// make some properties boolean
	table.display_ads = truthy(table.display_ads, true);
	table.brandlock = truthy(table.brandlock, false);
	table.card_image_mask = truthy(table.card_image_mask, true);

	// normalize some others
	table.card_name_position = table.card_name_position.toLowerCase();
	table.card_text_alignment = table.card_text_alignment.toLowerCase();

	return table;
}

// Takes the whole `top` data object and formats recirc links
async function processRecirculationLinks(table = {}) {
	let related_links = [];
	let related_link_index = 1;

	// We support infinite recirc links in the top with the pattern of `related_link_1`, `related_link_2`,`related_link_{n}`
	// This loop will pluck them from the data as long as there are any to find.
	while (related_link_index > 0) {
		const link = `related_link_${related_link_index}`;
		if (table[link]) {
			try {
				// Let's try it as an absolute link
				const u = new URL(table[link]);

				// And add it to our array if we have associated text
				if (table[`${link}_text`]) {
					related_links.push({
						link: u.toString(),
						label: table[`${link}_text`],
					});
				}
			} catch (e) {
				// This is not a parseable link, so let's assume it's a presto ID
				try {
					// Get the presto metadata
					const { assets } = await getArticles(table[link]);
					// Test if we actually got anything. A successful CAPI query
					// of an unpublished asset will return `{assets[null]}`, so
					// we actually need to look at the item in the array
					if (assets.length && assets[0]) {
						const { headline, pageURL, shortHeadline } = assets[0];

						// Add it to our array, deferring to headline from spreadsheet
						related_links.push({
							link: pageURL.long,
							label: table[`${link}_text`] || shortHeadline || headline,
						});
					}
				} catch (e) {
					// The presto ID failed.
					console.error(
						"!! Problem getting related link: %s (maybe it is unpublished?)",
						link
					);
					console.error(e);
				}
			}

			// Now for some housekeeping.
			// Delete the flat links in favor of our array

			delete table[link];
			delete table[`${link}_text`];

			// Increment our counter.
			related_link_index++;
		} else {
			// We have no more links. Break
			related_link_index = 0;
		}
	}

	// Add the links to our table and return
	table.related_links = related_links;

	return table;
}

// Makes sure our content-protection configuration is viable, assigning defaults where needed.
function processContentProtection(table) {
	// Various things we'll want to check. Access them here, with sensible defaults.
	const {
		required_status = DEFAULT_CONTENT_PROTECTION_STATE,
		max_characters = DEFAULT_MAX_CHARACTERS,
	} = table;

	// Assign our simple default values that don't need validation
	table = Object.assign(
		{},
		{
			//The headline kicker label for premium content
			headline_label_premium: DEFAULT_HEADLINE_LABEL_PREMIUM,
			headline_label_preview: DEFAULT_HEADLINE_LABEL_PREVIEW,

			// Strings needed for the login component. Will be different based on premium status
			label_sign_in_button: DEFAULT_LABEL_SIGN_IN,
			label_does_not_meet_requirements:
				required_status === "subscriber"
					? DEFAULT_LABEL_DOES_NOT_MEET_REQUIREMENTS_SUBSCRIBER
					: DEFAULT_LABEL_DOES_NOT_MEET_REQUIREMENTS_REGISTERED,
			label_sign_up_button:
				table.required_status === "subscriber"
					? DEFAULT_LABEL_SIGN_UP_SUBSCRIBE
					: DEFAULT_LABEL_SIGN_UP_REGISTER,
		},
		table
	);

	// Handle content protection states. Normalize required status to lower case,
	// and use default value if configured choice is not recognized.
	table.required_status = CONTENT_PROTECTION_STATES.has(required_status.toLowerCase())
		? required_status.toLowerCase()
		: DEFAULT_CONTENT_PROTECTION_STATE;

	// We can  configure how many characters are shown in a roadblocked state.
	// Defaults to 12, but could be anything. This will always be set, but might
	// not ever be used, depending on the content protection state.
	// In the case that the max doesn't coerce to an integer, use the default.
	table.max_characters = parseInt(max_characters) || DEFAULT_MAX_CHARACTERS;

	return table;
}

async function processIntroImage(table = {}) {
	if (table.intro_image) {
		table.intro_image_position = table.intro_image_position.toLowerCase();
		try {
			const {
				intro_image,
				intro_image_alt_text = "",
				intro_image_caption = "",
				intro_image_credit = "",
				intro_image_hide_caption = "no",
				intro_image_hide_credit = "no",
			} = table;

			let headerMedia = await getMediaData({
				image: intro_image,
				alt: intro_image_alt_text,
				caption: intro_image_caption,
				credit: intro_image_credit,
			});
			if (intro_image_hide_caption.toLowerCase() === "yes") headerMedia.caption = "";
			if (intro_image_hide_credit.toLowerCase() === "yes") headerMedia.credit = "";

			table.intro_image = headerMedia;
			table.includesVideo = "json" in headerMedia;

			// Clean things up.
			delete table.intro_image_alt_text;
			delete table.intro_image_caption;
			delete table.intro_image_credit;
			delete table.intro_image_hide_caption;
			delete table.intro_image_hide_credit;
		} catch (e) {
			console.error("!! Problem getting header image: %s", e);
		}
	}

	return table;
}
module.exports = { top };
