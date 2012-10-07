// default configuration options
if(localStorage.host == undefined)
    localStorage.host = 'localhost:9954';

if(localStorage.nbsync == undefined)
    localStorage.nbsync = 60;

localStorage.connectiontimeout = 10;

var xhr = new XMLHttpRequest();
var host = localStorage['host'];
var tmp = '';
var memory = {};
var nbconfig;
var showedConnectionPopup = false;

console.log("nbnotify-chrome main.js init..."); 

function openTab(url) {
	chrome.tabs.create({ url: url });
}

function post(adress, data) {
    d = false;

    try {
        $.ajax({
                type: "POST",
                url: adress,
                async: false,
                data: data,
                success: function(response) { 
                            d = response;
                            return d;
                        },
                dataType: 'text'
                });

        console.log("POST "+adress+" -> "+data+" = "+d);
    } catch (e) {
        return false;    
    }

    return d;
}

function loadMemory() {
    // transfer nbnotify database

    data = '{"function": "getConfigAndEntries", "data": ""}';
    response = post("http://"+host+"/", data);

    if(response == false)
    {
        chrome.tabs.getAllInWindow(function(tabList) {

            for(tab in tabList) {
                if (tabList[tab]['url'].indexOf("connection.html") == -1 && tabList[tab]['url'].indexOf("chrome-extension") == -1)
                {
                    if (showedConnectionPopup == false)
                        openTab(chrome.extension.getURL('connection.html'));
                        showedConnectionPopup = true
                        return false;
                }

            }
        });

        return false;
    }

    tmp = JSON.parse(parseRJ(response).replace(/\'/g, '"'));
    memory = tmp[0];
    nbconfig = tmp[1];

    localStorage.connectiontimeout = tmp[1]['connection']['timeout']
}

// check if link is in database
function isInDatabase(link)
{
    m = MD5(link);

    if(memory[m] != undefined) 
    {
        return true; 
    }

    return false;
}


function parseRJ(response) {
    try {
        array = JSON.parse(response);
        return array.response;
    } catch (e) {
        return false;
    }
}

function messageListener(request, sender, sendResponse) {
    switch (request.type) {

        case "setType":
            data = '{"function": "setType", "data": {"link": "'+request.link+'", "type": "'+request.linkType+'"}}';
            adress = "http://"+host+"/"
            console.log("setType -> "+request.link+" -> "+request.linkType);

            response = post(adress, data);
            d = {data: parseRJ(response)};

            sendResponse(d);
        break;


        case "addPage":
            data = '{"function": "addPage", "data": "'+request.link+'"}';
            adress = "http://"+host+"/"
            console.log("addPage -> "+request.link+" -> "+data);

            // add to application memory
            memory[MD5(adress)] = adress

            response = post(adress, data);
            d = {data: parseRJ(response)};

            sendResponse(d);
        break;

        case "removePage":
            data = '{"function": "removePage", "data": "'+request.link+'"}';
            adress = "http://"+host+"/"
            console.log("remove -> "+request.link+" -> "+data);

            // add to application memory
            delete memory[MD5(adress)]

            response = post(adress, data);
            d = {data: parseRJ(response)};

            sendResponse(d);
        break;


        case "saveConfiguration":
            data = '{"function": "saveConfiguration", "data": ""}';
            adress = "http://"+host+"/"
            console.log("saveConfiguration.");

            response = post(adress, data);
            d = {data: parseRJ(response)};

            sendResponse(d);
        break;

        case "memory":
            sendResponse({data: memory});
        break;

        case "isInDatabase":
            sendResponse({data: isInDatabase(request.id)})
        break;

        case "nbconfig":
            sendResponse({data: nbconfig})
        break;

        case "ping":
            data = '{"function": "ping", "data": ""}';
            adress = "http://"+request.adress+"/"
            console.log("ping "+request.adress);

            alert(data);

            response = post(adress, data);
            d = {data: parseRJ(response)};

            sendResponse(d);
        break;

        case "configSetKey":
            data = '{"function": "configSetKey", "data": {"section": "'+request.section+'", "option": "'+request.option+'", "value": "'+request.value+'"}}';
            adress = "http://"+host+"/"
            console.log("ping "+host);

            response = post(adress, data);
            d = {data: parseRJ(response)};

            sendResponse(d);
        break;

    }
}

chrome.extension.onMessage.addListener(messageListener);

// get nbnotify database
loadMemory();
window.setInterval(loadMemory, (localStorage.nbsync*1000));

// just a test of ajax post
//console.log(post("http://localhost:9954", '{"function": "notifyNewData", "data": {"data": "This is a test!", "title": "Change this title.", "icon": "/usr/share/path/to/icon.png", "pageid": ""}}')) 
