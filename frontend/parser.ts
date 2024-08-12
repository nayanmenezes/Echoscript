// deno-lint-ignore-file no-explicit-any
import {Statement, Program, Expression, BinaryExpression, NumericLiteral, Identifier, VariableDeclaration, AssignmentExpression, Property, ObjectLiteral, CallExpression, MemberExpression, FunctionDeclaration} from "./ast.ts";
import {tokenize, Token, TokenType} from "./lexer.ts";

export default class Parser {

    private tokens: Token[] = [];

    private notEndOfFile() : boolean{
        return this.tokens[0].type != TokenType.EOF;
    }

    private at(){
        return this.tokens[0] as Token;
    }

    private advance(): Token{
        const prev = this.tokens.shift() as Token;
        return prev;
    }

    private expect(type: TokenType, err: any){
        const prev = this.tokens.shift() as Token;
        if(!prev || prev.type != type){
            console.error("Parser error:\n", err, prev, "- Expecting: ", type);
            Deno.exit(1);
        }

        return prev;
    }

    public produceAST(sourceCode: string): Program {
        this.tokens = tokenize(sourceCode);
        const program: Program = {
            kind: "Program",
            body: [],
        }

        while(this.notEndOfFile()){
            program.body.push(this.parseStatement());
        }

        return program;

    }

    private parseStatement(): Statement {
        switch(this.at().type){
            case TokenType.Let:
            case TokenType.Const:
                return this.parseVarDeclaration();
            default:
                return this.parseExpression();
        }
    }

    private parseVarDeclaration(): Statement{
        const isConstant = this.advance().type == TokenType.Const;
        const identifier = this.expect(TokenType.Identifier, "Expected identifier name following let | const keywords").value;

        if(this.at().type == TokenType.Semicolon){
            this.advance();
            if(isConstant){
                throw "Must assign value to constant expression. No value provided."
            }

            return {kind: "VariableDeclaration", identifier, constant: false } as VariableDeclaration;
        }

        this.expect(TokenType.Equals, "Expected equals token following identifier in var declaration.");
        const declaration = {kind: "VariableDeclaration", value: this.parseExpression(), identifier, constant: isConstant } as VariableDeclaration;

        this.expect(TokenType.Semicolon, "Variable declaration must end with semicolon.");
        return declaration;
    }



    private parseExpression(): Expression{
        return this.parseAssignmentExpression();
    }

    private parseAssignmentExpression(): Expression {
        const left = this.parseObjectExpression();
      
        if(this.at().type == TokenType.Equals){
            this.advance();
            const value = this.parseAssignmentExpression();
            return {value, assigne: left, kind: "AssignmentExpression"} as AssignmentExpression;
        }

        return left;
    }

    private parseObjectExpression(): Expression{
        if(this.at().type !== TokenType.OpenBrace){
            return this.parseAdditiveExpression();
        }

        this.advance();
        const properties = new Array<Property>();

        while(this.notEndOfFile() && this.at().type != TokenType.CloseBrace){
          const key = this.expect(TokenType.Identifier, "Object literal key expected").value; 

          if(this.at().type == TokenType.Comma){ //suports pair -> {key, }
            this.advance();
            properties.push({key, kind: "Property"});
            continue;
          }else if(this.at().type == TokenType.CloseBrace){  //pair -> {key }
            properties.push({key, kind: "Property"});
            continue;
          }
          

          this.expect(TokenType.Colon, "Missing colon following indentifier in Object Expression");
          const value = this.parseExpression();
          properties.push({kind: "Property", value, key});
          if(this.at().type != TokenType.CloseBrace){
            this.expect(TokenType.Comma, "Expected comma or Closing Bracket following property.");
          }
        }

        this.expect(TokenType.CloseBrace, "Object literal is missing closing brace.");
        return {kind: "ObjectLiteral", properties} as ObjectLiteral;
    }

