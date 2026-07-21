// ALSO STUDY EVENT DELEGATION IN-DEPTH***
export default class DOMController {
    onAddProject = null;
    onDeleteProject = null;
    onChangeProject = null;
    onAddTodo = null;
    onDeleteTodo = null;
    onCustomizeTodo = null;
    onSaveTodo = null;
    onCompleteTodo = null;
    onChangeName = null;

    onAddSubtask = null;
    onDeleteSubtask = null;
    onCompleteSubtask = null;

    originalTodoData = null;

    projContainer = document.querySelector("#project-container");
    todoContainer = document.querySelector("#todo-container");
    addProjectButton = document.querySelector("#add-project");
    newProjectInput = document.querySelector("#new-project");
    displayedProject = document.querySelector("#displayed-project");
    displayInput = document.querySelector("#display-input");
    mainHeader = document.querySelector("main-header");
    addTodoButton = document.querySelector("#add-todo");
    newTodo = document.querySelector("#new-todo");
    newTodoInput = document.querySelector("#todo-input");

    todoDialog = document.querySelector("#todo-dialog");
    dialogForm = document.querySelector("#todo-form");
    dialogTitle = document.querySelector("#title-input");
    dialogNotes = document.querySelector("#note-input");
    dialogDate = document.querySelector("#due-date");
    dialogPriority = document.querySelector("#dialog-priority");
    dialogEnergy = document.querySelector("#dialog-energy");
    dialogAddBtn = document.querySelector("#add-subtask");
    dialogSaveBtn = document.querySelector("#save-button");
    dialogCancelBtn = document.querySelector("#cancel-button");
    dialogDeleteBtn = document.querySelector("#delete-todo");

    dialogSubtaskContainer = document.querySelector("#subtask-container");
    dialogSubHeader = document.querySelector("#subtask-header");
    dialogSublist = document.querySelector("#sub-list");
    dialogSubContainer = document.querySelector("#new-subtask");
    dialogSubInput = document.querySelector("#subtask-input");

    createProject(title, id) {
        let project;
        if (!title) {
            this.newProjectInput.classList.add("hidden");
            return;
        }
        if (!id) {
            project = {
                title,
                id: crypto.randomUUID(),
            }
        } else {
            project = {
                title,
                id,
            }
        }
        if (this.onAddProject) {  // callback functions, do in-depth in this shit
            this.onAddProject(project);
        }
        document.querySelector(".list-item.active")?.classList.remove("active");

        this.displayedProject.dataset.projectId = project.id;
        this.displayedProject.textContent = title;

        const newProject = document.createElement("div");
        const projectTitle = document.createElement("p");
        const removeBtn = document.createElement("button");

        newProject.classList.add("list-item");
        projectTitle.classList.add("project");
        removeBtn.classList.add("remove-button");
        newProject.classList.add("active");

        removeBtn.type = "button";

        projectTitle.textContent = title;
        removeBtn.textContent = "×"

        newProject.dataset.projectId = project.id;

        newProject.appendChild(projectTitle);
        newProject.appendChild(removeBtn);
        this.newProjectInput.before(newProject);

        this.newProjectInput.classList.add("hidden");

        removeBtn.addEventListener('click', (e) => {
            this.handleDeleteProject(e, newProject);
        });

        newProject.addEventListener('click', () => {
            this.handleChangeProject(project.id);
        });
    }

    bindEvents() {
        this.displayedProject.addEventListener('click', this.handleRenameProject); // This next

        this.addProjectButton.addEventListener('click', this.handleAddProject);
        this.newProjectInput.addEventListener('keydown', this.handleEnterProject);
        this.newProjectInput.addEventListener('blur', this.handleBlurProject);

        this.displayInput.addEventListener('keydown', this.handleEnterName);
        this.displayInput.addEventListener('blur', this.handleBlurName);

        this.addTodoButton.addEventListener('click', this.handleAddTodo);
        this.newTodoInput.addEventListener('keydown', this.handleEnterTodo);
        this.newTodoInput.addEventListener('blur', this.handleBlurTodo);

        this.dialogForm.addEventListener('input', this.handleEditTodo);
        this.dialogDeleteBtn.addEventListener('click', this.handleDeleteTodo);
        this.dialogSaveBtn.addEventListener('click', this.handleSaveTodo);
        this.dialogCancelBtn.addEventListener('click', this.handleCancelTodo);
        this.dialogAddBtn.addEventListener('click', this.handleAddSub);
        this.dialogSubInput.addEventListener('keydown', this.handleEnterSub);
        this.dialogSubInput.addEventListener('blur', this.handleBlurSub);
    }

