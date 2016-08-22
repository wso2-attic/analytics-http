/*
 * Copyright (c) 2014, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

function getInfoBoxMiniChartStatStat(conditions, facet, field, operation) {
    var output = [];
    var i;
    var results, result;
    var alias;

    alias = operation + '_' + field;

    results = getAggregateDataFromDAS(REQUEST_SUMMARY_TABLE, conditions, "0", facet, [
        {
            "fieldName": field,
            "aggregate": operation,
            "alias": alias
        },
    ]);

    results = JSON.parse(results);

    for (i = 0; i < results.length; i++) {
        result = results[i];
        if (result) {
            result = result['values'];
            // push time and the values
            output.push([result[facet][0], result[alias].toFixed(0)]);
        }
    }

    return output;
}


function getDataForInfoBoxBarChart(type, conditions) {
    var startTime = request.getParameter('start_time');
    var endTime = request.getParameter('end_time');
    var timeDiff = 0;
    var i;
    var results, result;
    var operation, field;
    var arrList = [];

    if (startTime != null && endTime != null) {
        timeDifference = endTime - startTime;
    }

    operation = 'SUM';
    field = AVERAGE_REQUEST_COUNT;
    if (type == 'averageResponseTime') {
        operation = 'AVG';
        field = AVERAGE_RESPONSE_TIME;
    }

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

    results = getInfoBoxMiniChartStatStat(conditions, facetField, field, operation);

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

    results.sort(function (a,b) {
        return (new Date(a[0].replace(' ', 'T') + dateCompletionPostfix)
        - new Date(b[0].replace(' ', 'T') + dateCompletionPostfix));
    });

    for (i = 0; i < results.length; i++) {
        result = results[i];
        var tempData = [];
        tempData[0] = i;
        tempData[1] = result[1];
        tempData[2] = Number(new Date(result[0].replace(' ', 'T') + dateCompletionPostfix).getTime()).toPrecision();
        arrList.push(tempData);
    }

    return arrList;
}


function getInfoBoxRequestStat(conditions) {

    var output = {};
    var results = getAggregateDataFromDAS(REQUEST_SUMMARY_TABLE, conditions, "0", ALL_FACET, [
        {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + AVERAGE_REQUEST_COUNT
        }, {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "MIN",
            "alias": "MIN_" + AVERAGE_REQUEST_COUNT
        }, {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "MAX",
            "alias": "MAX_" + AVERAGE_REQUEST_COUNT
        }, {
            "fieldName": AVERAGE_REQUEST_COUNT,
            "aggregate": "AVG",
            "alias": "AVG_" + AVERAGE_REQUEST_COUNT
        }
    ]);

    results = JSON.parse(results)[0];

    output['title'] = 'Total Requests';
    output['measure_label'] = 'Per min';

    if (results != null && results['values']['SUM_' + AVERAGE_REQUEST_COUNT] != null) {
        results = results['values'];
        output['total'] = results['SUM_' + AVERAGE_REQUEST_COUNT];
        output['max'] = results['MAX_' + AVERAGE_REQUEST_COUNT];
        output['avg'] = Math.round(results['AVG_' + AVERAGE_REQUEST_COUNT]);
        output['min'] = results['MIN_' + AVERAGE_REQUEST_COUNT]
    } else {
        print({'message': ''});
        return;
    }

    output['graph'] = getDataForInfoBoxBarChart('averageRequestCount', conditions);


    print({'message': output});
}

function getInfoBoxResponseStat(conditions) {
    var output = {};

    var results = getAggregateDataFromDAS(REQUEST_SUMMARY_TABLE, conditions, "0", ALL_FACET, [
        {
            "fieldName": AVERAGE_RESPONSE_TIME,
            "aggregate": "MIN",
            "alias": "MIN_" + AVERAGE_RESPONSE_TIME
        }, {
            "fieldName": AVERAGE_RESPONSE_TIME,
            "aggregate": "MAX",
            "alias": "MAX_" + AVERAGE_RESPONSE_TIME
        }, {
            "fieldName": AVERAGE_RESPONSE_TIME,
            "aggregate": "AVG",
            "alias": "AVG_" + AVERAGE_RESPONSE_TIME
        }
    ]);

    results = JSON.parse(results)[0];

    output['title'] = 'Response Time';
    output['measure_label'] = 'ms';

    if (results != null && results['values']['MAX_' + AVERAGE_RESPONSE_TIME] != null) {
        results = results['values'];
        output['max'] = results['MAX_' + AVERAGE_RESPONSE_TIME];
        output['avg'] = Math.round(results['AVG_' + AVERAGE_RESPONSE_TIME]);
        output['min'] = results['MIN_' + AVERAGE_RESPONSE_TIME];
    } else {
        print({'message': ''});
        return;
    }

    output['graph'] = getDataForInfoBoxBarChart('averageResponseTime', conditions);

    print({'message': output});
}

function getInfoBoxSessionStat(conditions) {
    var output = {};

    var results = getAggregateDataFromDAS(REQUEST_SUMMARY_TABLE, conditions, "0", ALL_FACET, [
        {
            "fieldName": SESSION_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + SESSION_COUNT
        }, {
            "fieldName": SESSION_COUNT,
            "aggregate": "AVG",
            "alias": "AVG_" + SESSION_COUNT
        }
    ]);

    if (results != null) {
        results = JSON.parse(results)[0];
    }
    output['title'] = 'Sessions';

    if (results != null && results['values']['SUM_' + SESSION_COUNT] != null) {
        results = results['values'];
        output['total'] = results['SUM_' + SESSION_COUNT];
        output['avg'] = Math.round(results['AVG_' + SESSION_COUNT]);
    } else {
        print({'message': ''});
        return;
    }

    print({'message': output});
}

function getInfoBoxErrorStat(conditions) {
    var output = {};

    var results = getAggregateDataFromDAS(REQUEST_SUMMARY_TABLE, conditions, "0", ALL_FACET, [
        {
            "fieldName": HTTP_SUCCESS_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + HTTP_SUCCESS_COUNT
        }, {
            "fieldName": HTTP_ERROR_COUNT,
            "aggregate": "SUM",
            "alias": "SUM_" + HTTP_ERROR_COUNT
        }
    ]);

    results = JSON.parse(results)[0];

    output['title'] = 'Errors';

    if (results != null && results['values']['SUM_' + HTTP_ERROR_COUNT] != null) {
        results = results['values'];
        output['total'] = results['SUM_' + HTTP_ERROR_COUNT];
        output['percentage'] =
            (results['SUM_' + HTTP_ERROR_COUNT] * 100 / (results['SUM_' + HTTP_SUCCESS_COUNT] + results['SUM_' + HTTP_ERROR_COUNT])).toFixed(2) + '\x25';
    } else {
        print({'message': ''});
        return;
    }

    print({'message': output});
}
