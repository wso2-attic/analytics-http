/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var TOPIC = "timeRangeChangeSubscriber";
var PUBLISHER_TOPIC = "chart-zoomed";
var pref = new gadgets.Prefs();
var timeFrom = gadgetUtil.timeFrom();
var timeTo = gadgetUtil.timeTo();
var node = gadgetUtil.node();
var appname = gadgetUtil.appName();
var statType = pref.getString("statType");
var rangeStart;
var rangeEnd;
var yAxisLabel = pref.getString("yAxisLabel");
var chartColor = pref.getString("chartColor");

$(function () {
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

gadgets.HubSettings.onConnect = function () {
    gadgets.Hub.subscribe(TOPIC, function (topic, data, subscriberData) {
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
        var schema = [
            {
                "metadata": {
                    "names": ["Time", yAxisLabel],
                    "types": ["time", "linear"]
                },
                "data": []
            }
        ];
        var chartConfig = {
            x: "Time",
            charts: [
                { type: "line", range: "true", y: yAxisLabel}
            ],
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

        data.message.forEach(function (row, i) {
            schema[0].data.push([new Date(parseFloat(row.time)).getTime(), row.value]);
        });

        var chart = new vizg(schema, chartConfig);

        $("#canvas").empty();
        chart.draw("#canvas", [
            {type: "range", callback: onRangeSelected}
        ]);
    } catch (e) {
        $("#canvas").html(gadgetUtil.getErrorText(e));
    }
};

function onError(msg) {
    $("#canvas").html(gadgetUtil.getErrorText(msg));
};

document.body.onmouseup = function () {
    if ((rangeStart) && (rangeEnd) && (rangeStart.toString() !== rangeEnd.toString())) {
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


var onRangeSelected = function (start, end) {
    rangeStart = start;
    rangeEnd = end;
};

// $(window).resize(function() {
//     if (page != TYPE_LANDING && qs[PARAM_ID]) {
//         drawChart();
//     }
// });
