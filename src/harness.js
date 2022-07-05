import { create, $$ } from "./util.js";

/**
 * Code for test homepage
 */

function runSelected (names) {
	iframes.innerHTML = "";

	let tests = names.map(name => {
		return create("iframe", {
			inside: iframes,
			src: name,
			events: {
				load: evt => {
					updateTotals();

					evt.target.contentWindow.document.addEventListener("testresultsupdate", evt => {
						updateTotals();
					});
				}
			}
		});
	});

	function updateTotals() {
		let totals = {pass: 0, fail: 0};

		tests.forEach(iframe => {
			let doc = iframe.contentDocument;

			if (doc.readyState !== "complete" || !doc.querySelector("body > nav")) {
				return;
			}

			totals.pass += +doc.querySelector("body > nav .count-pass .count").textContent;
			totals.fail += +doc.querySelector("body > nav .count-fail .count").textContent;
		});

		let totalsEl = document.querySelector("h1 + .totals") || create({className: "totals", after: document.querySelector("h1")});

		totalsEl.innerHTML = `<strong>${totals.pass}</strong> passing, <strong>${totals.fail}</strong> failing of ${totals.pass + totals.fail} total`
	}
}

/*
<li class="[if(name = selected, 'selected')]">
	<input type="checkbox" property="toRun" checked="[name != 'index.html']">
	<meta property="id" content="[to(name, '.html')]">
	<a target="test" property="name" mv-action="set(selected, name)">[id]</a>
	<a href="[name]" class="new-tab" title="Open in new Tab" target="_blank">↗️</a>
</li>
*/

for (let a of tests.querySelectorAll("li > a")) {
	let li = a.parentElement;
	a.insertAdjacentHTML("beforebegin", `<input type="checkbox" property="toRun" checked>`);
	a.target = "test";
	a.addEventListener("click", evt => {
		for (let li of tests.querySelectorAll("li")) {
			li.classList.remove("selected");
		}
		li.classList.add("selected");
	});
	a.insertAdjacentHTML("afterend", `<a href="${ a.getAttribute("href") }" class="new-tab" title="Open in new Tab" target="_blank">↗️</a>`)
}

tests.insertAdjacentHTML("afterend", `<button id="run_button">Run selected</button>`);
run_button.addEventListener("click", evt => {
	runSelected($$("li > :checked + a", tests).map(a => a.getAttribute("href")));
});