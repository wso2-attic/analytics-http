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

function getTimeVaryingStat(conditions, type, startTime, endTime, color) {
    var dataArray = [];
    var i;
    var row;
    var mappedParameters = parameterMapping[type];

    var timeDifference = endTime - startTime;

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
    } else if (timeDifference >= 5184000000) {
        facetField = MONTH_FACET;
    } else if (timeDifference >= 172800000) {
        facetField = DAY_FACET;
    } else if (timeDifference >= 7200000) {
        facetField = HOUR_FACET;
    }

    var results = JSON.parse(getTimeVaryingStatData(conditions, mappedParameters, facetField));
    var chartOptions = {};

    var dateCompletionPostfix = ':00.000Z';

    if (facetField == YEAR_FACET) {
        dateCompletionPostfix = '-00-00T00:00:00.000Z';
    } else if (facetField == MONTH_FACET) {
        dateCompletionPostfix = '-00T00:00:00.000Z';
    } else if (facetField == DAY_FACET) {
        dateCompletionPostfix = 'T00:00:00.000Z';
    } else if (facetField == HOUR_FACET) {
        dateCompletionPostfix = ':00:00.000Z';
    }

    for (i = 0; i < results.length; i++) {
        row = results[i]['values'];
        var time = new Date(String(row[facetField][0]).replace(' ', 'T') + dateCompletionPostfix).getTime();
        dataArray.push({"time": Number(time).toPrecision(), "value":row[mappedParameters[2]]});
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