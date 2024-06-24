#!/usr/bin/env node
import path from "path";
import { globSync } from "glob";
import env from "./env/node.js";
import run from "./run.js";

// Dependencies
import * as chokidar from "chokidar";

const CONFIG_GLOB = "{,_,.}htest.{json,config.json,config.js}";
let config;


export async function getConfig (glob = CONFIG_GLOB) {
	if (config) {
		return config;
	}

	let paths = globSync(glob);

	if (paths.length > 0) {
		let configPath = "./" + paths[0];
		let importParams;
		configPath = path.join(process.cwd(), configPath);
					// return import(p).then(m => m.default ?? m);
		if (configPath.endsWith(".json")) {
			importParams = {assert: { type: "json" }, with: { type: "json" }};
		}

		config = await import(configPath, importParams).then(m => config = m.default);

		return config;
	}
}

/**
 * Run tests via a CLI command
 * First argument is the location to look for tests (defaults to the current directory)
 * Second argument is the test path (optional)
 * @param {object} [options] Same as `run()` options, but command line arguments take precedence
 */
export default async function cli (options = {}) {
	let config = await getConfig();
	if (config) {
		options = {...config, ...options};
	}

	let argv = process.argv.slice(2);

	let location = argv[0];

	if (argv[1]) {
		options.path = argv[1];
	}

	if (options.watch) {
		const watcher = chokidar.watch(location, {
			persistent: true,
		});

		// TODO: Re-run the tests that *actually* changed
		watcher.on("change", path => {
			run(location, {env, ...options});
		});
	}

	run(location, {env, ...options});
}