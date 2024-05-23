import * as check from "../src/check.js";

export default {
	name: "Check tests",
	tests: [
		{
			name: "equals()",
			run: check.equals,
			tests: [
				{
					args: [1, 1],
					expect: true,
				},
				{
					args: [1, 0],
					expect: false,
				},
				{
					args: [NaN, NaN],
					expect: true,
				},
			]
		}
	]
}