const publishers = {
	USAT: {
		"@type": "Organization",
		logo: {
			"@type": "ImageObject",
			height: 60,
			width: 338,
			url: "https://www.gannett-cdn.com/gannett-web/properties/usatoday/logos-and-branding/logo-amp-results.png",
		},
		name: "USA TODAY",
	},
	PDTF: {
		"@type": "Organization",
		name: "Detroit Free Press",
		logo: {
			"@type": "ImageObject",
			url: "https://www.gannett-cdn.com/sites/freep/images/site-nav-logo@2x.png",
			height: 80,
			width: 297,
		},
	},
	PIND: {
		"@type": "Organization",
		logo: {
			"@type": "ImageObject",
			height: 60,
			url: "https://www.gannett-cdn.com/gannett-web/properties/indystar/logos-and-branding/logo-amp-results.png",
			width: 212,
		},
		name: "The Indianapolis Star",
	},
	PCIN: {
		"@type": "Organization",
		logo: {
			"@type": "ImageObject",
			height: 60,
			url: "https://www.gannett-cdn.com/gannett-web/properties/cincinnati/logos-and-branding/logo-amp-results.png",
			width: 346,
		},
		name: "The Cincinnati Enquirer",
	},
	NCOD: {
		"@type": "Organization",
		logo: {
			"@type": "ImageObject",
			url: "https://www.gannett-cdn.com/sites/dispatch/images/site-nav-logo@2x.png",
		},
		name: "The Columbus Dispatch",
	},
	PNAS: {
		"@type": "Organization",
		logo: {
			"@type": "ImageObject",
			url: "https://www.tennessean.com/sitelogos/m-oc.svg",
		},
		name: "The Tennessean",
	},
};

/**
 *
 * @param {Object} param0 Object of params:
 *  - {string} ssts: The ssts, with slashes
 *  - {string} date_modified, date_updated: the pub and update dates as a machine-readable string
 *  - {string} title: page title
 *  - {string} canonical url
 *  - {string} site_code: Used to retrieve publisher information
 *  - {string} share_image: Absolute CDN URL for the share image
 *  - {string|boolean} is_accessible_for_free Should be "false" if any part of this page is premium
 *  - {[]string} paywalled_content_css_selector: The array of css selector strings one would need to specifically
 *    target the paywalled content on a page, and not the free-for-all content. An intro probably is not paywalled,
 *    but the main meat of the page might be.
 *    (More: https://developers.google.com/search/docs/advanced/structured-data/paywalled-content)
 * @returns {Object} all the LD+JSON you need in one convenient place.
 */

export function json_ld({
	ssts = "",
	date_modified = "",
	date_published = "",
	title = "",
	canonical_url = "",
	site_code = "",
	share_image = "",
	is_accessible_for_free = true,
	paywalled_content_css_selector = [],
}) {
	const sstsColon = ssts ? `ssts:${ssts.split("/").join(":")}` : "";
	const jsonldMetadata = {
		contentSourceCode: site_code,
		siteCode: site_code,
		ssts: sstsColon,
		type: "story",
	};

	let json = {
		"@context": "http://schema.org",
		"@type": "WebSite",
		author: {},
		dateModified: date_modified,
		datePublished: date_published,
		headline: title,
		isAccessibleForFree: String(is_accessible_for_free),
		image: {
			"@type": "ImageObject",
			url: share_image,
		},
		isBasedOn: canonical_url,
		keywords: ["type:story", sstsColon],
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": canonical_url,
		},
		metadata: JSON.stringify(jsonldMetadata),
	};

	if (!is_accessible_for_free && paywalled_content_css_selector.length > 0) {
		json.hasPart = paywalled_content_css_selector.map(cssSelector => {
			return {
				"@type": "WebPageElement",
				isAccessibleForFree: String(is_accessible_for_free),
				cssSelector,
			};
		});
	}

	if (site_code && publishers[site_code.toUpperCase()]) {
		json.author = {
			"@type": "Organization",
			name: publishers[site_code.toUpperCase()].name,
		};
		json.publisher = publishers[site_code.toUpperCase()];
	}

	return json;
}
