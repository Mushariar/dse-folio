Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
}
Number.prototype.padleft = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) {
        s = "0" + s;
    }
    return s;
}
function numbertoMicroScale(labelValue, decimalpoint) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

        ? formatNumber((Math.abs(Number(labelValue)) / 1.0e+9).toFixed(decimalpoint)) + "B"
        // Six Zeroes for Millions
        : Math.abs(Number(labelValue)) >= 1.0e+6

        ? formatNumber((Math.abs(Number(labelValue)) / 1.0e+6).toFixed(decimalpoint)) + "M"
        // Three Zeroes for Thousands
        : Math.abs(Number(labelValue)) >= 1.0e+3

        ? formatNumber((Math.abs(Number(labelValue)) / 1.0e+3).toFixed(decimalpoint)) + "K"

        : Math.abs(Number(labelValue)) == 0

        ? "0"

        : formatNumber((Math.abs(Number(labelValue))).toFixed(decimalpoint));

}

function formatNumber(num) {

    if (num === null) {
        return null;
    }

    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

function getData(pUrl, pData, pMethod, pCallback) {
    var settings = {
        url: pUrl,
        method: pMethod,
        async: true,
        headers: {
            //"Content-Type": "application/json",
            "Cache-Control": "no-cache"
        },
        data: {data: pData}
    }
    jQuery.ajax(settings).done(function (response) {
        //console.log(response);
        pCallback(response);
    }).fail(function (errdata) {

        console.log("Error####");
        console.log(pUrl);
        console.log(errdata);
    });
}
