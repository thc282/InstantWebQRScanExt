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

let sourceTabId = null;
let sourceWindowId = null;
//get windowId from url
function initFromURL() {
    const args = new URLSearchParams(location.search);
    sourceTabId = parseInt(args.get('tabId'));
    sourceWindowId = parseInt(args.get('windowId'));
}

// 初始化函數
function initialize() {
    // 先從 storage 中讀取
    const storedTabId = sessionStorage.getItem('sourceTabId');
    const storedWindowId = sessionStorage.getItem('sourceWindowId');

    //console.log(sessionStorage);
    if (storedTabId && storedWindowId) {
        // 如果 storage 中有值，使用存儲的值
        sourceTabId = parseInt(storedTabId);
        sourceWindowId = parseInt(storedWindowId);
    } else {
        // 如果 storage 中沒有值，從 URL 參數獲取並存儲
        const urlParams = new URLSearchParams(window.location.search);
        sourceTabId = parseInt(urlParams.get('tabId'));
        sourceWindowId = parseInt(urlParams.get('windowId'));

        // 存儲到 session storage
        sessionStorage.setItem('sourceTabId', sourceTabId);
        sessionStorage.setItem('sourceWindowId', sourceWindowId);
    }
}

// 更新 storage 的函數
function updateStorage(tabId, windowId) {
    sourceTabId = tabId;
    sourceWindowId = windowId;
    sessionStorage.setItem('sourceTabId', tabId);
    sessionStorage.setItem('sourceWindowId', windowId);
    //console.log(sessionStorage)
}

// 監聽 window focus 變化
chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) return;

    const window = await chrome.windows.get(windowId, { populate: true });

    if (!window.tabs.some(tab => tab.url.includes('scan-window.html'))) {
        const [activeTab] = await chrome.tabs.query({
            active: true,
            windowId: windowId
        });
        if (activeTab) {
            updateStorage(activeTab.id, windowId);
        }
    }
});

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', initialize);

function updateResult(result) {
    if (isValidURL(result)) {
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