import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiFlag, FiTag, FiImage, FiTrash2, FiEdit2, FiSave, FiChevronLeft } from 'react-icons/fi';
import { PRIORITIES, useTaskContext } from '../../context/TaskContext';
import TaskLabel from '../ui/TaskLabel';
import { motion, AnimatePresence } from 'framer-motion';

function TaskDetailModal({ isOpen, onClose, task }) {
    const { updateTask, deleteTask } = useTaskContext();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: PRIORITIES.MEDIUM,
        labels: [],
        images: []
    });
    const [newLabel, setNewLabel] = useState('');
    const [isAddingLabel, setIsAddingLabel] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                priority: task.priority || PRIORITIES.MEDIUM,
                labels: task.labels || [],
                images: task.images || []
            });
            // Reset edit mode when task changes
            setIsEditMode(false);
            setIsDeleting(false);
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateTask(task.id, formData);
            setIsEditMode(false);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDelete = async () => {
        if (isDeleting) {
            try {
                await deleteTask(task.id);
                onClose();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        } else {
            setIsDeleting(true);
            // Auto-clear confirmation after 3 seconds
            setTimeout(() => setIsDeleting(false), 3000);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
    };

    const removeImage = (imageId) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== imageId)
        }));
    };

    const addLabel = (label) => {
        if (!formData.labels.includes(label) && label.trim()) {
            setFormData(prev => ({
                ...prev,
                labels: [...prev.labels, label]
            }));
        }
        setNewLabel('');
        setIsAddingLabel(false);
    };

    const removeLabel = (label) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.filter(l => l !== label)
        }));
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                        <div className="flex items-center">
                            {isEditMode && (
                                <button
                                    onClick={toggleEditMode}
                                    className="mr-2 text-gray-500 hover:text-gray-700 p-1"
                                    title="Back to view mode"
                                >
                                    <FiChevronLeft className="h-5 w-5" />
                                </button>
                            )}
                            <h2 className="text-lg font-medium">
                                {isEditMode ? 'Edit Task' : 'Task Details'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-1">
                            {!isEditMode && (
                                <button
                                    onClick={toggleEditMode}
                                    className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                                    title="Edit Task"
                                >
                                    <FiEdit2 className="h-5 w-5" />
                                </button>
                            )}
                            {isEditMode && (
                                <button
                                    onClick={handleSubmit}
                                    className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                                    title="Save Changes"
                                >
                                    <FiSave className="h-5 w-5" />
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                title="Close"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            ) : (
                                <h3 className="text-xl font-medium text-gray-900">{formData.title}</h3>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            {isEditMode ? (
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            ) : (
                                <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 min-h-[100px]">
                                    {formData.description ? (
                                        <p className="whitespace-pre-wrap">{formData.description}</p>
                                    ) : (
                                        <p className="text-gray-400 italic">No description provided</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiCalendar className="h-4 w-4 mr-1" />
                                        <span>Due Date</span>
                                    </div>
                                </label>
                                {isEditMode ? (
                                    <input
                                        type="date"
                                        id="dueDate"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                ) : (
                                    <div className="bg-gray-50 rounded-md p-2 text-sm">
                                        {formData.dueDate ? (
                                            <span className="text-gray-700">
                                                {new Date(formData.dueDate).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">No due date</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiFlag className="h-4 w-4 mr-1" />
                                        <span>Priority</span>
                                    </div>
                                </label>
                                {isEditMode ? (
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
                                ) : (
                                    <div className="bg-gray-50 rounded-md p-2 text-sm flex items-center">
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${formData.priority === PRIORITIES.HIGH ? 'bg-red-500' :
                                            formData.priority === PRIORITIES.MEDIUM ? 'bg-yellow-500' :
                                                'bg-blue-500'
                                            }`}></span>
                                        <span className="text-gray-700">
                                            {formData.priority === PRIORITIES.HIGH ? 'High' :
                                                formData.priority === PRIORITIES.MEDIUM ? 'Medium' :
                                                    'Low'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FiTag className="h-4 w-4 mr-1" />
                                        <span>Labels</span>
                                    </div>
                                    {isEditMode && !isAddingLabel && (
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
                                        onRemove={isEditMode ? () => removeLabel(label) : null}
                                    />
                                ))}
                                {formData.labels.length === 0 && (
                                    <span className="text-sm text-gray-400 italic">No labels</span>
                                )}
                            </div>

                            {isEditMode && isAddingLabel && (
                                <div className="flex gap-2 mt-3">
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        className="flex-1 border rounded-md px-3 py-1 text-sm"
                                        placeholder="Enter label"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addLabel(newLabel)}
                                        className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingLabel(false)}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditMode && (
                            <div className="mb-4">
                                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiImage className="h-4 w-4 mr-1" />
                                        <span>Images</span>
                                    </div>
                                </label>
                                <input
                                    type="file"
                                    id="images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        )}

                        {formData.images && formData.images.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center">
                                        <FiImage className="h-4 w-4 mr-1" />
                                        <span>Attached Images</span>
                                    </div>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {formData.images.map(image => (
                                        <div key={image.id} className="relative rounded-md overflow-hidden">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-24 object-cover"
                                            />
                                            {isEditMode && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(image.id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <FiX className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t mt-6">
                            {isEditMode ? (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${isDeleting
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'text-red-600 hover:bg-red-50'
                                        }`}
                                >
                                    <FiTrash2 className="h-4 w-4 mr-1" />
                                    {isDeleting ? 'Confirm Delete' : 'Delete Task'}
                                </button>
                            ) : (
                                <div></div>
                            )}

                            <div className="flex gap-2">
                                {isEditMode ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={toggleEditMode}
                                            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={toggleEditMode}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                                    >
                                        Edit Task
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default TaskDetailModal; 