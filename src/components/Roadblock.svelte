<script>
	import { afterUpdate, onMount } from "svelte";

	// import Default from "./characters/Default.svelte";
	import LoginCast from "./LoginCast.svelte";
	import RoadblockFake from "./RoadblockFake.svelte";

	export let hasCategories;
	export let character_layout;
	export let hasImages;
	export let labels;
	export let characters;
	export let see_the_rest;

	let roadblock;
	let max = 6;

	// Use this resize observer  to keep the number of blurred chars in the roadblock to a single row.
	const resizeObserver =
		typeof window === "undefined"
			? null
			: new ResizeObserver(entries => {
					for (let entry of entries) {
						const width = entry.contentBoxSize[0].inlineSize;
						if (width) {
							max = Math.floor(width / 230);
						}
					}
			  });

	onMount(() => {
		if (typeof window !== "undefined") {
			resizeObserver.observe(roadblock);
		}
	});
</script>

<style>
	.roadblock {
		margin: 2rem 0;
		position: relative;
	}

	.roadblock :global(.login-wrapper) {
		position: absolute;
		top: 100px;
		left: 50%;
		transform: translate(-50%, 0);
		background: var(--color-background);
	}

	.roadblock .cast-section {
		filter: blur(1px);
	}

	:global([data-theme="dark"]) .roadblock .characters {
		opacity: 0.15;
	}

	.characters__inner {
		margin: 0;
		list-style: none;
		padding: 0;
		display: flex;
		flex-flow: row nowrap;
		gap: var(--cast-grid-gap);
	}

	.characters__inner li {
		flex: 1 1;
	}

	.characters__inner li :global(svg) {
		fill: #eee;
	}
</style>

<div class="roadblock" bind:this={roadblock}>
	<div class="characters cast-section" aria-hidden="true">
		<ul class="characters__inner">
			{#each Array(max) as _}
				<li><RoadblockFake /></li>
			{/each}
		</ul>
	</div>
</div>
