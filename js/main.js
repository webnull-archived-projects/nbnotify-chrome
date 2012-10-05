var xhr = new XMLHttpRequest();
var host = "localhost:9954";
var tmp = '';
var memory = {};

function post(adress, data) {
    d = 'Not responded yet...';

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

    console.log("POST "+adress+" -> "+data);

    return d;
}

function loadMemory() {
    // transfer nbnotify database

    data = '{"function": "getAllEntries", "data": ""}';
    response = post("http://"+host+"/", data);
    memory = JSON.parse(parseRJ(response).replace(/\'/g, '"'));
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
    array = JSON.parse(response);
    return array.response;
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

    }
}

// get nbnotify database
loadMemory();
chrome.extension.onRequest.addListener(messageListener);
window.setInterval(loadMemory, 5000);

// just a test of ajax post
//console.log(post("http://localhost:9954", '{"function": "notifyNewData", "data": {"data": "This is a test!", "title": "Change this title.", "icon": "/usr/share/path/to/icon.png", "pageid": ""}}')) 
