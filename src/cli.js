#!/usr/bin/env node

import env from "./env/node.js";
import run from "./run.js";

/**
 * Run tests via a CLI command
 * First argument is the location to look for tests (defaults to the current directory)
 * Second argument is the test path (optional)
 * @param {object} [options] Same as `run()` options, but command line arguments take precedence
 */
export default async function cli (options = {}) {
	let argv = process.argv.slice(2);

	let location = argv[0];

	if (argv[1]) {
		options.path = argv[1];
	}

	run(location, {env, ...options});
}