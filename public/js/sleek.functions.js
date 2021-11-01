/* ====== Index ======

	1. JEKYLL INSTANT SEARCH
	2. SCROLLBAR CONTENT
	3. TOOLTIPS AND POPOVER
	4. MULTIPLE SELECT
	4. LOADING BUTTON
	5. TOASTER
	6. PROGRESS BAR
	7. CIRCLE PROGRESS
	8. DATE PICKER

	====== End ======*/




$(document).ready(function () {

    /*======== 1. JEKYLL INSTANT SEARCH ========*/

    var searchInput = $('#search-input');
    if (searchInput.length != 0) {
        SimpleJekyllSearch.init({
            searchInput: document.getElementById('search-input'),
            resultsContainer: document.getElementById('search-results'),
            dataSource: '/public/data/search.json',
            searchResultTemplate: '<li><div class="link"><a href="{link}">{label}</a></div><div class="location">{location}</div><\/li>',
            noResultsText: '<li>No results found</li>',
            limit: 10,
            fuzzy: true,
        });
    }


    /*======== 2. SCROLLBAR CONTENT ========*/

    var dataScrollHeight = $("[data-scroll-height]");
    function scrollWithBigMedia(media) {
        if (media.matches) {
            /* The viewport is greater than, or equal to media screen size */
            dataScrollHeight.each(function () {
                var scrollHeight = $(this).attr("data-scroll-height");
                $(this).css({ height: scrollHeight + "px", overflow: "hidden" });
            });

            //For content that needs scroll
            $(".slim-scroll")
                .slimScroll({
                    opacity: 0,
                    height: "100%",
                    color: "#999",
                    size: "5px",
                    touchScrollStep: 50
                })
                .mouseover(function () {
                    $(this)
                        .next(".slimScrollBar")
                        .css("opacity", 0.4);
                });
        } else {
            /* The viewport is less than media screen size */
            dataScrollHeight.css({ height: "auto", overflow: "auto" });
        }
    }

    if (dataScrollHeight.length != 0) {
        var media = window.matchMedia("(min-width: 992px)");
        scrollWithBigMedia(media); // Call listener function at run time
        media.addListener(scrollWithBigMedia); // Attach listener function on state changes
    }

    var chatLeftContent = $('#chat-left-content');
    if (chatLeftContent.length != 0) {
        chatLeftContent.slimScroll({});
    }
    var chatRightContent = $('#chat-right-content');
    if (chatRightContent.length != 0) {
        chatRightContent.slimScroll({});
    }

    /*======== 3. TOOLTIPS AND POPOVER ========*/
    var tooltip = $('[data-toggle="tooltip"]');
    if (tooltip.length != 0) {
        tooltip.tooltip({
            container: "body",
            template:
                '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
        });
    }

    var popover = $('[data-toggle="popover"]');

    if (popover.length != 0) {
        popover.popover();
    }
    /*======== 4. MULTIPLE SELECT ========*/
    var multipleSelect = $(".js-example-basic-multiple");
    if (multipleSelect.length != 0) {
        multipleSelect.select2();
    }

    /*======== 4. LOADING BUTTON ========*/

    var laddaButton = $('.ladda-button');

    if (laddaButton.length != 0) {
        Ladda.bind(".ladda-button", {
            timeout: 5000
        });

        Ladda.bind(".progress-demo button", {
            callback: function (instance) {
                var progress = 0;
                var interval = setInterval(function () {
                    progress = Math.min(progress + Math.random() * 0.1, 1);
                    instance.setProgress(progress);

                    if (progress === 1) {
                        instance.stop();
                        clearInterval(interval);
                    }
                }, 200);
            }
        });
    }



    /*======== 5. TOASTER ========*/

    var toaster = $('#toaster');

    function callToaster(positionClass) {
        toastr.options = {
            closeButton: true,
            debug: false,
            newestOnTop: false,
            progressBar: true,
            positionClass: positionClass,
            preventDuplicates: false,
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "5000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut"
        };
        toastr.success("Welcome to Sleek Dashboard", "Howdy!");
    }

    if (toaster.length != 0) {
        if (document.dir != "rtl") {
            callToaster("toast-top-right");
        } else {
            callToaster("toast-top-left");
        }

    }

    /*======== 6. PROGRESS BAR ========*/
    NProgress.done();

    /*======== 6. PROGRESS BAR ========*/
    $('.slim-scroll-right-sidebar-2').slimScroll({
        opacity: 0,
        height: '100%',
        color: "#999",
        size: "5px",
        touchScrollStep: 50
    })
        .mouseover(function () {
            $(this)
                .next(".slimScrollBar")
                .css("opacity", 0.4);
        });

    /*======== 7. CIRCLE PROGRESS ========*/
    var circle = $('.circle');
    var gray = '#f5f6fa';

    if (circle.length != 0) {
        circle.circleProgress({
            lineCap: "round",
            startAngle: 4.8,
            emptyFill: [gray]
        });
    }

    /*======== 8. DATE PICKER ========*/
    // $('input[name="dateRange"]').daterangepicker({
    //   autoUpdateInput: false,
    //   singleDatePicker: true,
    //   locale: {
    //     cancelLabel: 'Clear'
    //   }
    // });

    // $('input[name="dateRange"]').on('apply.daterangepicker', function (ev, picker) {
    //   $(this).val(picker.startDate.format('MM/DD/YYYY'));
    // });

    // $('input[name="dateRange"]').on('cancel.daterangepicker', function (ev, picker) {
    //   $(this).val('');
    // });

});


