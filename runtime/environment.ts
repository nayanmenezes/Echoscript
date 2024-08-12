import { MK_Boolean, MK_Native_Fn, MK_Null, RuntimeValue } from "./values.ts";

export function createGlobalEnvironment(){
    const env = new Environment();
    env.declareVariable("true", MK_Boolean(true), true);
    env.declareVariable("false", MK_Boolean(false), true)
    env.declareVariable("null", MK_Null(), true);

    env.declareVariable("print", MK_Native_Fn((args, scope) => {
        console.log(...args);
        return MK_Null();
    }), true);

    return env;

}

export default class Environment{
    private parent?: Environment;
    private variables: Map<string,RuntimeValue>;
    private constants: Set<string>;

    

    constructor(parentENV?: Environment){
        const global = parentENV ? true : false;
        this.parent = parentENV;
        this.variables = new Map();
        this.constants = new Set();
        
    }

    public declareVariable(varname: string, value: RuntimeValue, constant: boolean): RuntimeValue{
        if(this.variables.has(varname)){
            throw `Cannot declare variable ${varname}. As it already exists.`
        }

        this.variables.set(varname, value);

        if(constant){
            this.constants.add(varname);
        }
        return value;
    }

    public assignVariable(varname: string, value: RuntimeValue): RuntimeValue{
        const env = this.resolve(varname);
        if(env.constants.has(varname)){
            throw `Cannot reassign to variable ${varname} declared constant`;
        }
        env.variables.set(varname, value);
        return value;
    }

    public lookupVariable(varname: string): RuntimeValue{
        const env = this.resolve(varname);
        return env.variables.get(varname) as RuntimeValue;
    }

    public resolve(varname: string): Environment{
        if(this.variables.has(varname)){
            return this;
        }

        if(this.parent == undefined){
            throw `Cannot resolve '${varname}' as it does not exist.`
        }

        return this.parent.resolve(varname)
    }
}