    handleAddProject = () => {
        if (!this.newProjectInput.classList.contains("hidden")) {
            this.newProjectInput.classList.add("hidden")
            return;
        }
        this.newProjectInput.classList.remove("hidden");
        this.newProjectInput.focus();
    }

    handleEnterProject = (e) => {
        if (e.key === "Enter") {
            this.newProjectInput.blur();
        }
    }

    handleBlurProject = () => {
        const title = this.newProjectInput.value.trim();
        if (!title) {
            this.newProjectInput.classList.add("hidden");
            return;
        }

        this.displayedProject.textContent = title;
        this.createProject(title);
        this.newProjectInput.value = "";
        this.newProjectInput.classList.add("hidden");
        this.todoContainer.replaceChildren(this.newTodo);
    }

    handleDeleteProject = (e, newProject) => {
        e.stopPropagation(); // stop events on parent and button from mixing up
        newProject.remove();
        this.todoContainer.replaceChildren(this.newTodo);
        document.querySelector(".list-item.active")?.classList.remove("active");
        const lastId = this.projContainer.querySelector(".list-item:last-of-type");
        if (!lastId) {
            this.displayedProject.textContent = "";
            return;
        }
        let lastProject;
        if (this.onDeleteProject) {
            lastProject = this.onDeleteProject(newProject.dataset.projectId, lastId.dataset.projectId);
        }
        lastId.classList.add("active");
        this.displayedProject.textContent = lastProject.title;
        this.displayedProject.dataset.projectId = lastProject.id;
        for (const todos of lastProject.todos) {
            this.renderTodos(todos);
            for (const sub of todos.checkList) {
                const todoContainer = document.querySelector(`.todo[data-todo-id="${todos.id}"]`)
                this.renderSubtasks(todos.checkList, sub.id, sub.title, todoContainer.querySelector(".subtasks"));
            }
        }
    }

    handleChangeProject = (projectId) => { //change
        let selectedProject;
        let projectTodos = [];
        if (document.querySelector(".active").dataset.projectId === projectId) {
            return;
        }
        document.querySelector(".list-item.active")?.classList.remove("active");
        const projectElement = document.querySelector(`[data-project-id="${projectId}"]`);
        if (this.onChangeProject) {
            selectedProject = this.onChangeProject(projectId);
            if (this.displayedProject.dataset.projectId === selectedProject.id) {
                return;
            }
            this.displayedProject.dataset.projectId = selectedProject.id;
            projectTodos = selectedProject.todos
        }
        projectElement.classList.add("active");
        this.todoContainer.replaceChildren(this.newTodo);
        for (const todo of projectTodos) {
            this.renderTodos(todo);
            for (const sub of todo.checkList) {
                const todoContainer = document.querySelector(`.todo[data-todo-id="${todo.id}"]`)
                this.renderSubtasks(todo.checkList, sub.id, sub.title, todoContainer.querySelector(".subtasks"));
            }
        }

    }

    handleRenameProject = () => {
        this.displayedProject.classList.add("hidden");
        this.displayInput.classList.remove("hidden");
        this.displayInput.value = this.displayedProject.textContent;
        this.displayInput.focus();
    }

    handleEnterName = (e) => {
        if (e.key === "Enter") {
            this.displayInput.blur();
        }
    }

    handleBlurName = () => {
        console.log("blur")
        if (this.displayInput.value === "") {
            this.displayInput.value = this.displayedProject.textContent;
        }
        this.displayedProject.textContent = this.displayInput.value;
        this.displayInput.classList.add("hidden");
        this.displayedProject.classList.remove("hidden");
        if (this.onChangeName) {
            this.onChangeName(this.displayedProject.dataset.projectId, this.displayInput.value)
        }
        const projectTitle = document.querySelector(
            `[data-project-id="${this.displayedProject.dataset.projectId}"] .project`
        );
        projectTitle.textContent = this.displayInput.value;
    }

    handleAddTodo = () => {
        if (!this.newTodo.classList.contains("hidden")) {
            this.newTodo.classList.add("hidden")
            return;
        }
        this.newTodo.classList.remove("hidden");
        this.newTodoInput.focus();
    }

    handleDeleteTodo = (e) => {
        const dialog = e.target.closest("dialog");
        if (this.onDeleteTodo) {
            this.onDeleteTodo(this.displayedProject.dataset.projectId, dialog.dataset.todoId);
        }
        const todoId = this.todoDialog.dataset.todoId;
        const todo = document.querySelector(
            `.todo[data-todo-id="${todoId}"]`
        );
        todo.remove();
        dialog.close();
    }

