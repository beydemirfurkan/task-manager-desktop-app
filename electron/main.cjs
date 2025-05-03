// electron/main.cjs
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

// Initialize the electron-store for tasks and trash
const taskStore = new Store({ name: 'tasks' });
const deletedTasksStore = new Store({ name: 'deletedTasks' });
const columnsStore = new Store({ name: 'statusColumns' }); // Add this line

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    // Load the index.html of the app
    // In production, load the bundled app
    // In development, use the dev server URL
    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    mainWindow.loadURL(url);

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

// This method will be called when Electron has finished initialization
// and is ready to create browser windows
app.whenReady().then(() => {
    createWindow();

    // Check for updates after startup (except in development)
    if (process.env.NODE_ENV !== 'development') {
        autoUpdater.checkForUpdatesAndNotify();
    }

    // App update related handlers
    ipcMain.handle('check-for-updates', () => {
        if (process.env.NODE_ENV !== 'development') {
            autoUpdater.checkForUpdatesAndNotify();
        }
        return true;
    });

    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });

    // Set up IPC handlers for task management
    ipcMain.handle('get-tasks', () => {
        return taskStore.get('tasks', []);
    });

    ipcMain.handle('save-tasks', (_, tasks) => {
        taskStore.set('tasks', tasks);
        return true;
    });

    ipcMain.handle('add-task', (_, task) => {
        const tasks = taskStore.get('tasks', []);
        const newTasks = [...tasks, task];
        taskStore.set('tasks', newTasks);
        return newTasks;
    });

    ipcMain.handle('update-task', (_, { id, updates }) => {
        const tasks = taskStore.get('tasks', []);
        const updatedTasks = tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
        );
        taskStore.set('tasks', updatedTasks);
        return updatedTasks;
    });

    ipcMain.handle('delete-task', (_, id) => {
        const tasks = taskStore.get('tasks', []);
        const updatedTasks = tasks.filter(task => task.id !== id);
        taskStore.set('tasks', updatedTasks);
        return updatedTasks;
    });

    // Handlers for trash management
    ipcMain.handle('get-deleted-tasks', () => {
        return deletedTasksStore.get('deletedTasks', []);
    });

    ipcMain.handle('save-deleted-tasks', (_, deletedTasks) => {
        deletedTasksStore.set('deletedTasks', deletedTasks);
        return true;
    });

    ipcMain.handle('add-deleted-task', (_, task) => {
        const deletedTasks = deletedTasksStore.get('deletedTasks', []);
        const updatedDeletedTasks = [...deletedTasks, task];
        deletedTasksStore.set('deletedTasks', updatedDeletedTasks);
        return updatedDeletedTasks;
    });

    ipcMain.handle('remove-deleted-task', (_, id) => {
        const deletedTasks = deletedTasksStore.get('deletedTasks', []);
        const updatedDeletedTasks = deletedTasks.filter(task => task.id !== id);
        deletedTasksStore.set('deletedTasks', updatedDeletedTasks);
        return updatedDeletedTasks;
    });

    // Add status column handlers - ADD THESE
    ipcMain.handle('get-status-columns', () => {
        return columnsStore.get('columns', []);
    });

    ipcMain.handle('save-status-columns', (_, columns) => {
        columnsStore.set('columns', columns);
        return true;
    });

    ipcMain.handle('add-status-column', (_, column) => {
        const columns = columnsStore.get('columns', []);
        const newColumns = [...columns, column];
        columnsStore.set('columns', newColumns);
        return newColumns;
    });

    ipcMain.handle('update-status-column', (_, { id, updates }) => {
        const columns = columnsStore.get('columns', []);
        const updatedColumns = columns.map(column =>
            column.id === id ? { ...column, ...updates } : column
        );
        columnsStore.set('columns', updatedColumns);
        return updatedColumns;
    });

    ipcMain.handle('delete-status-column', (_, id) => {
        const columns = columnsStore.get('columns', []);
        const updatedColumns = columns.filter(column => column.id !== id);
        columnsStore.set('columns', updatedColumns);
        return updatedColumns;
    });

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Auto-updater events
autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Güncelleme Mevcut',
        message: 'Yeni bir güncelleme mevcut. İndiriliyor...',
        buttons: ['Tamam']
    });
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Güncelleme Hazır',
        message: 'Güncelleme indirildi. Şimdi yeniden başlatılacak.',
        buttons: ['Şimdi Yeniden Başlat']
    }).then(() => {
        autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', (err) => {
    dialog.showErrorBox('Güncelleme Hatası', `Güncelleme sırasında hata oluştu: ${err.toString()}`);
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});