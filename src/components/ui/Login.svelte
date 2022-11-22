<script>
	/**
	 * This component presents a pair of buttons with the proper URLs (suitable for UW user management):
	 * 	- Subscribe/Register now
	 * 	- Log in.
	 *
	 * It depends on the existence of the usual `fireEvent` function and the base Button.svelte
	 *
	 * REQUIRED PROPS
	 * @prop category | The string of the desired Google Analytics category. This often is the project slug
	 * @prop required_status | If set to "subscriber," then this component will adjust to reflect that. Otherwise defaults to registered content protection state.
	 *
	 * OPTIONAL PROPS
	 * @prop component | a short string used to differentiate subscribing from different parts of a page or app, such as "splash" or "roadblock"
	 * @prop label_sign_in_button | The text for the log in button
	 * @prop label_sign_up_button | The text for the sign up/subscribe button.
	 * @prop label_does_not_meet_requirements | The message displayed with the buttons. Has two different generic defaults based on content protection state
	 */

	// UTILS
	import { fireEvent } from "../../utils/analytics.js";
	import { fade } from "svelte/transition";

	// COMPONENTS
	import Button from "./Button.svelte";

	// ANALYTICS & CONTENT PROTECTION STRINGS
	const label = "inbound link";
	export let component = "";
	export let category = "";

	// LABELS
	export let label_sign_in_button = "Sign in";
	export let label_sign_up_button = "Sign up now";
	export let label_does_not_meet_requirements = "";

	// Allows us to toggle more easily. Will default to registration.
	export let isPremium = true;

	let default_message = isPremium
		? "This content is for subscribers only."
		: "Please register to view this content. It's free and easy to do.";

	// USER MANAGEMENT/LOGIN
	const signInLink = generateSignInLink();
	const signUpLink = isPremium
		? generateSubscribeLink({ category })
		: generateSignUpLink({ category });

	function getSource({ category, component }) {
		let source = category;
		if (component) source += `_${component}`;
		return source.replace(" ", "-");
	}

	// For users who are registered, but not signed in, this will create a link to send them to a sign-in page then return them the quiz.
	function generateSignInLink() {
		if (typeof window === "undefined" || !window.ga_data) {
			return "https://login.usatoday.com/USAT-GUP/authenticate";
		}

		const { baseName, topLevelDomain, uaid } = window.ga_data.site;
		const url = new URL(
			`https://login.${baseName}${topLevelDomain}/${uaid}-GUP/authenticate`
		);
		url.searchParams.set("success-url", window.location);
		url.searchParams.set("cancel-url", window.location);
		url.searchParams.set("return-url", window.location);
		return url.toString();
	}

	// For users who are not registered, this will create a link to send them to a signup page then return them the quiz.
	function generateSignUpLink({ category, component = "" }) {
		if (typeof window === "undefined" || !window.ga_data) {
			return "https://login.usatoday.com/USAT-GUP/authenticate?requested-state=create-account";
		}
		const { baseName, topLevelDomain, uaid } = window.ga_data.site;
		const url = new URL(
			`https://login.${baseName}${topLevelDomain}/${uaid}-GUP/authenticate`
		);

		url.searchParams.set("success-url", window.location);
		url.searchParams.set("cancel-url", window.location);
		url.searchParams.set("return-url", window.location);
		url.searchParams.set("reg_source", getSource({ category, component }));
		url.searchParams.set("reg_medium", "ONSITE");
		url.searchParams.set("reg_campaign", "[]");
		url.searchParams.set("reg_delivery", "ux");
		url.searchParams.set("requested-state", "create-account");
		return url.toString();
	}

	// For users who are not subscribers, this will create a link to send them to a subscription page
	function generateSubscribeLink({ category = "", component = "" }) {
		if (typeof window === "undefined" || !window.ga_data) {
			return `https://subscribe.usatoday.com/specialoffer`;
		}
		const { baseName, topLevelDomain } = window.ga_data.site;
		const url = new URL(`https://subscribe.${baseName}${topLevelDomain}/specialoffer`);
		url.searchParams.set("success-url", window.location);
		url.searchParams.set("cancel-url", window.location);
		url.searchParams.set("return-url", window.location);

		url.searchParams.set("gps-source", getSource({ category, component }));
		url.searchParams.set("itm_medium", "");
		url.searchParams.set("itm_source", "");
		url.searchParams.set("itm_campaign", category);
		url.searchParams.set("itm_content", "");
		return url.toString();
	}
</script>

<style>
	.login {
		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: stretch;
		text-align: center;
		gap: 16px 4px;
	}

	.login :global(.btn) {
		font-size: 16px;
		margin: 0;
		min-width: 200px;
		border-radius: 0;
	}

	.login__instructions {
		width: 100%;
		margin: 0;
	}
	p.login__instructions,
	a.login__secondary-btn {
		font: bold 16px/1.3em var(--fonts-sans-serif, sans-serif);
		color: var(--color-font);
		text-decoration-color: var(--color-accent);
	}

	.login__secondary-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--input-height, 44px);
		transition: background 150ms ease;
		padding: 0 1em;
	}

	.login__secondary-btn:hover,
	.login__secondary-btn:focus {
		background: #e0e0e0;
	}

	.login__secondary-btn:focus {
		outline: 2px solid var(--color-accent);
	}

	@media all and (min-width: 768px) {
		.login {
			text-align: center;
			justify-content: center;
		}
	}
</style>

<div class="login">
	<p class="login__instructions" transition:fade>
		{@html label_does_not_meet_requirements || default_message}
	</p>
	<Button
		label={label_sign_up_button}
		href={signUpLink}
		on:click={() => {
			const action = isPremium ? "subscription" : "registration";
			fireEvent({ category, action, label });
		}} />
	<a
		transition:fade
		class="login__secondary-btn"
		target="_blank"
		rel="noopener nofollow"
		href={signInLink}
		on:click={() => {
			const action = "sign in";
			fireEvent({ category, action, label });
		}}>
		{label_sign_in_button}</a>
</div>
