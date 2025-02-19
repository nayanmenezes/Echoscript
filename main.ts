import Parser from "./frontend/parser.ts";
import { createGlobalEnvironment } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts";

run("./test.txt");

async function run(filename: string) {
	const parser = new Parser();
	const env = createGlobalEnvironment();

	const input = await Deno.readTextFile(filename);
	const program = parser.produceAST(input);

	const result = evaluate(program, env);
	// console.log(result);
}

