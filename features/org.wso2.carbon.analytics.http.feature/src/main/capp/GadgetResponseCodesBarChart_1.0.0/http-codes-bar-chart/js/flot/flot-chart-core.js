var pref = new gadgets.Prefs();
var delay;
var chartData = [];
var options;
var plot;
var node = pref.getString("node") || undefined;
var start = pref.getString("startTime") || undefined;
var end  = pref.getString("endTime") || undefined;
var appname = pref.getString("appname") || undefined;

$(function () {

    //var pauseBtn = $("button.pause");
    //pauseBtn.click(function () {
    //    $(this).toggleClass('btn-warning');
    //    togglePause($(this));
    //});
    //$(".reset").click(function () {
    //    fetchData();
    //});

    getQueryParams(parent.document.location.href);

    fetchData();

    //if (pref.getString("pause").toLowerCase() == "yes") {
    //    document.getElementById("pauseBtn").style.visibility = 'visible';
    //}


});

function getQueryParams(url){

    if(url.indexOf("?") > -1){
        var vars = url.split('?');
        var params = vars[1].split('&');

        for (var i = 0; i < params.length; i++) {
            var pair = params[i].split('=');
            if (decodeURIComponent(pair[0]) == 'appname') {
                appname = (decodeURIComponent(pair[1]));
                console.log(appname);
            }
            if (decodeURIComponent(pair[0]) == 'start-time') {
                start = (moment((decodeURIComponent(pair[1])), 'X').format('YYYY-MM-DD HH:mm'));
                console.log((moment((decodeURIComponent(pair[1])), 'X').format('YYYY-MM-DD HH:mm')));
            }
            if (decodeURIComponent(pair[0]) == 'end-time') {
                end = (moment((decodeURIComponent(pair[1])), 'X').format('YYYY-MM-DD HH:mm'));
                console.log((moment((decodeURIComponent(pair[1])), 'X').format('YYYY-MM-DD HH:mm')));
            }
        }
    }
}
$(window).load(function(){
    var parentWindow = window.parent.document,
        thisParentWrapper = $('#'+gadgets.rpc.RPC_ID, parentWindow).closest('.gadget-body');
    $(thisParentWrapper).closest('.ues-component-box').addClass('no-heading-gadget ues-component-heading');
});
//
//function togglePause(btnElm) {
//    if (btnElm.hasClass('btn-warning')) {
//        clearTimeout(delay);
//    }
//    else {
//        if (isNumber(pref.getString("updateGraph")) && !(pref.getString("updateGraph") == "0")) {
//            delay = setTimeout(function () {
//                fetchData()
//            },
//            pref.getString("updateGraph") * 1000);
//        }
//    }
//}

var drawChart = function (data, options) {

    if(data.length == 0){
        $('#placeholder').html("<div class='no-data'>No data available for selected options..!</div>");
        return;
    }

    plot = $.plot("#placeholder", data, options);

    var previousPoint = null;
    $("#placeholder").bind("plothover", function (event, pos, item) {

        if ($("#enablePosition:checked").length > 0) {
            var str = "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")";
            $("#hoverdata").text(str);
        }


        if (item) {
            if (previousPoint != item.dataIndex) {

                previousPoint = item.dataIndex;

                $("#tooltip").remove();
                var x = item.datapoint[0],
                    y = item.datapoint[1];

                showTooltip(item.pageX, item.pageY,y);
            }
        } else {
            $("#tooltip").remove();
            previousPoint = null;
        }
    });


    // connect graph and overview graph

    $("#placeholder").bind("plotselected", function (event, ranges) {

        // clamp the zooming to prevent eternal zoom

        if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
            ranges.xaxis.to = ranges.xaxis.from + 0.00001;
        }

        if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
            ranges.yaxis.to = ranges.yaxis.from + 0.00001;
        }

        // do the zooming

        plot = $.plot("#placeholder", data,
            $.extend(true, {}, options, {
                xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
            })
        );

        overview.setSelection(ranges, true);
    });

    $("#overview").bind("plotselected", function (event, ranges) {
        plot.setSelection(ranges);
    });
};

function fetchData() {
    var url = pref.getString("dataSource");

    var data = {
        start_time: start,
        end_time: end,
        node: node,
        action: pref.getString("appStatType")
    };
    if(appname!=""){
        data.appname = appname;
    }
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        data: data,
        success: onDataReceived
    });
    //var pauseBtn = $("button.pause");
    //togglePause(pauseBtn);
}
function onDataReceived(series) {
    chartData = series[0];
    options = $.extend(true, {}, chartConfigs(), series[1]);
    console.log(options);
    var chartOptions = options;
    var _chartData = [];
    addSeriesCheckboxes(chartData);
    if (chartData["series1"]["data"].length != 0) {
        $.each(chartData, function (key) {
            _chartData.push(chartData[key]);
        });
    }
    drawChart(_chartData, chartOptions);
    //var seriesContainer = $("#optionsRight");
    //seriesContainer.find(":checkbox").click(function () {
    //    filterSeries(chartData);
    //});
}

function showTooltip(x, y, contents) {
    $("<div id='tooltip'>" + contents + "</div>").css({
        top: y + 10,
        left: x + 10
    }).appendTo("body").fadeIn(200);
}

function addSeriesCheckboxes(data) {
    // insert checkboxes
    var seriesContainer = $("#optionsRight").find(".series-toggle");
    seriesContainer.html("");
    var objCount = 0;
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            objCount++;
        }
    }
    if (objCount > 1) {
        $.each(data, function (key, val) {
            seriesContainer.append("<li><input type='checkbox' name='" + key +
                "' checked='checked' id='id" + key + "'/>" +
                "<label for='id" + key + "' class='seriesLabel'>"
                + val.label + "</label></li>");
        });
    }
}

//function filterSeries(data) {
//    var filteredData = [];
//    var seriesContainer = $("#optionsRight");
//    seriesContainer.find("input:checked").each(function () {
//        var key = $(this).attr("name");
//        if (key && data[key]) {
//            var pausebtn = $("button.pause");
//            if (!pausebtn.hasClass('btn-warning')) {
//                $(pausebtn).toggleClass('btn-warning');
//            }
//            togglePause(pausebtn);
//            filteredData.push(data[key]);
//        }
//        drawChart(filteredData, options);
//    });
//}
//function isNumber(n) {
//    return !isNaN(parseFloat(n)) && isFinite(n);
//}


gadgets.HubSettings.onConnect = function () {

    //gadgets.Hub.subscribe('wso2.gadgets.charts.timeRangeChange',
    //    function (topic, data, subscriberData) {
    //        start = data.start.format('YYYY-MM-DD HH:mm');
    //        end = data.end.format('YYYY-MM-DD HH:mm');
    //        fetchData();
    //    }
    //);
    //
    //gadgets.Hub.subscribe('wso2.gadgets.charts.ipChange',
    //    function (topic, data, subscriberData) {
    //        node = data;
    //        fetchData();
    //    }
    //);

    gadgets.Hub.subscribe('timeRangeChangeSubscriber',
        function (topic, data, subscriberData) {
            //alert("Subscriber just received dates " +data.start + " and " +data.end);
            start = data.start;
            end = data.end;
            fetchData();
        }
    );

};
