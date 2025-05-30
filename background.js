chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "save_url") {
        chrome.runtime.sendNativeMessage(
            "hu.netsave.bridge",  // Ezt nevezd át, ha más a native messaging host neve!
            {
                action: "save_url",
                url: request.url,
                root: request.root
            },
            function(resp) {
                sendResponse(resp);
            }
        );
        // Aszinkron válasz miatt true!
        return true;
    }
    // Ide jöhetnek további action-ök, pl. képek, videók, stb.
});