    private parseAdditiveExpression(): Expression{
        let left = this.parseMultiplicativeExpression();

        while(this.at().value == "+" || this.at().value == "-"){
            const operator = this.advance().value;
            const right = this.parseMultiplicativeExpression();
            left = {kind: "BinaryExpression", leftHand: left, rightHand: right, operator} as BinaryExpression;
        }
        return left;
    }

    private parseMultiplicativeExpression(): Expression{
        let left = this.parseCallMemberExpression()

        while(this.at().value == "*" || this.at().value == "/" || this.at().value == "%"){
            const operator = this.advance().value;
            const right = this.parseCallMemberExpression();
            left = {kind: "BinaryExpression", leftHand: left, rightHand: right, operator} as BinaryExpression;
        }
        return left;
    }

    private parseCallMemberExpression(): Expression {
      const member = this.parseMemberExpression();

      if(this.at().type == TokenType.OpenParen){
        return this.parseCallExpression(member);
      }

      return member;
    };

    private parseCallExpression(caller: Expression): Expression{
        let call_expression: Expression = {kind: "CallExpression", caller, args: this.parseArgs()} as CallExpression;


        if(this.at().type == TokenType.OpenParen){
            call_expression = this.parseCallExpression(call_expression);
        }

        return call_expression;
    }

    private parseArgs(): Expression[]{
        this.expect(TokenType.OpenParen, "Expected open parenthesis.");
        const args = this.at().type == TokenType.CloseParen ? []: this.parseArgsList();

        this.expect(TokenType.CloseParen, "Missing closing parenthesis inside arguments list.");
        return args;
    }

    private parseArgsList(): Expression[]{
      const args = [this.parseAssignmentExpression()];

      while(this.at().type == TokenType.Comma && this.advance()){
        args.push(this.parseAssignmentExpression());
      }

      return args;
    }

    private parseMemberExpression(): Expression{
        let object = this.parsePrimaryExpression();
        

        while(this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket){
            const operator = this.advance();
            let property: Expression;
            let computed: boolean;

            //non-computed properties
            if(operator.type == TokenType.Dot){
                computed = false;
                property = this.parsePrimaryExpression();

                if(property.kind != "Identifier"){
                    throw `Cannot use dot operator without right hand side being an identifier.`
                }
            }else
            {
                    computed = true;
                    property = this.parsePrimaryExpression();
                    this.expect(TokenType.CloseBracket, "Mising closing bracket in computed value.");
            }

            object = {kind: "MemberExpression", object, property, computed} as MemberExpression;
        }

        return object;

    }


    private parsePrimaryExpression (): Expression{
        const tk = this.at().type;

        switch(tk){
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: this.advance().value} as Identifier;
            case TokenType.Number:
                return {kind: "NumericLiteral", value: parseFloat(this.advance().value)} as NumericLiteral;
            // deno-lint-ignore no-case-declarations 
            case TokenType.OpenParen:
                this.advance();
                const value = this.parseExpression();
                this.expect(TokenType.CloseParen, "Unexpected token found inside parenthesized expression. Expected closing parenthesis.",);
                return value;
            case TokenType.Fn:
                return this.parseFunctionDeclaration();
            default:
                console.error("Unexpected token found during parsing!", this.at())
                Deno.exit(1);
        }
    }
    parseFunctionDeclaration(): Statement {
        this.advance();
        const name = this.expect(TokenType.Identifier, "Expected function name following function keyword.").value;
        const args = this.parseArgs();

        const params: string[] = [];
        for(const arg of args){
            if(arg.kind !== "Identifier"){
                throw "Inside function declare expected parameters to be of type string."
            }

            params.push((arg as Identifier).symbol);
        }

        this.expect(TokenType.OpenBrace, "Expected function body following declaration");

        const body:Statement[] = [];

        while(this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace){
            body.push(this.parseStatement());
        }

        this.expect(TokenType.CloseBrace, "Closing barce expected inside function declaration.");
        const fn = {
            body, name, parameters: params, kind: "FunctionDeclaration"
        } as FunctionDeclaration;

        return fn;
    }
}
