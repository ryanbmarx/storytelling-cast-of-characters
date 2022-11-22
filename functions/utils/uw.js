// uw utils

/* helper to make a UW response */
module.exports = function UW({
	title = "",
	headline = "",
	description = "",
	url = "",
	html = "",
	styles = [],
	scripts = [],
	meta = [],
	share_image = "",
	share_text = "",
	twitter = "",
	jsonld,
	ssts = "",
	cst = "",
	includesVideo = false,
	date_published = null,
	basePageType = "interactives",
	contentProtectionState = "free",
	contentId = null,
}) {
	const uw = {
		type: "rich",
		url,
		html,
		jsonld,
	};

	let links = styles.map(href => {
		return {
			rel: "stylesheet",
			href,
		};
	});

	links.push({
		rel: "canonical",
		href: url,
	});

	uw.tags = {
		title,
		script: scripts.reduce((accumulator, current) => {
			const { src } = current;
			try {
				current.src = new URL(src).href;
				accumulator.push(current);
			} catch (e) {
				console.error("!!! UW RESPONSE: Not a valid script URL", e);
			}
			return accumulator;
		}, []),

		link: links,

		meta: [
			{
				property: "og:type",
				content: "article",
			},
			{
				property: "og:url",
				content: url,
			},
			{
				property: "description",
				content: description,
			},
			{
				property: "og:description",
				content: description,
			},
			{
				name: "twitter:description",
				content: description,
			},
			{
				property: "og:title",
				content: share_text || headline || title,
			},
			{
				name: "twitter:title",
				content: share_text || headline || title,
			},
			{
				property: "og:image",
				content: share_image,
			},
			{
				name: "twitter:image",
				content: share_image,
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			...meta,
		],
	};

	if (twitter) {
		uw.tags.meta.push({
			name: "twitter:site",
			content: twitter,
		});
	}

	// Going off of what we set for in-depth articles
	// https://github.com/GannettDigital/lab-microservices/blob/staging/controllers/longform.go#L797
	uw.meta = {
		url: url,
		short_url: url,
		mobile_url: url,
		page_url: url,
		ssts,
		headline: title, // this sets prop44 i think
		includesVideo,
		basePageType,
		contentId,
		datePublished: date_published, // CD23
	};

	// Add SSTS to the  response
	if (ssts) {
		uw.meta.ssts = ssts;

		// Add the section, so the nav adapts
		// i.e. sports/football/nfl => "sports"
		uw.meta.sectionName = ssts.split("/")[0];
	}

	// Add CST to the response, defaulting to SSTS if not provided
	if (cst || ssts) uw.meta.cst = cst ? cst : ssts;

	// Set the CAM status, which populates CD27
	// uw.cam = {
	// 	contentProtectionState,
	// };
	return uw;
};
