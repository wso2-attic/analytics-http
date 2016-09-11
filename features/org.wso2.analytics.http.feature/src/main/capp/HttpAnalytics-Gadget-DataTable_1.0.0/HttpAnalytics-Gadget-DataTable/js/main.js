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
var TOPIC = "timeRangeChangeSubscriber";
var timeFrom;
var timeTo;
var timeUnit = null;
var node = gadgetUtil.node();
var oTable;
var statType = pref.getString("statType");
var firstField = pref.getString("firstField");

$(function () {
    timeFrom = gadgetUtil.timeFrom();
    timeTo = gadgetUtil.timeTo();

    oTable = $('#tblMessages').DataTable({
        dom: '<"dataTablesTop"' +
            'f' +
            '<"dataTables_toolbar">' +
            '>' +
            'rt' +
            '<"dataTablesBottom"' +
            'lip' +
            '>',
        "processing": true,
        "serverSide": false,
        "columnDefs": [
            {title: firstField, targets: [0]},
            {title: "Number of requests", targets: [1], className: "numericColumn"},
            {title: "Perentage", targets: [2], className: "numericColumn"}
        ],
        "ajax": {
            "url": CONTEXT,
            "data": function (d) {
                d.start_time = timeFrom,
                    d.end_time = timeTo,
                    d.node = node,
                    d.action = statType,
                    d.appname = gadgetUtil.appName()
            },
            dataType: "json",
            type: "GET"
        },
        "order": [
            [ 1, "desc" ]
        ],
        "scrollY": $('body').height() * .5
    });

    $('#tblMessages').on('error.dt',function (e, settings, techNote, message) {
        console.error(message);
    }).DataTable();

    //Binding custom searching on Enter key press
    $('#tblMessages_filter input').unbind();
    $('#tblMessages_filter input').bind('keyup', function (e) {
        if (e.keyCode == 13) {
            oTable.search(this.value).draw();
        }
    });

});

gadgets.HubSettings.onConnect = function () {
    gadgets.Hub.subscribe(TOPIC, function (topic, data, subscriberData) {
        onTimeRangeChanged(data);
    });
};

function onTimeRangeChanged(data) {
    timeFrom = data.start;
    timeTo = data.end;
    timeUnit = data.timeUnit;

    oTable.clear().draw();
    oTable.ajax.reload().draw();
};

function onData(response) {

    try {
        var data = response.message;
        if (data.length <= 0) {
            $("#canvas").html(gadgetUtil.getEmptyRecordsText());
            return;
        }
        $("#tblMessages thead tr").empty();
        $("#tblMessages tbody").empty();
        var thead = $("#tblMessages thead tr");
        columns.forEach(function (column) {
            var th = jQuery('<th/>');
            th.append(column.label);
            th.appendTo(thead);
        });

        var tbody = $("#tblMessages tbody");
        data.forEach(function (row, i) {
            var tr = jQuery('<tr/>');
            columns.forEach(function (column) {
                var td = jQuery('<td/>');
                var value = row[column.name];
                td.text(value);
                td.appendTo(tr);

            });
            tr.appendTo(tbody);

        });

        dataTable = $('#tblMessages').DataTable({
            dom: '<"dataTablesTop"' +
                'f' +
                '<"dataTables_toolbar">' +
                '>' +
                'rt' +
                '<"dataTablesBottom"' +
                'lip' +
                '>'
        });
    } catch (e) {
        $("#canvas").html(gadgetUtil.getErrorText(e));
    }
};

function onError(msg) {
    $("#canvas").html(gadgetUtil.getErrorText(msg));
};
