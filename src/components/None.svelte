<script>
	/**
	 * When there are no characters left to view, because of filtering, this is what you see.
	 */
	import { contextKey } from "../stores.js";
	import { getContext } from "svelte";

	import ButtonReset from "./ButtonReset.svelte";
	import SocialShareCast from "./SocialShareCast.svelte";

	const { share, none_message } = getContext(contextKey);
</script>

<style>
	.none {
		grid-column: 1 / -1;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-flow: row wrap;
		color: var(--color-font-muted);

		background: var(--color-screen-light);
		padding: 2rem;
		box-sizing: border-box;
	}

	.none :global(.share) {
		flex: 0 0 100%;
		display: block;
		width: 100%;
		justify-content: center;
	}
	.none p {
		font-style: italic;
		color: currentColor;
		margin: 0 1em 0 0;
	}

	.none :global(.share) {
		--share-color-font: var(--color-font-muted);
	}
	.none :global(.share .share__label) {
		display: none;
	}

	.none :global(.share__btns) {
		--share-color-font: var(--color-font-muted);
		justify-content: center;
	}
</style>

<div class="none">
	<p>{none_message}</p>
	<ButtonReset />
	{#if share}
		<SocialShareCast />
	{/if}
</div>
