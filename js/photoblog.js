var buttonAdd = 'Subskrybuj powiadomienia przy pomocy nbnotify';
var buttonTemplate = '<li><a href="#" id="subscribe_button">'+buttonAdd+'</a></li>';
var buttonDelete = 'Przestań subskrybować powiadomienia';

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
    a = checkSubscribeUser();
    var link = a.link;
    var login = a.username;

    element = getElementsByClassName("left-panel-menu")[0]

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

    chrome.extension.sendMessage({type: "isInDatabase", id: "http://photoblog.pl/mojphotoblog/"+login}, function(response) { 
        if (response.data == true)
        {
            ubutton.innerHTML = buttonDelete;
        }
        
    });
}

// check if url adress is correct
function checkSubscribeUser()
{
    var r = new RegExp("photoblog\.pl\/([A-Za-z0-9\_\-]+)/");
    var match = r.exec(window.location);

    // get user name
    welcome_msg = getElementsByClassName("logged clearfix")[0].innerHTML

    var r = new RegExp('photoblog.pl\/([A-Za-z0-9\-\_]+)');
    var match_welcome = r.exec(welcome_msg);

    if (match_welcome == null)
        return false;

    if (match == null)
        return false;

    if (match.length > 1)
    {
        return {link: "http://"+match[0], username: match_welcome[1]};
    }

    return false;
}

function doSubscribeUser() {
    a = checkSubscribeUser();
    var adress = a.link;
    var login = a.username;

    if (adress != false)
    {
        chrome.extension.sendMessage({type: "isInDatabase", id: "http://photoblog.pl/mojphotoblog/"+login}, function(response) { 
            if (response.data == true)
            {
                chrome.extension.sendMessage({type: "removePage", link: "http://photoblog.pl/mojphotoblog/"+login}, function(response) { x = response;})
                chrome.extension.sendMessage({type: "saveConfiguration"}, function(response) { x = response;})
                button = document.getElementById("subscribe_button");
                button.innerHTML = buttonAdd;
            } else {
                //chrome.extension.sendMessage({type: "setType", link: adress, linkType: "rss"}, function(response) { r = response;})
                chrome.extension.sendMessage({type: "addPage", link: "http://photoblog.pl/mojphotoblog/id/"+Base64.encode(document.cookie), show: "http://photoblog.pl/mojphotoblog/"+login}, function(response) { })
                chrome.extension.sendMessage({type: "saveConfiguration"}, function(response) { })
                button = document.getElementById("subscribe_button");
                button.innerHTML = buttonDelete;
            }
        });
    } else {
        console.log("Warning: match.length < 2 in doSubscribeUser");
    }
}

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}

createUserButton();
//document.addEventListener('DOMContentLoaded', createUserButton);
