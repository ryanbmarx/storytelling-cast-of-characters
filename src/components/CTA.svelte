<script>
	// For the context
	import { contextKey } from "../stores.js";
	import { getContext } from "svelte";
	import { fireEvent } from "../utils/analytics.js";
	import { isInternal } from "../utils/is-internal.js";
	import { inView } from "../utils/watch-for-element.js";

	import Button from "./ui/Button.svelte";

	export let position;
	export let cta_headline;
	export let cta_button_text;
	export let cta_link;
	export let cta_helper_text;
	export let cta_match_premium_state;
	let clazz;
	export { clazz as class };

	const { meets_required_status, cast_project } = getContext(contextKey);

	// Logic to determine if we need to see the CTA in this case
	function shouldDisplay() {
		// Don't show if we don't have required stuff
		if (!cta_headline && !cta_link) return false;

		// If we don't care about CPS, show it.
		if (!cta_match_premium_state) return true;

		// We _do_ care about premium state, so check if this person meets our requirement.
		return meets_required_status;
	}

	function handleClick(e) {
		const category = `${isInternal ? "internal" : "outbound"} links`;
		const action = `Cast of Characters CTA ${position}`;
		const label = `to ${cta_link}`;

		fireEvent({ category, action, label });
	}

	// Sets up the inview event for the CTA
	function handleInView(element) {
		// REGISTER EVENT FOR LAST CHARACTER
		// This will select the last character in each section
		// let last = document.querySelectorAll(".character:last-of-type");
		// if (last[last.length - 1]) {
		// 	// Set up an inview for the last element in our nodelist
		inView({
			element,
			once: true,
			cb: () => {
				fireEvent({
					category: "scroll tracking",
					action: `CTA in view ${position}`,
					label: `cast of characters ${cast_project}`,
				});
			},
		});
	}
</script>

<style>
	.cta {
		box-sizing: border-box;
		padding: 1.2rem 2rem;
		margin: 2.5rem auto;

		display: flex;
		flex-flow: row wrap;
		justify-content: center;
		align-items: center;
		gap: 1rem;

		position: relative;
	}

	.cta::before {
		content: "";
		width: 2rem;
		height: 2rem;

		position: absolute;
		top: 0;
		left: 0;

		border-top: 6px solid var(--color-accent);
		border-left: 6px solid var(--color-accent);
	}

	.cta__headline {
		flex: 1 1 100%;
		width: 100%;
		text-align: center;
		font: bold 1.7rem/1.3em var(--fonts-sans-serif);
		color: var(--color-font);
		margin: 0;
	}

	.cta__helper {
		font: italic 1rem/1.3rem var(--fonts-sans-serif);
		margin: 0;
	}

	.cta :global(.cta__button) {
		margin: 0;
	}
</style>

{#if shouldDisplay()}
	<aside class="cta {clazz} cast-section--content-width" use:handleInView>
		<h1 class="cta__headline headline">{cta_headline}</h1>
		<Button
			class="cta__button"
			label={cta_button_text}
			href={cta_link}
			on:click={handleClick} />
		{#if cta_helper_text}
			<p class="cta__helper">{cta_helper_text}</p>
		{/if}
	</aside>
{/if}
