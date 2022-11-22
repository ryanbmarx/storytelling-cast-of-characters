// This is dummy data simulating a nonsubscriber, not logged in user.
function noUser() {
	return {
		meta: {
			status: 200,
			message: "User found.",
			isAnonymous: true,
			unmetRequirements: ["firstName", "lastName"],
			allRequirementsMet: false,
			isAuthenticatedInCurrentContext: false,
			market_relationship: "anonymous",
		},
		response: {
			always_anonymousId: "ANONYMOUS",
			clientId: "ANONYMOUS_CLIENT_ID",
			client: {
				attributes: {},
				insights: {},
			},
			anonymousId: "ANONYMOUS",
			user: {
				licensePaymentHistory: [],
				profileAttributes: {},
			},
			attributes: {},
			propensitySubscribe: {
				ex: false,
				na: true,
				sub: false,
				no: true,
			},
			insights: {},
		},
	};
}

export async function meetsRequiredStatus(requiredStatus = "any") {
	if (typeof window === "undefined") {
		// If we are SSRing, send back true only if it is a free thing. Otherwise send back false
		return requiredStatus === "any";
	}

	// Get the user data object, or our default if something has gone wrong.
	let user = {};
	try {
		user = await Gallium.user;
	} catch (e) {
		user = noUser();
		console.error(e);
	}

	switch (requiredStatus) {
		case "subscriber":
			return user?.meta?.market_relationship === "subscriber";
		case "registered":
			// Compare to the boolean here so we are always sending back a boolean, even if the user prop is `null`
			return user?.response?.user?.hasMarketAccess === true;
		default:
			return true;
	}
}