    handleEnterTodo = (e) => {
        if (e.key === "Enter") {
            this.newTodoInput.blur();
        }
    }

    handleBlurTodo = () => {
        if (this.newTodoInput.value === "") {
            this.newTodo.classList.add("hidden");
            return;
        }
        const todoInitialData = {
            title: this.newTodoInput.value,
            id: crypto.randomUUID(),
        }
        let todoData;
        if (this.onAddTodo) {
            todoData = this.onAddTodo(todoInitialData, this.displayedProject.dataset.projectId);
        }

        this.newTodo.classList.add("hidden");

        this.renderTodos(todoData);

        this.newTodoInput.value = "";
    }

    handleEditTodo = () => {
        const currentData = JSON.stringify(Object.fromEntries(new FormData(this.dialogForm)));
        this.dialogSaveBtn.disabled = (currentData === this.originalTodoData);
    }

    handleAddSub = () => {
        if (!this.dialogSubContainer.classList.contains("hidden")) {
            this.dialogSubContainer.classList.add("hidden")
            return;
        }
        this.dialogSubContainer.classList.remove("hidden");
        this.dialogSubInput.focus();
    }

    handleEnterSub = (e) => {
        if (e.key === "Enter") {
            this.dialogSubInput.blur();
        }
    }

    handleBlurSub = () => {
        if (this.dialogSubInput.value === "") {
            this.dialogSubContainer.classList.add("hidden");
            return;
        }
        let todoData;
        const subData = {
            title: this.dialogSubInput.value,
            id: crypto.randomUUID(),
        }
        if (this.onAddSubtask) {
            todoData = this.onAddSubtask(this.displayedProject.dataset.projectId, this.todoDialog.dataset.todoId, subData); // pass project id, todo id, store subtask name and id
        }

        this.dialogSubContainer.classList.add("hidden");

        const subTask = document.createElement("div");
        const subDelete = document.createElement("button");
        subDelete.textContent = "×";
        subDelete.type = "button";
        subTask.classList.add("subtask-row");
        subDelete.classList.add("remove-sub");

        this.dialogSublist.appendChild(subTask);

        this.renderSubtasks(todoData.checkList, subData.id, subData.title, subTask);

        subTask.appendChild(subDelete);

        subDelete.addEventListener('click', (e) => {
            const row = e.target.closest(".subtask-row");
            const subtaskId = row
                .querySelector(".sub-title")
                .dataset.subTodoId;

            if (this.onDeleteSubtask) {
                todoData = this.onDeleteSubtask(
                    this.displayedProject.dataset.projectId,
                    this.todoDialog.dataset.todoId,
                    subtaskId
                )
                e.target.closest('.subtask-row').remove();
            }
            const displayedSubtask = document.querySelector(`.sub-title[data-sub-todo-id="${subData.id}"]`);
            displayedSubtask.parentElement.remove();
            if (todoData.checkList.length === 0) {
                subtasks.classList.add("hidden");
            }
        });

        this.dialogSubInput.value = "";

        const todo = document.querySelector(`.todo[data-todo-id="${todoData.id}"]`);
        const subtasks = todo.querySelector(".subtasks");
        this.renderSubtasks(todoData.checkList, subData.id, subData.title, subtasks);
    }

    handleSaveTodo = (e) => {
        e.preventDefault();
        const todo = document.querySelector(`.todo[data-todo-id="${this.todoDialog.dataset.todoId}"]`);
        const todoDate = todo.querySelector(".due-date");
        const todoNotes = todo.querySelector(".notes");
        const todoSubContainer = todo.querySelector(".sub-container");
        const todoSubtasks = todo.querySelector(".subtasks");
        const newTodoData = Object.fromEntries(new FormData(this.dialogForm));
        let todoData;

        if (this.onSaveTodo) {
            todoData = this.onSaveTodo(this.displayedProject.dataset.projectId, this.todoDialog.dataset.todoId, newTodoData);
        }

        if (todo) {
            todo.querySelector(".task-title").textContent = todoData.title;
        }

        this.todoDialog.close();

        this.renderDate(todoData.date, todoDate);
        this.renderNotes(todoData.notes, todoNotes);
        this.renderSubcontainer(todoData, todoSubContainer);
    }

