<script>
	import { fireEvent } from "../../utils/analytics.js";
	import { getContext } from "svelte";
	import { contextKey } from "../../stores.js";

	export let characterId = "";
	export let id = "";
	export let name = "";
	export let description = "";

	export let group = "";
	export let checked = false;
	let value = id;

	const { filterLabels } = getContext(contextKey);

	function labelClick(e) {
		fireEvent({
			category: `content`,
			action: `character label`,
			label: `Filtered by label`,
		});
	}

	// * Export checked value for group bindings cribbed from: https://svelte.dev/repl/de117399559f4e7e9e14e2fc9ab243cc?version=3.12.15
	$: updateCheckbox(group);
	$: updateGroup(checked);

	function updateCheckbox(group) {
		checked = group.indexOf(value) >= 0;
	}

	function updateGroup(checked) {
		const index = group.indexOf(value);
		if (checked) {
			if (index < 0) {
				group.push(value);
				group = group;
			}
		} else {
			if (index >= 0) {
				group.splice(index, 1);
				group = group;
			}
		}
	}
</script>

<style>
	input[type="checkbox"] {
		visibility: hidden;
		position: absolute;
		top: 15px;
		left: 15px;
		transform: translate(-50%, -50%);
		z-index: 1;
	}
	label {
		display: block;
		font: 12px/1em var(--fonts-sans-serif);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.5em;
		border: 1px solid var(--color-font);
		background: none;
		cursor: pointer;
		transition: border-color 150ms ease-in-out, color 150ms ease-in-out,
			background-color 150ms ease-in-out;
	}
	input:checked + label {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-accent-text);
	}
</style>

<svelte:options accessors={true} />

<input
	on:input={labelClick}
	id="{characterId}-label-{id}"
	type="checkbox"
	bind:checked
	{value} />
<label for="{characterId}-label-{id}">
	{name}
</label>
