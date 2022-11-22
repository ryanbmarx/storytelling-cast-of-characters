<script context="module">
	const cards = new Set();
	export function flipAll(display = "back") {
		cards.forEach(c => {
			c.flip(null, display);
		});
	}
</script>

<script>
	// PARTS
	import CharacterLabels from "../parts/CharacterLabels.svelte";
	import CharacterName from "../parts/CharacterName.svelte";
	import CardVisual from "../parts/CardVisual.svelte";
	import CardText from "../parts/CardText.svelte";

	// UTILS
	import { fireEvent } from "../../utils/analytics.js";
	import { base } from "../../utils/links.js";
	import { contextKey } from "../../stores.js";
	import { getContext, onMount } from "svelte";
	import { randomNumber } from "../../utils/random.js";
	import { inView } from "../../utils/watch-for-element.js";

	const { ASSET_PATH } = base();

	export let id = "";
	export let index;
	export let kicker = "";
	export let name;
	export let badge;
	export let title = "";
	export let description;
	export let image = {};
	export let visible = true;
	export let category = "";
	export let labels = [];
	export let labelLookup = {};
	export let bullets = [];
	export let blurbs = [];
	export let links = [];
	export let layout; // The name of the layout
	export let card_image_mask = true;
	export let color_accent = null;
	export let color_accent_text = null;
	export let color_accent_screen = null;
	export let color_accent_screen_text = null;
	export let h;
	export let thumbnail = {};
	// A ref to the component
	let card;

	// We gonna reverse them?
	let reverse = layout.includes("reverse");

	// We gonna flip them or let them be side-by-side?
	let split = layout.includes("side_by_side");

	// The boolean to set the flipped-over state.
	// The first card in each category will be flipped.
	let flipped = index === 0 && !split;

	const { bullets_header, cast_project, card_text_alignment, card_name_position } =
		getContext(contextKey);

	function flip(e, direction) {
		switch (direction) {
			case "back":
				// Show the back
				flipped = true;
				break;
			case "front":
				// Show the front
				flipped = false;
				break;
			default:
				// Otherwise just reverse what we have
				flipped = !flipped;
		}
	}

	// Rando negative number between 0 and 1, with a little extra
	const cardFrontRotate = `${(Math.random() + 0.2) * -1}deg`;
	// Rando positive number between 0 and 1, with a little extra
	const cardBackRotate = `${Math.random() + 0.2}deg`;
	// Rando negative number between 1 and 2
	const cardBackShiftX = `${randomNumber(0, 5) / -10}rem`;
	// Rando positive number between 1 and 2
	const cardBackShiftY = `${Math.random() + 1}rem`;

	onMount(() => {
		// Add our card to the master list of cards
		const instance = { flip };
		cards.add(instance);

		// REGISTER THE HINT FLIP FOR THE FIRST CARD

		if (index === 0) {
			inView({
				once: true,
				element: card,
				rootMargin: "-50% 0px",
				cb: () => {
					flipped = false;
					fireEvent({
						category: "scroll tracking",
						action: "hint card seen",
						label: `cast of characters ${cast_project}, category: ${category}`,
					});
				},
			});
		}

		return () => {
			cards.delete(instance);
		};
	});

	// Sets up the click listener, if we want to use it.
	function cardListeners(node) {
		// Only want to do this if we are the flippable version
		// So if we are split, then .... well, split.
		if (split) return;
		node.addEventListener("click", e => {
			flip();
			fireEvent({
				category: "content",
				action: "grid",
				label: `Card back side ${flipped ? "revealed" : "hidden"}`,
			});
		});
	}
</script>

