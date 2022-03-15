if (typeof browser === "undefined") {
	browser = chrome;
}

browser.browserAction.onClicked.addListener(function () {

	var togglePowerPaneCode = ''
		+ 'var pane = document.querySelector(".crm-power-pane-sections");'
		+ 'var nextValue = (pane.style.display !== "" && pane.style.display !== "none") ? "none" : "block";'
		+ 'pane.style.display = nextValue;'

	browser.tabs.executeScript({
		code: togglePowerPaneCode
	});
	chrome.tabs.create({ 'url': chrome.extension.getURL('pages/grid.html') });

	//chrome.tabs.create({
	//	url: `pages/grid.html`,
	//});
	//alert(chrome.extension.getURL('pages/grid.html'))
});

function getCurrentTabCCCb() {
	alert("getCurrentTabCCCb")
	//let queryOptions = { active: true, currentWindow: true };
	//let [tab] = await chrome.tabs.query(queryOptions);
	//return tab;
}

//console.log("chrome", chrome);
////chrome.runtime.onMessage
//console.log("chrome.runtime", chrome.runtime);
//console.log("chrome.runtime.onMessage", chrome.runtime.onMessage);

//browser.browserAction.onClicked.addListener(function () {

//	alert("hihi")
//});
//chrome.browserAction.onClicked.addListener(function (tab) {

	
//	//var action_url = "http://www.reddit.com/submit?url=" + encodeURIComponent(tab.href) + '&title=' + encodeURIComponent(tab.title);
//	//chrome.tabs.create({ url: action_url });
//});


browser.browserAction.onClicked.addListener(function (message, sender, sendResponse) {
	//88alert("xxx")
	if (message.type === 'Page') {
		alert("Page")
		let c = message.category.toString();
		switch (c) {
			case 'allUsers':
				chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
					chrome.tabs.sendMessage(tabs[0].id, {
						category: 'allUsers',
						type: 'Background',
						content: message.content,
					});
				});
				break;
			case 'Settings':
				content = message.content;
				chrome.tabs.create({
					url: `/pages/organisationdetails.html`,
				});
				break;
			case 'myRoles':
			case 'allFields':
			case 'quickFindFields':
			case 'entityMetadata':
			case 'environment':
				content = message.content;
				chrome.tabs.create({
					url: `/pages/grid.html`,
				});
				break;
			case 'workflows':
				content = message.content;
				chrome.tabs.create({
					url: `/pages/processes.html`,
				});
				break;
			case 'Extension':
				renderBadge();
				if (message.content === 'On') {
					chrome.browserAction.enable(sender.tab.id);
				} else if (message.content === 'Off') chrome.browserAction.disable(sender.tab.id);
				break;
			case 'Load':
				sendResponse(content);
				break;
			case 'allUserRoles':
				content = message.content;
				chrome.tabs.create({
					url: `/pages/userroles.html`,
				});
				break;
			case 'optionsets':
				content = message.content;
				chrome.tabs.create({
					url: `/pages/optionsets.html`,
				});
				break;
			default:
				break;
		}
	} else if (message.type === 'Impersonate') {
		let category = message.category;
		let impersonizationMessage = message.content;

		renderBadge();

		switch (category) {
			case 'activation':
				userId = impersonizationMessage.UserId;

				chrome.webRequest.onBeforeSendHeaders.removeListener(headerListener);

				if (impersonizationMessage.IsActive) {
					chrome.webRequest.onBeforeSendHeaders.addListener(
						headerListener,
						{
							urls: [impersonizationMessage.Url + 'api/*'],
						},
						['blocking', 'requestHeaders', 'extraHeaders']
					);
				}
				break;
			case 'changeUser':
				userId = impersonizationMessage.UserId;
				break;
		}
	} else if (message.type === 'API') {
		let c = message.category.toString();
		switch (c) {
			case 'allUsers':
				chrome.tabs.query(
					{
						active: true,
						currentWindow: true
					},
					function (tabs) {
						chrome.tabs.executeScript(tabs[0].id, {
							code: `window.postMessage({ type: '${c}', category: '${message.type}' }, '*');`,
						});
					}
				);
				break;
		}
	} else {
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true,
			},
			function (tabs) {
				if (!tabs || tabs.length === 0) return;
				chrome.tabs.executeScript(tabs[0].id, {
					code: `window.postMessage({ type: '${message.type}', category: '${message.category}' }, '*');`,
				});
			}
		);
	}
});

