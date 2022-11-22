<script>
	import { fireEvent } from "../../utils/analytics.js";
	export let href = "";
	export let ariaLabel = "Return to the top of the page";
	export let category = "nav";
	export let label = "cast of characters";
	export let action = "back to top";
</script>

<style>
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--touch-target);
		height: var(--touch-target);
		text-decoration: none;
		background: rgba(0, 0, 0, 0.4);
		border-radius: 50%;

		position: fixed;
		bottom: var(--nav-height, var(--cast-nav-height));
		right: var(--nav-height, var(--cast-nav-height));
		transition: opacity 150ms ease-in-out;
		opacity: 0.5;
	}

	a:hover {
		opacity: 1;
	}

	a:focus {
		outline: 2px solid var(--color-accent);
	}

	a::before {
		content: "";
		display: block;
		border-top: 4px solid black;
		border-left: 4px solid black;

		width: 30%;
		height: 30%;
		position: absolute;
		top: 50%;
		left: 50%;
		opacity: 0.75;
		transform: translate(-50%, -25%) rotate(45deg);
	}

	.sr-only {
		clip-path: polygon(0 0, 1px 1px, 0 0);
		position: absolute;
		left: 100vw;
	}
</style>

{#if href}
	<a
		on:click={e => {
			fireEvent({ category, action, label });
		}}
		class="return"
		{href}
		aria-label={ariaLabel}>
		<span class="sr-only">{ariaLabel}</span>
	</a>
{/if}
