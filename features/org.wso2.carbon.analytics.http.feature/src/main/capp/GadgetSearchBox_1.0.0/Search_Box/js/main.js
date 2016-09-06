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

var href = parent.window.location.href

var PARAM_ID = "webappName";

$(function () {
    var qs = gadgetUtil.getQueryString();

    if (qs[PARAM_ID] != null) {
        $("#txtSearch").val(qs[PARAM_ID]);
    }

    $("#txtSearch").attr('placeholder', 'Search webapps ...');

    gadgetUtil.fetchData(CONTEXT, {
        action: 'apps-list',
        start_time: gadgetUtil.timeFrom(),
        end_time: gadgetUtil.timeTo()
    }, onData, onError);

    function onData(response) {

        // Add all applications text to the list
        if (response.message) {
            response.message.push(ALL_APPLICATIONS_TEXT);
        }

        $('.typeahead').typeahead({
            hint: true,
            highlight: true,
            minLength: 0
        }, {
            name: 'proxyName',
            source: substringMatcher(response.message)
        }).on('typeahead:selected',function (evt, item) {

            var href = parent.window.location.href;
            if (jQuery.isEmptyObject(qs)) {
                href = href + "?" + PARAM_ID + "=" + item;
            } else if (qs[PARAM_ID]) {
                href = href.replace(new RegExp('(webappName=)[^\\&]+'), '$1' + item)
            } else {
                href = href + "&" + PARAM_ID + "=" + item;
            }
            parent.window.location = href;
        }).on('typeahead:open',function (evt, item) {
            wso2.gadgets.controls.resizeGadget({
                height: "200px"
            });
        }).on('typeahead:close',function (evt, item) {
            wso2.gadgets.controls.restoreGadget();
        }).focus().blur();
    }

    function onError(error) {

    }

    var substringMatcher = function (strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function (i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });

            cb(matches);
        };
    };
});
