<svelte:options accessors={true} />

<script>
	export let label, id;
	export let value;
	export let options = [];
	export let showAll;
</script>

<style>
	label {
		margin: 0 0 8px 0;
		display: block;
	}
	.select {
		position: relative;
		background: var(--select-color-background, #fff);
		height: var(--select-input-height, 44px);
		border-radius: var(--select-border-radius, 5px);
	}

	.select::after {
		content: "";
		display: block;
		width: 1em;
		height: 0.75em;
		background-color: var(--select-carat-color, #aaa);

		-webkit-clip-path: polygon(0 0, 100% 0, 50% 100%);
		clip-path: polygon(0 0, 100% 0, 50% 100%);

		position: absolute;
		right: 8px;
		bottom: calc(var(--input-height) / 2);
		transform: translate(0, 50%);
	}

	.select__input {
		font-size: 1em;
		width: 100%;
		height: 100%;
		padding: 0 0.5em;
		position: relative;
		border: none;
		z-index: 3;
		background: transparent;
		-moz-appearance: none;
		-webkit-appearance: none;
		appearance: none;
	}

	.select__input::-ms-expand {
		display: none;
	}
</style>

{#if label}<label for={id}>{label}</label>{/if}
<div class="select">
	<select class="select__input" {id} on:input bind:value>
		{#if showAll}
			<option value={showAll.value} selected>{showAll.label}</option>
		{/if}
		{#each options as { value, label }}
			{#if value != "" && label != ""}
				<option {value}>{label}</option>
			{/if}
		{/each}
	</select>
</div>