    handleCancelTodo = () => {
        const parsedInitialData = JSON.parse(this.originalTodoData);

        Object.keys(parsedInitialData).forEach(key => {
            const input = this.dialogForm.elements[key];
            if (input) {
                input.value = parsedInitialData[key];
            }
        });

        this.todoDialog.close();
    }

    renderTodos = (projectData) => {
        const todo = document.createElement("div");
        const mainTodo = document.createElement("div");
        const checkTodo = document.createElement("div");
        const date = document.createElement("p");
        const hiddenCheck = document.createElement("input");
        const customCheck = document.createElement("label")
        const title = document.createElement("span");
        const todoInfo = document.createElement("button");

        const notes = document.createElement("p");
        const subContainer = document.createElement("div");
        const priority = document.createElement("p");
        const energy = document.createElement("div");
        const subtasks = document.createElement("div");

        todo.classList.add("todo");
        mainTodo.classList.add("main-todo");
        hiddenCheck.classList.add("hidden-check");
        customCheck.classList.add("custom-check");
        title.classList.add("task-title");
        date.classList.add("due-date");
        todoInfo.classList.add("todo-info");
        notes.classList.add("notes");
        subContainer.classList.add("sub-container");
        priority.classList.add("priority");
        energy.classList.add("energy-level");
        subtasks.classList.add("subtasks", "hidden");

        hiddenCheck.id = `todo-check-${projectData.id}`;

        hiddenCheck.type = "checkbox";
        hiddenCheck.name = `todo-check-${projectData.id}`;
        hiddenCheck.htmlFor = `todo-check-${projectData.id}`;
        title.textContent = projectData.title;
        todoInfo.textContent = "i";
        todoInfo.command = "show-modal";
        todoInfo.type = "button";

        todo.dataset.todoId = projectData.id;

        todo.appendChild(mainTodo);
        todo.appendChild(date);
        todo.appendChild(notes);
        todo.appendChild(subContainer);
        todo.appendChild(subtasks);
        subContainer.appendChild(priority);
        subContainer.appendChild(energy);
        mainTodo.appendChild(checkTodo);
        mainTodo.appendChild(todoInfo);
        checkTodo.appendChild(hiddenCheck);
        checkTodo.appendChild(customCheck);
        checkTodo.appendChild(title);

        this.renderDate(projectData.date, date);
        this.renderNotes(projectData.notes, notes);
        this.renderSubcontainer(projectData, subContainer);

        todoInfo.addEventListener('click', () => {
            this.todoDialog.showModal();
            let todoData;
            if (this.onCustomizeTodo) {
                todoData = this.onCustomizeTodo(this.displayedProject.dataset.projectId, projectData.id);
            }
            this.todoDialog.dataset.todoId = todoData.id;
            this.dialogTitle.value = todoData.title;
            this.dialogNotes.value = todoData.notes;
            this.dialogDate.value = todoData.date;
            this.dialogPriority.value = todoData.priority;
            this.dialogEnergy.value = todoData.energy;
            this.dialogSublist.replaceChildren();
            if (todoData.checkList) {
                for (const sub of todoData.checkList) {
                    const subTask = document.createElement("div");
                    const subDelete = document.createElement("button");
                    subDelete.textContent = "×";
                    subDelete.type = "button";
                    subTask.classList.add("subtask-row");
                    subDelete.classList.add("remove-sub");
                    subDelete.addEventListener('click', (e) => {
                        const row = e.target.closest(".subtask-row");
                        const subtaskId = row
                            .querySelector(".sub-title")
                            .dataset.subTodoId;

                        if (this.onDeleteSubtask) {
                            todoData = this.onDeleteSubtask(
                                this.displayedProject.dataset.projectId,
                                this.todoDialog.dataset.todoId,
                                subtaskId
                            )
                            e.target.closest('.subtask-row').remove();
                        }
                        const displayedSubtask = document.querySelector(`.sub-title[data-sub-todo-id="${sub.id}"]`);
                        displayedSubtask.parentElement.remove();
                        if (todoData.checkList.length === 0) {
                            subtasks.classList.add("hidden");
                        }
                    });
                    this.dialogSublist.appendChild(subTask);

                    this.renderSubtasks(todoData.checkList, sub.id, sub.title, subTask);
                    this.dialogSublist.appendChild(subTask);
                    subTask.appendChild(subDelete);
                }
            }

            this.originalTodoData = JSON.stringify(Object.fromEntries(new FormData(this.dialogForm)));

            this.dialogSaveBtn.disabled = true;
        });

        let timeout;

        hiddenCheck.addEventListener('change', () => {
            if (hiddenCheck.checked) {
                timeout = setTimeout(() => {
                    todo.remove();
                }, 3000);
                if (this.onCompleteTodo) {

                    this.onCompleteTodo(this.displayedProject.dataset.projectId, projectData.id);
                }
            } else {
                clearTimeout(timeout);
            }
        });

        this.newTodo.before(todo);
    }

