import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create the context
const TaskContext = createContext();

// Custom hook to use the task context
export const useTaskContext = () => useContext(TaskContext);

// Define the task priorities
export const PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

// Define the default task statuses
export const DEFAULT_STATUSES = {
    TODO: 'todo',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
};

// Available labels for tasks
export const AVAILABLE_LABELS = [
    'work', 'personal', 'urgent', 'idea', 'meeting'
];

// Get combined statuses (default + custom)
const computeStatuses = (statusCols) => {
    // Ensure we have at least the default statuses
    return {
        ...DEFAULT_STATUSES,
        ...(statusCols && Array.isArray(statusCols) && statusCols.length > 0
            ? Object.fromEntries(statusCols.map(col => [col.id.toUpperCase(), col.id]))
            : {})
    };
};

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [deletedTasks, setDeletedTasks] = useState([]);
    const [statusColumns, setStatusColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [timeFilter, setTimeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');

    // Calculate STATUSES from statusColumns
    const STATUSES = useMemo(() => computeStatuses(statusColumns), [statusColumns]);

    // Load tasks from Electron store on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                console.log("Loading data...");

                // Define default columns
                const defaultColumns = [
                    { id: DEFAULT_STATUSES.TODO, name: 'To Do', icon: 'list', color: 'blue' },
                    { id: DEFAULT_STATUSES.IN_PROGRESS, name: 'In Progress', icon: 'clock', color: 'orange' },
                    { id: DEFAULT_STATUSES.COMPLETED, name: 'Completed', icon: 'check-circle', color: 'green' }
                ];

                // Check if we are in Electron environment
                if (window.electronAPI) {
                    const storedTasks = await window.electronAPI.getTasks();
                    setTasks(storedTasks);

                    const storedDeletedTasks = await window.electronAPI.getDeletedTasks();
                    setDeletedTasks(storedDeletedTasks || []);

                    try {
                        const storedColumns = await window.electronAPI.getStatusColumns();
                        console.log("Stored columns:", storedColumns);

                        if (storedColumns && Array.isArray(storedColumns) && storedColumns.length > 0) {
                            // Ensure default columns are always present
                            const hasDefaultColumns = defaultColumns.every(defaultCol =>
                                storedColumns.some(col => col.id === defaultCol.id)
                            );

                            if (hasDefaultColumns) {
                                setStatusColumns(storedColumns);
                            } else {
                                // Add missing default columns
                                const mergedColumns = [...storedColumns];
                                defaultColumns.forEach(defaultCol => {
                                    if (!mergedColumns.some(col => col.id === defaultCol.id)) {
                                        mergedColumns.push(defaultCol);
                                    }
                                });
                                setStatusColumns(mergedColumns);
                                await window.electronAPI.saveStatusColumns(mergedColumns);
                            }
                        } else {
                            // Initialize with default columns
                            setStatusColumns(defaultColumns);
                            await window.electronAPI.saveStatusColumns(defaultColumns);
                        }
                    } catch (err) {
                        console.error("Error loading status columns:", err);
                        setStatusColumns(defaultColumns);
                        await window.electronAPI.saveStatusColumns(defaultColumns);
                    }
                } else {
                    // Fallback for development in browser
                    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                    setTasks(storedTasks);

                    const storedDeletedTasks = JSON.parse(localStorage.getItem('deletedTasks') || '[]');
                    setDeletedTasks(storedDeletedTasks);

                    try {
                        const storedColumnsString = localStorage.getItem('statusColumns');
                        console.log("Stored columns string:", storedColumnsString);

                        const storedColumns = storedColumnsString ? JSON.parse(storedColumnsString) : [];
                        console.log("Parsed stored columns:", storedColumns);

                        if (Array.isArray(storedColumns) && storedColumns.length > 0) {
                            // Ensure default columns are always present
                            const hasDefaultColumns = defaultColumns.every(defaultCol =>
                                storedColumns.some(col => col.id === defaultCol.id)
                            );

                            if (hasDefaultColumns) {
                                setStatusColumns(storedColumns);
                            } else {
                                // Add missing default columns
                                const mergedColumns = [...storedColumns];
                                defaultColumns.forEach(defaultCol => {
                                    if (!mergedColumns.some(col => col.id === defaultCol.id)) {
                                        mergedColumns.push(defaultCol);
                                    }
                                });
                                setStatusColumns(mergedColumns);
                                localStorage.setItem('statusColumns', JSON.stringify(mergedColumns));
                            }
                        } else {
                            // Initialize with default columns
                            setStatusColumns(defaultColumns);
                            localStorage.setItem('statusColumns', JSON.stringify(defaultColumns));
                        }
                    } catch (err) {
                        console.error("Error parsing stored columns:", err);
                        setStatusColumns(defaultColumns);
                        localStorage.setItem('statusColumns', JSON.stringify(defaultColumns));
                    }
                }

                console.log("Status columns after loading:", statusColumns);
            } catch (err) {
                console.error("Failed to load data:", err);
                setError('Failed to load data: ' + err.message);
                showToast('Failed to load data', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Save status columns whenever they change
    useEffect(() => {
        const saveColumns = async () => {
            try {
                if (window.electronAPI) {
                    await window.electronAPI.saveStatusColumns(statusColumns);
                } else {
                    localStorage.setItem('statusColumns', JSON.stringify(statusColumns));
                }
            } catch (err) {
                setError('Failed to save status columns: ' + err.message);
                showToast('Failed to save status columns', 'error');
            }
        };

        // Skip initial load
        if (!isLoading && statusColumns.length > 0) {
            saveColumns();
        }
    }, [statusColumns, isLoading]);

    // Save tasks to store whenever tasks change
    useEffect(() => {
        const saveTasks = async () => {
            try {
                if (window.electronAPI) {
                    await window.electronAPI.saveTasks(tasks);
                    await window.electronAPI.saveDeletedTasks(deletedTasks);
                } else {
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
                }
            } catch (err) {
                setError('Failed to save tasks: ' + err.message);
                showToast('Failed to save tasks', 'error');
            }
        };

        // Skip initial load
        if (!isLoading) {
            saveTasks();
        }
    }, [tasks, deletedTasks, isLoading]);

    // Show toast message
    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Get all available task labels currently in use
    const getAvailableLabels = () => {
        const labelsSet = new Set();
        tasks.forEach(task => {
            if (task.labels && Array.isArray(task.labels)) {
                task.labels.forEach(label => labelsSet.add(label));
            }
        });
        return Array.from(labelsSet);
    };

    // Get filtered tasks based on various criteria
    const getFilteredTasks = (status = null, priority = null) => {
        let filtered = [...tasks];

        // Filter by status if provided
        if (status) {
            filtered = filtered.filter(task => task.status === status);
        }

        // Filter by priority if provided
        if (priority) {
            filtered = filtered.filter(task => task.priority === priority);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(term) ||
                task.description?.toLowerCase().includes(term)
            );
        }

        // Filter by selected labels
        if (selectedLabels.length > 0) {
            filtered = filtered.filter(task =>
                selectedLabels.every(label => task.labels?.includes(label))
            );
        }

        // Filter by time
        if (timeFilter !== 'all') {
            const now = new Date();
            const weekFromNow = new Date(now);
            weekFromNow.setDate(now.getDate() + 7);
            const monthFromNow = new Date(now);
            monthFromNow.setMonth(now.getMonth() + 1);

            filtered = filtered.filter(task => {
                if (!task.dueDate) return false;
                const dueDate = new Date(task.dueDate);
                switch (timeFilter) {
                    case 'today':
                        return dueDate.toDateString() === now.toDateString();
                    case 'week':
                        return dueDate <= weekFromNow;
                    case 'month':
                        return dueDate <= monthFromNow;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    };

    // Add a new task
    const addTask = async (task) => {
        try {
            const newTask = {
                id: uuidv4(),
                createdAt: new Date().toISOString(),
                status: STATUSES.TODO,
                labels: [],
                ...task,
            };

            if (window.electronAPI) {
                const updatedTasks = await window.electronAPI.addTask(newTask);
                setTasks(updatedTasks);
            } else {
                setTasks((prev) => [...prev, newTask]);
            }

            showToast('Task added successfully', 'success');
            return newTask;
        } catch (err) {
            setError('Failed to add task: ' + err.message);
            showToast('Failed to add task', 'error');
            throw err;
        }
    };

    // Update an existing task
    const updateTask = async (id, updates) => {
        try {
            if (window.electronAPI) {
                const updatedTasks = await window.electronAPI.updateTask(id, updates);
                setTasks(updatedTasks);
            } else {
                setTasks((prev) =>
                    prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
                );
            }

            showToast('Task updated successfully', 'success');
        } catch (err) {
            setError('Failed to update task: ' + err.message);
            showToast('Failed to update task', 'error');
            throw err;
        }
    };

    // Mark a task as completed
    const completeTask = async (id) => {
        try {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const updates = {
                status: STATUSES.COMPLETED,
                completedAt: new Date().toISOString()
            };

            await updateTask(id, updates);
            showToast('Task completed', 'success');
        } catch (err) {
            setError('Failed to complete task: ' + err.message);
            showToast('Failed to complete task', 'error');
            throw err;
        }
    };

    // Delete a task (move to trash)
    const deleteTask = async (id) => {
        try {
            const taskToDelete = tasks.find(task => task.id === id);

            if (window.electronAPI) {
                const updatedTasks = await window.electronAPI.deleteTask(id);
                setTasks(updatedTasks);

                // Add to deleted tasks
                const updatedDeletedTasks = await window.electronAPI.addDeletedTask({
                    ...taskToDelete,
                    deletedAt: new Date().toISOString()
                });
                setDeletedTasks(updatedDeletedTasks);
            } else {
                // Remove from tasks
                setTasks((prev) => prev.filter((task) => task.id !== id));

                // Add to deleted tasks
                setDeletedTasks(prev => [...prev, {
                    ...taskToDelete,
                    deletedAt: new Date().toISOString()
                }]);
            }

            showToast('Task moved to trash', 'success');
        } catch (err) {
            setError('Failed to delete task: ' + err.message);
            showToast('Failed to delete task', 'error');
            throw err;
        }
    };

    // Permanently delete a task
    const permanentlyDeleteTask = async (id) => {
        try {
            if (window.electronAPI) {
                const updatedDeletedTasks = await window.electronAPI.removeDeletedTask(id);
                setDeletedTasks(updatedDeletedTasks);
            } else {
                setDeletedTasks(prev => prev.filter(task => task.id !== id));
            }

            showToast('Task permanently deleted', 'success');
        } catch (err) {
            setError('Failed to permanently delete task: ' + err.message);
            showToast('Failed to permanently delete task', 'error');
        }
    };

    // Restore a task from trash
    const restoreTask = async (id) => {
        try {
            const taskToRestore = deletedTasks.find(task => task.id === id);
            if (!taskToRestore) return;

            // Remove the deletedAt property
            const { deletedAt: _, ...taskWithoutDeletedAt } = taskToRestore;

            if (window.electronAPI) {
                // Add back to tasks
                const updatedTasks = await window.electronAPI.addTask(taskWithoutDeletedAt);
                setTasks(updatedTasks);

                // Remove from deleted tasks
                const updatedDeletedTasks = await window.electronAPI.removeDeletedTask(id);
                setDeletedTasks(updatedDeletedTasks);
            } else {
                // Add back to tasks
                setTasks(prev => [...prev, taskWithoutDeletedAt]);

                // Remove from deleted tasks
                setDeletedTasks(prev => prev.filter(task => task.id !== id));
            }

            showToast('Task restored successfully', 'success');
        } catch (err) {
            setError('Failed to restore task: ' + err.message);
            showToast('Failed to restore task', 'error');
        }
    };

    // Add label to task
    const addLabelToTask = async (taskId, label) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const labels = [...(task.labels || [])];
            if (!labels.includes(label)) {
                labels.push(label);
                await updateTask(taskId, { labels });
                showToast(`Added label: ${label}`, 'success');
            }
        } catch (err) {
            setError('Failed to add label: ' + err.message);
            showToast('Failed to add label', 'error');
        }
    };

    // Remove label from task
    const removeLabelFromTask = async (taskId, label) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            if (!task || !task.labels) return;

            const labels = task.labels.filter(l => l !== label);
            await updateTask(taskId, { labels });
            showToast(`Removed label: ${label}`, 'success');
        } catch (err) {
            setError('Failed to remove label: ' + err.message);
            showToast('Failed to remove label', 'error');
        }
    };

    // Toggle label selection for filtering
    const toggleLabelSelection = (label) => {
        setSelectedLabels(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedLabels([]);
        setTimeFilter('all');
    };

    // Status columns management
    const addStatusColumn = async (columnData) => {
        try {
            const newColumn = {
                id: columnData.id || `status-${uuidv4().slice(0, 8)}`,
                name: columnData.name,
                icon: columnData.icon || 'tag',
                color: columnData.color || 'gray',
                createdAt: new Date().toISOString(),
            };

            if (window.electronAPI) {
                const updatedColumns = await window.electronAPI.addStatusColumn(newColumn);
                setStatusColumns(updatedColumns);
            } else {
                setStatusColumns(prev => [...prev, newColumn]);
            }

            showToast('Status column added successfully', 'success');
            return newColumn;
        } catch (err) {
            setError('Failed to add status column: ' + err.message);
            showToast('Failed to add status column', 'error');
            throw err;
        }
    };

    const updateStatusColumn = async (id, updates) => {
        try {
            if (window.electronAPI) {
                const updatedColumns = await window.electronAPI.updateStatusColumn(id, updates);
                setStatusColumns(updatedColumns);
            } else {
                setStatusColumns(prev =>
                    prev.map(column => (column.id === id ? { ...column, ...updates } : column))
                );
            }

            showToast('Status column updated successfully', 'success');
        } catch (err) {
            setError('Failed to update status column: ' + err.message);
            showToast('Failed to update status column', 'error');
            throw err;
        }
    };

    const deleteStatusColumn = async (id) => {
        try {
            // Don't allow deleting if column has tasks
            const tasksInColumn = tasks.filter(task => task.status === id);
            if (tasksInColumn.length > 0) {
                showToast('Cannot delete column with tasks. Move tasks first.', 'error');
                throw new Error('Column has tasks');
            }

            if (window.electronAPI) {
                const updatedColumns = await window.electronAPI.deleteStatusColumn(id);
                setStatusColumns(updatedColumns);
            } else {
                setStatusColumns(prev => prev.filter(column => column.id !== id));
            }

            showToast('Status column deleted successfully', 'success');
        } catch (err) {
            setError('Failed to delete status column: ' + err.message);
            showToast('Failed to delete status column', 'error');
            throw err;
        }
    };

    // Get status columns that the user can add/modify/delete
    const getCustomizableColumns = () => {
        // Return all columns except the default ones that shouldn't be modified
        return statusColumns.filter(col =>
            !(col.id === DEFAULT_STATUSES.TODO ||
                col.id === DEFAULT_STATUSES.IN_PROGRESS ||
                col.id === DEFAULT_STATUSES.COMPLETED)
        );
    };

    // The context value
    const value = {
        tasks,
        deletedTasks,
        statusColumns,
        isLoading,
        error,
        toast,
        searchTerm,
        selectedLabels,
        timeFilter,
        viewMode,
        setSearchTerm,
        setTimeFilter,
        setViewMode,
        addTask,
        updateTask,
        completeTask,
        deleteTask,
        permanentlyDeleteTask,
        restoreTask,
        getFilteredTasks,
        getAvailableLabels,
        addLabelToTask,
        removeLabelFromTask,
        toggleLabelSelection,
        clearFilters,
        showToast,
        STATUSES,
        PRIORITIES,
        addStatusColumn,
        updateStatusColumn,
        deleteStatusColumn,
        getCustomizableColumns,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}; 