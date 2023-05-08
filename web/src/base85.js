/*
https://github.com/ulvesked/base85-arraybuffer/blob/master/dist/base85.js
*/

"use strict";

var BASE85_CHARS_Z85 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-:+=^!/*?&<>()[]{}@%$#";
function resizeArrayBuffer(buffer, offset, length) {
    if (offset == 0 && length == buffer.byteLength) {
        return buffer;
    }
    else if (length > buffer.byteLength) {
        if (typeof (ArrayBuffer.transfer) == 'function') {
            return ArrayBuffer.transfer(buffer, length);
        }
        else {
            var result = new ArrayBuffer(length);
            var dst = new Uint8Array(result);
            var src = new Uint8Array(buffer, offset, buffer.byteLength - offset);
            for (var i = 0; i < src.length; i++) {
                dst[i] = src[i];
            }
            return result;
        }
    }
    else {
        return buffer.slice(0, length);
    }
}
function encode(input, options) {
    var prefix = null, suffix = null;
    var ascii85 = !options || !options.variant || options.variant == "ascii85";
    var z = ascii85 && options && options.zeroesAsZ;
    var y = ascii85 && options && options.spacesAsY;
    var buf, byteOffset, byteLength;
    if (ArrayBuffer.isView(input)) {
        buf = input.buffer;
        byteOffset = input.byteOffset;
        byteLength = input.byteLength;
    }
    else {
        buf = input;
        byteOffset = 0;
        byteLength = input.byteLength;
    }
    var mod = byteLength % 4;
    var padding = 0;
    if (mod) {
        padding = 4 - mod;
        buf = resizeArrayBuffer(buf, byteOffset, byteLength + padding);
        byteOffset = 0;
        byteLength = buf.byteLength;
    }
    var data = new DataView(buf, byteOffset, byteLength);
    var result = [];
    if (prefix !== null) {
        result.push(prefix);
    }
    for (var i = 0; i < data.byteLength; i += 4) {
        var num = data.getUint32(i, false);
        if (num === 0x00000000 && z) {
            result.push('z');
        }
        else if (num === 0x20202020 && y) {
            result.push('y');
        }
        else {
            for (var x = 4; x >= 0; x--) {
                var pow = Math.pow(85, x);
                var mod_1 = num % pow;
                num = Math.floor(num / pow);
                var char = void 0;
                if (ascii85) {
                    char = String.fromCharCode(num + 33);
                }
                else {
                    char = BASE85_CHARS_Z85[num];
                }
                result.push(char);
                num = mod_1;
            }
        }
    }
    if (padding > 0) {
        result.splice(result.length - padding, padding);
    }
    return result.join("");
}

export default encode;