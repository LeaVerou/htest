# JS-first mode

## Defining tests

Tests are defined and grouped by object literals with a defined structure.
Each of these objects can contain child tests, its own test, both, or even neither.
There is no strict distinction between tests and groups of tests, you decide how you want to organize your testsuite,
and the syntax is designed to make it easier to evolve it over time.

The main idea is that a lot of these properties inherit down to descendants unless overridden,
allowing you to only specify what’s different in each test.

### Defining the test: `run` and `args`

- `run` defines the code to run, as a function. It can be either sync or async.
This inherits down, so subtests only need it if different than the parent.
- `args` is an array of arguments to pass to the running function.
If you pass a single argument, it will be converted to an array.

It is common to define a single `run` function and several subtests that pass different arguments to it.

For a test to run, it needs at least a `run` function (possibly inherited) and an `args` array (possibly empty).

### Naming the test: `name`

`name` is a string that describes the test.
It is optional, but recommended, as it makes it easier to identify the test in the results.
If not provided, it defaults to the first argument passed to `run`, if any.

You can also provide a function that takes the arguments as arguments and returns a string.
In that case, it will inherit down to descendants.

### Setting expectations: `expect`, `throws`, `maxTime`, `maxTimeAsync`

All of these properties define the criteria for a test to pass.

`expect` defines the expected result, so you'll be using it the most.

If you are testing that an error is thrown, you can use `throws`.
`throws: true` will pass if any error is thrown, but you can also have more granular criteria:
- If the value is an `Error` subclass, the error thrown *also* needs to be an instance of that class.
- If the value is a function, the function *also* needs to return a truthy value when called with the error thrown as its only argument.

The time a test took is always measured and displayed.
If the test returns a promise, the time it took to resolve is also measured, separately.
To test performance-sensitive functionality, you can set `maxTime` or `maxTimeAsync` to specify the maximum time (in ms) that the test should take to run.

To make it easier to interpret the results, each test can only have one main pass criterion: result-based, error-based, or time-based.
E.g. you can use `maxTime` and `maxTimeAsync` together, but not with `expect` or `throws`.

If you specify multiple criteria, nothing will break, but you will get a warning.

### Making comparisons easier: `map` and `check`

By default, if you provide an `expect` value, the test will pass if the result is equal to it (though using a [somewhat smarter algorithm](https://github.com/LeaVerou/htest/blob/main/src/check.js#L9) than just `===`).
However, often you don’t really need full equality, just to verify that the result passes some kind of test,
or that it has certain things in common with the expected output.

- `map` allows you to provide a mapping function that will be applied to both the result and the expected value before comparing them.
If the return value is an array, each individual item will be mapped separately.
- `check` allows you to provide a custom function that takes the result and the expected value (if present) as argments and returns a boolean indicating whether the test passed.
If the return value is not a boolean, it is coerced to one.

Both are inherited by descendants unless overridden.

There are many helpers for this in `/src/check.js` and `/src/map.js`,
with either predefined functions or functions that return functions for more flexibility.

```js
import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	run: Math.random,
	args: [],
	check: check.between({min: 0, max: 1}),
}
```

You can even do logical operations on them:

```js
import getHue from "../src/getHue.js";
import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	run (color) { getHue(color) },
	args: ["green"],
	expect: 90,
	check: check.and(
		check.is("number"),
		check.closeEnough({epsilon: 1})
	)
}
```

Or, for nicer syntax:

```js
import getHue from "../src/getHue.js";
import {and, is, closeEnough } from "../node_modules/htest.dev/src/check.js";

export default {
	run (color) { getHue(color) },
	args: ["green"],
	expect: 90,
	check: and(
		is("number"),
		closeEnough({epsilon: 1})
	)
}
```

### Example


Here is an example that defines three tests with a common `run` function:

```js
import parse from "../src/parse.js";
import evaluate from "../src/evaluate.js";

export default {
	// How to run the test
	// Can be sync or async
	run (expression, ...args) {
		let ast = parse(expression);
		return evaluate(ast, ...args);
	},
	map: JSON.stringify,
	tests: [
		// Array of tests or groups of tests (see below)
		{
			args: ["1 + 2"],
			expect: 3
		},
		{
			name: "Variables",
			tests: [
				{args: ["x", {x: 1}], expect: 1},
				{args: ["x + y", {x: 1, y: 2}], expect: 3},
			]
		}
	]
}
```

## Running tests

Because the tests are defined declaratively, they can be run in a number of ways.

### Node.js

While to [run HTML tests](../html/) it may be enough to simply link to hTest’s JS and CSS files,
to run JS tests in Node, you need to use npm to install hTest:

```sh
npm install htest --save-dev
```

To run the tests, all you need is a script that imports the testsuite and runs it:

```js
import run from "../node_modules/htest.dev/src/js/cli.js";

let test = {
	name: "Addtion",
	run: (a, b) => a + b,
	args: [1, 2],
	expect: 3,
}

run(test);
```

Try running it:

<pre class="language-shell-session"><code>
% node my-test.js
<span class="colored" style="color: green">[Addtion] PASS (0.03 ms)</span>
</code></pre>

More realistically, you’d be defining sets of tests in individual modules, then importing them into a main test suite:

```js
import run from "../node_modules/htest.dev/src/js/cli.js";
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

tests/index-fn.js:

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

tests/index.js:

```js
import run from "../node_modules/htest.dev/src/js/cli.js";
import tests from "./index-fn.js";

run(tests);
```

### In the browser

TODO