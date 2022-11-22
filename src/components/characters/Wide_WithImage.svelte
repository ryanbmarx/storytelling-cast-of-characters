<script>
	// PARTS
	import CharacterLabels from "../parts/CharacterLabels.svelte";
	import CharacterBullets from "../parts/CharacterBullets.svelte";
	import CharacterBlurbs from "../parts/CharacterBlurbs.svelte";
	import CharacterName from "../parts/CharacterName.svelte";
	import CharacterImage from "../parts/CharacterImage.svelte";
	import CharacterThumbnail from "../parts/CharacterThumbnail.svelte";
	import CharacterLinks from "../parts/CharacterLinks.svelte";
	import CharacterDescription from "../parts/CharacterDescription.svelte";

	// UTILS
	import { contextKey } from "../../stores.js";
	import { getContext } from "svelte";
	import { trackInlineLinks } from "../../utils/analytics.js";

	const { bullets_header } = getContext(contextKey);

	export let id = null;
	export let kicker = "";
	export let name;
	export let badge;
	export let title;
	export let description;
	export let image = {};
	export let thumbnail = {};
	export let visible;
	export let category = "";
	export let labels = [];
	export let labelLookup = {};
	export let bullets = [];
	export let blurbs = [];
	export let links = [];
	export let h;
	// IMAGES
	export let widths = [
		200, 300, 400, 500, 600, 700, 800, 1000, 1200, 900, 1400, 1500, 1800, 2100,
	];
	export let sizes = "(min-width:768px) 33vw,(min-width:1024px) 25vw, 100vw";
</script>

<style>
	.character.character--wide {
		display: none;
		align-content: flex-start;
		gap: 1rem;
		grid-template: auto minmax(1px, 1fr) / repeat(3, minmax(1px, 1fr));
	}

	.character--wide :global(.image),
	.character--wide :global(.image-fpo) {
		align-self: flex-start;
		grid-column: 1/-1;
	}

	.character--wide :global(.character__name) {
		font: normal 23px/1.3em var(--fonts-serif);
	}

	.character__text {
		grid-column: 1 / -1;
	}

	.character--wide :global(p:last-child) {
		margin-bottom: 0;
	}

	.character--wide :global(.character__bullets),
	.character--wide :global(.character__labels) {
		margin: 0;
		grid-column: 1/-1;
	}

	.character.character--wide :global(p) {
		/* Optimum width of body text */
		max-width: 70ch;
	}

	.character--wide .character__text {
		grid-column: 1 / -1;
	}
	/* VISIBLE STATE */
	.character.character--wide.visible {
		display: grid;
	}

	@media all and (min-width: 768px) {
		.character--wide :global(.character__name) {
			font: normal 26px/1.3em var(--fonts-serif);
		}

		.character--wide :global(.image),
		.character--wide :global(.image-fpo) {
			grid-column: 1;
			grid-row: 1/ -1;
			max-width: unset;
		}

		.character--wide .character__text {
			grid-column: 2 / -1;
		}
		.character--wide :global(.character__labels) {
			margin: 0;
			grid-column: 2/-1;
		}

		.character--wide :global(.character__bullets) {
			grid-column: 2/-1;
		}
	}
</style>

<li {id} class="character character--wide" class:visible>
	<CharacterImage {image} {sizes} {widths} />
	<div class="character__text" use:trackInlineLinks>
		<CharacterName {h} {name} {title} {kicker} {badge} />
		{#if thumbnail.src}<CharacterThumbnail {...thumbnail} />{/if}
		<CharacterDescription {description} />
		<CharacterBlurbs {blurbs} h={h + 1} />
		<CharacterLinks {links} />
	</div>
	<CharacterBullets {bullets} header={bullets_header} h={h + 1} {name} />
	<CharacterLabels {labels} characterId={id} />
</li>
