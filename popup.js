function openTab(url) {
	chrome.tabs.create({ url: url });
	window.close();
}

function optionsTab() { openTab(chrome.extension.getURL('options.html')); }

function init() {
    $("#subscription_active").text("Subskrypcja aktywna dla tego adresu");
    document.getElementById("settings_link").addEventListener("click", optionsTab, false);
    
}

document.addEventListener('DOMContentLoaded', init);


