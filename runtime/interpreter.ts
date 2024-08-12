import {RuntimeValue, NumberValue} from "./values.ts";
import {BinaryExpression, Program, NumericLiteral, Statement, Identifier, VariableDeclaration, AssignmentExpression, ObjectLiteral, CallExpression, FunctionDeclaration} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { evaluateIdentifier, evaluateBinaryExpression, evaluateAssignment, evaluateObjectExpression, evaluateCallExpression } from "./eval/expressions.ts";
import { evaluateFunctionDeclaration, evaluateProgram, evaluateVarDeclaration } from "./eval/statements.ts";


export function evaluate(astNode: Statement, env: Environment): RuntimeValue{
    switch(astNode.kind){
        case "NumericLiteral":
            return {value: ((astNode as NumericLiteral).value), type: "number"} as NumberValue;
        case "Identifier":
            return evaluateIdentifier(astNode as Identifier, env);
        case "ObjectLiteral":
            return evaluateObjectExpression(astNode as ObjectLiteral, env);
        case "CallExpression":
            return evaluateCallExpression(astNode as CallExpression, env);
        case "BinaryExpression":
            return evaluateBinaryExpression(astNode as BinaryExpression, env);
        case "AssignmentExpression":
            return evaluateAssignment(astNode as AssignmentExpression, env)
        case "Program":
            return evaluateProgram(astNode as Program, env);

        case "VariableDeclaration":
            return evaluateVarDeclaration(astNode as VariableDeclaration, env);
        
        case "FunctionDeclaration":
            return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);
        default:
            console.error("This AST node has not yet been set up for interpretation.", astNode);
            Deno.exit(0);
    }
}