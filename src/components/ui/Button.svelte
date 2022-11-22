<script>
	/**
	 * This is a basic button component. It will theme itself with the globally defined `--color-accent`,
	 * defaulting to USAT blue. Global styles set in a higher-up component can change these values, and more
	 * intricate theming can be done by changing the CSS variables lower down.
	 *
	 * The button will be a `<button>` unless provided with the `href` property, which will format it as an
	 * anchor/`<a>` tag defaulting to a new window.
	 *
	 * If you want to add other classes to the button, those can be passed in using the `class` prop on the component
	 */
	import { fade } from "svelte/transition";

	export let label = "";
	export let id = null;
	export let muted = false;
	export let href = "";
	export let newWindow = true;

	let clazz = "";
	export { clazz as class };

	$: target = newWindow ? "_blank" : "";
	$: rel = newWindow ? "noopener noreferrer" : "";
</script>

<style>
	a.btn,
	button.btn {
		/* Style the button */
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: var(--touch-target, 44px);
		min-width: 44px;
		max-width: 150px;
		margin: 0 auto;

		box-sizing: border-box;
		border: 1px solid
			var(--btn-color-border, var(--btn-color-accent, var(--color-accent, #009bff)));
		padding: 8px 16px;
		border-radius: var(--btn-border-radius, 5px);
		cursor: pointer;
		text-decoration: none;
		font: var(--font-size-button, 14px) / 1.3em var(--fonts-sans-serif, sans-serif);
		background-color: var(--btn-color-background, var(--btn-color-accent, #009bff));
		color: var(--btn-color-text, var(--color-accent-text, white));
		transition: filter 150ms ease-in-out, min-height 150ms ease-in-out,
			background-color 150ms ease-in-out;
		font-weight: bold;
	}

	.btn--muted {
		background-color: transparent;
		color: var(--btn-color-muted, #aaaaaa);
		cursor: default;
		border-color: var(--btn-color-muted, #aaaaaa);
		font-weight: normal;
	}

	.btn:not(.btn--muted):hover,
	.btn:not(.btn--muted):focus {
		filter: brightness(115%);
	}
</style>

{#if href}
	<a transition:fade {href} {id} class="btn {clazz}" on:click {target} {rel}>
		{label}
	</a>
{:else}
	<button
		transition:fade
		{id}
		class="btn {clazz}"
		class:btn--muted={muted}
		disabled={muted}
		on:click>{label}</button>
{/if}
