/*
 * Copyright (c) 2015, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

include('../db.jag');
include('../constants.jag');
var helper = require('as-data-util.js');

function getHttpStatusAllRequests(conditions) {
    var results = getAggregateDataFromDAS(HTTP_STATUS_TABLE, conditions, "0", ALL_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results);

    if (results.length > 0) {
        return results[0]['values']['SUM_' + AVERAGE_REQUEST_COUNT];
    }
}

function getBrowserAllRequests(conditions) {
    var results = getAggregateDataFromDAS(USER_AGENT_FAMILY_TABLE, conditions, "0", ALL_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results);

    if (results.length > 0) {
        return results[0]['values']['SUM_' + AVERAGE_REQUEST_COUNT];
    }
}

function getDeviceAllRequests(){
    var results = getAggregateDataFromDAS(DEVICE_TYPE_TABLE, conditions, "0", ALL_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results);

    if (results.length > 0) {
        return results[0]['values']['SUM_' + AVERAGE_REQUEST_COUNT];
    }
}

function getOperatingSystemAllRequests(conditions){
    var results = getAggregateDataFromDAS(OPERATING_SYSTEM_TABLE, conditions, "0", ALL_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results);

    if (results.length > 0) {
        return results[0]['values']['SUM_' + AVERAGE_REQUEST_COUNT];
    }
}


function getHttpStatusStatData(conditions) {
    var output = [];
    var i, total_request_count;
    var results, result;

    total_request_count = getHttpStatusAllRequests(conditions);

    if(total_request_count <= 0){
        return;

    }
    results = getAggregateDataFromDAS(HTTP_STATUS_TABLE, conditions, "0", RESPONSE_HTTP_STATUS_CODE_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results);

    if (results.length > 0) {
        for (i = 0; i < results.length; i++) {
            result = results[i]['values'];
            output.push([result[RESPONSE_HTTP_STATUS_CODE_FACET], result['SUM_' + AVERAGE_REQUEST_COUNT],
                (result['SUM_' + AVERAGE_REQUEST_COUNT]*100/total_request_count).toFixed(2)]);
        }
    }

    return output;
}

function getBrowserStatData(conditions){
    var output = [];
    var i, total_request_count;
    var results, result;

    total_request_count = getBrowserAllRequests(conditions);

    if(total_request_count <= 0){
        return;

    }
    results = getAggregateDataFromDAS(USER_AGENT_FAMILY_TABLE, conditions, "0", USER_AGENT_FAMILY_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results);

    if (results.length > 0) {
        for (i = 0; i < results.length; i++) {
            result = results[i]['values'];
            output.push([result[USER_AGENT_FAMILY_FACET], result['SUM_' + AVERAGE_REQUEST_COUNT],
                (result['SUM_' + AVERAGE_REQUEST_COUNT]*100/total_request_count).toFixed(2)]);
        }
    }

    return output;
}

function getDeviceStatData(conditions){
    var output = [];
    var i, total_request_count;
    var results, result;

    total_request_count = getDeviceAllRequests(conditions);

    if(total_request_count <= 0){
        return;

    }
    results = getAggregateDataFromDAS(DEVICE_TYPE_TABLE, conditions, "0", DEVICE_CATEGORY_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results);

    if (results.length > 0) {
        for (i = 0; i < results.length; i++) {
            result = results[i]['values'];
            output.push([result[DEVICE_CATEGORY_FACET], result['SUM_' + AVERAGE_REQUEST_COUNT],
                (result['SUM_' + AVERAGE_REQUEST_COUNT]*100/total_request_count).toFixed(2)]);
        }
    }

    return output;
}

function getOperatingStatData(conditions){
    var output = [];
    var i, total_request_count;
    var results, result;

    total_request_count = getOperatingSystemAllRequests(conditions);

    if(total_request_count <= 0){
        return;

    }
    results = getAggregateDataFromDAS(OPERATING_SYSTEM_TABLE, conditions, "0", OPERATING_SYSTEM_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results);

    if (results.length > 0) {
        for (i = 0; i < results.length; i++) {
            result = results[i]['values'];
            output.push([result[OPERATING_SYSTEM_FACET], result['SUM_' + AVERAGE_REQUEST_COUNT],
                (result['SUM_' + AVERAGE_REQUEST_COUNT]*100/total_request_count).toFixed(2)]);
        }
    }

    return output;
}



function getHttpStatusTabularStat(conditions, tableHeadings, sortColumn) {
    print(helper.getTabularData(getHttpStatusStatData(conditions), tableHeadings, sortColumn));
}

function getBrowserTabularStat(conditions, tableHeadings, sortColumn){
    print(helper.getTabularData(getBrowserStatData(conditions), tableHeadings, sortColumn));}

function getDeviceTabularStat(conditions, tableHeadings, sortColumn){
    print(helper.getTabularData(getDeviceStatData(conditions), tableHeadings,sortColumn));
}

function getOperatingSystemTabularStat(conditions, tableHeadings, sortColumn){
    print(helper.getTabularData(getOperatingStatData(conditions), tableHeadings, sortColumn));
}

function getBrowserPieStat(conditions, visibleNumbers, groupName){
    var dataObject = {};
    var i, len;
    var row;
    var series;
    var data;
    var chartOptions = {};

    var results = getBrowserStatData(conditions);

    var shrinkedResults = helper.getShrinkedResultset(results, visibleNumbers, groupName);

    for (i = 0, len = shrinkedResults.length; i < len; i++) {
        row = shrinkedResults[i];
        series = 'series' + i;
        data = {'label': row[0][0], 'data': row[2]};
        dataObject[series] = data;
    }

    print([dataObject, chartOptions]);

}

function getDevicePieStat(conditions, visibleNumbers, groupName){
    var dataObject = {};
    var i, len;
    var row;
    var series;
    var data;
    var chartOptions = {};

    var results = getDeviceStatData(conditions);

    var shrinkedResults = helper.getShrinkedResultset(results, visibleNumbers, groupName);

    for (i = 0, len = shrinkedResults.length; i < len; i++) {
        row = shrinkedResults[i];
        series = 'series' + i;
        data = {'label': row[0][0], 'data': row[2]};
        dataObject[series] = data;
    }

    print([dataObject, chartOptions]);
}

function getOperatingSystemPieStat(conditions, visibleNumbers, groupName){
    var dataObject = {};
    var i, len;
    var row;
    var series;
    var data;
    var chartOptions = {};

    var results = getOperatingStatData(conditions);

    var shrinkedResults = helper.getShrinkedResultset(results, visibleNumbers, groupName);

    for (i = 0, len = shrinkedResults.length; i < len; i++) {
        row = shrinkedResults[i];
        series = 'series' + i;
        data = {'label': row[0][0], 'data': row[2]};
        dataObject[series] = data;
    }

    print([dataObject, chartOptions]);

}

function getHttpStatusStat(conditions) {
    var dataArray = [];
    var ticks = [];
    var i;
    var opt;
    var total_request_count = 0;
    var results, result;

    results = getHttpStatusStatData(conditions);

    if (results.length > 0) {
        for (i = 0; i < results.length && (i < 5); i++) {
            result = results[i];
            dataArray.push([i, result[1]]);
            ticks.push([i, result[0]]);
        }
    }

    chartOptions = {
        'xaxis': {
            'ticks': ticks,
            'axisLabel': 'Top 5 HTTP Response Codes'
        },
        'yaxis': {
            'axisLabel': 'Number of Requests'
        }
    };

    print([
        {'series1': {'label': 's', 'data': dataArray}},
        chartOptions
    ]);
}