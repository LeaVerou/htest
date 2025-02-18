export default {
	name: "Tests for timeout",
	description: "These tests are designed to fail.",
	run: () => new Promise(resolve => setTimeout(resolve, 200, "foo")),
	maxTime: 100,
	tests: [
		{
			name: "Result-based test",
			expect: "bar",
		},
		{
			name: "Error-based test",
			throws: error => error.cause.name !== "TimeoutError",
		},
		{
			name: "Time-based test",
			maxTimeAsync: 100,
		},
	],
};
