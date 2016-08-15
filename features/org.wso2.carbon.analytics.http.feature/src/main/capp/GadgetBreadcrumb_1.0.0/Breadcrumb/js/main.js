var href = parent.window.location.href;
var lastSegment = href.substr(0,href.lastIndexOf('/') + 1);
var baseUrl = parent.window.location.protocol + "//" + parent.window.location.host + BASE_URL;
var qs = gadgetUtil.getQueryString();
var pageName = gadgetUtil.getCurrentPageName();
var currentLocation;

$(function() {

    $("#homeLink").attr("href", baseUrl);
    currentLocation = pageName;
    if (currentLocation != LANDING_PAGE) {
        // add the query params except webappName param
        appendTrail(lastSegment + pageName + gadgetUtil.removeUrlParam('webappName'), pageName)

        if (gadgetUtil.appName() != '') {
            appendTrail(lastSegment + pageName + gadgetUtil.getUrlParameters(), gadgetUtil.appName());
        }
    }

    function appendTrail(url,text) {
        var ol = $(".breadcrumb");
        var li = $('<li/>');
        var a = $('<a/>');

        li.addClass("truncate");
        a.attr("href",url);
        a.text(text);
        li.append(a);
        ol.append(li);
    }
    
    $(".breadcrumb").on('click', 'a', function(e) {
        e.preventDefault();
        parent.window.location = $(this).attr('href');
    });

});