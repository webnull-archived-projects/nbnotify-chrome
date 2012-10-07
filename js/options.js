function removePage(e) {
    adress = e.target.rel;
    chrome.extension.sendMessage({type: "removePage", link: adress}, function(response) { })
    listAllPlugins()
}

function listAllPlugins() {
    chrome.extension.sendMessage({type: "memory"}, function(response) { 

        if(response == undefined)
        {
            document.getElementById("subscribed_links").innerHTML = "<p>Nie można połączyć z nbnotify.</p>";
            return false;
        }

        if(JSON.stringify(response.data) == "{}")
        {
            document.getElementById("subscribed_links").innerHTML = "<p>Nie można połączyć z nbnotify.</p>";
            return false;
        }

        d = response.data;
        txt = "<table>";

        n = 0;

        for (i in d) {
            n = n + 1;
            txt += '<tr><td><a href="'+d[i]+'" target="_blank">'+d[i]+'</a></td><td><a href="#" rel="'+d[i]+'" id="del_'+n+'">Usuń</a></td></tr>';
        }

        txt += "</table>";

        document.getElementById("subscribed_links").innerHTML = txt;

        k = 0;
        while (k != n) {
            k = k+1;
            document.getElementById('del_'+k).addEventListener("click", removePage, false);
        }
    });
}

function init() {
    listAllPlugins();
}

function checkHost(host) {

    if (host.length < 6)
    {
        $('#host').css("border", "solid orange 2px");
        return false;
    }

    chrome.extension.sendMessage({type: "ping", adress: host}, function(response) {

        if (response == undefined)
        {
            $('#host').css("border", "solid red 2px");
            return false;
        }

        if (response.data)
        {
            localStorage['host'] = host
            $('#host').css("border", "solid green 2px");
        } else {
            $('#host').css("border", "solid red 2px");
        }
    });
}

$(function(){
    $('#host').val(localStorage['host']);
    $('#host').focusout(function() { checkHost($('#host').val()); });

    // Synchronization time (nbnotify -> chrome)
    $('#sync-time').val(localStorage.nbsync);
    $('#sync-time').change(function () { localStorage.nbsync = $('#sync-time').val()});
    

    // Connection timeout in nbnotify (connection -> timeout)
    $('#max-timeout').val(localStorage.connectiontimeout);
    $('#max-timeout').focusout(function (){
        localStorage.connectiontimeout = $('#max-timeout').val();
        chrome.extension.sendMessage({type: "configSetKey", section: 'connection', option: 'timeout', value: localStorage.connectiontimeout}, function() {});
        chrome.extension.sendMessage({type: "saveConfiguration"}, function() { })
    });
});

document.addEventListener('DOMContentLoaded', init);
