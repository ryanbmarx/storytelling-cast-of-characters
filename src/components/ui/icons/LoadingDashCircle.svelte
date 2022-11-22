<script>
	export let title = "This application is loading";
	export let animated = true;
	export let width = "30px";
</script>

<style>
	@keyframes rotate {
		from {
			transform: rotate(0);
		}

		to {
			transform: rotate(360deg);
		}
	}

	svg {
		margin: 15px auto;
	}

	.animated {
		animation-name: rotate;
		animation-duration: 1.5s;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
	}
</style>

<svg
	style="width:{width}"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 682 682"
	role="img"
	aria-hidden="true"
	class="spinner"
	class:animated>
	<title>{title}</title>
	<path
		d="M341,682A340.86,340.86,0,0,1,58.32,531.77a35,35,0,0,1,58-39.21A271,271,0,0,0,341,612h.91a35,35,0,0,1,.12,70h-1Zm170.49-51.83a35,35,0,0,1-19.55-64A270.88,270.88,0,0,0,612,341c0-1,0-2,0-3a35,35,0,0,1,70-.78c0,1.26,0,2.53,0,3.79A340.79,340.79,0,0,1,531,624.22,34.89,34.89,0,0,1,511.49,630.17ZM35,377.71A35,35,0,0,1,0,342.89V341A341,341,0,0,1,149.44,58.85a35,35,0,0,1,39.37,57.89A271,271,0,0,0,70,341v1.53a35,35,0,0,1-34.82,35.18ZM593.75,203.42a35,35,0,0,1-28.91-15.24A271.14,271.14,0,0,0,341,70h-2.58a35,35,0,0,1-.27-70H341A341.11,341.11,0,0,1,622.61,148.65a35,35,0,0,1-28.86,54.77Z" />
</svg>
