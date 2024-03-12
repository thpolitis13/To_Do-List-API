document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    let tasks = [];

    if ('Notification' in window) {
        Notification.requestPermission();
    }

    loadTasksFromLocalStorage();

    taskForm.addEventListener('submit', addTask);
    document.getElementById('sort-by-completed').addEventListener('click', sortByCompleted);
    document.getElementById('sort-by-date').addEventListener('click', sortByDate);

    function addTask(event) {
        event.preventDefault();
        const taskInput = document.getElementById('task-input');
        const dueDateInput = document.getElementById('task-due-date');
        const categorySelect = document.getElementById('task-category');

        if (taskInput.value.trim() === '') {
            alert('Please add a task');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskInput.value.trim(),
            category: categorySelect.value,
            completed: false,
            added: new Date(),
            dueDate: dueDateInput.value ? new Date(dueDateInput.value) : null
        };

        tasks.push(task);
        saveTasksToLocalStorage();
        renderTasks();
        taskInput.value = '';
        dueDateInput.value = '';
        categorySelect.value = 'Personal';
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task' + (task.completed ? ' completed' : '');
            li.dataset.taskId = task.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

            const taskSpan = document.createElement('span');
            taskSpan.className = 'task-text';
            taskSpan.textContent = task.text;

            const dueDateSpan = document.createElement('span');
            dueDateSpan.className = 'task-due-date';
            if (task.dueDate) {
                const formattedDate = new Date(task.dueDate).toLocaleString();
                dueDateSpan.textContent = ` (Due: ${formattedDate})`;
                updateDueStatus(li, task.dueDate);
            } else {
                dueDateSpan.textContent = ' (No due date)';
            }

            const categorySpan = document.createElement('span');
            categorySpan.className = 'task-category';
            categorySpan.textContent = ` [${task.category}] `;

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'x';
            deleteBtn.className = 'remove-task';
            deleteBtn.addEventListener('click', () => removeTask(task.id));

            li.appendChild(categorySpan);
            li.appendChild(taskSpan);
            li.appendChild(dueDateSpan);
            li.appendChild(checkbox);
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });
    }

    function updateDueStatus(li, dueDate) {
        const now = new Date().getTime();
        const dueTime = new Date(dueDate).getTime();
        if (dueTime < now) {
            li.classList.add('overdue');
        } else if (dueTime - now <= 3600000) {
            li.classList.add('due-soon');
        }
    }

    function removeTask(taskId) {
        tasks = tasks.filter(task => task.id != taskId);
        saveTasksToLocalStorage();
        renderTasks();
    }

    function toggleTaskCompletion(taskId) {
        const task = tasks.find(task => task.id == taskId);
        task.completed = !task.completed;
        saveTasksToLocalStorage();
        renderTasks();
    }

    function sortByCompleted() {
        tasks.sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);
        renderTasks();
    }

    function sortByDate() {
        tasks.sort((a, b) => {
            const dueDateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            const dueDateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            return dueDateA - dueDateB;
        });
        renderTasks();
    }

    function loadTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
    }

    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});
