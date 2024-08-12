import { FunctionDeclaration, Program, VariableDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { RuntimeValue, MK_Null, FunctionValue } from "../values.ts";

export function evaluateProgram(program: Program, env: Environment): RuntimeValue{
    let lastEvaluated: RuntimeValue = MK_Null();

    for(const statement of program.body){
        lastEvaluated = evaluate(statement, env);
    }

    return lastEvaluated;

}

export function evaluateVarDeclaration(declaration: VariableDeclaration, env: Environment,): RuntimeValue{
    const value = declaration.value ? evaluate(declaration.value, env): MK_Null();
    return env.declareVariable(declaration.identifier, value, declaration.constant);
}

export function evaluateFunctionDeclaration(declaration: FunctionDeclaration, env: Environment,): RuntimeValue{
    const fn = 
    {type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body} as FunctionValue;

    return env.declareVariable(declaration.name, fn , true);
}
