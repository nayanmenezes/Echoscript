//Let x = 45
//[ LetToken, IndentifierTk, EqualsTk, NumberTkn]

export enum TokenType{
    //Literal Types
    Number, 
    Identifier,

    //Operators for grouping
    Equals,
    Comma, Colon,
    OpenParen, CloseParen,
    Semicolon,
    BinaryOperator, 
    OpenBrace, 
    CloseBrace,
    OpenBracket,
    CloseBracket,
    Dot,


    //Keywords
    Let,
    Const,
    Fn,

    EOF, //Represents the end of the file
}

const KEYWORDS: Record<string, TokenType> = {
    let: TokenType.Let,
    const: TokenType.Const,
    fn: TokenType.Fn
}

export interface Token{
    value: string, 
    type: TokenType,
}

function token(value = "", type: TokenType): Token{
    return {value, type};
}

function skipCharacter(src: string){
    return src == ' ' || src == '\n' || src == '\t' || src == "\r";
}

function isAlphabetic(src: string){
    return src.toUpperCase() != src.toLowerCase();
}

function isInteger (str: string){
    const c = str.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return (c >= bounds[0] && c <= bounds[1]);
}

export function tokenize (sourceCode: string): Token[]{
    const tokens = new Array<Token>();
    const src = sourceCode.split("");

    // build tokens until end of file is reached
    while(src.length > 0){
        if(src[0] == "("){
            tokens.push(token(src.shift(), TokenType.OpenParen))
        }else if(src[0] == ")"){
            tokens.push(token(src.shift(), TokenType.CloseParen))
        }else if(src[0] == "+" || src[0] == "-" || src[0] == "*" || src[0] == "/" || src[0] == "%"){
            tokens.push(token(src.shift(), TokenType.BinaryOperator))
        }else if(src[0] == "{"){
            tokens.push(token(src.shift(), TokenType.OpenBrace))
        }else if(src[0] == "}"){
            tokens.push(token(src.shift(), TokenType.CloseBrace))
        }else if(src[0] == "["){
            tokens.push(token(src.shift(), TokenType.OpenBracket))
        }else if(src[0] == "]"){
            tokens.push(token(src.shift(), TokenType.CloseBracket))
        }else if(src[0] == "="){
            tokens.push(token(src.shift(), TokenType.Equals))
        }else if(src[0] == ";"){
            tokens.push(token(src.shift(), TokenType.Semicolon))
        }else if(src[0] == ":"){
            tokens.push(token(src.shift(), TokenType.Colon))
        }else if(src[0] == ","){
            tokens.push(token(src.shift(), TokenType.Comma))
        }else if(src[0] == "."){
            tokens.push(token(src.shift(), TokenType.Dot))
        }else {
            //handle multicharacter tokens

            //build token
            if(isInteger(src[0])){
                let number = "";
                while(src.length > 0 && isInteger(src[0])){
                    number+= src.shift();
                }
                tokens.push(token(number, TokenType.Number))
            }else if(isAlphabetic(src[0])){
                let identifier = "";
                while(src.length > 0 && isAlphabetic(src[0])){
                    identifier+= src.shift();
                }


                //check for reserved words, versus user-defined keywords
                const reserved = KEYWORDS[identifier];
                if(typeof reserved == "number"){
                    tokens.push(token(identifier, reserved));
                }else{
                    tokens.push(token(identifier, TokenType.Identifier));
                }
            }else if(skipCharacter(src[0])){
                src.shift();
            }else{
                console.log("unrecognized character found in source: ", src[0]);
            }
          }
        }
        tokens.push({type: TokenType.EOF, value: "EndOfFile"});
        return tokens;
    }
    