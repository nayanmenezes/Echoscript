import { AssignmentExpression, BinaryExpression, CallExpression, Identifier, ObjectLiteral } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { RuntimeValue, NumberValue, MK_Null, ObjectValue, NativeFnValue, FunctionValue } from "../values.ts";

export function evaluateBinaryExpression(binaryOperator: BinaryExpression, env: Environment): RuntimeValue{
    const lhs = evaluate(binaryOperator.leftHand, env);
    const rhs = evaluate(binaryOperator.rightHand, env);

    if(lhs.type == "number" && rhs.type == "number"){
        return evaluateNumericExpression(lhs as NumberValue, rhs as NumberValue, binaryOperator.operator);
    }

    return MK_Null();
}

export function evaluateIdentifier(ident: Identifier, env: Environment): RuntimeValue{
    const val = env.lookupVariable(ident.symbol);
    return val;
}

export function evaluateObjectExpression(
  obj: ObjectLiteral,
  env: Environment,
): RuntimeValue {
  const object = { type: "object", properties: new Map() } as ObjectValue;
  for (const { key, value } of obj.properties) {
    const runtimeVal = (value == undefined)
      ? env.lookupVariable(key)
      : evaluate(value, env);

    object.properties.set(key, runtimeVal);
  }

  return object;
}

export function evaluateCallExpression(expr: CallExpression,env: Environment): RuntimeValue {
  const args = expr.args.map((arg) => evaluate(arg,env));
  const fn = evaluate(expr.caller, env);

  if(fn.type == "native-function"){
    const result = (fn as NativeFnValue).call(args, env);
    return result;
  }

  if(fn.type == "function"){
    const func = fn as FunctionValue;
    const scope = new Environment(func.declarationEnv);

    // create variables for parameter list

    for(let i = 0; i < func.parameters.length; i++){
      const varname = func.parameters[i];
      scope.declareVariable(varname, args[i], false);

    }

    let result: RuntimeValue = MK_Null();
    for(const stmt of func.body){
      result = evaluate(stmt, scope);
    }

    return result;
  }

  throw "Cannot call value that is not a function: " + JSON.stringify(fn);


}

export function evaluateNumericExpression(lhs: NumberValue, rhs: NumberValue, operator: string): NumberValue{
    let result: number;

    if (operator == "+") {
    result = lhs.value + rhs.value;
  } else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "/") {
    // TODO: Division by zero checks
    result = lhs.value / rhs.value;
  } else {
    result = lhs.value % rhs.value;
  }
    return {value: result, type:"number"};

}

export function evaluateAssignment(node: AssignmentExpression, env: Environment):  RuntimeValue{
    if(node.assigne.kind != "Identifier"){
        throw `Invalid LHS inside assignment expression ${JSON.stringify(node.assigne)}`;
    }

    const varname = (node.assigne as Identifier).symbol;
    return env.assignVariable(varname, evaluate(node.value, env));
}