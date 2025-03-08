/*=================================================
=            選擇區域截圖功能            =
script inside scan-window.html
=================================================*/

const partScanBtn = document.getElementById('part-scan-btn');
var currentScanWindowId = null;
// 初始化區域截圖按鈕
partScanBtn.addEventListener('click', () => {
    // 禁用按鈕
    partScanBtn.disabled = true;

    // 激活掃描視窗
    chrome.windows.update(
        sourceWindowId,
        {
            drawAttention: true,
            focused: true,
        },
    )

    // 發送初始化消息到content script
    chrome.tabs.sendMessage(sourceTabId, {
        action: 'initAreaSelection',
        //lastWindowId: lastWindowId
    }).then(coord => {
        //console.log('回傳結果', coord);
        // 重新激活掃描視窗
        chrome.windows.update(
            -2,
            { focused: true },
        )
        if (coord !== "cancel") processImage(coord);
        partScanBtn.disabled = false;
    }).catch(err => {
        console.error('失敗:', err);
    });
});

function showImg(dataUrl, n) {
    console.log(dataUrl);
    setTimeout(function () { //FireFox seems to require a setTimeout for this to work.
        let w = window.open("", n, "popup");
        w.document.body.appendChild(w.document.createElement('iframe'))
            .src = dataUrl;
        w.document.getElementsByTagName("iframe")[0].style.width = '100%';
        w.document.getElementsByTagName("iframe")[0].style.height = '100%';
    }, 0);
}

function processImage(coord) {
    chrome.tabs.captureVisibleTab(sourceWindowId, (dataUrl) => {
        const screenshotImage = new Image();

        //showImg(dataUrl, 'part');
        screenshotImage.onload = () => {
            canvas.width = coord.windowWidth;
            canvas.height = coord.windowHeight
            context.drawImage(screenshotImage, 0, 0, coord.windowWidth, coord.windowHeight);

            //showImg(canvas.toDataURL(), 'canvas');
            //console.log(canvas.width, canvas.height, screenshotImage.width, screenshotImage.height, coord.windowWidth, coord.windowHeight);
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
                //console.log(code);
                updateResult((code.data == "") ? '無法識別QR code內容' : code.data);
            } else {
                updateResult('未發現QR code');
            }
            scanBtn.disabled = false;
        }
        screenshotImage.src = dataUrl;
    });
}