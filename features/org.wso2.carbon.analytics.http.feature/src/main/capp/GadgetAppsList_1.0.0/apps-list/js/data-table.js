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

var pref = new gadgets.Prefs();
var statType = pref.getString('statType');
var start = gadgetUtil.timeFrom();
var end = gadgetUtil.timeTo();
var node = gadgetUtil.node();

var template;

function fetchData() {
    gadgetUtil.fetchData(CONTEXT, {
        start_time: start,
        end_time: end,
        node: gadgetUtil.node(),
        action: statType
    }, onDataReceived, onError);
}

function onDataReceived(data) {
    var tableData = data.data;
    var tableHeadings = data.headings;
    var orderColumn = data.orderColumn;
    var applist = data.applist || undefined; //returns true if there's a list of apps in the table
    var table;
    var headings;

    headings = getTableHeader(tableHeadings);
    $('#placeholder').html(template(headings));

    var dataTableOptions = {};

    dataTableOptions['data'] = tableData;
    dataTableOptions['order'] = [orderColumn];

    if (!applist) {
        dataTableOptions['aoColumns'] = [
            {'sWidth': '60%'},
            {'sWidth': '20%'},
            {'sWidth': '20%'}
        ];
    }

    table = $('#table').dataTable(dataTableOptions);

    if (applist) {
        registerWebappSelect(table);
    }
}

function onError() {
    console.error("Error while fetching applications list.");
}

$(window).load(function () {
    var parentWindow = window.parent.document,
        thisParentWrapper = $('#' + gadgets.rpc.RPC_ID, parentWindow).closest('.gadget-body');
    $(thisParentWrapper).closest('.ues-component-box').addClass('no-heading-gadget ues-component-heading');
});

function registerWebappSelect(table) {
    table.find('tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            var param = '';
            if (node) {
                param = 'node=' + node;
            }

            if (start && end) {
                param = param + (param == '' ? '' : '&') +
                    'timeFrom=' + start + '&timeTo=' + end;
            }

            var webapp = table.fnGetData(this)[0];
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            var webappUrl = webapp;
            if (param != '?') {
                webappUrl = 'webappName=' + webappUrl + '&' + param;
            }

            var url = BASE_URL + "drill-down?" + webappUrl;
            window.open(url, '_parent');
        }
    });
}

function getTableHeader(tableHeadings) {
    var headingArray = [];
    var row = [];
    var th = {};
    var rowSpan = 1;
    var i, j, len, len2;

    for (i = 0, len = tableHeadings.length; i < len; i++) {
        if (tableHeadings[i] instanceof Object) {
            rowSpan = 2;
            break;
        }
    }

    for (i = 0, len = tableHeadings.length; i < len; i++) {
        th = {};
        if (typeof(tableHeadings[i]) == 'string') {
            th.rowSpan = rowSpan;
            th.text = tableHeadings[i];
        } else {
            th.colSpan = tableHeadings[i]["sub"].length;
            th.text = tableHeadings[i]['parent'];
        }
        row.push(th);
    }

    headingArray.push(row);

    if (rowSpan > 1) {
        row = [];
        for (i = 0, len = tableHeadings.length; i < len; i++) {
            if (tableHeadings[i] instanceof Object) {
                var subHeadings = tableHeadings[i]['sub'];
                for (j = 0, len2 = subHeadings.length; j < len2; j++) {
                    th = {};
                    th.text = subHeadings[j];
                    row.push(th);
                }
            }
        }
        headingArray.push(row);
    }

    return headingArray;
}

$(function () {
    fetchData();

    Handlebars.registerHelper('generateHeadingTag', function (th) {
        var properties = '';
        properties += (th.rowSpan) ? " rowspan='" + th.rowSpan + "'" : '';
        properties += (th.colSpan) ? " colspan='" + th.colSpan + "'" : '';
        return new Handlebars.SafeString('<th' + properties + '>' + th.text + '</th>');
    });

    template = Handlebars.compile($('#table-template').html());

});

gadgets.HubSettings.onConnect = function () {

    gadgets.Hub.subscribe('timeRangeChangeSubscriber',
        function (topic, data, subscriberData) {
            start = data.start;
            end = data.end;
            fetchData();
        }
    );
};















