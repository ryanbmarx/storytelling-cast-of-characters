const { color, hsl } = require("d3-color");

/**
 * Will return "white" or "black" after deteriming which of those colors will have the most contrast with the given color;
 * Will default to black.
 * c {string} Valid CSS color
 */
function getOverlayColor(c) {
	try {
		const white = color("white");
		const black = color("black");
		const USAT = color("#009bff").formatHex();
		const rgb = color(c).rgb();

		// Add exception for USAT blue brand colors
		if (color(c).formatHex() === USAT) return "#ffffff";

		return contrast(rgb, black) >= contrast(rgb, white) ? "black" : "white";
	} catch (e) {
		console.error(`!! Problem parsing color value: ${c}`);
		//   If the color doesn't parse, return the default
		return "black";
	}
}

// CRIBBED FROM https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
function luminanace(r, g, b) {
	var a = [r, g, b].map(function (v) {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
/**
 * contrast() takes two rgb color objects and finds the contrast ratio between them
 * @param {d3 color object} rgb1
 * @param {d3 color object} rgb2
 */

function contrast(rgb1, rgb2) {
	const l1 = luminanace(rgb1.r, rgb1.g, rgb1.b) + 0.05;
	const l2 = luminanace(rgb2.r, rgb2.g, rgb2.b) + 0.05;
	return Math.max(l1, l2) / Math.min(l1, l2);
}

/**
 *
 * @param {string} c A valid CSS color.
 * @returns {Object} A object with four colors in hex value: the main color provided,a good, lighter version for background screens and text colors for both values.
 */
function getUtilityColors(c = "") {
	try {
		const themeColor = hsl(c);

		// Normalize the main color
		const main = themeColor.formatHex();

		// Find a light, screen version
		let screen = themeColor;
		screen.l = 0.9;
		screen.s -= 0.1;
		screen = screen.formatHex();

		// Get the proper text colors
		const main_text = getOverlayColor(main);
		const screen_text = getOverlayColor(screen);

		return { main, screen, main_text, screen_text };
	} catch (e) {
		console.error(`!!! Error trying to get utility colors for ${c}`);
		console.error(e);
		return {};
	}
}

module.exports = { getUtilityColors, getOverlayColor };
