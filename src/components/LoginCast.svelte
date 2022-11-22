<script>
	/**
	 * This is a wrapper component around our base Login component. It's purpose is to handle
	 * the context and any possible logic to configure the various labels and analytics
	 * variables required by the base component
	 */
	import { getContext } from "svelte";
	import { contextKey } from "../stores.js";

	// COMPONENTS
	import Login from "./ui/Login.svelte";

	export let see_the_rest = null;
	export let component = "";

	const {
		label_sign_in_button,
		label_sign_up_button,
		label_does_not_meet_requirements,
		isPremium,
		cast_project,
	} = getContext(contextKey);
</script>

<style>
	.login-wrapper {
		box-sizing: border-box;
		border: 1px solid black;
		padding: 1.5rem 2rem;
		max-width: 600px;
	}

	.login-wrapper :global(.login) {
		max-width: 60ch;
		margin: 0 auto;
	}
	.login-wrapper :global(.login p) {
		font-size: 1.3em;
	}
	:global([data-theme="dark"]) .login-wrapper {
		border: 1px solid var(--color-font);
	}
</style>

<div class="login-wrapper">
	<Login
		{label_sign_in_button}
		{label_sign_up_button}
		label_does_not_meet_requirements={see_the_rest || label_does_not_meet_requirements}
		{isPremium}
		{component}
		category={`Cast of Character_${cast_project}`} />
</div>
