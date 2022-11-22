<script>
	import { fireEvent } from "../utils/analytics.js";
	export let category_nav_label;
	export let category_nav_label_instructions;
	export let categories = [];
	export let h = 3;

	function click(e) {
		const action = "navigation|Cast of Characters category";
		const label = "Jump to category";
		fireEvent({ action, label });
	}
</script>

<style>
	.wrapper {
		overflow: hidden;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;

		display: flex;
		flex-flow: row wrap;
		align-items: center;
		justify-content: flex-start;
		margin: 0 -1em -0.5em 0;
	}

	li {
		flex: 0 0;
		display: block;
		margin: 0 1em 0.5em 0;
		min-width: -moz-fit-content;
		min-width: fit-content;
	}

	.category-button {
		font: var(--font-size-small) / 1em var(--fonts-sans-serif);
		text-transform: uppercase;
		color: var(--color-font);
		text-decoration: none;

		min-height: var(--touch-target);
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
	}
	.category-button:hover,
	.category-button:focus {
		text-decoration: none;
	}

	.category-button::after {
		content: "";
		display: block;
		height: 3px;
		background: currentColor;
		margin-top: 0.25em;
		transition: background var(--transition, 150ms) ease;
	}

	.category-button:hover::after,
	.category-button:focus::after {
		background: var(--color-accent);
	}
	@media all and (pointer: fine) {
		.category-button {
			min-height: 0;
		}
	}
</style>

<nav class="category-buttons">
	<svelte:element this={`h${h}`} class="cast-label">
		<span class="cast-label__text">{category_nav_label}</span>
		<span class="cast-label__subtext">{category_nav_label_instructions}</span>
	</svelte:element>
	<div class="wrapper">
		<ul>
			{#each categories as category}
				<li>
					<a on:click={click} class="category-button" href="#{category.id}"
						>{category.name}</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>
