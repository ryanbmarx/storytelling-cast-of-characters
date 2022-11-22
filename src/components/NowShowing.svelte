<script>
	import { onMount, getContext } from "svelte";

	import { contextKey } from "../stores.js";
	const { numberVisible, numberTotal } = getContext(contextKey);

	import ButtonReset from "./ButtonReset.svelte";

	let visible;
	let nowShowing;

	onMount(() => {
		nowShowing.style.setProperty("--visible-width", `${visible.offsetWidth}px`);
	});
</script>

<style>
	.now-showing {
		display: none;
	}

	@media all and (min-width: 1024px) {
		.now-showing {
			--now-showing-duration: 0;
			/* For the translucent background screen */
			--color-background: var(--color-screen-light);

			max-width: 100%;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			width: var(--cast-controls-width);
			margin: 0 0 1rem 0;

			position: sticky;
			top: 0;
			z-index: 10;
		}

		.now-showing__text {
			/* Position absolutely to make animations smoother */
			position: absolute;
			top: 50%;
			left: 0;
			transform: translate(0, -50%);

			font-size: var(--font-size-base);
			line-height: 1.3em;
			font-family: var(--fonts-sans-serif);
			color: var(--color-font-muted);
			margin: 0 1em 0 0;
			transition: -webkit-text-stroke 250ms ease-out, color 250ms ease-out;
		}

		.now-showing__visible {
			display: inline-block;
			text-align: center;
			min-width: var(--visible-width, unset);
			position: relative;

			/* Inherit makes it play nicer with the animated properties of the parent */
			font-weight: inherit;

			animation-name: slideDown;
			animation-duration: var(--now-showing-duration);
			animation-iteration-count: 1;
			animation-fill-mode: forwards;
		}

		.now-showing__visible::after {
			content: "";
			display: block;
			width: 3rem;
			height: 3rem;
			background: var(--color-accent);
			position: absolute;
			top: 50%;
			left: 50%;
			border-radius: 50%;

			transform: translate(-50%, -50%);
			opacity: 0;
			animation: pop calc(var(--now-showing-duration) / 3) ease-in 1 forwards;
			animation-delay: calc(var(--now-showing-duration) * 0.85);
		}

		.animating .now-showing__text {
			-webkit-text-stroke: 1px currentColor;
			color: var(--color-accent);
		}
	}
	@media all and (prefers-reduced-motion: no-preference) {
		.now-showing {
			--now-showing-duration: 750ms;
		}
	}

	@keyframes pop {
		from {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0);
		}

		50% {
			opacity: 0.7;
		}

		to {
			opacity: 0;
			transform: translate(-50%, -50%) scale(1.6);
		}
	}

	@keyframes slideDown {
		from {
			transform: translate(0, -100%);
			opacity: 0;
		}

		to {
			transform: translate(0, 0);
			opacity: 1;
		}
	}
</style>

<div bind:this={nowShowing} class="now-showing translucent-background animating">
	{#key $numberVisible}
		<span class="now-showing__text">
			Displaying <strong
				on:animationend={e => {
					nowShowing.classList.remove("animating");
				}}
				on:animationstart={e => {
					nowShowing.classList.add("animating");
				}}
				class="now-showing__visible"
				bind:this={visible}>{$numberVisible}</strong>
			of {numberTotal}
		</span>
	{/key}
	<ButtonReset />
</div>
