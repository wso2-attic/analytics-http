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
var pref = new gadgets.Prefs();
var timeFrom = gadgetUtil.timeFrom();
var timeTo = gadgetUtil.timeTo();
var node = gadgetUtil.node();
var appname = gadgetUtil.appName();
var statType = pref.getString("statType");
var targetPage = pref.getString("targetPage");
var categoryName = pref.getString("categoryName");

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
                    "names": ["Percentage", categoryName],
                    "types": ["linear", "ordinal"]
                },
                "data": []
            }
        ];

        var chartConfig = {
            charts: [
                { type: "arc", x: "Percentage", color: categoryName, mode: "donut"}
            ],
            padding: { top: 10, right: 50, bottom: 10, left: 10 },
            width: $('body').width(),
            height: $('body').height(),
            legend: true,
            percentage: true,
            tooltip: {"enabled": true, "color": "#e5f2ff", "type": "symbol", "content": [categoryName, "Percentage"],
                "label": true}
        };

        data.message.forEach(function (row, i) {
            schema[0].data.push([parseFloat(row.value), row.name]);
        });

        var onChartClick = function (event, item) {
            if (targetPage != gadgetUtil.getCurrentPageUrl()) {
                var targetUrl = BASE_URL + targetPage + gadgetUtil.getUrlParameters();
                parent.window.location = targetUrl;
            }
        };
        var chart = new vizg(schema, chartConfig);

        $("#canvas").empty();
        chart.draw("#canvas", [
            { type: "click", callback: onChartClick }
        ]);
    } catch (e) {
        $("#canvas").html(gadgetUtil.getErrorText(e));
    }
};

function onError(msg) {
    $("#canvas").html(gadgetUtil.getErrorText(msg));
};
