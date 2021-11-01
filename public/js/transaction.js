$(document).ready(function () {


    getData("/transactionui", {}, "GET", loaddata);

    function loaddata(ds) {
        loadtrxaccount(ds.useraccount);
        loadtrxtradingcode(ds.companylist);

        initializetrxform();
    }

    /*======== JQUERY AUTO COMPLETE FOR TRANSACTION ENTRY ========*/
    // function loadtrxtradingcode(ds) {
    //     console.log(ds);
    //     $("#trxtradingcode").autocomplete({
    //         minLength: 2,
    //         autoFocus: true,
    //         source: function (request, response) {
    //             response($.map(ds, function (item) {
    //                 if (item.companycode.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase())
    //                     return {
    //                         label: item.companycode + " (" + item.comapnyname + ")",
    //                         value: item.companycode
    //                     };
    //             }));
    //         },
    //         change: function (event, ui) {
    //             if (ui.item == null) {
    //                 event.currentTarget.value = '';
    //                 event.currentTarget.focus();
    //             }
    //         }
    //     }).focus(function () {
    //         $(this).autocomplete("search", "");
    //     });
    // }

    function loadtrxtradingcode(ds) {
        $("#trxtradingcode").autocomplete({
            minLength: 1,
            maxResults: 10,
            autoFocus: false,
            focus: function (event, ui) {
                $("#trxtradingcode").val(ui.item.value);
                return false;
            },
            source: function (request, response) {
                response($.map(ds, function (item) {
                    // if (item.companycode.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase() 
                    // ||
                    // (item.comapnyname ? item.comapnyname.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase() : false )
                    //  )
                    if (item.companycode.toLowerCase().indexOf(request.term.toLowerCase()) > -1
                        ||
                        (item.comapnyname ? item.comapnyname.toLowerCase().indexOf(request.term.toLowerCase()) > -1 : false)
                    )
                        return {
                            label: item.comapnyname,
                            value: item.companycode
                        };
                }).slice(0, this.options.maxResults)
                );
            },
            change: function (event, ui) {
                if (ui.item == null) {
                    event.currentTarget.value = '';
                    event.currentTarget.focus();
                }
            }
        }).autocomplete("instance")._renderItem = function (ul, item) {
            return $('<li class="autocomplete-top-search">')

                .append('<div style="color: #4c84ff;">' + item.value + '</div><div style="color: #000;">' + item.label + '</div>')
                .appendTo(ul);
        }
    }

    /*======== User Account Information for Transaction ========*/
    function loadtrxaccount(ds) {

        if (ds) {
            ds.forEach(function (acc, i) {
                $('#trxaccount')
                    .append($("<option></option>")
                        .attr("data-value", JSON.stringify({ id: acc.id, balance: acc.balance, commissionpct: acc.commissionpct }))
                        .text(acc.boid)
                    );

                if (acc.isdefault === 1) {
                    $('#trxaccount option')[i].selected = true;
                    $("#spnbalance").text(formatNumber(acc.balance));
                    $("#trxcommissionpct").val(acc.commissionpct);
                }

            });
        }
        else {
            alert("No account found");
        }

    }

    function initializetrxform(isTanstype) {


        $("#trxtransdate").val(moment().format('YYYY-MM-DD'));
        $("#trxtradingcode").val("");
        $("#trxquantity").val("");
        $("#trxrate").val("");
        $("#trxtotalprice").val("");
        $("#trxamount").val("");
        $("#trxcommission").val("");
        $("#trxcommissionpct").val("");
        $("#trxavgcost").val("");
        $("#trxtotalcost").val("");
        $("#spnbalance").text("");
        $("#trxaccountid").val("");

        $("#trxtradingcode").prop("readonly", false);
        $("#trxquantity").prop("readonly", false);
        $("#trxrate").prop("readonly", false);
        $("#trxtotalprice").prop("readonly", true);
        $("#trxamount").prop("readonly", true);
        $("#trxcommission").prop("readonly", true);
        $("#trxcommissionpct").prop("readonly", true);
        $("#trxavgcost").prop("readonly", true);
        $("#trxtotalcost").prop("readonly", true);

        $("#trxtradingcode").prop("required", true);
        $("#trxquantity").prop("required", true);
        $("#trxrate").prop("required", true);
        $("#trxtotalprice").prop("required", true);
        $("#trxamount").prop("required", true);
        $("#trxcommission").prop("required", true);
        $("#trxavgcost").prop("required", false);
        $("#trxtotalcost").prop("required", false);



        if (!isTanstype) {
            $("#trxtranstype").val("BUY");
        }
        $("#spnbalance").text(formatNumber($("#trxaccount").find(":selected").data("value").balance));
        $("#trxcommissionpct").val($("#trxaccount").find(":selected").data("value").commissionpct);
        $("#trxaccountid").val($("#trxaccount").find(":selected").data("value").id);

    }
    function calculatetrxformdata() {

        let vTransType = $("#trxtranstype").val();

        switch (vTransType) {
            case "BUY":
                $("#trxtradingcode").prop("readonly", false);
                $("#trxquantity").prop("readonly", false);
                $("#trxrate").prop("readonly", false);


                $("#trxtradingcode").prop("required", true);
                $("#trxquantity").prop("required", true);
                $("#trxrate").prop("required", true);
                $("#trxtotalprice").prop("required", true);
                $("#trxamount").prop("required", true);
                $("#trxcommission").prop("required", true);


                if ($('#trxquantity').val() && $('#trxrate').val() && $('#trxcommissionpct').val()) {
                    $('#trxtotalprice').val((parseInt($('#trxquantity').val().trim()) * parseFloat($('#trxrate').val().trim())).round(2));
                    $('#trxcommission').val((parseFloat($('#trxcommissionpct').val().trim()) * parseFloat($('#trxtotalprice').val().trim()) / 100).round(2));
                    $('#trxamount').val((parseFloat($('#trxtotalprice').val().trim()) + parseFloat($('#trxcommission').val().trim())).round(2));
                }

                break;
            case "SALE":
                $("#trxtradingcode").prop("readonly", false);
                $("#trxquantity").prop("readonly", false);
                $("#trxrate").prop("readonly", false);
                $("#trxtradingcode").prop("required", true);
                $("#trxquantity").prop("required", true);
                $("#trxrate").prop("required", true);
                $("#trxtotalprice").prop("required", true);
                $("#trxamount").prop("required", true);
                $("#trxcommission").prop("required", true);
                $("#trxcommissionpct").prop("required", false);
                $("#trxavgcost").prop("required", true);

                // trxavgcost
                if ($("#trxaccountid").val() && $("#trxtradingcode").val()) {
                    getavgcost($("#trxaccount").find(":selected").data("value").id, $("#trxtradingcode").val()).then((r) => {
                        if (!r) {
                            alert("You do not have this item to same");
                            $('#trxtradingcode').val((""));
                            $('#trxavgcost').val((""));
                            $('#trxtradingcode').focus();
                        } else {
                            $('#trxavgcost').val((r.avgcost).round(2));
                        }

                    });
                }

                if ($('#trxquantity').val() && $('#trxrate').val() && $('#trxcommissionpct').val()) {
                    $('#trxtotalprice').val((parseInt($('#trxquantity').val().trim()) * parseFloat($('#trxrate').val().trim())).round(2));
                    $('#trxcommission').val((parseFloat($('#trxcommissionpct').val().trim()) * parseFloat($('#trxtotalprice').val().trim()) / 100).round(2));
                    $('#trxamount').val((parseFloat($('#trxtotalprice').val().trim()) - parseFloat($('#trxcommission').val().trim())).round(2));
                    $('#trxtotalcost').val((parseInt($('#trxquantity').val().trim()) * parseFloat($('#trxavgcost').val().trim())).round(2));
                    $('#trxrealizedprofit').val((parseFloat($('#trxamount').val().trim()) - parseFloat($('#trxtotalcost').val().trim())).round(2));
                }
                break;
            case "RECEIPT":
                $("#trxamount").prop("readonly", false);
                $("#trxtradingcode").val("");
                $("#trxtradingcode").prop("readonly", true);
                $("#trxquantity").prop("readonly", true);
                $("#trxrate").prop("readonly", true);

                $("#trxamount").prop("required", true);

                break;
            case "PAYMENT":
                $("#trxamount").prop("readonly", false);
                $("#trxtradingcode").val("");
                $("#trxcommissionpct").val("");
                $("#trxtradingcode").prop("readonly", true);
                $("#trxquantity").prop("readonly", true);
                $("#trxrate").prop("readonly", true);
                $("#trxamount").prop("required", true);
                break;
            case "CASH DIVIDENT":
                $("#trxtradingcode").prop("readonly", false);
                $("#trxdividendpct").prop("readonly", false);
                $("#trxamount").prop("readonly", false);
                $("#trxquantity").prop("readonly", true);
                $("#trxrate").prop("readonly", true);
                $("#trxcommissionpct").val("");

                $("#trxtradingcode").prop("required", true);
                $("#trxamount").prop("required", true);
                if ($('#trxamount').val().trim()) {
                    $('#trxrealizedprofit').val(parseFloat($('#trxamount').val().trim()).round(2));
                }
                break;
            case "STOCK DIVIDENT":
                $("#trxtradingcode").prop("readonly", false);
                $("#trxquantity").prop("readonly", false);
                $("#trxdividendpct").prop("readonly", false);
                $("#trxrate").prop("readonly", true);
                $("#trxcommissionpct").val("");

                $("#trxtradingcode").prop("required", true);
                $("#trxquantity").prop("required", true);

                break;
            case "RIGHT SHARE":
                $("#trxtradingcode").prop("readonly", false);
                $("#trxquantity").prop("readonly", false);
                $("#trxrate").prop("readonly", false);
                $("#trxtradingcode").prop("required", true);
                $("#trxquantity").prop("required", true);
                $("#trxrate").prop("required", true);
                $("#trxtotalprice").prop("required", true);
                $("#trxamount").prop("required", true);
                $("#trxcommission").prop("required", true);

                if ($('#trxquantity').val() && $('#trxrate').val() && $('#trxcommissionpct').val()) {
                    $('#trxtotalprice').val((parseInt($('#trxquantity').val().trim()) * parseFloat($('#trxrate').val().trim())).round(2));
                    $('#trxcommission').val((parseFloat($('#trxcommissionpct').val().trim()) * parseFloat($('#trxtotalprice').val().trim()) / 100).round(2));
                    $('#trxamount').val((parseFloat($('#trxtotalprice').val().trim()) + parseFloat($('#trxcommission').val().trim())).round(2));
                }
                break;
            default:
                throw new Error('Undefined Transaction Type');
        };

    }

    function getavgcost(accountid, companycode) {
        ///
        return new Promise(async (resolve, reject) => {
            getData("/getavgcost/" + accountid + "/" + companycode, {}, "GET", (ds) => {
                resolve(ds);
            });
        });
    }

    $("#trxtradingcode, #trxquantity, #trxrate, #trxamount").change(function () {
        var c = $(this);

        $.when(
            c.focusout()).then(function () {
                console.log(c);
                calculatetrxformdata();
            });
    });


    // $("#btnClearTrx").click(function () {
    //     //initializetrxform();
    // });
    $("#trxtranstype").change( () => {
        initializetrxform(true);
        calculatetrxformdata();
    });
    $("#trxaccount").change( () => {
        initializetrxform();
        $("#spnbalance").text(formatNumber($(this).find(":selected").data("value").balance));
        $("#trxcommissionpct").val($(this).find(":selected").data("value").commissionpct);
        $("#trxaccountid").val($(this).find(":selected").data("value").id);
    });

    $('input,select').on('keypress', (e) => {
        if (e.which == 13) {
            e.preventDefault();
            var $next = $('[tabIndex=' + (+this.tabIndex + 1) + ']');

            if (!$next.length) {
                $next = $('[tabIndex=1]');
            }
            $next.focus();

        }
    });

    $('#btnClearTrx').click( (e) => {
        //


        $.confirm({
            title: 'Reset',
            type: 'blue',
            content: 'Do you want to clear data',
            theme: 'Material',
            autoClose: 'cancel|8000',
            buttons: {
                cancel: {
                    btnClass: 'btn-danger',
                    text: 'Cancel',
                    action: function () {
                        $//.alert('Canceled!');
                        e.preventDefault();
                    }
                },
                confirm: {
                    btnClass: 'btn-success',
                    text: '  Ok  ',
                    action: function () {
                        //form.submit();
                        initializetrxform();
                    }
                }
            }
        });
    });

});