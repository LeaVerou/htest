/**
 * Format console text with HTML-like tags
 */
// https://stackoverflow.com/a/41407246/90826
let modifiers = {
	reset: "\x1b[0m",
	b: "\x1b[1m",
	dim: "\x1b[2m",
	i: "\x1b[3m",
}

let colors = {
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
}

let tagRegex = RegExp(
	Object.keys(modifiers).map(tag => `</?${tag}>`).join("|") +
	`|<c\\s+(${ Object.keys(colors).join("|") })>|</c>`,
"gi");

export default function format (str) {
	if (!str) {
		return str;
	}

	str = str + "";
	// Iterate over all regex matches in str
	let active = new Set();
	let colorStack = [];
	return str.replace(tagRegex, tag => {
		let isClosing = tag[1] === "/";
		let name = tag.match(/<\/?(\w+)/)[1];
		let color = tag.match(/<c\s+(\w+)>/)?.[1];

		if (isClosing) {
			if (name === "c") {
				colorStack.pop();
			}
			else {
				if (active.has(name)) {
					active.delete(name);
				}
				else {
					// Closing tag for formatting that wasn't active
					return "";
				}
			}

			let activeColor = colorStack.at(-1);
			let colorModifier = colors[activeColor] ?? "";
			return modifiers.reset + [...active].map(name => modifiers[name]).join("") + colorModifier;
		}
		else {
			if (name === "c") {
				colorStack.push(color);
				return colors[color] ?? "";
			}
			else {
				active.add(name);
				return modifiers[name];
			}
		}
	});
}

export function stripFormatting (str) {
	return str.replace(tagRegex, "");
}

// /**
//  * Platform agnostic console formatting
//  * @param {*} str
//  * @param {*} format
//  */
// export default function format (str, format) {
// 	if (typeof format === "string") {
// 		format = Object.fromEntries(format.split(/\s+/).map(type => [type, true]));
// 	}

// 	for (let type in format) {
// 		str = formats[type] ? formats[type](str) : str;
// 	}
// str = str.replaceAll("\x1b", "\\x1b");
// 	return str;
// }