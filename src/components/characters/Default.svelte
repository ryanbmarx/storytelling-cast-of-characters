<script>
	import CharacterLabels from "../parts/CharacterLabels.svelte";
	import CharacterBullets from "../parts/CharacterBullets.svelte";
	import CharacterBlurbs from "../parts/CharacterBlurbs.svelte";
	import CharacterName from "../parts/CharacterName.svelte";
	import CharacterLinks from "../parts/CharacterLinks.svelte";
	import CharacterImage from "../parts/CharacterImage.svelte";
	import CharacterDescription from "../parts/CharacterDescription.svelte";

	import { trackInlineLinks } from "../../utils/analytics.js";
	import { contextKey } from "../../stores.js";
	import { getContext } from "svelte";

	export let id = "";
	export let kicker = "";
	export let name;
	export let badge;
	export let title = "";
	export let description = "";
	export let image = {};
	export let visible = true;
	export let category = "";
	export let labels = [];
	export let labelLookup = {};
	export let bullets = [];
	export let blurbs = [];
	export let links = [];
	export let h;
	// IMAGES
	// These get used to build the srcset
	export let widths = ["100", "200", "300", "200", "400", "600", "800", "900", "1200"];
	// These get passed through to be the image's `sizes` attribute
	// There should be a sizes for each character layout (with an image)
	// https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/sizes
	export let sizes =
		"(min-width: 460px) 50vw, (min-width: 690px) 33vw, (min-width: 920px) 25vw, (min-width: 1024px) 33vw, (min-width: 1100px) 25vw, 100vw";

	const { hasImages, bullets_header } = getContext(contextKey);

	// hide an image that fails to load
	function hideMissing(e) {
		e.target.remove();
	}
</script>

<style>
	.character--default {
		display: none;
		flex-flow: column nowrap;
		gap: 1rem;
	}

	.character--default.visible {
		display: flex;
	}
</style>

<li {id} class="character character--default" class:visible>
	{#if hasImages}
		<CharacterImage {image} {sizes} {widths} />
	{/if}
	<div class="character__text" use:trackInlineLinks>
		<CharacterName {h} {name} {title} {kicker} {badge} />
		<CharacterDescription {description} />
		<CharacterBlurbs {blurbs} h={h + 1} />
		<CharacterBullets {bullets} header={bullets_header} h={h + 1} {name} />
		<CharacterLinks {links} />
	</div>
	<CharacterLabels {labels} characterId={id} />
</li>
