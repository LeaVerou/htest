import transform from "./mocha.js";

// Example test suite in hTest format
const testSuite = {
	name: "Example Test Suite",
	description: "Check that the Mocha adapter successfully transforms hTest tests into Mocha tests",
	tests: [
		{
			name: "Result-based tests",
			getName () {
				let args = [...this.args];

				if (this.data.denominator !== undefined) {
					args.push(this.data.denominator);
				}

				return args.join(" / ");
			},
			run (a, b) {
				return a / b / (this.data.denominator ?? 1);
			},
			tests: [
				{
					args: [10, 2],
					expect: 5,
				},
				{
					args: [8, 2],
					data: {
						denominator: 2,
					},
					expect: 2,
				},
				{
					name: "Skipped test",
					args: [0, 0],
					skip: true,
				},
			],
		},
		{
			name: "Error-based tests",
			tests: [
				{
					name: "Any error",
					run: () => {
						throw new TypeError("foo");
					},
					throws: true,
				},
				{
					name: "Function",
					run: () => {
						throw new TypeError();
					},
					throws: error => error.constructor === TypeError,
				},
				{
					name: "Subclass",
					run: () => {
						throw new SyntaxError();
					},
					throws: SyntaxError,
				},
				{
					name: "Expect no error",
					run: () => "bar",
					throws: false,
				},
			],
		},
		{
			name: "Time-based tests",
			tests: [
				{
					name: "Synchronous",
					run: () => "foo",
					maxTime: 10,
				},
				{
					name: "Asynchronous",
					run: async () => new Promise(resolve => setTimeout(resolve, 10, "foo")),
					maxTimeAsync: 20,
				},
			],
		},
		{
			name: "Custom check",
			tests: [
				{
					name: "Object",
					run: () => "42",
					check: {
						looseTypes: true,
					},
					expect: 42,
				},
				{
					name: "Function",
					run: () => "foo",
					expect: "bar",
					check (actual, expected) {
						return actual.length === expected.length;
					},
				},
			],
		},
		{
			name: "Lifecycle hooks",
			getName () {
				return `Test #${ this.args[1] }`;
			},
			beforeAll () {
				console.log("\tbeforeAll() ...");
			},
			beforeEach () {
				console.log(`\tbeforeEach() #${ this.args[1] }...`);
			},
			afterEach () {
				console.log(`\tafterEach() #${ this.args[1] }...`);
			},
			afterAll () {
				console.log("\tafterAll() ...");
			},
			run: () => "foo",
			tests: Array.from({ length: 3 }, (_, index) => ({ args: ["foo", index + 1] })),
		},
	],
};

// Transform the test suite to Mocha's format
transform(testSuite);
