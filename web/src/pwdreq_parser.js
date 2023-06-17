export default function(input){
    let url = null;
    try{
        url = new URL(input);
        if("pwdreq:" != url.protocol) throw Error();

        // treat as HTTP url afterwards. hostname etc. are HTTP url
        // specific.
        url = new URL("http"+input.slice(6));
    } catch(e){
        throw e;
    }
    
    let username = url.username;
    let domain   = url.hostname;
    let category = url.pathname;
    let search   = url.searchParams;
    let format   = url.searchParams.get("format") || "";
    let hint     = url.hash;

    if(hint.slice(0,1)=='#') hint = hint.slice(1);

    return {
        username, domain, category, search, format, hint,
    }
}