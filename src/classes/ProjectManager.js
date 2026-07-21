export default class ProjectManager {
    projects = [];
    addProject(project) {
        this.projects.push(project);
        this.save();
    }
    deleteProject(projectId) {
        this.projects = this.projects.filter(p => p.id !== projectId);
        this.save();
    }
    getProject(id) {
        return this.projects.find(p => p.id === id);
    }
    setActiveProject(id) {
        localStorage.setItem("activeProject", id);
    }
    save() {
        localStorage.setItem("projectManager", JSON.stringify(this));
    }
}