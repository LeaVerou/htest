---
title: JS-first mode
toc: true
---
# JS-first mode

## Defining tests

Tests are defined and grouped by object literals with a defined structure.
Each of these objects can either be a test, or contain child tests.
All properties work across both: if a property doesn’t directly apply to a group, it inherits down to the tests it contains.
This allows you to only specify what is different in each test,
and makes it easier to evolve the testsuite over time.

### Defining the test: `run`, `args`, `data`

- `run` defines the code to run, as a function. It can be either sync or async.
This inherits down, so subtests only need it if different than the parent.
- `args` is an array of arguments to pass to the running function.
If you pass a single argument, it will be converted to an array.
You can also use `arg` for this, which will *always* be assumed to be a single argument, even when it’s an array.
- `data` is an optional object with data that will be accessible to the running function as `this.data`.
Data inherits down unless overridden.
It is useful for differentiating the behavior of `run()` across groups of tests without having to redefine it or pass repetitive arguments.

It is common to define a single `run` function and several subtests that pass different arguments to it.

For a test to run, it needs at least a `run` function (possibly inherited) and an `args` array (possibly empty).

### Describing the test: `name`, `description`

`name` is a string that describes the test.
It is optional, but recommended, as it makes it easier to identify the test in the results.
If not provided, it defaults to the first argument passed to `run`, if any.

`name` can also be a function, which accepts the same arguments as `run()` and returns the default name as a string.
In that case, it will inherit down to descendants.

`description` is an optional longer description of the test or group of tests.

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
		check.proximity({epsilon: 1})
	)
}
```

Or, for nicer syntax:

```js
import getHue from "../src/getHue.js";
import {and, is, proximity } from "../node_modules/htest.dev/src/check.js";

export default {
	run (color) { getHue(color) },
	args: ["green"],
	expect: 90,
	check: and(
		is("number"),
		proximity({epsilon: 1})
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

- [In Node.js](../../run/node/)
- [In the browser](../../run/html/)