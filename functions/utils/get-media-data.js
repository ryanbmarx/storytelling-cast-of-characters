const sizeOf = require("image-size");
const { getCrop, getPhotos } = require("./content-api.js");
const fetch = require("node-fetch");

/**
 * A helper function to retrieve all the data one might need for a properly marked-up and lazy-loaded image. It is intended for use
 * in the quiz framework (but the data structure and, thus, this function can be used anywhere). In the case of absolute URLs to images
 * on the CDN, it collects the data into a data object and returns.
 *
 * For presto IDs, the photo information is collected into the same object, but treats spreadsheet data as a higher priority. That means,
 * for example, that an image's presto caption can be overwritten in the spreadsheet on a photo-by-photo basis. Or the alt text.
 *
 * @param {Object} prefix The data to fetch an image
 * @returns {object} Data object with all the needed component pieces to render a well-formed, accessible image or teal-player video
 *
 * ```json
 * {
 * 	src, alt, caption, credit, height, width, aspectRatio, type
 * }
 * ```
 */

async function getMediaData({
	image = "",
	caption = "",
	alt = "",
	credit = "",
	title = "",
	crop = "bestCrop",
}) {
	if (image.indexOf("http") > -1) {
		return await processCDNImage(arguments[0]);
	} else {
		// It's not a complete URL, so let's assume it's a presto ID.
		try {
			// Get the data from CAPI
			const capiData = await getPhotos(image);
			if (capiData.assets && capiData.assets[0]) {
				// The data comes as an array. Ours will be index zero
				const media = capiData.assets[0];
				switch (media?.type) {
					case "video":
						return {
							type: media.type,
							credit: credit || media.credit || "",
							caption: caption || media.promoBrief || "",
							poster: media.videoStill,
							json: JSON.stringify(media),
							title: title || media.title || "",
						};
						break;
					default:
						// We also want the bestCrop.
						const imgCrop = getCrop({ crop, crops: media.crops });

						// Add the pieces of information we need for a splash photo to the meta data
						// Defer to the spreadsheet for caption/alt/credit overwriting.
						return {
							type: media.type,
							src: imgCrop.path,
							height: imgCrop.height,
							width: imgCrop.width,
							aspectRatio: imgCrop.width / imgCrop.height,
							caption: caption || media.caption || "",
							credit: credit || media.credit || "",
							alt: alt || caption || media.caption || "",
						};
				}
			}
		} catch (e) {
			// Sound the alarm: There was a problem getting the presto image.
			console.error(`Trouble fetching image: ${image}`);
			console.error(e);
		}
	}

	// Something went wrong
	return {};
}

async function processCDNImage({
	image = "",
	caption = "",
	alt = "",
	credit = "",
	crop = "bestCrop",
}) {
	try {
		// Make the CDN URL a proper JS URL
		const src = new URL(image);

		// If we are cropping — `bestCrop` is basically uncropped — then
		// add the `crop` param to the URL because Fastly is cool like that.
		if (crop != "bestCrop") {
			// Fastly will crop images to a ratio (W:H) and will do so
			// with "content-aware" machine learning greatness (`smart`)
			crop = crop.replace(/(X|x|_)/g, ":");
			src.searchParams.set("crop", `${crop},smart`);
		}

		// Get the dimensions of our resulting image
		let dimensions = await getImageSize(src.toString());

		// Send back the full data object, with the added `type` property because at times we need that.
		// It's hard-coded here b/c we don't support non-presto videos.
		return {
			src: src.toString(),
			caption,
			credit,
			alt,
			...dimensions,
			type: "image",
		};
	} catch (e) {
		console.error("!!! Problem getting CDN image dimensions: %s", image);
		console.error(e);

		// Send back the mostly empty data object
		return {
			src: image,
			caption,
			credit,
			alt,
			height: null,
			width: null,
			type: "image",
		};
	}
}

/**
 * This helper function, like the one above, is suitable when all you need is a URL. Perhaps you are using a photo as a CSS background image.
 * It won't send a caption or alt text. Just the absolute CDN url. Use it wisely and in an accessible way. It accepts presto IDs and
 * absolute URLs (which are simply returned), so both photo types can be used interchangeably in markup
 *
 * @param {string} image The value for the photo requested (presto ID or URL)
 *
 * @returns {string} The url of the image sought.
 */
async function justGetPhotoURL(image) {
	// Got nothing. Quit.
	if (!image) return null;

	// This looks like a CDN link. Just return it.
	if (image.indexOf("http") === 0) return image;

	try {
		// Get the photo from CAPI
		const i = await getPhotos(image);
		// Take that returned payload and get the bestCrop URL
		return getCrop({ crops: i.assets[0].crops }).path;
	} catch (e) {
		console.error(`Error getting image from presto: ${image}`);
		console.error(e);
		return null;
	}
}

/**
 * Get dimensions of a remote image
 *
 * @param {URL|String} url
 * @returns {Promise<Object>} dimensions of the image at `url`
 */
async function getImageSize(url) {
	try {
		const u = new URL(url);
		const buf = await fetch(u).then(r => r.buffer());
		const dimensions = sizeOf(buf);

		dimensions.aspectRatio = dimensions.width / dimensions.height;
		return dimensions;
	} catch (e) {
		console.error("!!! Problem getting remote image dimensions: %s", url);
		console.error(e);
	}
}

module.exports = { getMediaData, justGetPhotoURL };
