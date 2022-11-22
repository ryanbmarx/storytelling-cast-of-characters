<script>
	import { format } from "date-fns-tz";

	export let published = "";
	export let updated = "";

	const AP_MONTHS = [
		"Jan.",
		"Feb.",
		"March",
		"April",
		"May",
		"June",
		"July",
		"Aug.",
		"Sept.",
		"Oct.",
		"Nov.",
		"Dec.",
	];

	const DATE_FORMAT = "d, yyyy";
	const TIME_FORMAT = "h:mm aa zzz";

	published = new Date(published);
	updated = new Date(updated);

	function formattedDate(d) {
		let date = format(d, DATE_FORMAT);
		let time = format(d, TIME_FORMAT);
		let month = AP_MONTHS[d.getMonth()];

		let formatted = `${time}, ${month} ${date}`;

		return formatted;
	}
</script>

<style>
	.timestamp {
		font: var(--font-size-small) / 1.3em var(--fonts-sans-serif);
		color: var(--color-font-muted);
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.updated {
		font-weight: bold;
	}

	@media all and (min-width: 768px) {
		.timestamp > li {
			display: inline;
		}

		.updated::before {
			content: "|";
			margin: 0 0.25em;
		}
	}
</style>

{#if published}
	<ul class="timestamp">
		<li class="published">
			<time datetime={published.toISOString()}>{formattedDate(published)}</time>
		</li>
		{#if updated}
			<li class="updated">
				Updated: <time datetime={updated.toISOString()}>{formattedDate(updated)}</time>
			</li>
		{/if}
	</ul>
{/if}
