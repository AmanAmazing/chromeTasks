chrome.commands.onCommand.addListener(function(command) {
	if (command === '_execute_action') {
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'openPopup' });
		});
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action === 'showAddTaskForm') {
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'showAddTaskForm' });
		});
	}
});
