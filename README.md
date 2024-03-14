<header>

# ✅ **h**Test

Declarative, boilerplate-free unit testing, for everyone.

https://htest.dev

</header>

<main>

## Features at a glance

- ✅ **Declarative**: Write your tests as nested object literals, with nice, readable syntax.
- ✅ **Flexible**: You decide where your tests live, across how many files, and how they’re grouped. Anything you can `import`, you can test.
- ✅ **Boilerplate-free**: Any commonalities between tests only specified once on the parent, and inherited. Anything that can be optional, is.
- ✅ **Quick to write**: Most tests only need two properties: `args` and `expect`. No more excuses for not testing your utility functions!
- ✅ **ESM-first**: Written in ESM from the get-go.
- ✅ **CLI and browser**: Run your tests in the command line, in the browser, or both.
- ✅ **HTML-first mode**: Working on UI-heavy code? Write your tests in HTML, with reactive evaluation and mock interactions!
- ✅ **Friendly**: Never used a unit test framework before? No problem! hTest is designed to be as friendly as possible to newcomers.

## What the hTest? Do we really need another unit testing framework?

Unit testing is hard enough as it stands — the more friction in writing tests, the fewer get written.
**hTest** is a unit testing framework that focuses on making it as quick and painless as possible to write tests.
Forget nested function calls with repetitive code.
hTest aims to eliminate all boilerplate, so you can focus on writing the actual tests.



hTest can be used in one of two ways: [JS-first](docs/define/js/) or [HTML-first](docs/define/html/).

<table>
<thead>
<tr>
<th>

[**JS-first mode**](docs/define/js/)
</th>
<th>

[**HTML-first mode**](docs/define/html/)
</th>
</tr>
</thead>
	<tbody>
		<tr>
			<td>

Write your tests in nested object literals, and you can [run them either in Node](docs/run/node) or [in the browser](docs/run/html).
Tests inherit values they don’t specify from their parents, so you never have to repeat yourself.
</td>
<td>

Write your tests in HTML files and run them only in the browser.</td>
<tr>
<td>

* More suitable for pure JS code.
* Compatible with CI and other automated test running processes.
* Code must be compatible with Node to use the Node test runner.

</td>
<td>

* More suitable for UI-heavy code.
* Pass-criteria extends beyond value matching or error catching, and could even be things like what CSS selectors match or what the DOM looks like.
* Reactive evaluation: if the HTML changes or the user interacts with the UI, relevant tests are re-evaluated.
* Mock interactions like click or focus with HTML attributes.

</td>
</tr>
	</tbody>
</table>

You can even mix and match the two modes in the same testsuite!
E.g. even a UI-heavy library has many JS-only functions that are better tested via JS-first tests.

![Sample terminal output](assets/images/terminal-output.png)

## Roadmap

hTest is still a work in progress, but is stable enough to be used in production.
It was soft launched in Q4 2023, but has been in use since 2022 (2017 if you count its early precursor — though that only included the HTML syntax).

The main things that still need to be done before launch are:
* Improve documentation — this is top priority, people keep asking for things that are already possible because they’re not documented well!
* Fix CLI output glitches
* Improve usability of nested output, especially for deeply nested tests. Ideal would be an interactive tree that starts off collapsed but can be navigated and expanded with the keyboard.
* Implement watch functionality
* Ensure we're not missing essential use cases

Any help with these would be greatly appreciated!

## hTest in the wild

### JS-first testsuites

* [Color.js](https://colorjs.io/test/) [\[source\]](https://github.com/color-js/color.js/tree/main/test)
* [vᴀꜱᴛly](https://vastly.mavo.io/test/) [\[source\]](https://github.com/mavoweb/vastly/tree/main/test)

### HTML-first testsuites

#### Testsuites

* [Color.js old testsuite](https://colorjs.io/tests/)
* [Mavo](https://test.mavo.io) (using a precursor of hTest)

#### Single page tests

* [Parsel](https://parsel.verou.me/test.html)
* [Stretchy](https://stretchy.verou.me/test.html)

</main>
