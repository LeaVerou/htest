import fs from "fs";
import run from "../src/js/cli.js";

// Read filenames in this directory
const __dirname = new URL(".", import.meta.url).pathname;
let filenames = fs.readdirSync(__dirname)
	.filter(name => !name.startsWith("index") && name.endsWith(".js"));

let tests = await Promise.all(filenames.map(name => import(`./${name}`).then(module => module.default)));

let root = {
	name: "All tests",
	tests
};

export default root;

let argv = process.argv.slice(2);
run(argv[0] || root);