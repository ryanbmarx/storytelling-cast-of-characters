<script context="module">
	// Given an array of desired width URLs, this will generate an appropriate srcset string for
	// images stored on Fastly. The default values here are good enough to catch most images' needs.
	// Though it might seem absurd to generate urls for as much as 6K pixels, but a 2K image
	// on a 3x device would get you there.
	export function getSrcSet(src, widths = []) {
		if (!src) return;
		try {
			// Try parsing the URL.
			src = new URL(src);

			// Generate the srcset by iterating over the provided sizes
			return widths.map(width => {
				src.searchParams.set("width", width);
				return `${src.toString()} ${width}w`;
			});
		} catch (e) {
			// Something happened
			console.error(`Image URL not valid: ${src}`);
			console.error(e);
			// Just return the URL, as we were given it, in a basic srcset.
			return `${src} ${width}w`;
		}
	}
</script>

<script>
	export let src = "";
	export let alt = "";
	export let caption = "";
	export let credit = "";
	export let decorative = false;
	export let height = "";
	export let width = "";
	export let lazy = false;

	// sizes attribute will default to full-viewport
	export let sizes = "100vw";

	// Generic collection of widths to catch pretty much all possible pixel needs
	export let widths = [
		"100",
		"200",
		"300",
		"600",
		"800",
		"1100",
		"1500",
		"2000",
		"2500",
		"3000",
		"3500",
		"4000",
		"4500",
		"5000",
		"5500",
		"6000",
	];

	// Let's us use "class" as a prop
	// https://svelte.dev/repl/1d0b80898137445da24cf565830ce3f7?version=3.4.2
	let clazz = "";
	export { clazz as class };

	$: loading = lazy ? "lazy" : "eager";
	$: altText = decorative ? "" : alt;
	let srcset = getSrcSet(src, widths);
</script>

<style>
	.image {
		margin: 0;
		padding: 0;
		display: block;
		overflow: hidden;
	}

	img {
		width: 100%;
		display: block;
		object-fit: cover;
		object-position: center;
	}

	img.has-attributes {
		/* 
		When we have height and width attributes for a photo, which 
		is required for proper lazy loading, then we need set explicit height.
		*/
		width: 100%;
		height: 100%;
	}
	.image__caption {
		color: var(--color-font, #222);
		font: var(--font-size-image-caption, 14px) / 1.3em
			var(--fonts-sans-serif, sans-serif);
		margin-top: 8px;
	}

	.image__credit {
		display: inline-block;
		text-transform: uppercase;
		font-style: italic;
		margin: 0 0 0.5em;
	}
</style>

{#if src && (alt || decorative)}
	<figure class="image {clazz}">
		<img
			class:has-attributes={height && width}
			{src}
			{srcset}
			{sizes}
			alt={altText}
			{loading}
			{height}
			{width} />
		{#if caption || credit}
			<figcaption class="image__caption">
				{#if caption}{caption}{/if}
				{#if credit}<span class="image__credit">{credit}</span>{/if}
			</figcaption>
		{/if}
	</figure>
{/if}
