function openTab(url) {
	chrome.tabs.create({ url: url });
	window.close();
}

function handleInternalLink(a) {
    openTab(chrome.extension.getURL(a.target.rel));
}

function init() {
    
}

document.addEventListener('DOMContentLoaded', init);
