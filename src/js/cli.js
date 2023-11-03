#! /usr/bin/env node
import run from "./node-run.js";

let argv = process.argv.slice(2);

if (argv.length > 0) {
	// Read filenames in CWD
	let location = argv[0];

	// Is location a directory?
	let stats = fs.statSync(location);
	if (stats.isDirectory()) {
		// Read filenames in this directory
		let filenames = fs.readdirSync(location)
			.filter(name => !name.startsWith("index") && name.endsWith(".js"));

		let tests = await Promise.all(filenames.map(name => import(`./${name}`).then(module => module.default)));

		let root = {
			name: "All tests",
			tests
		};

		run(root);
	}
	else {
		// Let glob figure it out
		run(location);
	}
}

export default run;