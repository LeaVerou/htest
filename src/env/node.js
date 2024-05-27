// Native Node packages
import fs from "fs";
import path from "path";
import * as readline from 'node:readline';

// Dependencies
import logUpdate from 'log-update';
import { AsciiTree } from 'oo-ascii-tree';
import { globSync } from 'glob';

// Internal modules
import format from "../format-console.js";
import { getType } from '../util.js';

// Recursively traverse a subtree starting from `node` and make (only) groups of tests collapsible
function makeCollapsible (node) {
	if (node.tests?.length) {
		node.collapsed = node.test.level === 0 ? false : true; // the root is expanded by default

		for (let test of node.tests) {
			makeCollapsible(test);
		}
	}
}

// Recursively traverse a subtree starting from `node` and return all visible groups of tests
function getVisibleGroups (node, groups = []) {
	groups.push(node);

	if (node.collapsed === false && node.tests?.length) {
		let tests = node.tests.filter(test => test.collapsed !== undefined); // we are interested in groups only
		for (let test of tests) {
			getVisibleGroups(test, groups);
		}
	}

	return groups;
}

function getTree (msg, i) {
	if (msg.collapsed !== undefined) {
		let {collapsed, highlighted, children} = msg;

		let icon = msg.collapsed ? "▶︎ " : "▼ ";
		msg = icon + msg;
		if (highlighted) {
			msg = `<b>${ msg }</b>`;
		}
		msg = new String(msg);
		msg.collapsed = collapsed;
		msg.children = collapsed ? [] : children;
	}

	return new AsciiTree(`</dim>${ msg }<dim>`, ...(msg.children?.map(getTree) ?? []));
}

// Render the tests stats
function render (root, options) {
	let messages = root.toString({ format: options.format ?? "rich" });
	let tree = getTree(messages).toString();
	tree = format(tree);

	logUpdate(tree);
}

// Set up environment for Node
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
			return getTestsIn(location);
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
	setup () {
		process.env.NODE_ENV = "test";
	},
	done (result, options, event, root) {
		makeCollapsible(root)
		render(root, options);

		if (root.stats.pending === 0) {

			let hint = `
<b>You are in interactive mode now.</b>
Use <b>↑</b> and <b>↓</b> arrow keys to navigate groups of tests, <b>→</b> and <b>←</b> to expand and collapse them respectively.
Press <b>^C</b> (<b>Ctrl+C</b>) or <b>q</b> to quit.
`;
			hint = format(hint);

			logUpdate.clear();
			console.log(hint);

			readline.emitKeypressEvents(process.stdin);
			process.stdin.setRawMode(true); // handle keypress events instead of Node

			root.highlighted = true;
			render(root, options);

			let active = root; // active (highlighted) group of tests that can be expanded/collapsed; root by default
			process.stdin.on("keypress", (character, key) => {
				let name = key.name;

				if ((name === "c" && key.ctrl) || name === "q") {
					// Quit interactive mode
					logUpdate.done();
					process.exit();
				}
				else if (name === "up") {
					// Figure out what group of tests is active (and should be highlighted)
					let groups = getVisibleGroups(root);
					let index = groups.indexOf(active);
					index = Math.max(0, index - 1); // choose the previous group, but don't go higher than the root
					active = groups[index];

					groups = groups.map(group => group.highlighted = false);
					active.highlighted = true;
					render(root, options);
				}
				else if (name === "down") {
					let groups = getVisibleGroups(root);
					let index = groups.indexOf(active);
					index = Math.min(groups.length - 1, index + 1); // choose the next group, but don't go lower than the last one
					active = groups[index];

					groups = groups.map(group => group.highlighted = false);
					active.highlighted = true;
					render(root, options);
				}
				else if (name === "left" && active.collapsed === false) {
					active.collapsed = true;
					render(root, options);
				}
				else if (name === "right" && active.collapsed === true) {
					active.collapsed = false;
					render(root, options);
				}
			});
		}

		if (root.stats.fail > 0) {
			process.exitCode = 1;
		}
	}
}
