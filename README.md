<header>

# **h**Test

Truly declarative unit testing!

</header>

<main>

## What is hTest?

htest is a unit testing framework that focuses on making it as quick as possible to write tests,
and as nice as possible to read them.
TDD is hard enough as it stands — the more friction in writing tests, the fewer are written.
htest aims to eliminate all boilerplate, so you can focus on the tests themselves.

htest can be used in one of two ways: [HTML-first](docs/html/) or [JS-first](docs/js/):
- In [**HTML-first mode**](docs/html/) you write your tests in HTML files and run them only in the browser.
You define pass criteria that could even be what CSS selectors match,
and are evaluated reactively as the DOM updates.
You could even mock interactions, like clicks.
This is more suited to test UI code.
- In [**JS-first mode**](docs/js/) you write your tests in object literals,
and you can run them either in Node or in the browser.
You can even mix and match the two modes in the same testsuite.


## Running tests in the browser

The following applies to the HTML view of both modes.

### Isolating tests

It is often useful to isolate a single group of tests, or even a single test so you can debug a particular failure.

To isolate a group of tests (`<section>`), simply click the link of the section heading.

To isolate a specific test (`<tr>`), hold down the Alt/Option key and double click on the table row.

## hTest in the wild

### Testsuites

* [Color.js](https://colorjs.io/tests/)
* [Mavo](https://test.mavo.io) (not using hTest directly, but a precursor)

### Single page tests

* [Parsel](https://projects.verou.me/parsel/test.html)
* [Stretchy](https://stretchy.verou.me/test.html)

</main>
