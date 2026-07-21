export default class Project {
    title;
    id;
    todos = [];
    constructor(projectData) {
        this.title = projectData.title;
        this.id = projectData.id;
    }
    addTodo(todoData) {
        this.todos.push(todoData);
    }
    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
    }
    getTodo(id) {
        return this.todos.find(t => t.id === id);
    }
    setTitle(newName) {
        this.title = newName;
    }
    viewTodos() {
        for (const todo of this.todos) {
            return todo;
            // not sure, iterate through whole array and somehow display the name and the due date of each todo 
        }
    }
}