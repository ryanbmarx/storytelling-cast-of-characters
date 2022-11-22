<script>
	import MagnifyingGlass from "./icons/MagnifyingGlass.svelte";
	import Clear from "./icons/Clear.svelte";

	let input; // The ref for the input[type="text"]

	export let id = null;
	export let label;

	// This will hold the value
	export let value;
	export let buttonClearFunction = () => {};
	export let labelClear = "Clear this search";
	export let placeholder = "";

	// This clears out the input and runs  any supplied analytics
	function reset(e) {
		buttonClearFunction();
		value = "";
		input.blur();
	}
	/*
	
	These CSS vars can be used to style the input

	--input-text-border-radius
	--input-text-height
	--input-text-color-background
	--input-text-color-accent
	--input-text-color-font
	--input-text-color-label
	--input-text-color-label-hover
	--input-text-border-color
	--input-text-border-weight
	*/
</script>

<style>
	.search {
		display: flex;
		flex-flow: row nowrap;
		justify-content: space-between;
		align-items: center;
		padding: 0 0 0 8px;
		gap: 8px;
		box-sizing: border-box;

		background: var(--input-text-color-background, var(--color-background, white));
		border-radius: var(--input-text-border-radius, var(--border-radius, 5px));
		border: var(--input-text-border-weight, 1px) solid
			var(
				--input-text-border-color,
				var(--input-text-color-font, var(--color-font, #222))
			);
		font-size: 1em;
		height: var(--input-text-height, var(--touch-target, 44px));
		margin: 1.5em 0 0 0;
		position: relative;
	}

	.search:focus-within {
		outline: 2px solid var(--input-text-color-accent, var(--color-accent, #009bff));
		outline-offset: -2px;
	}

	label {
		position: absolute;
		top: 50%;
		left: 0;
		z-index: 5;

		font: bold var(--font-size-small, 14px) / 1.3em var(--fonts-sans-serif);
		color: var(
			--input-text-color-label,
			var(--input-text-color-font, var(--color-font, #222))
		);
		transform: translate(32px, -50%);
		display: block;
		transition: top 150ms ease, transform 150ms ease, color 150ms ease;
	}

	.search:focus-within > label,
	.search__input:focus + label,
	label:focus,
	.search__input:not(:placeholder-shown) + label {
		/* Put the label above the input */
		top: -0.5em;
		transform: translate(0, -100%);
		color: var(
			--input-text-color-label-hover,
			var(
				--input-text-color-label,
				var(--input-text-color-font, var(--color-font, #222))
			)
		);
	}

	.search__icon {
		flex: none;
		width: 18px;
		height: 18px;
		padding: 0;
		box-sizing: border-box;
		display: flex;
	}

	.search__icon :global(svg) {
		width: 100%;
		height: 100%;
		margin: auto;
	}

	.search__input {
		flex: 1 1;

		/* Without the minwidth, the input will overflow: https://stackoverflow.com/questions/43314921/strange-input-widths-in-firefox-vs-chrome/43361500#43361500 */
		min-width: 0;
		height: 100%;
		font-size: 1em;
		padding: 0;
		border: none;
		margin: 0;
		color: var(--input-text-color-font, var(--color-font, #222));
	}

	.search__input:focus {
		outline: none;
	}

	.search__clear {
		flex: none;
		padding: 0;
		cursor: pointer;
		height: 100%;
		width: var(--input-text-height, var(--touch-target, 44px));
		box-sizing: border-box;
		border: none;
		background-color: transparent;
		display: flex;
		opacity: 0.5;
		visibility: visible;
		transition: opacity 150ms ease, visibility 150ms ease;
	}

	.search__clear[hidden] {
		visibility: hidden;
		opacity: 0;
	}

	.search__clear:hover,
	.search__clear:focus {
		opacity: 1;
	}

	.search__clear :global(svg) {
		fill: var(--input-text-color-font, var(--color-font, #222));
		margin: auto;
		transition: opacity 150ms ease, fill 150ms ease;
	}
</style>

<div
	class="search"
	aria-labelledby="label-{id}"
	on:focusin={e => {
		input.focus();
	}}>
	<div class="search__icon">
		<MagnifyingGlass title="Search by name" />
	</div>
	<input
		{id}
		type="text"
		bind:this={input}
		class="search__input"
		{placeholder}
		bind:value
		on:input />
	<label
		id="label-{id}"
		for={id}
		on:click={() => {
			input.focus();
		}}>{label}</label>
	<button
		aria-label={labelClear}
		class="search__clear"
		hidden={value.length <= 0}
		on:click={reset}>
		<Clear title={labelClear} />
	</button>
</div>
