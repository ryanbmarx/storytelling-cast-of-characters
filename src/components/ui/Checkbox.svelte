<script>
	/**
	 *
	 * This is a stylized checkbox UI element.
	 *
	 *
	 * AVAILABLE CSS VARS"
	 * --checkbox-size: The width and height of the box
	 * --checkbox-border-radius: Should the box have rounded corners?;
	 * --checkbox-color-box: The border color of the checkbox. Also is the default fill color of the box when checked
	 * --checkbox-checked-fill: The fill color of the box when checked. Can be any css `background`
	 * --checkbox-font-family: Defaults to `sans-serif`
	 * --checkbox-margin: Distance between the box and the text
	 * --checkbox-color-check: What color the check, defaults to white.
	 * --checkbox-color-font: What color text? Defaults to --color-font, then `black`
	 *
	 * the checkbox is built to rely on the existence of a few theming css variables:
	 * --color-accent
	 * --color-accent-text
	 * --color-font
	 * --fonts-sans-serif
	 *
	 *
	 * Export checked value for group bindings cribbed from: https://svelte.dev/repl/de117399559f4e7e9e14e2fc9ab243cc?version=3.12.15
	 *
	 */

	export let id = null;
	export let value = "";
	export let label = "";
	export let description = "";
	export let labelFirst = false;
	let clazz = "";
	export { clazz as class };

	export let checked = false;
	export let group = "";

	$: updateCheckbox(group);
	$: updateGroup(checked);

	function updateCheckbox(group) {
		checked = group.indexOf(value) >= 0;
	}

	function updateGroup(checked) {
		const index = group.indexOf(value);
		if (checked) {
			if (index < 0) {
				group.push(value);
				group = group;
			}
		} else {
			if (index >= 0) {
				group.splice(index, 1);
				group = group;
			}
		}
	}
</script>

<style>
	.checkbox {
		font-family: var(--checkbox-font-family, var(--fonts-sans-serif, sans-serif));
		color: var(--checkbox-color-font, var(--color-font, black));
		display: flex;
		align-items: center;
		min-height: var(--touch-target, 44px);
		cursor: pointer;
	}
	.checkbox__box {
		flex: 0 0 var(--checkbox-size, 1em);
		/* The box to be checked */
		position: relative;
		display: block;
		width: var(--checkbox-size, 1em);
		height: var(--checkbox-size, 1em);
		border-radius: var(--checkbox-border-radius, 5px);
		border: 1px solid var(--checkbox-color-box, black);
		margin: 0 var(--checkbox-margin, 0.5em) 0 0;
	}

	.checkbox__check {
		display: block;
		width: 90%;
		height: 90%;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		/* Fill with 1) configured color 2) Accent color 3) white (default) */
		fill: var(--checkbox-color-check, var(--color-accent-text, white));
		opacity: 0;
	}

	input:checked + .checkbox .checkbox__box {
		/* Fill with 1) Configured color 2) Accent color 3) box border color 4) black (default) */
		background: var(
			--checkbox-checked-fill,
			var(--color-accent, var(--checkbox-color-box, black))
		);
	}

	input:checked + .checkbox .checkbox__box::before {
		content: "";
		display: block;

		height: 100%;
		width: 100%;

		position: absolute;
		top: 0;
		left: 0;

		mix-blend-mode: multiply;
		background: linear-gradient(310.73deg, white -8.55%, #909090 72.26%);
	}
	input:checked + .checkbox .checkbox__check {
		opacity: 1;
	}

	.checkbox--label-first {
		flex-flow: row-reverse nowrap;
		justify-content: flex-end;
	}

	.checkbox--label-first .checkbox__box {
		margin: 0 0 0 var(--checkbox-margin, 0.5em);
	}

	input[type="checkbox"] {
		visibility: hidden;
		position: absolute;
		top: 15px;
		left: 15px;
		transform: translate(-50%, -50%);
		z-index: 1;
	}
	/* With longer labels/descriptions  */

	.checkbox--description {
		align-items: flex-start;
	}

	.checkbox__text .checkbox__label {
		display: block;
		font-weight: bold;
		line-height: 1em;
		margin-bottom: 0.2em;
	}

	.checkbox__label {
		font-weight: bold;
	}

	@media all and (prefers-reduced-motion: no-preference) {
		.checkbox__box {
			transition: background var(--checkbox-transition, 100ms) ease;
		}
		.checkbox__check {
			transform: translate(-50%, -50%) scale(0);
			transition: opacity var(--checkbox-transition, 100ms) ease,
				transform var(--checkbox-transition, 100ms) ease;
		}

		input:checked + .checkbox .checkbox__check {
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>

<svelte:options accessors={true} />

<input id="checkbox-{id}" type="checkbox" bind:checked on:input {value} />
<label
	id="checkbox-{id}-label"
	class:checkbox--description={description}
	class:checkbox--label-first={labelFirst}
	class="checkbox {clazz}"
	for="checkbox-{id}">
	<span class="checkbox__box" aria-hidden="true">
		<svg
			aria-hidden="true"
			class="checkbox__check"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 17.68 13.44">
			<title>This item is selected</title>
			<polygon
				points="14.85 0 7.07 7.78 2.83 3.54 0 6.36 4.24 10.61 7.07 13.44 9.9 10.61 17.68 2.83 14.85 0" />
		</svg>
	</span>

	{#if description}
		<span class="checkbox__text">
			<span class="checkbox__label">{label}</span>
			<span class="checkbox__description">{description}</span>
		</span>
	{:else}
		<span class="checkbox__label">{label}</span>
	{/if}
</label>