    renderDate = (dateData, dateElement) => {
        if (!dateData) {
            dateElement.classList.add("hidden");
        } else {
            dateElement.classList.remove("hidden");
            dateElement.textContent = dateData;
        }
    }

    renderNotes = (noteData, noteElement) => {
        if (!noteData) {
            noteElement.classList.add("hidden");
        } else {
            noteElement.classList.remove("hidden");
            noteElement.textContent = noteData;
        }
    }

    renderSubcontainer = (subData, subElement) => {
        const priority = subElement.querySelector(".priority");
        const energy = subElement.querySelector(".energy-level");
        if (!subData.priority && !subData.energy) {
            subElement.classList.add("hidden");
        } else {
            subElement.classList.remove("hidden");
        }

        if (!subData.priority) {
            priority.classList.add("hidden");
        } else {
            priority.classList.remove("hidden");;
            if (subData.priority === "0") {
                priority.textContent = "Low Priority";
                priority.className = "";
                priority.classList.add("priority", "low");
            } else if (subData.priority === "1") {
                priority.textContent = "Medium Priority";
                priority.className = "";
                priority.classList.add("priority", "medium");
            } else {
                priority.textContent = "High Priority";
                priority.className = "";
                priority.classList.add("priority", "high");
            }
        }
        if (!subData.energy) {
            energy.classList.add("hidden");
        } else {
            energy.classList.remove("hidden");
            const filledStars = Number(subData.energy);
            const totalStars = 5;
            const emptyStars = totalStars - filledStars;

            energy.replaceChildren();
            for (let i = 0; i < filledStars; i++) {
                const star = document.createElement("span");
                star.classList.add("star", "filled");
                energy.appendChild(star);
            }
            if (emptyStars !== 0) {
                for (let j = 0; j < emptyStars; j++) {
                    const star = document.createElement("span");
                    star.classList.add("star", "empty");
                    energy.appendChild(star);
                }
            }
        }
    }

    renderSubtasks = (checkList, subId, subName, subTask) => {
        if (checkList.length === 0) {
            subTask.classList.add("hidden");
        } else {
            subTask.classList.remove("hidden");
            const subItem = document.createElement("label");
            const subHiddenCheck = document.createElement("input");
            const subCustomCheck = document.createElement("span")
            const subTitle = document.createElement("span");

            subItem.classList.add("subtask-item");
            subHiddenCheck.classList.add("hidden-check");
            subCustomCheck.classList.add("custom-check");
            subTitle.classList.add("sub-title");

            subHiddenCheck.id = `dialog-sub-${subId}`;

            subHiddenCheck.type = "checkbox";
            subHiddenCheck.name = `dialog-sub-${subId}`;
            subHiddenCheck.htmlFor = `dialog-sub-${subId}`;
            subTitle.textContent = subName;

            let timeout;

            subHiddenCheck.addEventListener('change', () => {
                if (subHiddenCheck.checked) {
                    timeout = setTimeout(() => {
                        
                        const mainSub = document.querySelector(
                            `.todo .sub-title[data-sub-todo-id="${subId}"]`
                        );
                        const dialogSub = this.todoDialog.querySelector(
                            `.sub-title[data-sub-todo-id="${subId}"]`
                        );
                        const subtasks = mainSub.closest(".subtasks")
                        const todoElement = mainSub.closest(".todo");
                        mainSub?.closest(".subtask-item").remove();
                        dialogSub?.closest(".subtask-row").remove();
                        if (this.onCompleteSubtask) {
                        const newChecklist =
                            this.onCompleteSubtask(
                                this.displayedProject.dataset.projectId,
                                todoElement.dataset.todoId,
                                subId
                            );
                        if (newChecklist.length === 0) {
                            console.log(mainSub);
                            subtasks.classList.add("hidden");
                        }
                    }
                    },);
                    
                } else {
                    clearTimeout(timeout);
                }
            });

            subTitle.dataset.subTodoId = subId;

            subTask.appendChild(subItem);
            subItem.appendChild(subHiddenCheck);
            subItem.appendChild(subCustomCheck);
            subItem.appendChild(subTitle);
        }
    }
}

/*
SUPPLEMENTAL SHXT
- deadline detection
- using date-fns to format dates and make use of deadlines
*/