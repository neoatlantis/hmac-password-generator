import crypto from "crypto-js";
import base85 from "app/base85";

const SHA256 = crypto.SHA256;
const SHA256_HMAC = crypto.HmacSHA256;


function WordArray2ArrayBuffer(wa){
    let a = new Int32Array(wa.words);
    return a.buffer;
}


function parse_format(format){
    format = format.toUpperCase();
    let matched = format.match(/^([1-9]|[1-9][0-9])U?L?N?S?$/);
    if(!matched) throw Error('密码输出格式错误');
    let length = parseInt(matched[1], 10);
    let uppercase = format.indexOf('U') >= 0;
    let lowercase = format.indexOf('L') >= 0;
    let numeric   = format.indexOf('N') >= 0;
    let special   = format.indexOf('S') >= 0;
    return {
        length, uppercase, lowercase, numeric, special,
    };
}




export default function({
    key,
    category,
    domain,
    username,
    generation_password,
    format
}){


    // TODO ensure all params in ASCII printable range

    let format_parsed = parse_format(format);

    let alphabet = [
        format_parsed.lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
        format_parsed.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
        format_parsed.numeric ? '0123456789' : '',
        format_parsed.special ? '!@#$%^&' : '',
    ].join("");

    console.log(alphabet, format_parsed);

    if(alphabet == "") alphabet = "abcdefghijklmnopqrstuvwxyz";


    let password_derivation_parameter = SHA256(
        [category, domain, username, generation_password].join("\n")
    ).toString().toLowerCase();

    let password_seed = SHA256_HMAC(
        password_derivation_parameter,
        key
    );

    let output = "";

    let h = password_seed;
    while(output.length < format_parsed.length){
        h = SHA256(h);
        let encoded = base85(WordArray2ArrayBuffer(h));
        
        for(let i=0; i<encoded.length; i++){
            let c = encoded[i];
            if(alphabet.indexOf(c) >= 0){
                output += c;
            }
        }

    }
    
    return output.slice(0, format_parsed.length);

}