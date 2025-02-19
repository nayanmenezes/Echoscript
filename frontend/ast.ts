export type NodeType =
  | "Program"
  | "NumericLiteral"
  | "Identifier"
  | "AssignmentExpression"
  | "MemberExpression"
  | "CallExpression"
  | "VariableDeclaration"
  | "FunctionDeclaration"
  | "BinaryExpression"
  | "Property"
  | "ObjectLiteral";


export interface Statement {
  kind: NodeType;
}


export interface Program extends Statement {
  kind: "Program";
  body: Statement[];
}

export interface AssignmentExpression extends Expression{
  kind: "AssignmentExpression";
  assigne: Expression;
  value: Expression;
}

export interface VariableDeclaration extends Statement {
  kind: "VariableDeclaration";
  constant: boolean,
  identifier: string, 
  value?: Expression
}

export interface FunctionDeclaration extends Statement {
  kind: "FunctionDeclaration";
  parameters: string[];
  name: string;
  body: Statement[];
}

export interface Expression extends Statement {}


export interface BinaryExpression extends Expression {
  kind: "BinaryExpression";
  leftHand: Expression;
  rightHand: Expression;
  operator: string; 
}

export interface CallExpression extends Expression {
  kind: "CallExpression";
  args: Expression[];
  caller: Expression; 
}

export interface MemberExpression extends Expression {
  kind: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean; 
}


export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string;
}


export interface NumericLiteral extends Expression {
  kind: "NumericLiteral";
  value: number;
}

export interface Property extends Expression{
  kind: "Property";
  key: string;
  value?: Expression;
}

export interface ObjectLiteral extends Expression{
  kind: "ObjectLiteral";
  properties: Property[];
}
