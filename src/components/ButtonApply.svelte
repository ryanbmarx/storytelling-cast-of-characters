<script>
	import ButtonReset from "./ButtonReset.svelte";
	import Button from "./ui/Button.svelte";

	// STORES
	import { getContext } from "svelte";
	import { contextKey } from "../stores.js";
	const { toggleMenu, numberVisible, numberTotal } = getContext(contextKey);
</script>

<style>
	.buttons {
		margin: 0;
		padding: 0;
		list-style: none;
		width: calc(100vw - 30px - 30px);
		text-transform: uppercase;

		z-index: 2;

		display: flex;

		position: sticky;
		top: 100%;
		transform: translate(0, -100%);
	}

	.buttons > :global(.apply) {
		flex: 2 2;
		max-width: none;
	}
	.buttons :global(.reset) {
		background: var(--grey-light);
		flex: 1 1;
	}

	.buttons :global(button) {
		max-width: none;
		margin: 0;
	}

	@media all and (min-width: 1024px) {
		.buttons {
			display: none;
		}
	}
</style>

<div class="buttons">
	<Button
		class="apply"
		label="Apply: Showing {$numberVisible} of {numberTotal}"
		on:click={toggleMenu} />

	<ButtonReset />
</div>
