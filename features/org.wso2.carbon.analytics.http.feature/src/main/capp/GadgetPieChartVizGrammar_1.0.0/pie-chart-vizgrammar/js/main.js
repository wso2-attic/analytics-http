var TOPIC = "timeRangeChangeSubscriber";
var pref = new gadgets.Prefs();
var timeFrom = gadgetUtil.timeFrom();
var timeTo = gadgetUtil.timeTo();
var node = gadgetUtil.node();
var appname = gadgetUtil.appName();;
var statType = pref.getString("appStatType");
var targetPage = pref.getString("targetPage");

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
                "names": ["Percentage", "Browser"],
                "types": ["linear", "ordinal"]
            },
            "data": []
        }];

        var chartConfig = {
            charts: [{ type: "arc", x: "Percentage", color: "Browser", mode: "donut"}],
            padding: { top:10, right:200, bottom:10, left:10 },
            width: $('body').width()-50,
            height: $('body').height(),
            legend: true,
            percentage: true,
        };

        data.message.forEach(function(row, i) {
            schema[0].data.push([parseFloat(row.value), row.name]);
        });

        var onChartClick = function(event, item) {
            if (targetPage != gadgetUtil.getCurrentPageName()) {
                var targetUrl = BASE_URL + targetPage + "?" + gadgetUtil.getQueryStringAsString();
                parent.window.location = targetUrl;
            }
        };
        var chart = new vizg(schema, chartConfig);

        $("#canvas").empty();
        chart.draw("#canvas", [{ type: "click", callback: onChartClick }]);
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