<script>
	import CharacterLabels from "../parts/CharacterLabels.svelte";
	import CharacterBullets from "../parts/CharacterBullets.svelte";
	import CharacterBlurbs from "../parts/CharacterBlurbs.svelte";
	import CharacterName from "../parts/CharacterName.svelte";
	import CharacterImage from "../parts/CharacterImage.svelte";
	import CharacterLinks from "../parts/CharacterLinks.svelte";
	import CharacterThumbnail from "../parts/CharacterThumbnail.svelte";
	import CharacterDescription from "../parts/CharacterDescription.svelte";

	import { contextKey } from "../../stores.js";
	import { getContext } from "svelte";
	import { trackInlineLinks } from "../../utils/analytics.js";

	export let id = "";
	export let kicker = "";
	export let badge;

	export let name;
	export let title = "";
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

	// Pass through for the images
	export let sizes =
		"(min-width:700px) 50vw,(min-width:1024px) 75vw,(min-width:1100px) 33vw, 100vw";
	export let widths = [200, 400, 600, 800, 1200, 1600, 1800, 2400];

	const { hasImages, bullets_header } = getContext(contextKey);
</script>

<style>
	.character.character--medium {
		display: none;
	}

	.character__text > :global(.character__name),
	.character__text > :global(*),
	.character.character--medium > :global(*) {
		margin-top: 0;
		margin-bottom: 1rem;
	}
	.character.character--medium > :global(*:last-child) {
		margin-bottom: 0;
	}

	.character--medium :global(.character__name) {
		font: normal 23px/1.3em var(--fonts-serif);
	}

	/* IF THERE IS AN IMAGE */
	.character--images :global(.image),
	.character--images :global(.image-fpo) {
		margin: 0 0 1em 0;
	}

	.character__text {
		display: flow-root;
	}

	.character__text > :global(*) {
		margin-top: 0;
		margin-bottom: 1rem;
	}
	.character__text > :global(*:last-child) {
		margin-bottom: 0;
	}

	.character--medium :global(p:last-child) {
		margin-bottom: 0;
	}

	.character--medium :global(.character__labels) {
		margin: 0;
	}

	.character.character--medium :global(p) {
		/* Optimum width of body text */
		max-width: 70ch;
	}

	/* VISIBLE STATE */
	.character.character--medium.visible {
		display: block;
	}

	@media all and (min-width: 768px) {
		.character--medium :global(.character__name) {
			font: normal 26px/1.3em var(--fonts-serif);
		}
	}
</style>

<li
	class="character character--medium"
	class:character--images={hasImages}
	{id}
	class:visible>
	<div class="character__text" use:trackInlineLinks>
		{#if hasImages}<CharacterImage {image} {sizes} {widths} />{/if}
		<CharacterName {name} {title} {kicker} {badge} {h} />
		<CharacterBullets {bullets} header={bullets_header} h={h + 1} {name} />
		{#if thumbnail.src}<CharacterThumbnail {...thumbnail} />{/if}
		<CharacterDescription {description} />
		<CharacterBlurbs {blurbs} h={h + 1} />
		<CharacterLinks {links} />
	</div>
	<CharacterLabels {labels} characterId={id} />
</li>
