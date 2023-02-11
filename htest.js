{
let currentPage;

if (/\/$/.test(location.pathname)) {
	currentPage = "index";
}
else {
	currentPage = (location.pathname.match(/\/([a-z-]+)(?:\.html|\/?$)/) || [, "index"])[1];
}

document.documentElement.style.setProperty("--page", `"${currentPage}"`);

let loaded;

if (currentPage == "index") {
	loaded = import("./src/harness.js");
}
else {
	loaded = import("./src/testpage.js");
}

function ready (doc = document) {
	return new Promise(resolve => {
		if (doc.readyState !== "loading") {
			resolve();
		}
		else {
			doc.addEventListener("DOMContentLoaded", resolve, {once: true});
		}
	}).then(() => loaded);
}

function getType (o) {
	let str = Object.prototype.toString.call(o);

	return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}

// Stringify object in a useful way
function format (obj) {
	let type = getType(obj);

	if (obj && obj[Symbol.iterator] && type != "string") {
		var arr = [...obj];

		if (obj && arr.length > 1) {
			return arr.map(o => format(o)).join(" ");
		}
		else if (arr.length == 1) {
			obj = arr[0];
		}
		else {
			return `(empty ${type})`;
		}
	}

	if (obj instanceof HTMLElement) {
		return obj.outerHTML;
	}

	let toString = obj + "";

	if (!/\[object \w+/.test(toString)) {
		// Has reasonable toString method, return that
		return toString;
	}

	return JSON.stringify(obj, function(key, value) {
		switch (getType(value)) {
			case "set":
				return {
					type: "Set",
					value: [...value]
				};
			default:
				return value;
		}
	}, "\t");
};

/**
 * Global functions to be available to tests
 */

async function $out (...texts) {
	var script = this instanceof HTMLElement && this.matches("script")? this : document.currentScript;

	for (let text of texts) {
		if (typeof text === "function") {
			await ready();
			try {
				text = text();
			}
			catch (err) {
				text = `<div onclick="console.log(\`${err.stack}\`)">${err}</div>`;
			}
		}

		text = format(text);

		if (document.readyState == "loading") {
			document.write(text);
		}
		else if (script && script.parentNode) {
			script.insertAdjacentHTML("afterend", text);
		}
		else {
			console.log(script, script.parentNode)
			console.log("Test print", text);
		}
	}
}

function $outln (...text) {
	print(...text);
	print(" ", document.createElement("br"));
}

Object.assign(globalThis, {$out, $outln});

}