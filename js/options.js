var i18n=function(){function i(b){b=b.querySelectorAll(l);for(var d,f=0;d=b[f];f++)for(var e=0;e<h.length;e++){var c=h[e],a=d.getAttribute(c);a!=null&&j[c](d,a)}}var j={"i18n-content":function(b,d){b.textContent=chrome.i18n.getMessage(d)},"i18n-values":function(b,d){for(var f=d.replace(/\s/g,"").split(/;/),e=0;e<f.length;e++){var c=f[e].match(/^([^:]+):(.+)$/);if(c){var a=c[1];c=chrome.i18n.getMessage(c[2]);if(a.charAt(0)=="."){a=a.slice(1).split(".");for(var g=b;g&&a.length>1;)g=g[a.shift()];if(g){g[a]=c;a=="innerHTML"&&i(b)}}else b.setAttribute(a,c)}}}},h=[],k;for(k in j)h.push(k);var l="["+h.join("],[")+"]";return{process:i}}();

function checkFacebookIntegration() {
    // check if any facebook feed link exists in database
    chrome.extension.sendMessage({type: "memory"}, function(response) {

        d = response.data;
        for (i in d) {
            if(d[i].indexOf("facebook.com/feeds/notifications.php") != -1)
            {
                console.log("Found facebook link: "+d[i]);
                $('#facebook_integration_div').remove();
                return false;
            }
        }
    });
}


function facebookIntegration() {
    // add facebook link to database

    $.ajax({type: "GET",
            url: 'https://www.facebook.com/notifications',
            headers: { 
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Referer": "https://www.facebook.com/",
                "Cache-Control": "max-age=0"
            },
            async: false,
            success: function(response) {
                parser = new DOMParser();
                xmlDoc = parser.parseFromString(response,"text/xml");
                link = false;    

                var r = new RegExp('viewer=([0-9]+)\&amp\;key=([A-Za-z0-9]+)\&amp\;format');
                test = r.exec(response);

                if (test.length > 0)
                {
                    // 1 => id & viewer, 2 => key
                    facebookLink = "https://www.facebook.com/feeds/notifications.php?id="+test[1]+"&viewer="+test[1]+"&key="+test[2]+"&format=rss20";
                    chrome.extension.sendMessage({type: "addPage", link: facebookLink}, function(response) { })
                    $('#facebook_integration_div').remove();
                    refreshList();
                } else {
                    alert(chrome.i18n.getMessage("cannot_connect_facebook"));                
                }
            }
           });
}

function removePage(e) {
    adress = e.target.rel;
    chrome.extension.sendMessage({type: "removePage", link: adress}, function(response) { listAllPlugins() })
    refreshList();
}

function refreshList() {
    listAllPlugins();
    i18n.process(document);
}

function listAllPlugins() {
    chrome.extension.sendMessage({type: "memory"}, function(response) { 

        if(response == undefined)
        {
            document.getElementById("subscribed_links").innerHTML = "<p>"+chrome.i18n.getMessage("cannot_connect_nbnotify")+"</p>";
            return false;
        }

        if(JSON.stringify(response.data) == "{}")
        {
            document.getElementById("subscribed_links").innerHTML = "<p>"+chrome.i18n.getMessage("cannot_connect_nbnotify")+"</p>";
            return false;
        }

        d = response.data;
        txt = "<table>";

        n = 0;

        for (i in d) {
            n = n + 1;
            txt += '<tr><td><a href="'+d[i]+'" target="_blank">'+d[i]+'</a></td><td><a href="#" rel="'+d[i]+'" id="del_'+n+'">'+chrome.i18n.getMessage("delete")+'</a></td></tr>';
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
    refreshList();
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
    // facebook integration
    checkFacebookIntegration();
    document.getElementById('facebook_integration').addEventListener("click", facebookIntegration, false);

    // global -> checktime
    $('#checktime').val((localStorage.checktime/60));
    $('#checktime').focusout(function () { 
        localStorage.checktime = ($('#checktime').val()*60);
        chrome.extension.sendMessage({type: "configSetKey", section: 'global', option: 'checktime', value: localStorage.checktime}, function() {});
        chrome.extension.sendMessage({type: "saveConfiguration"}, function() { })
    });
    

    // nbnotify adress
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
