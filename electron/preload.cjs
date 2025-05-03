// electron/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Task management
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
    addTask: (task) => ipcRenderer.invoke('add-task', task),
    updateTask: (id, updates) => ipcRenderer.invoke('update-task', { id, updates }),
    deleteTask: (id) => ipcRenderer.invoke('delete-task', id),

    // Trash management
    getDeletedTasks: () => ipcRenderer.invoke('get-deleted-tasks'),
    saveDeletedTasks: (deletedTasks) => ipcRenderer.invoke('save-deleted-tasks', deletedTasks),
    addDeletedTask: (task) => ipcRenderer.invoke('add-deleted-task', task),
    removeDeletedTask: (id) => ipcRenderer.invoke('remove-deleted-task', id),

    // Status Columns management - ADD THESE
    getStatusColumns: () => ipcRenderer.invoke('get-status-columns'),
    saveStatusColumns: (columns) => ipcRenderer.invoke('save-status-columns', columns),
    addStatusColumn: (column) => ipcRenderer.invoke('add-status-column', column),
    updateStatusColumn: (id, updates) => ipcRenderer.invoke('update-status-column', { id, updates }),
    deleteStatusColumn: (id) => ipcRenderer.invoke('delete-status-column', id),
});