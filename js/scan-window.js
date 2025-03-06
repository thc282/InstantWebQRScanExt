/*=================================================
=            主功能            =
script inside scan-window.html
=================================================*/

//HTML elements
const scanBtn = document.getElementById('scan-btn');
const resultDiv = document.getElementById('result');
const linkToWeb = document.getElementById('goToWeb');
const canvas = document.getElementById('qr-canvas');   //for drawing image
const context = canvas.getContext('2d');
const otherResultSpan = document.getElementById('other-result');

//get windowId from url
const args = new URLSearchParams(location.search);
const sourceTabId = parseInt(args.get('tabId'));
const sourceWindowId = parseInt(args.get('windowId'));

function updateResult(result) {
    if(isValidURL(result)) {
        linkToWeb.href = result;
        linkToWeb.innerHTML = result;
        linkToWeb.style.display = 'block';
        otherResultSpan.style.display = 'none';
    } else {
        otherResultSpan.innerHTML = result;
        linkToWeb.style.display = 'none';
        otherResultSpan.style.display = 'block';
    }
}

linkToWeb.addEventListener('click', openTab);
function openTab(e) {
    e.preventDefault();
    window.close();
    chrome.tabs.create({
        active: true,
        windowId: sourceWindowId,
        url: e.target.href
    });
}

function isValidURL(qrContent) {
    try {
        const url = new URL(qrContent);
        
        const protocols = ['http:', 'https:', 'ftp:'];
        if (!protocols.includes(url.protocol)) {
            return false;
        }

        // Improved domain validation that handles subdomains
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(url.hostname)) {
            return false;
        }

        return true;
    } catch (err) {
        return false;
    }
}