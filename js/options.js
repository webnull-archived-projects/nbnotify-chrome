function listAllPlugins() {
    chrome.extension.sendRequest({type: "memory"}, function(response) { 
        d = response.data;
        txt = "<ul>";

        for (i in d) {
            txt += '<li><a href="'+d[i]+'" target="_blank">'+d[i]+'</a></li>';       
        }

        txt += "</ul>";

        document.getElementById("subscribed_links").innerHTML = txt;
    });
}

function init() {
    listAllPlugins();
}

document.addEventListener('DOMContentLoaded', init);
