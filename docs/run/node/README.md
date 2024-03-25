# CLI

When [defining tests with JS](../../define/js/), most of the time you would want to run them in Node.
This allows you to use CI (continuous integration) services like Travis CI and GitHub Actions,
post-commit hooks, and other tools that run on the command line.

## Setup and requirements

For your tests to work with the Node.js runner, your JS code needs to be compatible with Node.js.
You need at least Node.js 16.x, but it is recommended to use the latest LTS version.

While to [run HTML tests](../define/html) it may be enough to simply link to hTest’s JS and CSS files,
to run JS tests in Node, you need to use npm to install hTest:

```sh
npm i htest.dev -D
```

## Zero hassle, some control

You just use the `htest` command line tool to run your tests:

```sh
npx htest tests
```

By default, hTest will look for all JS files in the directory you specify except for those starting with `index`.
You can use a glob to customize this:

```sh
npx htest tests/*.js,!tests/util.js
```

## Minimal hassle, more control

You can create your own CLI script to run your tests, by importing the same code the `htest` command line tool uses:

```js
import htest from "../node_modules/htest.dev/src/js/cli.js";

let test = {
	name: "Addtion",
	run: (a, b) => a + b,
	args: [1, 2],
	expect: 3,
}

htest(test, {verbose: true});
```

Try running it:

```sh
node my-test.js
```

## More hassle, total control

With both previous methods you can still pass command line arguments as well and hTest processes them:

```sh
node my-test.js footests.js
```

If you pass a directory, hTest will look for all JS files in that directory except for those starting with `index`.

If that's not desirable, you can use the lower level `run()` function:

```js
import run from "../node_modules/htest.dev/src/js/run.js";
import fooTests from "./foo.js";
import barTests from "./bar.js";

run({
	name: "All tests",
	tests: [
		fooTests,
		barTests,
	]
});
```

You could even have separate files for this:

`tests/index-fn.js`:

```js
import fooTests from "./foo.js";
import barTests from "./bar.js";

export default {
	name: "All tests",
	tests: [
		fooTests,
		barTests,
	]
}
```

`tests/index.js:`

```js
import run from "../node_modules/htest.dev/src/js/cli.js";
import tests from "./index-fn.js";

run(tests);
```

Just like `htest()`, any string arguments in the `run()` function are interpreted as globs (relative to the current working directory):

```js
import run from "../node_modules/htest.dev/src/js/run.js";

run("tests/*.js");
```
