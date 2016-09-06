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

var href = parent.window.location.href;
var lastSegment = href.substr(0, href.lastIndexOf('/') + 1);
var baseUrl = parent.window.location.protocol + "//" + parent.window.location.host + BASE_URL;
var qs = gadgetUtil.getQueryString();
var pageName = gadgetUtil.getCurrentPageName();
var pageUrl = gadgetUtil.getCurrentPageUrl();
var currentLocation;

$(function () {

    $("#homeLink").attr("href", baseUrl);
    if (pageUrl != LANDING_PAGE) {

        // for the drill-down page there won't be a pageName
        if (pageName != '') {
            // add the query params except webappName param
            appendTrail(lastSegment + pageUrl + gadgetUtil.removeUrlParam('webappName'), pageName)
        }

        if (gadgetUtil.appName() != '') {
            appendTrail(lastSegment + pageUrl + gadgetUtil.getUrlParameters(), gadgetUtil.appName());
        }
    }

    function appendTrail(url, text) {
        var ol = $(".breadcrumb");
        var li = $('<li/>');
        var a = $('<a/>');

        li.addClass("truncate");
        a.attr("href", url);
        a.text(text);
        li.append(a);
        ol.append(li);
    }

    $(".breadcrumb").on('click', 'a', function (e) {
        e.preventDefault();
        parent.window.location = $(this).attr('href');
    });

});