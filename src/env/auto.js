/**
 * Resolves to one of the existing environments based on heuristics
 */

// Are we in Node.js?
const IS_NODEJS = typeof process === "object" && process?.versions?.node;

const env = await import(IS_NODEJS ? "./node.js" : "./console.js").then(m => m.default);
export default env;
