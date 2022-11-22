<script>
	// PARTS
	import CharacterLabels from "../parts/CharacterLabels.svelte";
	import CharacterBullets from "../parts/CharacterBullets.svelte";
	import CharacterBlurbs from "../parts/CharacterBlurbs.svelte";
	import CharacterName from "../parts/CharacterName.svelte";
	import CharacterLinks from "../parts/CharacterLinks.svelte";
	import CharacterThumbnail from "../parts/CharacterThumbnail.svelte";
	import CharacterDescription from "../parts/CharacterDescription.svelte";

	// UTILS
	import { contextKey } from "../../stores.js";
	import { getContext } from "svelte";
	import { trackInlineLinks } from "../../utils/analytics.js";

	const { bullets_header } = getContext(contextKey);

	export let id = "";
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
</script>

<style>
	.character.character--wide {
		display: none;
		align-content: flex-start;
		gap: 1rem;
		grid-template: auto / repeat(3, minmax(1px, 1fr));
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

	.character--wide :global(.character__bullets) {
		/* padding: 1em 1em 1em 2em; */
		margin-bottom: 1em;
		/* background: #eee; */
	}

	.character--wide :global(.character__labels) {
		margin: 0;
	}

	.character__details {
		grid-column: 1/-1;
		display: block;
	}

	.character.character--wide :global(p) {
		/* Optimum width of body text */
		max-width: 70ch;
	}

	/* VISIBLE STATE */
	.character.character--wide.visible {
		display: grid;
	}

	@media all and (min-width: 768px) {
		.character--wide :global(.character__name) {
			font: normal 26px/1.3em var(--fonts-serif);
		}

		.character--wide :global(.character__bullets) {
			padding: 1em 1em 1em 2em;
			background: #eee;
		}

		.character__text {
			grid-column: 1 / 3;
		}

		.character__details {
			grid-column: 3;
			grid-row: 1;
		}
	}
</style>

<li {id} class="character character--wide" class:visible>
	<div class="character__text" use:trackInlineLinks>
		<CharacterName {h} {name} {title} {kicker} {badge} />
		{#if thumbnail.src}<CharacterThumbnail {...thumbnail} />{/if}
		<CharacterDescription {description} />
		<CharacterBlurbs {blurbs} h={h + 1} />
		<CharacterLinks {links} />
	</div>
	<div class="character__details">
		<CharacterBullets {bullets} header={bullets_header} h={h + 1} {name} />
		<CharacterLabels {labels} characterId={id} />
	</div>
</li>
