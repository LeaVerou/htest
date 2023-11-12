<header>

# ✅ **h**Test

Boilerplate-free unit testing, for everyone.

</header>

<main>

## What the hTest? Do we really need another unit testing framework?

htest is a unit testing framework that focuses on making unit testing as quick and painless as possible.
Forget copy-pasting 10 lines of boilerplate to write a single test.
TDD is hard enough as it stands — the more friction in writing tests, the fewer are written.
htest aims to eliminate all boilerplate, so you can focus on the tests themselves.

htest can be used in one of two ways: [HTML-first](docs/define/html/) or [JS-first](docs/define/js/):
- In [**HTML-first mode**](docs/define/html/) you write your tests in HTML files and run them only in the browser.
	* More suitable for UI-heavy code
	* Pass-criteria extends beyond value matching or error catching, and could even be things like what CSS selectors match or what the DOM looks like.
	* Reactive evaluation: if the HTML changes or the user interacts with the UI, relevant tests are re-evaluated.
	* Mock interactions like click or focus with HTML attributes.
- In [**JS-first mode**](docs/define/js/) you write your tests in object literals, and you can run them either in Node or in the browser.
	* More suitable for pure JS code
	* Tests are defined in a tree-like structure of object literals, with inheritance so you never have to repeat anything twice.
	* Compatible with CI and other automated test running processes.

You can even mix and match the two modes in the same testsuite!
E.g. even a UI-heavy library has many JS-only functions that are better tested via JS-first tests.

## hTest in the wild

### Testsuites

* [Color.js](https://colorjs.io/tests/)
* [Mavo](https://test.mavo.io) (using a precursor of what became hTest)

### Single page tests

* [Parsel](https://projects.verou.me/parsel/test.html)
* [Stretchy](https://stretchy.verou.me/test.html)

</main>
