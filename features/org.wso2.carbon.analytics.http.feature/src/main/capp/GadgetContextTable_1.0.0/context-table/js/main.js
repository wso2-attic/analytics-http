var pref = new gadgets.Prefs();
var TOPIC = "timeRangeChangeSubscriber";
var timeFrom;
var timeTo;
var timeUnit = null;
var node = gadgetUtil.node();
var oTable;
var SHARED_PARAM = "?shared=true&";
var statType = pref.getString("appStatType");

$(function() {
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
        "columns" : [
                    { title: "Context" },
                    { title: "Number of requests" },
                    { title: "Percentage" }
        ],
        "ajax": {
            "url" : CONTEXT,
            "data" : function (d) {
                    d.start_time = timeFrom,
                    d.end_time = timeTo,
                    d.node = node,
                    d.action = statType,
                    d.appname = gadgetUtil.appName()
            },
            dataType: "json",
            type: "GET"
        },
        "order": [[ 1, "desc" ]]
    });

    $('#tblMessages').on('error.dt', function ( e, settings, techNote, message ) {
        console.error( message );
    }).DataTable();

    //Binding custom searching on Enter key press
    $('#tblMessages_filter input').unbind();
    $('#tblMessages_filter input').bind('keyup', function(e) {
    if(e.keyCode == 13) {
        oTable.search( this.value).draw();
    }
    });

});

gadgets.HubSettings.onConnect = function() {
    gadgets.Hub.subscribe(TOPIC, function(topic, data, subscriberData) {
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
        columns.forEach(function(column) {
            var th = jQuery('<th/>');
            th.append(column.label);
            th.appendTo(thead);
        });

        var tbody = $("#tblMessages tbody");
        data.forEach(function(row, i) {
            var tr = jQuery('<tr/>');
            columns.forEach(function(column) {
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