<style>
	.character--card :global(p),
	div {
		box-sizing: border-box;
	}

	.character--card :global(.character__name) {
		margin-bottom: 0;
	}

	/* ------------------------ 
    This establishes the LAYOUT of the card. The "front" is displayed by default and on page load. 
    The "back" is what is seen when the card is flipped.
    ------------------------ */
	.character--card {
		--card-gap: 1rem;
		--card-border-radius: 8px;
		--card-max-width: 400px;
		--card-aspect-ratio-h: 358;
		--card-aspect-ratio-w: 256;
		--card-front-rotate: -1deg;
		--card-back-rotate: -1deg;
		--card-back-shift-Y: 2rem;
		--card-back-shift-X: 0;

		display: none;
		flex-flow: column nowrap;
		gap: var(--card-gap);
		position: relative;
	}

	.character--card.visible {
		display: flex;
	}

	.card-wrapper {
		cursor: pointer;
		position: relative;

		margin: 0 å;
		width: 100%;
		max-width: var(--card-max-width);

		/* Set the overall card shape */
		aspect-ratio: var(--card-aspect-ratio-w) / var(--card-aspect-ratio-h);
	}

	.card {
		--transform-transition-speed: 1s;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		float: left;
		perspective: 500px;
	}

	.split .card {
		--transform-transition-speed: 0;
	}

	.content {
		position: absolute;
		width: 100%;
		height: 100%;
		box-shadow: 3px 3px 4px rgba(0, 0, 0, 0.35);
		border-radius: var(--card-border-radius);
		outline: 0px solid var(--color-font);
		transition: transform var(--transform-transition-speed) ease-in-out,
			outline-width 150ms ease-in-out;
		-webkit-transform-style: preserve-3d;
		transform-style: preserve-3d;
	}

	.content:hover {
		/* Give user a little indication that there is a click action */
		/* Just offer a "peek" */
		transform: rotateY(-4deg);
		transition: transform 0.25s;
	}

	.content:focus {
		outline-width: 3px;
	}

	.flipped .card .content,
	.flipped .card .content:hover {
		/* Add hover state to prevent the "peeking" action from happening */
		transform: rotateY(-180deg);
		transition: transform 0.5s;
		box-shadow: -3px 3px 4px rgba(0, 0, 0, 0.35);
	}

	.character :global(:is(.front, .back)) {
		position: absolute;
		height: 100%;
		width: 100%;
		border-radius: var(--card-border-radius);
		overflow: hidden;
		-webkit-backface-visibility: hidden;
		backface-visibility: hidden;
	}
	.character :global(.back) {
		transform: rotateY(180deg);
		box-sizing: border-box;
	}
	/* ------------------------ 
    Set up the side-by-side layout
    ------------------------ */

	.split .card-wrapper {
		aspect-ratio: unset;
		max-width: unset;
		cursor: unset;
	}

	.split .card {
		position: static;
		float: none;
		perspective: unset;
	}
	.split .content {
		position: unset;
		box-shadow: none;
		transform: none;
	}
	.split .content:hover {
		transform: none;
	}

	.split :global(:is(.front, .back)) {
		height: unset;
		position: relative;
		box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.35);
		aspect-ratio: var(--card-aspect-ratio-w) / var(--card-aspect-ratio-h);
		width: 95%;
	}
	.split :global(.front) {
		/* So it sits over the back card */
		z-index: 2;
	}
	.split :global(.back) {
		margin-top: 1rem;
		transform: none;
		margin: calc(-1 * var(--card-gap)) 0 0 auto;
	}

	@media all and (min-width: 767px) {
		.split .content {
			display: flex;
			transform: none;
			padding-bottom: 2rem;
			max-width: 800px;
		}

		.split :global(.front) {
			transform: rotate(var(--card-front-rotate));
		}

		.split :global(.back) {
			transform: translate(var(--card-back-shift-X), var(--card-back-shift-Y))
				rotate(var(--card-back-rotate));
		}
		.split :global(:is(.front, .back)) {
			flex: 1 1 var(--card-max-width);
			margin: 0;
		}
	}
</style>

<li
	bind:this={card}
	{id}
	class="character character--card"
	class:visible
	class:reverse
	class:split
	style:--color-accent={color_accent}
	style:--color-accent-text={color_accent_text}
	style:--color-accent-screen={color_accent_screen}
	style:--color-text={color_accent_screen_text}
	style:--card-front-rotate={cardFrontRotate}
	style:--card-back-rotate={cardBackRotate}
	style:--card-back-shift-X={cardBackShiftX}
	style:--card-back-shift-Y={cardBackShiftY}>
	{#if card_name_position === "top"}
		<CharacterName {h} {name} {title} {kicker} {badge} />
	{/if}
	<div class="card-wrapper" class:flipped use:cardListeners>
		<div class="card">
			<div class="content" tabindex="0">
				{#if reverse}
					<!-- Shows the text-heavy side on load -->
					<CardText
						class="front"
						{h}
						{thumbnail}
						{bullets}
						{name}
						{blurbs}
						{links}
						{bullets_header} />
					<CardVisual
						class="back"
						{card_text_alignment}
						{card_name_position}
						{description}
						{card_image_mask}
						{h}
						{name}
						{title}
						{kicker}
						{image}
						{badge} />
				{:else}
					<!-- Shows the visual side on load -->
					<CardVisual
						class="front"
						{card_text_alignment}
						{card_name_position}
						{description}
						{card_image_mask}
						{h}
						{name}
						{title}
						{kicker}
						{image}
						{badge} />
					<CardText
						class="back"
						{h}
						{thumbnail}
						{bullets}
						{name}
						{blurbs}
						{links}
						{bullets_header} />
				{/if}
			</div>
		</div>
	</div>
	<CharacterLabels {labels} />
</li>
