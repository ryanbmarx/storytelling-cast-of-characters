/**
 *
 * @param {String} selector Finds an element matching this selector and parses its contents as JSON.
 * @returns JSON data, if found. Otherwise returns empty object if element isn't found or we're SSRing.
 */
export function load(selector) {
	if (typeof document === "undefined") return {};

	const el = document.querySelector(selector);

	if (!el) return {};

	return JSON.parse(el.textContent);
}
