export default {
	name: "Run tests",
	args: [],
	expect: "foo",
	tests: [
		{
			name: "Synchronous run()",
			run: () => "foo",
		},
		{
			name: "Asynchronous run()",
			run: async () => await Promise.resolve("foo"),
		},
		{
			name: "run() returning a promise",
			run: () => new Promise(resolve => setInterval(() => resolve("foo"), 100)),
		},
	],
};
