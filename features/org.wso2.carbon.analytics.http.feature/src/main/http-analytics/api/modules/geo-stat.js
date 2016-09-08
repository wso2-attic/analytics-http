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

function getLanguageAllRequests(conditions){
    var results = getAggregateDataFromDAS(LANGUAGE_TABLE, conditions, "0", ALL_FACET, [
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

function getCountryAllRequests(conditions){
    var results = getAggregateDataFromDAS(COUNTRY_TABLE, conditions, "0", ALL_FACET, [
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

function getLanguageStatData(conditions) {
    var output = [];
    var i, total_request_count;
    var results, result;

    total_request_count = getLanguageAllRequests(conditions);

    if(total_request_count <= 0){
        return;

    }
    results = getAggregateDataFromDAS(LANGUAGE_TABLE, conditions, "0", LANGUAGE_FACET, [
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
            output.push([result[LANGUAGE_FACET], result['SUM_' + AVERAGE_REQUEST_COUNT],
                (result['SUM_' + AVERAGE_REQUEST_COUNT]*100/total_request_count).toFixed(2)]);
        }
    }

    return output;
}

function getLanguageTabularStat(conditions) {
    print({'data': getLanguageStatData(conditions)});
}

function getCountryStatData(conditions) {
    var output = [];
    var country;
    var i, total_request_count;
    var results, result;

    total_request_count = getCountryAllRequests(conditions);

    if(total_request_count <= 0){
        return;

    }
    results = getAggregateDataFromDAS(COUNTRY_TABLE, conditions, "0", COUNTRY_FACET, [
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
            country = result[COUNTRY_FACET];

            if (country == EMPTY_FACET_VALUE) {
                country = 'Other';
            }
            output.push([country, result['SUM_' + AVERAGE_REQUEST_COUNT],
                (result['SUM_' + AVERAGE_REQUEST_COUNT]*100/total_request_count).toFixed(2)]);
        }
    }

    return output;

}

function getCountryCodeStatData(){
    var dataArray = [];
    var country;
    var i;
    var results, result;

    results = getAggregateDataFromDAS(COUNTRY_TABLE, conditions, "0", COUNTRY_FACET, [
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
            country = result[COUNTRY_FACET][0];

            if (country != EMPTY_FACET_VALUE) {
                dataArray.push({'name': country, 'value': result['SUM_' + AVERAGE_REQUEST_COUNT]});
            }
        }
    }

    return dataArray;
}

function drawCountryMap(conditions){
    var dataObject = {};
    var i, len;
    var row;
    var results = getCountryCodeStatData(conditions);
    print({'message': results});
}

function getCountryTabularStat(conditions) {
    print({'data': getCountryStatData(conditions)});

}

function getLanguageStat(){
    var dataArray = [];
    var ticks = [];
    var i;
    var opt;
    var total_request_count = 0;
    var results, result;

    results = getLanguageStatData(conditions);

    if (results.length > 0) {
        for (i = 0; i < results.length && (i < 5); i++) {
            result = results[i];
            dataArray.push({'name': result[0], 'value': result[1]});
        }
    }

    print({'message': dataArray});
    return;
}
