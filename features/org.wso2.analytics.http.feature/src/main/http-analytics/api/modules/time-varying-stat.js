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

include('../db.jag');
include('../constants.jag');
var helper = require('as-data-util.js');

// This map holds the field name, operation and alias and for request count, response time and error count
var parameterMapping = {
    'request': ['averageRequestCount', 'SUM', 'SUM_averageRequestCount'],
    'response': ['averageResponseTime', 'AVG', 'AVG_averageResponseTime'],
    'error': ['httpErrorCount','SUM', 'AVG_httpErrorCount']
};

function getTimeVaryingStatData(conditions, mappedParameters, facetField) {

    results = getAggregateDataFromDAS(REQUEST_SUMMARY_TABLE, conditions, "0", facetField, [{
        "fieldName": mappedParameters[0],
        "aggregate": mappedParameters[1],
        "alias": mappedParameters[2]
    }
    ]);

    return results;
}

function getTimeVaryingStat(conditions, type, color) {
    var dataArray = [];
    var i;
    var row;
    var time;

    startTime = Number(conditions.timeFrom) * 1000;
    endTime = Number(conditions.timeTo) * 1000;

    var mappedParameters = parameterMapping[type];

    var timeDifference = endTime - startTime;
    var unitTime = 60000; // 1 minute

    // Decide the time unit for summarization based on the following conditions,
    // if time difference is more than,
    //      2 years -> year
    //      2 months -> month
    //      2 days -> day
    //      2 hours -> hour
    //      else -> minute
    var facetField = TIME_FACET;
    if (timeDifference >= 63072000000) {
        facetField = YEAR_FACET;
        unitTime = 31536000000;
    } else if (timeDifference >= 5184000000) {
        facetField = MONTH_FACET;
        unitTime = 2592000000;
    } else if (timeDifference >= 172800000) {
        facetField = DAY_FACET;
        unitTime = 86400000;
    } else if (timeDifference >= 7200000) {
        facetField = HOUR_FACET;
        unitTime = 3600000;
    }

    var results = JSON.parse(getTimeVaryingStatData(conditions, mappedParameters, facetField));
    var chartOptions = {};

    var timeArray = [];

    for (i = 0; i < results.length; i++) {
        row = results[i]['values'];

        timeArray = String(row[facetField][0]).replace(' ', '-').replace(':','-').split('-');
        // fill empty elements of the time array
        for(var j = timeArray.length; j <= 6; j++) {
            timeArray.push(0);
        }

        // subtract 1 from month
        timeArray[1] = Number(timeArray[1]) - 1;

        time = new Date(timeArray[0], timeArray[1], timeArray[2], timeArray[3],timeArray[4]).getTime();
        dataArray.push({"time": Number(time).toPrecision(), "value":row[mappedParameters[2]]});
    }

    // if dataArray is empty, return
    if (dataArray.length == 0) {
        print({'message': []});
        return;
    }

    // sort dataArray
    dataArray.sort(function (a,b) {
        return a['time'] - b['time'];
    })

    // finding the proper starting time
    startTime = Math.ceil(Number(dataArray[0]['time']) / unitTime) * unitTime;

    // fill the zero values
    var dataArrayIndex = 0;
    for (i = startTime; i <= endTime + unitTime; i += unitTime) {
        if ((dataArrayIndex < dataArray.length)&& (dataArray[dataArrayIndex]['time'] == Number(i).toPrecision())) {
            dataArrayIndex++;
            continue;
        }

        dataArray.push({'time': Number(i).toPrecision(), 'value': 0});
    }

//    if (color != null) {
//        chartOptions = {
//            'colors': [color]
//        }
//    }

    print(
        {'message': dataArray}
    );
}