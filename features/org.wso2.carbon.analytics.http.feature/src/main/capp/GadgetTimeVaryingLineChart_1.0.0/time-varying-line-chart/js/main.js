var TOPIC = "timeRangeChangeSubscriber";
var PUBLISHER_TOPIC = "chart-zoomed";
var pref = new gadgets.Prefs();
var timeFrom = gadgetUtil.timeFrom();
var timeTo = gadgetUtil.timeTo();
var node = gadgetUtil.node();
var appname = gadgetUtil.appName();;
var statType = pref.getString("appStatType");
var rangeStart;
var rangeEnd;
var yAxisLabel = pref.getString("yAxisLabel");
var chartColor = pref.getString("chartColor");

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
                "names": ["Time", yAxisLabel],
                "types": ["time", "linear"]
            },
            "data": []
        }];
        var chartConfig = {
            x: "Time",
            charts: [{ type: "line", range: "true", y: yAxisLabel}],
            width: $('body').width(),
            height: $('body').height(),
            padding: { "top": 20, "left": 60, "bottom": 55, "right": -30 },
            rangeColor: chartColor,
            colorScale: [chartColor],
            xAxisAngle: true
        };

        // sorting the results
        data.message.sort(function (a, b) {
            return parseFloat(a.time) - parseFloat(b.time);
        });

        data.message.forEach(function(row, i) {
            schema[0].data.push([new Date(parseFloat(row.time)).getTime(), row.value]);
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
        chart.draw("#canvas",[{type:"range", callback:onRangeSelected}]);
    } catch (e) {
        $("#canvas").html(gadgetUtil.getErrorText(e));
    }
};

function onError(msg) {
    $("#canvas").html(gadgetUtil.getErrorText(msg));
};

document.body.onmouseup = function() {
    // var div = document.getElementById("dChart");
    // div.innerHTML = "<p> Start : " + rangeStart + "</p>" + "<p> End : " + rangeEnd + "</p>";

    if((rangeStart) && (rangeEnd) && (rangeStart.toString() !== rangeEnd.toString())){
    	var timeFrom = new Date(rangeStart).getTime();
	var timeTo = new Date(rangeEnd).getTime();

	if (timeFrom > timeTo) {
		var temp = timeFrom;
		timeFrom = timeTo;
		timeTo = temp;
	}

        var message = {
            timeFrom: timeFrom,
            timeTo: timeTo,
            timeUnit: "Custom"
        };

        gadgets.Hub.publish(PUBLISHER_TOPIC, message);
    }
}


var onRangeSelected = function(start, end) {
    rangeStart = start;
    rangeEnd = end;
};

// $(window).resize(function() {
//     if (page != TYPE_LANDING && qs[PARAM_ID]) {
//         drawChart();
//     }
// });
