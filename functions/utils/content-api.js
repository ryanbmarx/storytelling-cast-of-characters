const graphql = require("graphql.js");

const gql = graphql("https://content-api.gannettdigital.com/assets", {
	headers: {
		"x-sitecode": "USAT",
		"x-api-key": process.env.CONTENT_API_KEY,
	},
	asJSON: true,
});

/**
 *
 * @param {array or string} ids An array of IDs (for IMAGES) to be fetched from content API. A single ID, as a string, is coerced into an array (length=1)
 *
 * @returns the whole data thing from CAPI
 */
async function getPhotos(ids) {
	// If we have no asset IDs, then return an empty obj
	if (!ids) return {};

	if (!Array.isArray(ids)) {
		ids = [ids];
	}
	return photosQuery({ ids })
		.catch(e => {
			console.error(`!!! Error getting photo: ${ids}`);
			console.error(e.toString());
		})
		.then(photos => photos);
}

const photosQuery = gql(`query ($ids: [String!]!) {
    assets(ids: $ids) {
      id
	  type
      title
	  ... on video {
		adsEnabled
		awsPath
		bylineOverrideV2
		contentProtectionState
		contentSourceCode
		contributors {
		  contributorId
		}
		createSystem
		createUser
		credit
		excludeFromMobile
		headline
		length
		pageURL {
		  long
		}
		promoBrief
		propertyDisplayName
		propertyId
		propertyName
		publication
		publishDate
		publishSystem
		publishUser
		series
		shortHeadline
		source
		ssts {
		  section
		  subsection
		  subtopic
		  topic
		}
		statusName
		tags {
		  name
		}
		title
		type
		updateUser
		brightcoveAccountId
		brightcoveId
		credit
		promoBrief
		gannettTracking
		hlsURL
		initialPublishDate
		keywords
		mp4URL
		origin
		thumbnail
		videoStill
		title
	  }
      ... on image {
        caption
        credit
        orientation
        crops {
          name
          path
          width
          height
        }
      }
    }
  }
  `);

/**
 *
 * getCrop Returns the desired crop data from a CAPI set of crops
 *
 * @param {string} crop The ContentAPI name for the desired crop. Defaults to the (uncropped) "bestCrop"
 * @param {array} crops ContentAPI crops data for an image. Typically, this is `{ name, path, width, height }`
 *
 * @returns the indivudal crop data for an image
 */
function getCrop({ crop = "bestCrop", crops = [] }) {
	// If we have no crops, back out
	if (crops.length === 0) return;

	// Look through the crops for the one we want.
	for (let c of crops) {
		if (c.name === crop) return c;
	}
	// If crop wasn't found, then just return the first one from the crops
	// To get this far in the code, there has to be at least _one_ thing
	// in the crops array.
	return crops[0];
}

async function getArticles(ids) {
	// If we have no asset IDs, then return an empty obj
	if (!ids) return {};

	if (!Array.isArray(ids)) {
		ids = [ids];
	}
	return articlesQuery({ ids })
		.catch(e => {
			console.error(`!!! Error getting article(s): ${ids}`);
			if (e.errors) console.error(e.errors);
		})
		.then(articles => articles);
}

const articlesQuery = gql(`query ($ids: [String!]!) {
    assets(ids: $ids) {
		headline
		shortHeadline
		title
		promoBrief
		pageURL {
		  long
		}
    }
  }
  `);

/**
 * Grabs presto asset data using `node path/to/content-api.js {prestoID}`
 */
async function main() {
	const assetId = process.argv[2];
	const asset = await getAsset(assetId);
}

async function getContentPackage(id = "") {
	// If we have no asset IDs, then return an empty obj
	if (!id) return {};

	return contentPackageQuery({ id })
		.catch(e => {
			console.error(`!!! Error getting content package: ${ids}`);
			console.error(e.toString());
		})
		.then(data => data);
}

// With this query, fetch a contentpackage's promo image, links/headlines/prestoIDs and related call-to-action texts (i.e. "Dig Deeper")
const contentPackageQuery = gql(`query ($id: String!) {
	contentpackage(id: $id) {
	  id
	  callToAction
	  title
	  promoImage {
		id
		... on image {
		  credit
		  crops {
			name
			path
		  }
		  imageURL: URL {
			absolute
			publish
		  }
		}
	  }
	  links {
		id
		headline
		url
	  }
	}
  }`);

if (require.main === module) {
	main().catch(console.error);
}

module.exports = {
	getPhotos,
	getCrop,
	getArticles,
	getContentPackage,
};
