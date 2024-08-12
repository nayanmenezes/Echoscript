import { Statement } from "../frontend/ast.ts";
import Environment from "./environment.ts";

export type ValueType = "null" | "number" | "boolean" | "object" | "native-function" | "function";

export interface RuntimeValue{
    type: ValueType;
}

export interface NullValue extends RuntimeValue{
    type: "null";
    value: null;
}

export interface NumberValue extends RuntimeValue {
    type: "number";
    value: number;
}

export interface BooleanValue extends RuntimeValue {
    type: "boolean";
    value: boolean;
}

export interface ObjectValue extends RuntimeValue{
    type: "object";
    properties: Map<string, RuntimeValue>;
}

export interface NativeFnValue extends RuntimeValue{
    type: "native-function";
    call: FunctionCall;
}

export interface FunctionValue extends RuntimeValue{
    type: "function";
    name: string;
    parameters: string[];
    declarationEnv: Environment;
    body: Statement[];
}

export function MK_Number(n = 0){
    return {type: "number", value: n} as NumberValue;
}

export function MK_Null(){
    return {type: "null", value: null} as NullValue;
}

export function MK_Boolean(b = true){
    return {type: "boolean", value: b} as BooleanValue;
}

export type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue;

export function MK_Native_Fn(call: FunctionCall){
    return {type: "native-function", call} as NativeFnValue;
}


