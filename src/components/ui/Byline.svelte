<script>
	export let byline = "";
	export let organization = "USA TODAY NETWORK";
</script>

<style>
	.byline {
		margin: 1em 0 0 0;
	}

	.byline__name {
		color: var(--color-font);
		font: bold var(--font-size-small) / 1.3em var(--fonts-sans-serif);
	}
	.byline__organization {
		font: var(--font-size-small) / 1.3em var(--fonts-serif);
		color: var(--color-font);
	}
</style>

{#if byline}
	<div class="byline">
		<span class="byline__name">{byline}</span>
		<span class="byline__organization">{organization}</span>
	</div>
{/if}
