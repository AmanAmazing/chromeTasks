document.addEventListener('DOMContentLoaded', function() {
	var taskNameInput = document.getElementById('taskNameInput');
	var taskDescriptionInput = document.getElementById('taskDescriptionInput');
	var taskUrlInput = document.getElementById('taskUrlInput');
	var taskStatusInput = document.getElementById('taskStatusInput');
	var addTaskBtn = document.getElementById('addTaskBtn');
	var addTaskForm = document.getElementById('addTaskForm');
	var saveTaskBtn = document.getElementById('saveTaskBtn');
	var cancelTaskBtn = document.getElementById('cancelTaskBtn');
	var taskList = document.getElementById('taskList');
	var toggleCompletedBtn = document.getElementById('toggleCompletedBtn');
	var completedTasksList = document.getElementById('completedTasksList');
	var isCompletedVisible = false;

	// Load tasks from storage
	loadTasks();

	// Autofill the current tab's URL
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		var currentUrl = tabs[0].url;
		taskUrlInput.value = currentUrl;
	});

	// Add task button click event
	addTaskBtn.addEventListener('click', function() {
		addTaskForm.style.display = 'block';
	});

	// Save task button click event
	saveTaskBtn.addEventListener('click', function() {
		var taskName = taskNameInput.value;
		var taskDescription = taskDescriptionInput.value;
		var taskUrl = taskUrlInput.value;
		var taskStatus = taskStatusInput.value;

		if (taskName) {
			createTask(taskName, taskDescription, taskUrl, taskStatus);
			addTaskForm.style.display = 'none';
		}
	});

	// Cancel task button click event
	cancelTaskBtn.addEventListener('click', function() {
		addTaskForm.style.display = 'none';
		clearInputFields();
	});

	// Create a new task
	function createTask(name, description, url, status) {
		var task = {
			name: name,
			description: description,
			url: url,
			status: status
		};
		saveTask(task);
		clearInputFields();
	}

	// Load tasks from storage
	function loadTasks() {
		chrome.storage.sync.get('tasks', function(data) {
			var tasks = data.tasks || [];
			taskList.innerHTML = ''; // Clear the task list
			completedTasksList.innerHTML = ''; // Clear the completed tasks list

			// Sort tasks based on status
			tasks.sort(function(a, b) {
				var statusOrder = ['initial', 'pending', 'completed'];
				return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
			});

			tasks.forEach(function(task) {
				if (task.status === 'completed') {
					addTaskToCompletedList(task);
				} else {
					addTaskToList(task);
				}
			});
		});
	}

	// Add task to the task list
	function addTaskToList(task) {
		var li = document.createElement('li');
		li.dataset.taskId = task.id;
		li.dataset.status = task.status; // Add data-status attribute
		li.innerHTML = `
      <strong>${task.name}</strong><br>
      ${task.description}<br>
      <a href="${task.url}" target="_blank">${task.url}</a><br>
      Status: ${task.status}<br>
      <button class="editTaskBtn">Edit</button>
      <button class="deleteTaskBtn">Delete</button>
    `;
		taskList.appendChild(li);

		// Edit task button click event
		var editTaskBtn = li.querySelector('.editTaskBtn');
		editTaskBtn.addEventListener('click', function() {
			editTask(task.id);
		});

		// Delete task button click event
		var deleteTaskBtn = li.querySelector('.deleteTaskBtn');
		deleteTaskBtn.addEventListener('click', function() {
			deleteTask(task.id);
		});
	}

	// Add task to the completed tasks list
	function addTaskToCompletedList(task) {
		var li = document.createElement('li');
		li.dataset.taskId = task.id;
		li.dataset.status = task.status; // Add data-status attribute
		li.innerHTML = `
      <strong>${task.name}</strong><br>
      ${task.description}<br>
      <a href="${task.url}" target="_blank">${task.url}</a><br>
      <button class="deleteTaskBtn">Delete</button>
    `;
		completedTasksList.appendChild(li);

		// Delete task button click event
		var deleteTaskBtn = li.querySelector('.deleteTaskBtn');
		deleteTaskBtn.addEventListener('click', function() {
			deleteTask(task.id);
		});
	}

	// Save task to storage
	function saveTask(task) {
		chrome.storage.sync.get('tasks', function(data) {
			var tasks = data.tasks || [];
			task.id = Date.now().toString(); // Generate unique task ID
			tasks.push(task);
			chrome.storage.sync.set({ tasks: tasks }, function() {
				loadTasks(); // Reload tasks after saving
			});
		});
	}

	// Clear input fields
	function clearInputFields() {
		taskNameInput.value = '';
		taskDescriptionInput.value = '';
		taskUrlInput.value = '';
		taskStatusInput.value = 'initial';
	}

	// Edit task
	function editTask(taskId) {
		chrome.storage.sync.get('tasks', function(data) {
			var tasks = data.tasks || [];
			var taskIndex = tasks.findIndex(function(task) {
				return task.id === taskId;
			});

			if (taskIndex !== -1) {
				var task = tasks[taskIndex];
				taskNameInput.value = task.name;
				taskDescriptionInput.value = task.description;
				taskUrlInput.value = task.url;
				taskStatusInput.value = task.status;

				// Remove task from storage
				tasks.splice(taskIndex, 1);
				chrome.storage.sync.set({ tasks: tasks }, function() {
					loadTasks(); // Reload tasks after editing
					addTaskForm.style.display = 'block'; // Show the add task form for editing
				});
			}
		});
	}

	// Delete task
	function deleteTask(taskId) {
		chrome.storage.sync.get('tasks', function(data) {
			var tasks = data.tasks || [];
			var taskIndex = tasks.findIndex(function(task) {
				return task.id === taskId;
			});

			if (taskIndex !== -1) {
				// Remove task from storage
				tasks.splice(taskIndex, 1);
				chrome.storage.sync.set({ tasks: tasks }, function() {
					loadTasks(); // Reload tasks after deleting
				});
			}
		});
	}

	// Toggle completed tasks visibility
	toggleCompletedBtn.addEventListener('click', function() {
		if (isCompletedVisible) {
			completedTasksList.style.display = 'none';
			toggleCompletedBtn.textContent = 'Show Completed Tasks';
		} else {
			completedTasksList.style.display = 'block';
			toggleCompletedBtn.textContent = 'Hide Completed Tasks';
		}
		isCompletedVisible = !isCompletedVisible;
	});

	// Show add task form when keyboard shortcut is pressed
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action === 'showAddTaskForm') {
			addTaskForm.style.display = 'block';
			taskNameInput.focus(); // Set focus on the task name input field
		}
	});
});
