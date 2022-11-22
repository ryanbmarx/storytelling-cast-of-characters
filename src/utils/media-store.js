import { writable } from "svelte/store";

/**
 * This creates a boolean store value to let your code monitor viewport width in a convenient way.
 *
 * @param {string} query | The valid css media query conditions you want to observe
 * @param {boolean} defaultValue | When SSRing, it is necessary to define a default value because the `window` is not available when SSRing will kill the process
 */

export function createMediaStore(query, defaultValue = true) {
	// Get our store functions, and assign a default value
	let { set, subscribe } = writable(defaultValue);

	// If we are SSRing, the window is not defined. In that case, just return.
	if (typeof window === "undefined") return { subscribe };

	const media = window.matchMedia(query);
	try {
		media.addEventListener("change", e => {
			set(e.matches);
		});
	} catch (e) {
		// Old iOS browsers do not support the more logical `addEventListener`
		media.addListener(function (e) {
			set(e.matches);
		});
	}
	return { subscribe };
}
