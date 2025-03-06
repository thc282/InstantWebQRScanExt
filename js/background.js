// 在建立scan-window時記錄原始tab資訊
let sourceTabId = null;
let sourceWindowId = null;

chrome.action.onClicked.addListener((tab) => {
    sourceTabId = tab.id;
    sourceWindowId = tab.windowId;
    createScanWindow(tab)
})

// 创建持久化窗口
const createScanWindow = async (tab) => {
    const winInfo = await chrome.windows.getCurrent();

    chrome.windows.create({
        url: 'scan-window.html' + (tab ? `?windowId=${tab.windowId}&tabId=${tab.id}` : ''),
        type: 'popup',
        width: 660,
        height: 400,
        left: winInfo.left + Math.round((winInfo.width - 400) / 2),
        top: winInfo.top + Math.round((winInfo.height - 600) / 2)
    });
};