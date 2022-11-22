<script>
	import Image from "../ui/Image.svelte";
	export let sizes = "125px";
	export let widths = [100, 125, 200, 250, 300, 375, 400];
	export let src, alt, height, width;
</script>

<style>
	:global(.cast-thumbnail.image) {
		width: clamp(100px, 25%, 125px);
		float: left;
		margin: 0 1em 1em 0;
	}
</style>

{#if src && alt}
	<Image
		class="cast-thumbnail"
		{src}
		{alt}
		{height}
		{width}
		{sizes}
		{widths}
		caption={null}
		credit={null}
		lazy={true} />
{/if}
