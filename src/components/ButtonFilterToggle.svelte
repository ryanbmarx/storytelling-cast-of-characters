<script>
	import throttle from "lodash.throttle";
	import { getContext, onMount } from "svelte";
	import { contextKey } from "../stores.js";
	const { toggleMenu, isMobile } = getContext(contextKey);

	export let label = "Tap to filter";

	let muted = false;

	// Use this to ultimately trigger the mute/unmute
	let onScroll = e => {
		// Mute after three viewports, give or take
		muted = window.scrollY > window.innerHeight * 3;
	};

	onMount(() => {
		// Throttle our scroll handler here because lodash errors in SSR
		onScroll = throttle(onScroll, 500);
	});

	// The main function which toggles the muted state
	// Is fired when the main element is rendered to the DOM, versus
	// `onMount` so this stuff doesn't run on desktop
	function triggerMute(node) {
		document.addEventListener("scroll", onScroll);

		return {
			destroy() {
				document.removeEventListener("scroll", onScroll);
			},
		};
	}
</script>

<style>
	.toggle {
		--toggle-padding-h: var(--cast-padding-horiz);
		--toggle-color-text: var(--color-font);
		--toggle-height: 100%;
		/* Set outline-color seperately so it can transition away */
		--toggle-outline-color: var(--toggle-color-text);
		--toggle-font-size: var(--font-size-base);

		min-height: var(--touch-target);
		width: 100vw;
		margin-left: calc(-1 * var(--cast-padding-horiz));
		margin-top: 1rem;

		border: none;
		border-radius: 0;
		background: transparent;
		padding: 0;

		position: -webkit-sticky;
		position: sticky;
		top: var(--cast-nav-height);
		z-index: 4;
	}

	.toggle__inner {
		box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
		outline: 1px solid var(--toggle-outline-color);
		outline-offset: -1px;

		box-sizing: border-box;
		display: flex;
		flex-flow: row-reverse nowrap;
		align-items: center;
		justify-content: space-between;
		font: var(--font-size-small) / 1em var(--fonts-sans-serif);
		font-size: var(--toggle-font-size); /* define prop a 2nd time to transition*/
		color: var(--toggle-color-text);
		padding: 0 var(--toggle-padding-h);

		transition: color 150ms ease-in-out, height 150ms ease-in-out,
			font-size 150ms ease-in-out, outline-color 150ms ease-in-out;
		height: var(--toggle-height);
		width: 100%;

		position: absolute;
		top: 0;
		left: 0;
	}

	.toggle__inner::before {
		content: "";
		display: block;
		width: 0.5em;
		height: 0.5em;
		border-right: 2px solid var(--toggle-color-text);
		border-bottom: 2px solid var(--toggle-color-text);
		transform: rotate(45deg);
		transition: border-color 150ms ease;
	}

	.toggle.muted {
		--toggle-color-text: var(--color-font-muted);
		--toggle-height: 70%;
		--toggle-outline-color: rgba(0, 0, 0, 0);
		--toggle-font-size: var(--font-size-small);
	}

	@media all and (min-width: 1024px) {
		.toggle {
			display: none;
		}
	}
</style>

{#if $isMobile}
	<button class="toggle" class:muted on:click={toggleMenu} use:triggerMute>
		<span class="toggle__inner translucent-background">{label}</span>
	</button>
{/if}
