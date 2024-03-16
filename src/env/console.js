import format from "../format-console.js";

/**
 * Environment-agnostic env that prints results in the console (without depending on terminal-specific things)
 */
export default {
	name: "Console",
	resolveLocation (test) {
		return import(test).then(m => m.default ?? m);
	},
	done (result, options, event) {
		let str = result.toString({ format: options.format ?? "rich" });
		console.log(format(str));
	}
}