// for fetching and loading teal player-related things
// USING VERSION 1.83.0

import get from "lodash/get";

const TEAL_PLAYER_ROOT = `https://www.gannett-cdn.com/gannett-web/apps/teal/dist/`;
const TEAL_PLAYER_BUNDLE = new URL(`bundle-aa8b905a.js`, TEAL_PLAYER_ROOT);
const TEAL_PLAYER_CSS = new URL(`tealplayer-1e4fcc2d.css`, TEAL_PLAYER_ROOT);

let tealPlayerScript = null;
let tealPlayerLoaded = false;
let callbacks = [];

/**
 * loadTealPlayer will load a version of the Teal Player from the CDN. See a manifest of teal player
 * versions at this CDN link:
 *
 *      https://github.com/GannettDigital/teal-player/blob/master/manifest.json
 *
 * @param {Function} cb - a callback, called once the teal player loads (or, if the teal player is
 *  already loaded, call immediately)
 */
export function loadTealPlayer(cb = () => {}) {
	if (tealPlayerScript === null) {
		// create the script tag, setting up the `onload` event
		// which will call all the registered callbacks once the
		// script loads
		const s = document.createElement("script");
		tealPlayerScript = s;

		// add an onload callback
		s.onload = () => {
			tealPlayerLoaded = true;
			for (let callback of callbacks) {
				callback();
			}
		};

		// append the script to the dom
		document.body.appendChild(s);

		// add the src (trigging the load)
		s.src = TEAL_PLAYER_BUNDLE.toString();

		// dynamically load the stylesheet
		const tealStyleSheet = document.createElement("link");
		tealStyleSheet.setAttribute("rel", "stylesheet");
		tealStyleSheet.setAttribute("href", TEAL_PLAYER_CSS.toString());
		document.head.appendChild(tealStyleSheet);
	} else if (tealPlayerLoaded) {
		// if we've already loaded the Teal player, just call the calback
		// and return; does not append to callbacks array
		cb();
		return;
	}

	// add this callback to the callbacks array, for calling when
	// the script loads
	callbacks.push(cb);
}

/**
 * There's a bit of config needed to set up analytics, etc for the teal player. We should pull from
 * window.ga_data (for now), and also be sure to set defaults
 * See this demo for teal player v1.2.0 more info:
 *
 *      https://github.com/GannettDigital/teal-player/blob/master/demo/autoplay-1.2.0.html#L240
 */
export function tealPlayerSettings() {
	const isProd = process.env.NODE_ENV !== "development";
	return {
		base: {
			debug: isProd,
			placement: "storytelling/in-depth",
			closedCaption: true,
		},
		ias: {
			load: isProd,
			enable: isProd,
		},
		ima: {
			load: isProd,
			enable: isProd,
		},
		comscore: {
			load: isProd,
			enable: isProd,
		},
		gcianalytics: {
			enable: true,
			load: true,
		},
		heartbeat: {
			load: isProd,
			enable: isProd,
			market: get(window, "ga_data.site.adobe.market", "gpapermobileapp"), // required
			trackingServer: get(
				window,
				"ga_data.site.adobe.trackingServer",
				"repdata.usatoday.com"
			), // required
			trackingServerSecure: get(
				window,
				"ga_data.site.adobe.trackingServerSecure",
				"srepdata.usatoday.com"
			), // required
		},
		hls: {
			load: true,
			enable: true,
		},
		nudge: {
			load: isProd,
			enable: isProd,
			// id: 423 // couldn't find this in window.ga_data
			scriptUrl: get(
				window,
				"ga_data.site.video.snow.placements.default.nudge.scriptUrl",
				"https://cdn.ndg.io/ndg-8205542976.js"
			), // uscp default
		},
		controls: {
			enable: true,
			enableBigPlayButton: true,
		},
	};
}

/**
 * tealPlayerPage data gets requisite page data information to power teal player
 */
export function tealPlayerPageData() {
	const ssts = get(window, "ga_data.route.ssts", "");
	const sstsSplit = ssts.split("/");
	return {
		adTargeting: {
			customParams: {},
			simpleTarget: [],
		},

		// this data is not in window.ga_data as far as i can find
		// but are valid config options if we can get our hands on them
		// awsPath: 'news',
		// displayName: 'The Indianapolis Star',
		// siteCode: 'PIND', // ?!?!

		adFreeExperience: get(window, "ga_data.route.noAdvertising", false),
		baseName: get(window, "ga_data.site.baseName", "usatoday"),
		id: get(window, "ga_data.site.id", 1),
		keywords: get(window, "ga_data.route.keywords", ""),
		pageType: get(window, "ga_data.route.basePageType", "in-depth story pages"),
		publicationName: get(window, "ga_data.site.publicationName", "USA TODAY"),
		series: get(window, "ga_data.route.series", ""),
		section: sstsSplit.length > 0 ? sstsSplit[0] : "",
		subsection: sstsSplit.length > 1 ? sstsSplit[1] : "",
		topic: sstsSplit.length > 2 ? sstsSplit[2] : "",
		subtopic: sstsSplit.length > 3 ? sstsSplit[3] : "",

		// Third party
		twitter: get(window, "ga_data.site.twitter.primary_account", "usatoday"),

		// User data
		// none of this is in ga_data
		// anonymousId: '80a07a46-4d35-e911-ac30-90b11c343abd',
		// benefitSegment: 'ITK',
		// clientID: '9554b1a7-79ba-4bc3-bd6e-fa49c43fe4ff',
		// cohort: 'low',
		// dynamicPaywallSegments: '',
		// fireflyUserId: 27476757,
		// userLicenseType: 'none',
		// userMeterState: 'nothitpaywall',
		// userScroll: 'none',
		// userType: '',
	};
}
