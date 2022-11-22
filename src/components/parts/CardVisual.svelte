<script>
	import { trackInlineLinks } from "../../utils/analytics.js";
	import { randomNumber } from "../../utils/random.js";
	import { base } from "../../utils/links.js";

	import CharacterImage from "./CharacterImage.svelte";
	import CharacterName from "./CharacterName.svelte";
	import CharacterDescription from "./CharacterDescription.svelte";

	let clazz;
	export { clazz as class };

	export let card_text_alignment, card_name_position, card_image_mask;
	export let h, name, title, kicker, badge;
	export let description, image;

	// IMAGES
	// These get used to build the srcset
	export let widths = ["300", "400", "600", "800", "900", "1200"];
	// These get passed through to be the image's `sizes` attribute
	// There should be a sizes for each character layout (with an image)
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes
	export let sizes = "(min-width: 700px) 50vw, (min-width: 1200px) 33vw, 100vw";

	const MASKS = [
		"circle.svg",
		"notch-ne.svg",
		"notch-nw.svg",
		"notch-sw.svg",
		"notch-se.svg",
		"notch-ne-nw.svg",
		"octogon.svg",
	];

	// Randomly pull a mask from the list, and make a URL to the SVG asset.
	const { ASSET_PATH } = base();
	const mask = card_image_mask
		? `url(${new URL(
				`card-masks/${MASKS[randomNumber(0, MASKS.length - 1)]}`,
				ASSET_PATH
		  ).toString()})`
		: null;
</script>

<style>
	.visual {
		--card-mask: url("card-masks/circle.svg");

		background: black;
	}

	.visual :global(.image),
	.visual :global(.image-fpo) {
		height: 100%;
	}
	.visual--mask.visual :global(.image::before) {
		content: "";
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background: var(--card-mask);
		opacity: 0.7;
	}

	.visual.visual--mask :global(p) {
		background: none;
		min-height: 38%;
	}

	.visual__text {
		box-sizing: border-box;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 40%;
		padding: 1rem;

		text-align: center;
		background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.95));

		display: flex;
		flex-flow: column;
		align-items: center;
		justify-content: center;
	}

	.visual--name-bottom .visual__text {
		padding-bottom: 1.5rem;
		justify-content: end;
	}

	.visual__text :global(:is(.character__name, p)) {
		font: bold 1.7rem/1.2em var(--fonts-sans-serif);
		color: white;
		margin: 0;
	}

	.visual__text :global(p strong) {
		/* When showing the description, make strong tags reversed out with accent color */
		background-color: var(--color-accent);
		color: var(--color-accent-text);
		padding: 0 0.2em 0.1em 0.2em;
	}

	.visual__text :global(.character__title) {
		font: bold 1rem/1.3em var(--fonts-sans-serif);
		color: white;
		margin: 0;
	}
</style>

<div
	style:--card-mask={mask}
	class="{clazz} visual"
	class:visual--name-bottom={card_text_alignment === "bottom"}
	class:visual--mask={card_image_mask}
	use:trackInlineLinks>
	<CharacterImage {image} {sizes} {widths} />
	{#if card_name_position === "card"}
		<div class="visual__text">
			<CharacterName {h} {name} {title} {kicker} {badge} />
		</div>
	{:else if description}
		<div class="visual__text">
			<CharacterDescription {description} />
		</div>
	{/if}
</div>
