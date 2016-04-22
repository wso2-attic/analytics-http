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

function getContextTabularStat(conditions, tableHeadings, sortColumn){
    print(helper.getTabularData(getContextStatData(conditions), tableHeadings, sortColumn));
}

function getReferrerTabularStat(conditions, tableHeadings, sortColumn){
    print(helper.getTabularData(getReferrerStatData(conditions), tableHeadings, sortColumn));
}
function getContextAllRequests(conditions){

    var results = getAggregateDataFromDAS(WEBAPP_CONTEXT_TABLE, conditions, "0", ALL_FACET, [
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

function getReferrerAllRequests(conditions){
    var results = getAggregateDataFromDAS(REFERRER_TABLE, conditions, "0", ALL_FACET, [
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

function getContextStatData(conditions)
{

    var output = [];
    var i, total_request_count;
    var results, result;

    total_request_count = getContextAllRequests(conditions);

    if(total_request_count <= 0){
        return;

    }
    results = getAggregateDataFromDAS(WEBAPP_CONTEXT_TABLE, conditions, "0", WEBAPP_CONTEXT_FACET, [
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
            output.push([result[WEBAPP_CONTEXT_FACET], result['SUM_' + AVERAGE_REQUEST_COUNT],
                (result['SUM_' + AVERAGE_REQUEST_COUNT]*100/total_request_count).toFixed(2)]);
        }
    }

    return output;
}

function getReferrerStatData(conditions){
    var output = [];
    var i, total_request_count;
    var results, result;

    total_request_count = getContextAllRequests(conditions);

    if(total_request_count <= 0){
        return;

    }
    results = getAggregateDataFromDAS(REFERRER_TABLE, conditions, "0", REFERRER_FACET, [
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
            output.push([result[REFERRER_FACET], result['SUM_' + AVERAGE_REQUEST_COUNT],
                (result['SUM_' + AVERAGE_REQUEST_COUNT]*100/total_request_count).toFixed(2)]);
        }
    }

    return output;
}