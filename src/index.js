import "./styles.css";
import Todo from "./classes/Todo.js";
import Project from "./classes/Project.js"
import ProjectManager from "./classes/ProjectManager.js";
import DOMController from "./classes/DOMController.js"

const parsedProjectManager = JSON.parse(localStorage.getItem("projectManager"));
const domController = new DOMController();

const projectManager = new ProjectManager();

window.projectManager = projectManager;

domController.bindEvents();

if (parsedProjectManager.projects.length > 0) {
    for (const projectData of parsedProjectManager.projects) {
        const project = new Project(projectData);
        domController.createProject(projectData.title, projectData.id);
        if (projectData.todos.length > 0) {
            for (const todoData of projectData.todos) {
                const todo = new Todo(todoData);
                project.addTodo(todo);
                if (todoData.checkList) {
                    for (const subtask of todoData.checkList) {
                        todo.addSubtask(subtask);
                    }
                }
            }
        }
        projectManager.addProject(project);
    }
}

const activeProject = localStorage.getItem("activeProject");
const activeProjectEl = document.querySelector(`.list-item[data-project-id="${activeProject}"]`);
const activeProjectData = projectManager.getProject(activeProject);

document.querySelector(".list-item.active")?.classList.remove("active");
domController.displayedProject.dataset.projectId = activeProject;
domController.displayedProject.textContent = activeProjectData.title;
activeProjectEl.classList.add("active");

if (activeProjectData.todos.length > 0) {
    for (const todo of activeProjectData.todos) {
        domController.renderTodos(todo);
        for (const subtask of todo.checkList) {
            const activeProjectTodoContainer = document.querySelector(`.todo[data-todo-id="${todo.id}"]`)
            domController.renderSubtasks(todo.checkList, subtask.id, subtask.title, activeProjectTodoContainer.querySelector(".subtasks"));
        }
    }
}

domController.onAddProject = (projectData) => {
    const newProject = new Project(projectData);
    projectManager.addProject(newProject);
    projectManager.setActiveProject(projectData.id);
    projectManager.save();
}

domController.onDeleteProject = (projectId, lastProjectId) => {
    projectManager.deleteProject(projectId);
    const project = projectManager.getProject(lastProjectId);
    projectManager.setActiveProject(lastProjectId);
    projectManager.save();
    return project;
}

domController.onChangeProject = (selectedProject) => {
    const project = projectManager.getProject(selectedProject);
    domController.displayedProject.textContent = project.title; // this should be handled in dom controller
    projectManager.setActiveProject(selectedProject);
    return project;
}

domController.onChangeName = (projectId, projectName) => {
    const project = projectManager.getProject(projectId);
    console.log(project);
    console.log(project instanceof Project);
    project.setTitle(projectName);
    projectManager.save();
}

domController.onAddTodo = (todoData, projectId) => {
    const project = projectManager.getProject(projectId);
    const newTodo = new Todo(todoData);
    project.addTodo(newTodo);
    projectManager.save();
    return newTodo.getTodoData();
}

domController.onDeleteTodo = (projectId, todoId) => {
    const project = projectManager.getProject(projectId);
    project.deleteTodo(todoId);
    projectManager.save();
}

domController.onCompleteTodo = (projectId, todoId) => {
    const project = projectManager.getProject(projectId);
    project.deleteTodo(todoId);
    projectManager.save();
}

domController.onCustomizeTodo = (projectId, todoId) => {
    const project = projectManager.getProject(projectId);
    const todo = project.getTodo(todoId);
    console.log(todo);
    console.log(todo instanceof Todo);
    projectManager.save();
    return todo.getTodoData();
}

domController.onSaveTodo = (projectId, todoId, newTodoData) => {
    const project = projectManager.getProject(projectId);
    const todo = project.getTodo(todoId);
    todo.updateTodoData(newTodoData);
    projectManager.save();
    return todo.getTodoData();
}

domController.onAddSubtask = (projectId, todoId, subtask) => {
    const project = projectManager.getProject(projectId);
    const todo = project.getTodo(todoId);
    todo.addSubtask(subtask);
    projectManager.save();
    return todo.getTodoData();
}

domController.onDeleteSubtask = (projectId, todoId, subtaskId) => {
    const project = projectManager.getProject(projectId);
    const todo = project.getTodo(todoId);
    todo.removeSubtask(subtaskId);
    projectManager.save();
    return todo.getTodoData();
}

domController.onCompleteSubtask = (projectId, todoId, subtaskId) => {
    console.log(projectId, todoId, subtaskId);
    const project = projectManager.getProject(projectId);
    const todo = project.getTodo(todoId);
    todo.removeSubtask(subtaskId);
    projectManager.save();
    return todo.checkList;
}

