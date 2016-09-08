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


        if (data.message == "NO_VALID_DATA_FOR_GEOLOCATION") {
            $("#canvas").html(gadgetUtil.getNoValidCountryDataText());
            return;
        }

        var schema = [
            {
                "metadata": {
                    "names": ["Country", "RequestCount"],
                    "types": ["ordinal", "linear"]
                },
                "data": []
            }
        ];

        var paddingLeft = ($('body').width() - $('body').height() * 2) / 2;

        var chartConfig = {
            type: 'map',
            x: 'Country',
            renderer: 'canvas',
            charts: [
                { type: 'map', y: 'RequestCount', mapType: "world"}
            ],
            width: $('body').height() * 2,
            height: $('body').height()
        };

        var worldHelperInfoJsonUrl = "../../../../portal/templates/geojson/countryInfo.json";
        var worldGeoCodesUrl = "../../../../portal/templates/geojson/world.json"

        chartConfig.helperUrl = worldHelperInfoJsonUrl;
        chartConfig.geoCodesUrl = worldGeoCodesUrl;
        data.message.forEach(function (row, i) {
            schema[0].data.push([row.name, parseFloat(row.value)]);
        });

        var onChartClick = function (event, item) {
            if (targetPage != gadgetUtil.getCurrentPageUrl()) {
                var targetUrl = BASE_URL + targetPage + gadgetUtil.getUrlParameters();
                parent.window.location = targetUrl;
            }
        };

        var chart = new vizg(schema, chartConfig);

        $("#canvas").empty();
        $("#canvas").css({'padding-left': paddingLeft});
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