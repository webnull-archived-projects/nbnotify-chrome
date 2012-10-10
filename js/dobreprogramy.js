var buttonAdd = '<span class="icon i_rss"></span>Subskrybuj';
var buttonTemplate = '<a title="Subskrybuj przy pomocy nbnotify" class="png_bg button-icon-left font-heading text-h65" href="#" id="subscribe_button">'+buttonAdd+'</a>';
var buttonDelete = '<span class="icon i_rss"></span>Przestań subskrybować';

function getElementsByClassName(classname, node)  {
    if(!node) node = document.getElementsByTagName("body")[0];
    var a = [];
    var re = new RegExp('\\b' + classname + '\\b');
    var els = node.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
        if(re.test(els[i].className))a.push(els[i]);
    return a;
}

/* Subscribing user's RSS channels */

function createUserButton() {
    // Create "Subscribe" button in user profile

    var link = checkSubscribeUser();

    element = getElementsByClassName("contact-panel float-right")[0];

    // If we aren't in user profile page
    if(element == undefined) {
        return false    
    }

    if(link == false)
    {
        return false;
    }

    element.innerHTML = element.innerHTML+buttonTemplate;

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
    var r = new RegExp("dobreprogramy\.pl\/([A-Za-z0-9\-\_\@\;\.\:\#\!\%\&\$\?\/\,]+)");
    var match = r.exec(window.location);

    if(match[0] == "dobreprogramy.pl/Blog") { return false; }

    if(match == null) { console.log("Invalid link in checkSubscribeUser() detected: "+window.location)+", propably it's not a blog post."; return false; }

    if (match.length > 1)
    {
        return "http://"+match[0].replace("www.", "").replace("#", "")+",Rss";
    }

    return false;
}

function doSubscribeUser() {
    adress = checkSubscribeUser()

    console.log("doSubscribeUser: "+adress)

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

/* Subscribing comments from blog posts */

var buttonPostAdd = '<span class="icon i_rss"></span>Subskrybuj';
var buttonPost = '<div style="text-align: right"><a title="Subskrybuj przy pomocy nbnotify" class="png_bg button-icon-left font-heading text-h65" href="#" id="subscribe_post_button">'+buttonPostAdd+'</a></div><br>';
var buttonPostDelete = '<span class="icon i_rss"></span>Przestań subskrybować';

// check if url adress is correct
function checkSubscribePost()
{
    var r = new RegExp("dobreprogramy\.pl\/([A-Za-z0-9\-\_\@\;\.\:\#\!\%\&\$\?\/\,]+),([0-9]+)\.html");
    var match = r.exec(window.location);

    if(match == null) { console.log("Invalid link in checkSubscribePost() detected: "+window.location)+", propably it's not user's profile."; return false; }

    if (match.length > 1)
    {
        return "http://"+match[0].replace("www.", "");
    }

    return false;
}

function doSubscribePost() {
    // Send link to nbnotify

    adress = checkSubscribePost()

    if (adress != false)
    {
        chrome.extension.sendMessage({type: "isInDatabase", id: adress}, function(response) { 

            if (response.data == true)
            {
                chrome.extension.sendMessage({type: "removePage", link: adress}, function(response) { x = response;})
                chrome.extension.sendMessage({type: "saveConfiguration"}, function(response) { x = response;})
                button = document.getElementById("subscribe_post_button");
                button.innerHTML = buttonAdd;
            } else {
                chrome.extension.sendMessage({type: "addPage", link: adress}, function(response) { x = response;})
                chrome.extension.sendMessage({type: "saveConfiguration"}, function(response) { x = response;})
                button = document.getElementById("subscribe_post_button");
                button.innerHTML = buttonDelete;
            }
            
        });
    } else {
        console.log("Warning: match.length < 2 in doSubscribeUser");
    }
}

function createPostButton() {
    // Create "Subscribe" button in top of post

    var link = checkSubscribePost();

    element = document.getElementById('blog')

    // If we aren't in user profile page
    if(element == undefined) {
        return false    
    }

    if(link == false)
    {
        return false;
    }

    element.innerHTML = element.innerHTML.replace('</header>', buttonPost+'</header>');

    button = document.getElementById("subscribe_post_button");
    button.innerHTML = buttonPostAdd;

    button.addEventListener("click", doSubscribePost, false)

    chrome.extension.sendMessage({type: "isInDatabase", id: link}, function(response) { 

        if (response.data == true)
        {
            button.innerHTML = buttonPostDelete;
        }
        
    });
}

createUserButton()
createPostButton()
