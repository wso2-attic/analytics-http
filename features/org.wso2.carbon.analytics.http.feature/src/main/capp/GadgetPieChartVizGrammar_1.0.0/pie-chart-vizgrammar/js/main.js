var TOPIC = "timeRangeChangeSubscriber";
var pref = new gadgets.Prefs();
var timeFrom = gadgetUtil.timeFrom();
var timeTo = gadgetUtil.timeTo();
var node = gadgetUtil.node();
var appname = gadgetUtil.appName();;
var statType = pref.getString("appStatType");
var targetPage = pref.getString("targetPage");
var categoryName = pref.getString("categoryName");

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
                "names": ["Percentage", categoryName],
                "types": ["linear", "ordinal"]
            },
            "data": []
        }];

        var chartConfig = {
            charts: [{ type: "arc", x: "Percentage", color: categoryName, mode: "donut"}],
            padding: { top:10, right:50, bottom:10, left:10 },
            width: $('body').width(),
            height: $('body').height(),
            legend: true,
            percentage: true,
            tooltip: {"enabled":true, "color":"#e5f2ff", "type":"symbol", "content":[categoryName,"Percentage"],
            "label":true}
        };

        data.message.forEach(function(row, i) {
            schema[0].data.push([parseFloat(row.value), row.name]);
        });

        var onChartClick = function(event, item) {
            if (targetPage != gadgetUtil.getCurrentPageName()) {
                var targetUrl = BASE_URL + targetPage + gadgetUtil.getUrlParameters();
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
