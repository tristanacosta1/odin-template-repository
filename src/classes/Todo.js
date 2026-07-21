export default class Todo {
    title;
    id;
    date;
    notes;
    priority;
    energy;
    checkList = [];
    completion = false;
    constructor(todoData) {
        this.title = todoData.title;
        this.id = todoData.id;
        this.date = todoData.date;
        this.notes = todoData.notes;
        this.priority = todoData.priority;
        this.energy = todoData.energy;
        this.completion = todoData.completion;
    }
    addSubtask(subtask) {
        this.checkList.push(subtask);
    }
    removeSubtask(id) {
        this.checkList = this.checkList.filter(s => s.id !== id);
    }
    finishSubtask() {

    }
    viewTodo() {
        // maximize todo and show every details about it
    }
    getTodoData() {
        return {
            title: this.title || "",
            id: this.id || "",
            notes: this.notes || "",
            date: this.date || "",
            priority: this.priority || "",
            energy: this.energy || "",
            checkList: this.checkList
        }
    }
    updateTodoData(newTodoData) {
        const initialTodoData = this.getTodoData()
        Object.entries(newTodoData).forEach(([key, value]) => {
            if (value !== initialTodoData[key]) {
                this[key] = newTodoData[key];
            }
        });
    }
}