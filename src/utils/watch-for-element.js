/**
 *
 * watchForElement() Returns a Promise which resolves with an HTML reference to the first
 * DOM element matching the provided CSS selector string. Use this to "listen" or "watch"
 * for elements which might be on the page or might _eventually_ be on the page, such as the
 * persistent meter bar.
 *
 * @param {string} selector Any valid css selector.
 * @returns {HTML element} Will resolve by returning a reference to the first element on the page matching `selector`
 */

export function watchForElement(selector) {
	return new Promise((resolve, reject) => {
		let el = document.querySelector(selector);
		if (el) {
			resolve(el);
		}
		new MutationObserver((mutationRecords, observer) => {
			// Query for elements matching the specified selector
			Array.from(document.querySelectorAll(selector)).forEach(element => {
				resolve(element);
				//Once we have resolved we don't need the observer anymore.
				observer.disconnect();
			});
		}).observe(document.documentElement, {
			childList: true,
			subtree: true,
		});
	});
}

/**
 *
 * @param {HTML Node} element Sets up an intersection observer for the specified element.
 * @param {string} rootMargin An IO-compliant rootmargin, defaulting to when the element is just visible in the viewport
 * @param {function} cb A callback function to fire. This probably will be an analytics call. The IO's entry object is available in the CB.
 * @param {Boolean} once If true, which is the default, the IO will self-destruct after being called once.
 */
export function inView({
	element = null,
	rootMargin = "0px 0px 0px 0px",
	cb = () => {},
	once = true,
}) {
	if (typeof window !== "undefined" && window.IntersectionObserver && element) {
		const observer = new IntersectionObserver(
			entries => {
				entries.forEach(entry => {
					// set the src attribute and bail
					if (entry.isIntersecting) {
						cb(entry);
						if (once) observer.unobserve(element);
					}
				});
			},
			{
				rootMargin,
			}
		);
		observer.observe(element);
	}
}
