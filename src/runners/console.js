import genericRun from "../run.js";
import { getType } from "../util.js";
import format from "../format-console.js";

/**
 * Environment-agnostic test runner that prints results in the console (without depending on terminal-specific things)
 */

export const env = {
	done: (result, options = {}) => {
		let str = result.toString({ format: options.format ?? "rich" });
		console.log(format(str));
	}
}

/**
 *
 * @param {*} test
 * @param {*} options
 * @returns
 */
export default function run (test, options = {}) {
	options.env = env;

	if (getType(test) == "string") {
		// URL provided, resolve to test(s)
		test = Array.isArray(test) ? test : [test];
		Promise.all(test.flatMap(paths => {
			// Convert paths to imported modules
			paths = getType(paths) == "string" ? [paths] : paths;
			return paths.map(p => {
				p = path.join(process.cwd(), p);
				return import(p).then(m => m.default ?? m);
			});
		})).then(tests => {
			run(tests, options);
		});
		return;
	}

	return genericRun(test, options);
}