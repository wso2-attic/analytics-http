var TOPIC = "timeRangeChangeSubscriber";
var pref = new gadgets.Prefs();
var timeFrom = gadgetUtil.timeFrom();
var timeTo = gadgetUtil.timeTo();
var node = gadgetUtil.node();
var appname = gadgetUtil.appName();;
var statType = pref.getString("appStatType");

$(function() {
    fetchData();
});

function fetchData() {
    gadgetUtil.fetchData(CONTEXT, {
        start_time: timeFrom,
        end_time: timeTo,
        node: node,
        action: statType,
        appname: gadgetUtil.appName()
    }, onData, onError);
}

gadgets.HubSettings.onConnect = function() {
    gadgets.Hub.subscribe(TOPIC, function(topic, data, subscriberData) {
        timeFrom = data.start;
        timeTo = data.end;
        fetchData();
    });
};

function onData(data) {
    try {

        if (data.message.length == 0) {
            $("#canvas").html(gadgetUtil.getEmptyRecordsText());
            return;
        }
        var schema = [{
            "metadata": {
                "names": ["HTTP Response Code", "Request Count"],
                "types": ["ordinal", "linear"]
            },
            "data": []
        }];
        var chartConfig = {
            type: "bar",
            x: "HTTP Response Code",
            charts: [{ type: "bar", y: "Request Count", orientation: "left" }],
            grid: false,
            width: $('body').width(),
            height: $('body').height(),
            colorScale: [COLOR_BLUE],
            padding: { "top": 30, "left": 60, "bottom": 60, "right": 30 },
            textColor:"#000000",
            text:"HTTP Response Code",
            textAlign:"left",
            xAxisStrokeSize:0,
            xAxisFontSize:0
        };

        data.message.forEach(function(row, i) {
            schema[0].data.push([row.name, row.value]);
        });

//        var onChartClick = function(event, item) {
//            var id = -1;
//            if (item != null) {
//                id = item.datum.name;
//            }
//            var baseUrl = config.targetUrl;
//            var urlParameters = gadgetUtil.getUrlParameters();
//            if (urlParameters != null) {
//                baseUrl += urlParameters + "&";
//            } else {
//                baseUrl += "?";
//            }
//            var targetUrl =  baseUrl + PARAM_ID + "=" + id + "&timeFrom=" + timeFrom + "&timeTo=" + timeTo;
//            if (timeUnit != null) {
//                targetUrl += "&timeUnit=" + timeUnit;
//            }
//            parent.window.location = targetUrl;
//        };
        var chart = new vizg(schema, chartConfig);

        $("#canvas").empty();
        chart.draw("#canvas");
    } catch (e) {
        $("#canvas").html(gadgetUtil.getErrorText(e));
    }
};

function onError(msg) {
    $("#canvas").html(gadgetUtil.getErrorText(msg));
};

// $(window).resize(function() {
//     if (page != TYPE_LANDING && qs[PARAM_ID]) {
//         drawChart();
//     }
// });