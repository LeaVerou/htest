#!/usr/bin/env node

import run from "./node-run.js";
import fs from "fs";
import path from "path";

async function getTestsIn (dir) {
	let filenames = fs.readdirSync(dir).filter(name => !name.startsWith("index") && name.endsWith(".js"));
	let cwd = process.cwd();
	let paths = filenames.map(name => path.join(dir, name));
console.log(paths);
	return Promise.all(paths.map(path => import(path).then(module => module.default, err => {
		console.error(`Error importing ${path}:`, err);
	})));
}
console.log(process.cwd());
/**
 * Run tests:
 * - If command line arguments are provided, read those files and run them
 * - If no arguments are provided, but a defalt value is passed to the function, run that
 * - If neither are provided, try to find tests in the current directory
 * @param {object | object[]} defaultTest
 */
export default async function cli (defaultTest, defaultOptions) {
	let argv = process.argv.slice(2);
	let location = argv[0] ?? (defaultTest ? undefined : process.cwd());

	if (location) {
		// Read filenames in CWD
		if (fs.statSync(location).isDirectory()) {
			run({
				name: "All tests",
				tests: await getTestsIn(location),
			}, defaultOptions);
		}
		else {
			// 🤷🏽‍♀️ Let glob figure it out
			run(location, defaultOptions);
		}
	}
	else {
		run(defaultTest, defaultOptions);
	}
}

export { run };