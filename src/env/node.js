// Native Node packages
import fs from "fs";
import path from "path";

// Dependencies
import logUpdate from 'log-update';
import { AsciiTree } from 'oo-ascii-tree';
import { globSync } from 'glob';

// Internal modules
import genericRun from "../run.js";
import Test from "../classes/Test.js";
import format from "../format-console.js";
import { getType } from '../util.js';

// Set up environment for Node
function getTree (msg, i) {
	return new AsciiTree(`</dim>${ msg }<dim>`, ...(msg.children?.map(getTree) ?? []));
}

const filenamePatterns = {
	include: /\.m?js$/,
	exclude: /^index/,
};

async function getTestsIn (dir) {
	let filenames = fs.readdirSync(dir).filter(name => !filenamePatterns.exclude.test(name) && filenamePatterns.include.test(name));
	let cwd = process.cwd();
	let paths = filenames.map(name => path.join(cwd, dir, name));

	return Promise.all(paths.map(path => import(path).then(module => module.default, err => {
		console.error(`Error importing tests from ${path}:`, err);
	})));
}

export default {
	name: "Node.js",
	defaultOptions: {
		format: "rich",
		get location () {
			return process.cwd();
		}
	},
	resolveLocation: async function (location) {
		if (fs.statSync(location).isDirectory()) {
			// Directory provided, fetch all files
			run({
				name: "All tests",
				tests: await getTestsIn(location),
			}, options);
		}
		else { // Probably a glob
			// Convert paths to imported modules
			let modules = globSync(location).flatMap(paths => {
				// Convert paths to imported modules
				paths = getType(paths) === "string" ? [paths] : paths;
				return paths.map(p => {
					p = path.join(process.cwd(), p);
					return import(p).then(m => m.default ?? m);
				});
			});

			return Promise.all(modules);
		}

	},
	start () {
		process.env.NODE_ENV = "test";
	},
	done: (result, options) => {
		let messages = result.toString({ format: options.format ?? "rich" });
		let tree = getTree(messages).toString();
		tree = format(tree);
		logUpdate(tree);

		if (result.stats.pending === 0) {
			logUpdate.clear();
			console.log(tree);
		}

		if (result.stats.fail > 0) {
			process.exitCode = 1;
		}
	}
}
