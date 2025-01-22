import { IS_NODEJS } from "../util.js";

/**
 * Resolves to one of the existing environments based on heuristics
 */
const env = await import(IS_NODEJS ? "./node.js" : "./console.js").then(m => m.default);
export default env;
