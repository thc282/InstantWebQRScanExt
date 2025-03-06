/*=================================================
=            選擇區域截圖功能            =
script inside scan-window.html
=================================================*/

const partScanBtn = document.getElementById('part-scan-btn');

// 初始化區域截圖按鈕
partScanBtn.addEventListener('click', () => {
    // 發送初始化消息到content script
    chrome.tabs.sendMessage(sourceTabId, {
        action: 'initAreaSelection',
        //lastWindowId: lastWindowId
    }).then(coord => {
        console.log('回傳結果', coord);
        processImage(coord);
    }).catch(err => {
        console.error('失敗:', err);
    });
});

function showImg(dataUrl,n) {
    console.log(dataUrl);
    setTimeout(function () { //FireFox seems to require a setTimeout for this to work.
    let w = window.open("",n,"popup");
        w.document.body.appendChild(w.document.createElement('iframe'))
            .src = dataUrl;
        w.document.getElementsByTagName("iframe")[0].style.width = '100%';
        w.document.getElementsByTagName("iframe")[0].style.height = '100%';
    }, 0);
}

function processImage(coord) {
    chrome.tabs.captureVisibleTab(sourceWindowId, (dataUrl) => {
        const screenshotImage = new Image();

        //showImg(dataUrl, 'ori');
        screenshotImage.onload = () => {
            canvas.width = coord.windowWidth;
            canvas.height = coord.windowHeight
            context.drawImage(screenshotImage, 0, 0, coord.windowWidth, coord.windowHeight);

            //showImg(canvas.toDataURL(), 'canvas');
            console.log(canvas.width, canvas.height, screenshotImage.width, screenshotImage.height, coord.windowWidth, coord.windowHeight);
            //重新設置canvas尺寸為選擇區域
            var imageData = context.getImageData(coord.x, coord.y, coord.width, coord.height);
            //var imageData = context.getImageData(0, 0, coord.width, coord.height);
            canvas.width = coord.width;
            canvas.height = coord.height;
            context.putImageData(imageData, 0, 0);
            //showImg(canvas.toDataURL(), 'crop');
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
            });

            if (code) {
                console.log(code);
                updateResult((code.data == "") ? '無法識別QR code內容' : code.data);
            } else {
                updateResult('未發現QR code');
            }
            scanBtn.disabled = false;
        }
        screenshotImage.src = dataUrl;
    });
}
/*function initAreaSelection() {
    chrome.tabs.captureVisibleTab(lastWindowId, (dataUrl) => {
        // 設置canvas尺寸
        overlay.width = window.innerWidth;
        overlay.height = window.innerHeight;
        overlay1.width = window.innerWidth;
        overlay1.height = window.innerHeight;
        overlay.style.visibility = 'visible';
        overlay1.style.visibility = 'visible';

        // 繪製半透明遮罩
        ctx = overlay.getContext('2d');
        ctx1 = overlay1.getContext('2d');
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
            ctx1.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx1.fillRect(0, 0, overlay.width, overlay.height);
        };
        img.src = dataUrl;

        // 綁定事件
        overlay1.addEventListener('mousedown', startSelection);
        overlay1.addEventListener('mousemove', drawSelection);
        overlay1.addEventListener('mouseup', endSelection);
    });
}

function startSelection(e) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    console.log(startX, startY);
}

function drawSelection(e) {
    if (!isSelecting) return;

    //ctx = overlay.getContext('2d');

    ctx1.clearRect(0, 0, overlay.width, overlay.height);
    // 重新繪製背景
    //ctx1.drawImage(img, 0, 0);
    ctx1.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx1.fillRect(0, 0, overlay.width, overlay.height);

    // 計算選擇區域
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    // 清除選擇區域的遮罩
    ctx1.clearRect(startX, startY, width, height);
}

function endSelection(e) {
    isSelecting = false;
    endX = e.clientX;
    endY = e.clientY;

    // 彈窗提示
    const confirmMsg = confirm('確認選擇區域？');

    // 移除事件監聽
    overlay1.removeEventListener('mousedown', startSelection);
    overlay1.removeEventListener('mousemove', drawSelection);
    overlay1.removeEventListener('mouseup', endSelection);

    // 綁定確認按鈕點擊事件
    (confirmMsg) ? processSelectedArea() : null;

    //清除截圖畫面
    overlay.style.visibility = 'hidden';
    overlay1.style.visibility = 'hidden';
}

function processSelectedArea() {
    const selectionWidth = endX - startX;
    const selectionHeight = endY - startY;

    console.log(startX, startY, selectionWidth, selectionHeight);
    // 獲取選擇區域的圖像數據
    const imageData = ctx.getImageData(startX, startY, selectionWidth, selectionHeight);

    //重新設置canvas尺寸
    overlay.width = selectionWidth;
    overlay.height = selectionHeight;
    ctx.putImageData(imageData, 0, 0);
    console.log(overlay.toDataURL());
    // 使用jsQR解析QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
    });

    console.info(code);
    // 處理結果...
}*/