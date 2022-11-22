<script>
	import { contextKey } from "../stores.js";
	import { getContext } from "svelte";
	import { fireEvent } from "../utils/analytics.js";

	const { filterLabels, reset_button_label, searchString } = getContext(contextKey);

	function reset(e) {
		const action = "content|filter panel";
		const label = "Filters reset";
		fireEvent({ action, label });

		$searchString = "";
		$filterLabels = [];
	}
</script>

<style>
	button {
		font: var(--font-size-small) / 1.3em var(--fonts-sans-serif);
		border-radius: 0;
		border: none;
		background: transparent;

		display: flex;
		justify-content: center;
		align-items: center;

		min-height: var(--touch-target);
		padding: 0.5em;
		margin: 0;
		cursor: pointer;
		transition: background var(--transition) ease;
		text-decoration: underline;
		color: var(--color-font-muted);
	}

	button:hover,
	button:focus {
		background: var(--color-screen-light);
	}
</style>

<button class="reset" on:click={reset}>{reset_button_label}</button>
