import jsSHA from "jssha";
import base85 from "app/base85";
import { Buffer } from "buffer";



function SHA512(buffer){
    const obj = new jsSHA("SHA-512", "UINT8ARRAY");
    obj.update(buffer);
    return obj.getHash("UINT8ARRAY");
}

function SHA512_HMAC(buffer, key){
    const obj = new jsSHA("SHA-512", "UINT8ARRAY", {
        hmacKey: { value: key, format: "UINT8ARRAY" },
    });
    obj.update(buffer);
    return obj.getHash("UINT8ARRAY");
}





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


function seed_to_password(seed, format){
    if(!Buffer.isBuffer(seed)){
        throw Error("seed must be a buffer.");
    }

    let format_parsed = parse_format(format);
    let alphabet = [
        format_parsed.lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
        format_parsed.uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
        format_parsed.numeric ? '0123456789' : '',
        format_parsed.special ? '!@#$%^&' : '',
    ].join("");
    if(alphabet == "") alphabet = "abcdefghijklmnopqrstuvwxyz";

    let output = "";
    let h = seed;
    while(output.length < format_parsed.length){
        h = SHA512(h);
        let encoded = base85(h);
        
        for(let i=0; i<encoded.length; i++){
            let c = encoded[i];
            if(alphabet.indexOf(c) >= 0){
                output += c;
            }
        }
    }    
    return output.slice(0, format_parsed.length);
}


function get_password_derivation_parameter({
    category,
    domain,
    username,
    generation_password
}){
    if(![
        category, domain, username, generation_password
    ].every((e)=>/^([\x21-\x7e]+)?$/.test(e))){
        console.log(arguments);
        throw Error("Invalid parameter for password derivation.");
    }

    let joined = [
        category, domain, username, generation_password,
    ].join("\n");
    let joined_buffer = Buffer.from(joined, "ascii");

    return Buffer.from(SHA512(joined_buffer)).toString("hex").toLowerCase();
}





export {
    seed_to_password,
    get_password_derivation_parameter,
    SHA512_HMAC,
}