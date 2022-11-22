<script>
	import { contextKey } from "../stores.js";
	import { getContext } from "svelte";

	const { share_label, headline, cast_project } = getContext(contextKey);

	import SocialShare from "./ui/SocialShare.svelte";
</script>

<SocialShare
	linkedin={false}
	label={share_label}
	outlines={true}
	iconsOnly={true}
	project={`Cast of Character: ${cast_project}`}
	shareHeadline={headline} />
