#!/usr/bin/env node

import cli from "../src/cli.js";

function finished (result) {
	if (result.stats.fail) {
		process.exitCode = 1;
	}
}

cli(undefined, { finished });
