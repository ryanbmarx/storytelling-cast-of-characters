import { meetsRequiredStatus } from "./utils/users.js";
import { load } from "./utils/data.js";
import App from "./App.svelte";

const selector = "#cast-of-characters-data";
const data = load(selector);

const { required_status } = data.top;

if (!data) {
	console.error(`No data found. Set initial data in ${selector}.`);
}
let app;
meetsRequiredStatus(required_status)
	.then(async meets_required_status => {
		app = new App({
			hydrate: true,
			target: document.getElementById("cast"),
			props: { ...data, meets_required_status },
		});
	})
	.catch(console.error);
export default app;
