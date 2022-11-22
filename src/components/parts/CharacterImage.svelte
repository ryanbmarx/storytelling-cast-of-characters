<script>
	import Image from "../ui/Image.svelte";
	export let image = {};
	export let sizes;
	export let widths;
</script>

<style>
	.image-fpo {
		/* image placeholder will following image_ratio from the spreadsheet, defaulting to square */
		background: var(--image-fpo-background);
		width: 100%;

		padding-bottom: calc(
			100% * var(--image-ratio-height, 1) / var(--image-ratio-width, 1)
		);
	}

	@supports (aspect-ratio: 1 / 1) {
		.image-fpo {
			padding: 0;
			aspect-ratio: var(--image-ratio-width, 1) / var(--image-ratio-height, 1);
		}
	}
</style>

{#if image.src && image.alt}
	<Image {...image} lazy={true} {sizes} {widths} />
{:else}
	<div class="image-fpo" />
{/if}