/* ====== Index ======

1. RECNT ORDERS
2. USER ACTIVITY
3. ANALYTICS COUNTRY
4. PAGE VIEWS
5. ACTIVITY USER

====== End ======*/
$(function () {

    /*======== 1. RECNT ORDERS ========*/
    if ($("#recent-orders").length != 0) {
        var start = moment().subtract(29, "days");
        var end = moment();
        var cb = function (start, end) {
            $("#recent-orders .date-range-report span").html(
                start.format("ll") + " - " + end.format("ll")
            );
        };

        $("#recent-orders .date-range-report").daterangepicker(
            {
                startDate: start,
                endDate: end,
                opens: 'left',
                ranges: {
                    Today: [moment(), moment()],
                    Yesterday: [
                        moment().subtract(1, "days"),
                        moment().subtract(1, "days")
                    ],
                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                    "Last Month": [
                        moment()
                            .subtract(1, "month")
                            .startOf("month"),
                        moment()
                            .subtract(1, "month")
                            .endOf("month")
                    ]
                }
            },
            cb
        );
        cb(start, end);
    }

    /*======== 2. USER ACTIVITY ========*/
    if ($("#user-activity").length != 0) {
        var start = moment().subtract(1, "days");
        var end = moment().subtract(1, "days");
        var cb = function (start, end) {
            $("#user-activity .date-range-report span").html(
                start.format("ll") + " - " + end.format("ll")
            );
        };

        $("#user-activity .date-range-report").daterangepicker(
            {
                startDate: start,
                endDate: end,
                opens: 'left',
                ranges: {
                    Today: [moment(), moment()],
                    Yesterday: [
                        moment().subtract(1, "days"),
                        moment().subtract(1, "days")
                    ],
                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                    "Last Month": [
                        moment()
                            .subtract(1, "month")
                            .startOf("month"),
                        moment()
                            .subtract(1, "month")
                            .endOf("month")
                    ]
                }
            },
            cb
        );
        cb(start, end);
    }

    /*======== 3. ANALYTICS COUNTRY ========*/
    if ($("#analytics-country").length != 0) {
        var start = moment();
        var end = moment();
        var cb = function (start, end) {
            $("#analytics-country .date-range-report span").html(
                start.format("ll") + " - " + end.format("ll")
            );
        };

        $("#analytics-country .date-range-report").daterangepicker(
            {
                startDate: start,
                endDate: end,
                opens: 'left',
                ranges: {
                    Today: [moment(), moment()],
                    Yesterday: [
                        moment().subtract(1, "days"),
                        moment().subtract(1, "days")
                    ],
                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                    "Last Month": [
                        moment()
                            .subtract(1, "month")
                            .startOf("month"),
                        moment()
                            .subtract(1, "month")
                            .endOf("month")
                    ]
                }
            },
            cb
        );
        cb(start, end);
    }

    /*======== 4. PAGE VIEWS ========*/
    if ($("#page-views").length != 0) {
        var start = moment();
        var end = moment();
        var cb = function (start, end) {
            $("#page-views .date-range-report span").html(
                start.format("ll") + " - " + end.format("ll")
            );
        };

        $("#page-views .date-range-report").daterangepicker(
            {
                startDate: start,
                endDate: end,
                opens: 'left',
                ranges: {
                    Today: [moment(), moment()],
                    Yesterday: [
                        moment().subtract(1, "days"),
                        moment().subtract(1, "days")
                    ],
                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                    "Last Month": [
                        moment()
                            .subtract(1, "month")
                            .startOf("month"),
                        moment()
                            .subtract(1, "month")
                            .endOf("month")
                    ]
                }
            },
            cb
        );
        cb(start, end);
    }
    /*======== 5. ACTIVITY USER ========*/
    if ($("#activity-user").length != 0) {
        var start = moment();
        var end = moment();
        var cb = function (start, end) {
            $("#activity-user .date-range-report span").html(
                start.format("ll") + " - " + end.format("ll")
            );
        };

        $("#activity-user .date-range-report").daterangepicker(
            {
                startDate: start,
                endDate: end,
                opens: 'left',
                ranges: {
                    Today: [moment(), moment()],
                    Yesterday: [
                        moment().subtract(1, "days"),
                        moment().subtract(1, "days")
                    ],
                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                    "Last Month": [
                        moment()
                            .subtract(1, "month")
                            .startOf("month"),
                        moment()
                            .subtract(1, "month")
                            .endOf("month")
                    ]
                }
            },
            cb
        );
        cb(start, end);
    }
});