/*=================================================
=            全屏截圖功能            =
script inside scan-window.html
=================================================*/
scanBtn.addEventListener('click', () => {
    scanBtn.disabled = true;
    chrome.tabs.captureVisibleTab(sourceWindowId, (dataUrl) => {
        const screenshotImage = new Image();

        //showImg(dataUrl, 'full');
        screenshotImage.onload = () => {
            canvas.width = screenshotImage.width;
            canvas.height = screenshotImage.height;
            context.drawImage(screenshotImage, 0, 0);
            var imageData = context.getImageData(0, 0, screenshotImage.width, screenshotImage.height);
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
});
