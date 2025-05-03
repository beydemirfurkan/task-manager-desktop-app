import { useState, useEffect } from 'react';
import { FiCalendar, FiX, FiFlag, FiTag } from 'react-icons/fi';
import { PRIORITIES, AVAILABLE_LABELS, useTaskContext } from '../../context/TaskContext';
import TaskLabel from '../ui/TaskLabel';
import { AnimatePresence, motion as Motion } from 'framer-motion';

function TaskFormModal({ isOpen, onClose, task = null }) {
    const { addTask, updateTask, getAvailableLabels } = useTaskContext();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: PRIORITIES.MEDIUM,
        labels: [],
    });
    const [newLabel, setNewLabel] = useState('');
    const [isAddingLabel, setIsAddingLabel] = useState(false);

    // Get available labels from existing tasks and predefined labels
    const availableLabels = [...new Set([
        ...AVAILABLE_LABELS,
        ...getAvailableLabels()
    ])];

    // Populate form when editing an existing task
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                priority: task.priority || PRIORITIES.MEDIUM,
                labels: task.labels || [],
            });
        } else {
            // Reset form when adding a new task
            setFormData({
                title: '',
                description: '',
                dueDate: '',
                priority: PRIORITIES.MEDIUM,
                labels: [],
            });
        }
    }, [task]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (task) {
                // Update existing task
                await updateTask(task.id, formData);
            } else {
                // Add new task
                await addTask(formData);
            }
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    // Add a label to the task
    const addLabel = (label) => {
        if (!formData.labels.includes(label)) {
            setFormData(prev => ({
                ...prev,
                labels: [...prev.labels, label]
            }));
        }
        setNewLabel('');
        setIsAddingLabel(false);
    };

    // Remove a label from the task
    const removeLabel = (label) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.filter(l => l !== label)
        }));
    };

    // Handle adding a custom label
    const handleAddCustomLabel = (e) => {
        e.preventDefault();
        if (newLabel.trim()) {
            addLabel(newLabel.trim());
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
            >
                <Motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-lg shadow-lg w-full max-w-md"
                >
                    <div className="flex justify-between items-center p-3 border-b">
                        <h2 className="text-base font-medium">
                            {task ? 'Edit Task' : 'New Task'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 p-1"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-3">
                        <div className="mb-3">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="What needs to be done?"
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="2"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Add details (optional)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiCalendar className="h-4 w-4 mr-1" />
                                        <span>Due Date</span>
                                    </div>
                                </label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiFlag className="h-4 w-4 mr-1" />
                                        <span>Priority</span>
                                    </div>
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value={PRIORITIES.LOW}>Low</option>
                                    <option value={PRIORITIES.MEDIUM}>Medium</option>
                                    <option value={PRIORITIES.HIGH}>High</option>
                                </select>
                            </div>
                        </div>

                        {/* Labels section */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FiTag className="h-4 w-4 mr-1" />
                                        <span>Labels</span>
                                    </div>
                                    {!isAddingLabel && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingLabel(true)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                        >
                                            + Add Label
                                        </button>
                                    )}
                                </div>
                            </label>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.labels.map(label => (
                                    <TaskLabel
                                        key={label}
                                        label={label}
                                        onRemove={removeLabel}
                                    />
                                ))}
                                {formData.labels.length === 0 && !isAddingLabel && (
                                    <span className="text-xs text-gray-500">No labels added yet</span>
                                )}
                            </div>

                            {isAddingLabel && (
                                <div>
                                    {/* Show available labels */}
                                    {availableLabels.length > 0 && (
                                        <div className="mb-2">
                                            <div className="text-xs text-gray-500 mb-1">Available Labels:</div>
                                            <div className="flex flex-wrap gap-1">
                                                {availableLabels
                                                    .filter(label => !formData.labels.includes(label))
                                                    .map(label => (
                                                        <button
                                                            key={label}
                                                            type="button"
                                                            onClick={() => addLabel(label)}
                                                            className="text-xs px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100"
                                                        >
                                                            {label}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )}

                                    {/* Custom label input */}
                                    <form onSubmit={handleAddCustomLabel} className="flex items-center">
                                        <input
                                            type="text"
                                            value={newLabel}
                                            onChange={(e) => setNewLabel(e.target.value)}
                                            placeholder="New label name"
                                            className="flex-1 text-xs border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="submit"
                                            className="ml-1 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingLabel(false)}
                                            className="ml-1 text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-3 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary py-1.5 px-3 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary py-1.5 px-3 text-sm"
                            >
                                {task ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </form>
                </Motion.div>
            </Motion.div>
        </AnimatePresence>
    );
}

export default TaskFormModal; 