<script>
	import { trackInlineLinks } from "../../utils/analytics.js";

	// PARTS
	import CharacterBullets from "../parts/CharacterBullets.svelte";
	import CharacterBlurbs from "../parts/CharacterBlurbs.svelte";
	import CharacterLinks from "../parts/CharacterLinks.svelte";
	import CharacterThumbnail from "../parts/CharacterThumbnail.svelte";

	export let thumbnail = {};
	export let bullets = [];
	export let bullets_header = "";
	export let blurbs = [];
	export let links = [];
	export let name;
	export let h;

	let clazz;
	export { clazz as class };
</script>

<style>
	.visual {
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

	.text {
		box-sizing: border-box;
		background: var(--color-accent-screen);
		border-top: 0.75rem solid var(--color-accent);
		border-bottom: 0.75rem solid var(--color-accent);
		padding: var(--card-gap);
		overflow: scroll;
	}

	.text > :global(*) {
		margin: 0 0 1rem 0;
	}

	.text > :global(*:last-child) {
		margin-bottom: 0;
	}

	.text :global(.image.cast-thumbnail) {
		margin: 0 0 1rem 1rem;
		float: right;
	}

	.visual :global(p) {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 1rem;

		margin: 0;
		font: bold 1.7rem/1.2em var(--fonts-sans-serif);
		color: white;
		text-align: center;
		background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.95));

		/* Make sure everything is vertically centered in the card text space */
		min-height: 30%;
		display: flex;
		flex-flow: column;
		align-items: center;
		justify-content: center;
	}
	.visual :global(p strong) {
		background-color: var(--color-accent);
		color: var(--color-accent-text);
		padding: 0 0.2em 0.1em 0.2em;
	}

	.visual.visual--mask :global(p) {
		background: none;
		min-height: 38%;
	}
</style>

<div class="{clazz} text" use:trackInlineLinks>
	{#if thumbnail.src}<CharacterThumbnail {...thumbnail} />{/if}
	<CharacterBullets {bullets} header={bullets_header} h={h + 1} {name} />
	<CharacterBlurbs {blurbs} h={h + 1} />
	<CharacterLinks {links} />
</div>
