<script>
	import { getContext } from "svelte";
	import { contextKey } from "../../stores.js";
	import Label from "./CharacterLabel.svelte";

	const { labelLookup, filterLabels } = getContext(contextKey);

	export let labels = [];
	export let characterId = "";
</script>

<style>
	.character__labels {
		padding: 0;
		list-style: none;

		display: block;

		display: flex;
		align-items: center;
		flex-flow: row wrap;
		align-content: flex-start;
		gap: 0.5em;
	}

	.character__labels li {
		flex: none;

		max-width: -moz-fit-content;
		max-width: fit-content;

		display: block;
	}
</style>

{#if labels.length}
	<ul class="character__labels">
		{#each labels as label}
			<li>
				<Label bind:group={$filterLabels} {characterId} {...labelLookup[label]} />
			</li>
		{/each}
	</ul>
{/if}
