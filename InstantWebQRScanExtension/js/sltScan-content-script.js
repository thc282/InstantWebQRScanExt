console.log('sltScan-content-script.js loaded');
let isSelecting = null;
let startX, startY, endX, endY;
let resolveSelection = null;
let overlay = null;
let ctx = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'initAreaSelection') {
        // 返回 true 告訴 Chrome 我們會異步發送回應
        new Promise(resolve => {
            resolveSelection = (result) => {
                resolve(result);
                sendResponse(result); // 使用 sendResponse 發送結果
            };
            initCanvasOverlay();
        });
        return true; // 這行很重要，告訴 Chrome 我們會異步回傳
    }
});

function initCanvasOverlay() {
    overlay = document.createElement('canvas');
    ctx = overlay.getContext('2d');
    // 建立全屏覆蓋canvas
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        visibility: hidden;
        cursor: crosshair;
        z-index: 999999;
    `;
    document.body.appendChild(overlay);

    // 初始化繪圖上下文
    overlay.width = window.innerWidth;
    overlay.height = window.innerHeight;
    overlay.style.visibility = 'visible';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, overlay.width, overlay.height);

    // 鼠標事件監聽
    overlay.addEventListener('mousedown', startSelection);
    overlay.addEventListener('mousemove', drawSelectionBox);
    overlay.addEventListener('mouseup', finishSelection);
}

function startSelection(e) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
}

function drawSelectionBox(e) {
    if (!isSelecting) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, overlay.width, overlay.height);

    ctx.clearRect(startX, startY, e.clientX - startX, e.clientY - startY);
}

async function finishSelection(e) {
    isSelecting = false;
    endX = e.clientX;
    endY = e.clientY;

    const [x, y, width, height] = [
        Math.min(startX, endX),
        Math.min(startY, endY),
        Math.abs(startX - endX),
        Math.abs(startY - endY)
    ];

    // 彈窗提示
    const confirmMsg = confirm('確認選擇區域？');

    // 解析 Promise 並帶入座標
    if (resolveSelection) {
        resolveSelection(confirmMsg ? {
            x,
            y, 
            width, 
            height, 
            windowWidth: window.innerWidth, 
            windowHeight: window.innerHeight,
        } : "cancel");
    }

    document.body.removeChild(overlay);
    // 移除事件監聽
    overlay.removeEventListener('mousedown', startSelection);
    overlay.removeEventListener('mousemove', drawSelectionBox);
    overlay.removeEventListener('mouseup', finishSelection);
}