const isObjEmpty = function (obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

const getIP = function (req) {
    try{
        let ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    return ip;
    }
    catch(err){
        return null;
    }
    
}

module.exports = {isObjEmpty, getIP}