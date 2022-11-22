<script>
	// STORES
	import { getContext, onMount } from "svelte";
	import { contextKey } from "../stores.js";

	// COMPONENTS
	import ButtonApply from "./ButtonApply.svelte";
	import CategoryButtons from "./CategoryButtons.svelte";
	import InputText from "./ui/InputText.svelte";
	import NowShowing from "./NowShowing.svelte";
	import Checkbox from "./ui/Checkbox.svelte";
	import X from "./ui/icons/X.svelte";

	// UTILS
	import { fireEvent } from "../utils/analytics.js";
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";
	import { flip } from "svelte/animate";
	import throttle from "lodash.throttle";

	// LABELS & STUFF
	export let h = 3;
	export let category_nav_label = "Groups";
	export let category_nav_label_instructions = "Click to jump to each category";

	export let search_label = "Search";
	export let search_instructions = "Find what you are looking for";

	export let categories = [];
	export let labels = {};

	export let labels_instructions = "Check to toggle display";
	export let label_text_search = "Start typing to search";

	export let hasSearch = false;
	export let hasLabels = false;
	export let hasCategories = false;

	// ANALYTICS
	const category = "content";
	const action = "filter panel";

	let hasFilters = hasSearch || hasLabels;
	let hasLabelDescriptions =
		hasLabels &&
		Object.values(labels).reduce((accumulator, current) => {
			if ("description" in current || accumulator) return true;
			return false;
		}, false);

	const { searchString, filterLabels, labelsVisible, toggleMenu, filters_label } =
		getContext(contextKey);

	let l = Object.entries(labels);
	function checked(e) {
		const label = "Filtered by label";

		fireEvent({ category, action, label });
	}

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
				transform: ${transform} scale(${t});
				opacity: ${t}
			`,
			};
		},
	});

	$: checkedLabels = l.filter(([key, value]) => $filterLabels.includes(value.id));
	$: uncheckedLabels = l.filter(([key, value]) => !$filterLabels.includes(value.id));

	let onTextInput = e => {
		fireEvent({ category, action, label: "Filtered by text" });
	};

	function buttonClearFunction(e) {
		fireEvent({ category, action, label: "Text input cleared" });
	}

	onMount(() => {
		onTextInput = throttle(onTextInput, 1000, { leading: true });
	});
</script>

<style>
	.filters {
		padding: var(--cast-nav-height) 30px 30px 30px;
		margin: 0;
		box-sizing: border-box;
		width: 100%;
		height: 100%;

		position: fixed;
		left: 0;
		z-index: 99;
		bottom: 100%;

		background: var(--color-background);
		overflow: scroll;
		opacity: 0;
		transition: opacity 350ms ease, bottom 350ms ease;
	}

	.filters.visible {
		overflow: scroll;
		opacity: 1;
		bottom: 0;
	}

	.filters__close {
		display: flex;
		height: var(--touch-target);
		width: var(--touch-target);

		place-items: center center;
		place-content: center center;

		border-radius: 0;
		background: transparent;
		border: none;
		cursor: pointer;

		position: absolute;
		top: var(--cast-nav-height);
		right: 0;
		padding: 0;
		box-sizing: border-box;

		opacity: 0.5;
		transition: opacity 150ms ease;
	}

	.filters__close:focus,
	.filters__close:hover {
		opacity: 1;
	}
	.filters__close :global(svg) {
		stroke: var(--color-font);
		width: 50%;
	}

	.labels {
		list-style: none;
		margin: 0 0 calc(var(--touch-target) + 60px) 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		grid-gap: var(--cast-grid-gap, 30px);
	}

	.labels--no-description {
		--cast-grid-gap: 0.5rem;
	}

	.label :global(.checkbox__label) {
		color: var(--color-font);
		font-size: 13px;
		text-transform: uppercase;
	}

	.label :global(.checkbox__description) {
		font: var(--font-size-base) / 1.3em var(--fonts-serif, serif);
		color: var(--color-font-muted);
	}
	.label :global(.checkbox__check) {
		width: 65%;
		height: 65%;
	}

	@media all and (min-width: 1024px) {
		.controls {
			box-sizing: border-box;
			background: var(--color-screen-light);
			flex: none;
			width: var(--cast-controls-width);
			padding: var(--cast-controls-padding);
			padding-bottom: 0; /* So the scrolling list hits the bottom edge */

			/* A decorative flourish */
			border-top: 2px solid var(--color-accent);
		}

		.controls__fixed-container {
			/* Nice and sticky, so the controls can be seen at all scroll depths */
			position: sticky;
			top: var(--cast-nav-height);
			height: calc(100vh - var(--cast-nav-height));
			overflow-y: auto;
		}

		.controls--filters .controls__fixed-container {
			padding-top: 0;
		}

		.controls__fixed-container > :global(*) {
			margin-bottom: var(--cast-grid-gap);
		}
		.filters {
			padding: 0;
			margin: 0;
			position: relative;
			background: unset;
			top: unset;
			bottom: unset;
			left: unset;
			opacity: unset;
			transition: none;
			overflow: unset;
			z-index: unset;
			height: auto;
		}

		.labels {
			display: grid;
			margin: 0 0 6rem 0;
		}

		.filters__close {
			display: none;
		}
	}
</style>

<section class="controls" class:controls--filters={hasFilters}>
	<div class="controls__fixed-container">
		{#if hasFilters}
			<NowShowing />
		{/if}
		{#if hasCategories}
			<!-- Nav to different categories. Not _technically_ filters. -->
			<CategoryButtons
				{h}
				{category_nav_label_instructions}
				{category_nav_label}
				{categories} />
		{/if}
		<div class="filters" class:visible={$labelsVisible}>
			<button
				class="filters__close"
				aria-label="Hide the filters"
				on:click={toggleMenu}>
				<X title="Hide the filters" />
			</button>
			<ButtonApply />
			{#if hasFilters}
				<svelte:element this={`h${h}`} class="cast-label">
					<span class="cast-label__text">{filters_label}</span>
				</svelte:element>
			{/if}
			{#if hasSearch}
				<InputText
					id="cast-text-search"
					label={label_text_search}
					on:input={onTextInput}
					{buttonClearFunction}
					bind:value={$searchString} />
			{/if}
			{#if hasLabels}
				<p>{labels_instructions}</p>
				<ul class="labels" class:labels--no-description={!hasLabelDescriptions}>
					<!-- Begin with the checked labels -->
					{#each checkedLabels as [_, { id, name, description }] (id)}
						<li
							class="label label--checked"
							in:receive={{ key: id }}
							out:send={{ key: id }}
							animate:flip={{ duration: 200 }}>
							<Checkbox
								bind:group={$filterLabels}
								on:input={checked}
								value={id}
								{id}
								label={name}
								{description} />
						</li>
					{/each}
					<!-- Then with the unchecked labels -->
					{#each uncheckedLabels as [_, { id, name, description }] (id)}
						<li
							class="label label--unchecked"
							animate:flip={{ duration: 200 }}
							in:receive={{ key: id }}
							out:send={{ key: id }}>
							<Checkbox
								bind:group={$filterLabels}
								on:input={checked}
								value={id}
								{id}
								label={name}
								{description} />
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>
