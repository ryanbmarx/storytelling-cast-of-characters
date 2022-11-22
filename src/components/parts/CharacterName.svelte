<script>
	export let name = "";
	export let title = "";
	export let kicker = "";
	export let badge = "";
	export let h;
</script>

<style>
	.character__kicker {
		display: block;
		font: bold var(--font-size-small) / 1.3em var(--fonts-sans-serif);
		text-transform: uppercase;
		color: var(--color-font-very-muted);
		margin: 0 0 0.25em 0;
	}

	.character__badge {
		display: flex;
		align-items: center;
		justify-content: center;

		font: bold var(--font-size-small) / 1.3em var(--fonts-sans-serif);
		color: var(--color-accent-text);
		background: var(--color-accent);

		width: var(--cast-badge-width);
		height: var(--cast-badge-height);
		border-radius: 50%;

		float: left;
		margin: 0 var(--cast-badge-margin) 0.5rem 0;
	}

	.character__badge ~ .character__kicker,
	.character__badge ~ .character__name,
	.character__badge ~ .character__title {
		/* Move things over if a badge is present */
		margin-left: calc(var(--cast-badge-height) + var(--cast-badge-margin));
	}

	.character__name {
		--type-primary: var(--color-font); /* FUUW! */
		font: normal 21px/1.3em var(--fonts-serif);
		margin-top: 0;
	}

	/* Doing this gives us a little extra specificity */
	.character__title {
		font-size: var(--font-size-small);
		line-height: 1.3em;
		font-weight: 400;
		color: var(--color-font-muted);
		display: block;
		/* Pulls the title closer to the name (with a little margin) despite the name's layout margin */
		margin-top: calc(-1 * (var(--cast-inner-gap) - 0.25em));
	}
</style>

{#if badge}<span class="character__badge">{@html badge}</span>{/if}
{#if kicker}<span class="character__kicker">{kicker}</span>{/if}
<svelte:element this={`h${h}`} class="character__name">{name}</svelte:element>
{#if title}
	<span class="character__title">{title}</span>
{/if}
