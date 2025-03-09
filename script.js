// Selecting elements from the DOM  
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const toggleDarkMode = document.getElementById('toggleDarkMode');
const sortAsc = document.getElementById('sortAsc');
const sortDesc = document.getElementById('sortDesc');

// Load tasks from local storage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let selectedTasks = new Set();
let draggedIndex = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    applyDarkMode();
});

// Event Listeners
addTaskBtn?.addEventListener('click', addTask);
taskInput?.addEventListener('keypress', (event) => event.key === 'Enter' && addTask());
deleteAllBtn?.addEventListener('click', deleteSelectedTasks);
toggleDarkMode?.addEventListener('click', toggleTheme);
sortAsc?.addEventListener('click', () => sortTasks(true));
sortDesc?.addEventListener('click', () => sortTasks(false));

/** 📝 Add Task */
function addTask() {
    if (!taskInput) return;

    const taskText = taskInput.value.trim();
    if (!taskText || tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase())) {
        alert("Invalid or duplicate task!");
        return;
    }

    tasks.push({ text: taskText, completed: false });
    updateLocalStorage();
    renderTasks();
    
    // Clear the input field and refocus
    taskInput.value = '';  // Clear the input field
    taskInput.focus();     // Refocus back on the input field for the next task
}

/** 📝 Render Tasks */
function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = ''; // Clear the task list

    tasks.forEach((task, index) => {
        const li = createTaskElement(task, index);
        taskList.appendChild(li);
    });

    addDragAndDropHandlers(); // Enable drag & drop after rendering
}

/** 🔧 Create Task Element */
function createTaskElement(task, index) {
    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.index = index;
    li.classList.add('task-item');

    // Task container
    const taskContainer = document.createElement('div');
    taskContainer.classList.add('task-container');

    // Checkbox
    const selectCheckbox = document.createElement('input');
    selectCheckbox.type = 'checkbox';
    selectCheckbox.classList.add('task-checkbox');
    selectCheckbox.checked = selectedTasks.has(index);
    selectCheckbox.addEventListener('change', () => {
        selectCheckbox.checked ? selectedTasks.add(index) : selectedTasks.delete(index);
    });

    // Task text
    const taskText = document.createElement('span');
    taskText.textContent = task.text;
    taskText.classList.add('task-text');
    taskText.classList.toggle('completed', task.completed);  // Apply the 'completed' class if task is done
    taskText.addEventListener('dblclick', () => editTask(index, taskText));

    // Task actions
    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    // Done/Undo button
    const doneBtn = document.createElement('button');
    doneBtn.textContent = task.completed ? 'Undo' : 'Done';
    doneBtn.classList.add('done-btn');
    doneBtn.addEventListener('click', () => toggleTaskCompletion(index, doneBtn));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '&#10006;';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.addEventListener('click', () => confirmDelete(index));

    // Append elements
    taskActions.append(doneBtn, deleteBtn);
    taskContainer.append(selectCheckbox, taskText, taskActions);
    li.appendChild(taskContainer);

    // Drag & Drop Events
    li.addEventListener('dragstart', (e) => {
        draggedIndex = index;
        e.target.classList.add('dragging');
    });

    li.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    li.addEventListener('drop', (e) => {
        e.preventDefault();
        swapTasks(draggedIndex, index);
        e.target.classList.remove('dragging');
    });

    li.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
    });

    return li;
}

/** ✅ Toggle Task Completion */
function toggleTaskCompletion(index, doneBtn) {
    tasks[index].completed = !tasks[index].completed;
    doneBtn.textContent = tasks[index].completed ? 'Undo' : 'Done'; // Change the button text
    updateLocalStorage();
    renderTasks();
}

/** ❌ Confirm Delete Task */
function confirmDelete(index) {
    if (confirm("Are you sure you want to delete this task?")) {
        tasks.splice(index, 1);
        updateLocalStorage();
        renderTasks();
    }
}

/** ❌ Delete Selected Tasks */
function deleteSelectedTasks() {
    if (selectedTasks.size === 0) {
        alert("No tasks selected for deletion!");
        return;
    }

    if (confirm(`Are you sure you want to delete ${selectedTasks.size} selected task(s)?`)) {
        tasks = tasks.filter((_, index) => !selectedTasks.has(index));
        selectedTasks.clear();
        updateLocalStorage();
        renderTasks();
    }
}

/** 🔄 Update Local Storage */
function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/** 🌙 Toggle Dark Mode */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

/** 🌙 Apply Dark Mode on Load */
function applyDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

/** 🔀 Sort Tasks */
function sortTasks(ascending) {
    tasks.sort((a, b) => ascending ? a.text.localeCompare(b.text) : b.text.localeCompare(a.text));
    updateLocalStorage();
    renderTasks();
}

/** 🔄 Swap Tasks */
function swapTasks(fromIndex, toIndex) {
    const taskToMove = tasks.splice(fromIndex, 1)[0]; // Remove the dragged task
    tasks.splice(toIndex, 0, taskToMove); // Insert at new position
    updateLocalStorage();
    renderTasks();
}
