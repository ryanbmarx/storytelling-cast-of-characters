<script>
	import Button from "./ui/Button.svelte";
	import throttle from "lodash.throttle";
	import { onMount } from "svelte";
	import { flipAll } from "./characters/Card.svelte";
	import { fireEvent } from "../utils/analytics.js";

	// When true, a click will flip all the cards so that the back is visible.
	export let flipBack = true;
	export let label = "Flip all the cards";
	export let instructions = "Click or tap on a card to learn more.";

	let stuck = false;
	let controls;

	onMount(() => {
		// Set up an IO to track the "stuck" state.
		// https://davidwalsh.name/detect-sticky
		const observer = new IntersectionObserver(
			([e]) => {
				stuck = e.intersectionRatio < 1;
			},
			{ threshold: [1] }
		);

		observer.observe(controls);
	});

	// Triggers the flip-all action.
	function handleFlip(e) {
		const direction = flipBack ? "back" : "front";
		fireEvent({
			category: "content",
			action: "grid",
			label: `all cards flipped ${direction}`,
		});
		flipAll(direction);
		flipBack = !flipBack;
	}
</script>

<style>
	:global(#cards-toggle) {
		--btn-color-accent: var(--color-accent);
		--btn-color-accent-text: var(--color-accent-text);
		position: relative;
		z-index: 3;
		flex: none;
	}

	.card-toggle-controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin: var(--cast-grid-gap) 0;
	}

	.card-toggle-controls p {
		flex: 1 1 300px;
		margin: 0;
		transition: opacity 150ms ease-in-out;
	}

	@media all and (min-width: 768px) {
		.card-toggle-controls p {
			text-align: left;
		}
	}
	@media all and (min-width: 1024px) {
		.card-toggle-controls {
			margin: 0;
			position: sticky;
			padding-top: var(--cast-nav-height);
			margin-top: calc(-1 * var(--cast-nav-height));
			top: -1px;
			flex-flow: row-reverse nowrap;
			justify-content: flex-end;
		}

		.card-toggle-controls p {
			text-align: right;
			font-family: var(--fonts-sans-serif);
			font-size: var(--font-size-small);
		}

		/* THIS IS THE FLIP BUTTON AND IT'S STATES */
		.stuck :global(#cards-toggle) {
			--btn-color-background: var(--color-font-muted);
			--btn-color-border: var(--color-font-muted);
			--touch-target: 2rem;
			box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);
			opacity: 0.8;
			padding: 0 0.4em;
			transition: opacity 150ms ease-in-out, background 150ms ease-in-out;
		}
		.stuck :global(#cards-toggle:hover),
		.stuck :global(#cards-toggle:focus) {
			--btn-color-background: var(--color-font);
			transform: none;
			opacity: 1;
		}

		.stuck :global(#cards-toggle:focus) {
			outline: 2px solid var(--color-accent);
		}

		/* More stuck styles */
		.card-toggle-controls.stuck {
			z-index: 3;
		}

		.stuck p {
			transform: translate(-100%, 0);
			opacity: 0;
		}
	}
</style>

<div class="card-toggle-controls" class:stuck bind:this={controls}>
	<Button id="cards-toggle" {label} on:click={handleFlip} />
	<p>{instructions}</p>
</div>
