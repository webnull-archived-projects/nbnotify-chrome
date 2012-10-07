var buttonAdd = '<b>Subskrybuj przy pomocy nbnotify</b>';
var buttonTemplate = '<a title="Subskrybuj przy pomocy nbnotify" href="#" id="subscribe_button">'+buttonAdd+'</a>';
var buttonDelete = '<b>Przestań subskrybować</b>';

function getElementsByClassName(classname, node)  {
    if(!node) node = document.getElementsByTagName("body")[0];
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}

/* Subscribing user */

function createUserButton() {
    // Create "Subscribe" button in user profile

    var link = checkSubscribeUser();

    element = getElementsByClassName("location-and-url")[0];

    // If we aren't in user profile page
    if(element == undefined) {
        return false    
    }

    if(link == false)
    {
        return false;
    }

    element.innerHTML = buttonTemplate+element.innerHTML;

    ubutton = document.getElementById("subscribe_button");
    ubutton.innerHTML = buttonAdd;

    ubutton.addEventListener("click", doSubscribeUser, false)

    chrome.extension.sendMessage({type: "isInDatabase", id: link}, function(response) { 
        if (response.data == true)
        {
            ubutton.innerHTML = buttonDelete;
        }
        
    });
}

// check if url adress is correct
function checkSubscribeUser()
{
    var r = new RegExp("twitter\.com\/([A-Z-a-z0-9\-\_\.\,]+)");
    var match = r.exec(window.location);

    if (match == null)
        return false;

    if (match.length > 1)
    {
        return "http://"+match[0];
    }

    return false;
}

function doSubscribeUser() {
    adress = checkSubscribeUser()

    if (adress != false)
    {
        chrome.extension.sendMessage({type: "isInDatabase", id: adress}, function(response) { 
            if (response.data == true)
            {
                chrome.extension.sendMessage({type: "removePage", link: adress}, function(response) { x = response;})
                chrome.extension.sendMessage({type: "saveConfiguration"}, function(response) { x = response;})
                button = document.getElementById("subscribe_button");
                button.innerHTML = buttonAdd;
            } else {
                //chrome.extension.sendMessage({type: "setType", link: adress, linkType: "rss"}, function(response) { r = response;})
                chrome.extension.sendMessage({type: "addPage", link: adress}, function(response) { })
                chrome.extension.sendMessage({type: "saveConfiguration"}, function(response) { })
                button = document.getElementById("subscribe_button");
                button.innerHTML = buttonDelete;
            }
        });
    } else {
        console.log("Warning: match.length < 2 in doSubscribeUser");
    }
}

createUserButton()
