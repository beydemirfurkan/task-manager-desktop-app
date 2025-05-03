import { useState } from 'react';
import { FiTrash2, FiRefreshCw, FiAlertCircle, FiX } from 'react-icons/fi';
import { useTaskContext } from '../../context/TaskContext';
import { AnimatePresence, motion as Motion } from 'framer-motion';

function TrashView({ onClose }) {
    const { deletedTasks, restoreTask, permanentlyDeleteTask } = useTaskContext();
    const [confirmingId, setConfirmingId] = useState(null);

    // Format the deletion date
    const formatDeletionDate = (isoString) => {
        if (!isoString) return 'Unknown';
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Handle permanent deletion with confirmation
    const handleDelete = (id) => {
        if (confirmingId === id) {
            permanentlyDeleteTask(id);
            setConfirmingId(null);
        } else {
            setConfirmingId(id);
            // Auto-clear confirmation after 3 seconds
            setTimeout(() => setConfirmingId(null), 3000);
        }
    };

    return (
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
                className="bg-white rounded-lg shadow-lg overflow-hidden max-w-lg w-full"
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-800 flex items-center">
                        <FiTrash2 className="mr-2 h-5 w-5" />
                        Trash
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-2 max-h-96 overflow-y-auto">
                    {deletedTasks.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            <FiTrash2 className="mx-auto h-8 w-8 mb-2" />
                            <p>Trash is empty</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {deletedTasks.map(task => (
                                <Motion.li
                                    key={task.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-3 hover:bg-gray-50"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-800 truncate">{task.title}</h3>
                                            {task.description && (
                                                <p className="text-xs text-gray-500 truncate">{task.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                Deleted on {formatDeletionDate(task.deletedAt)}
                                            </p>
                                        </div>

                                        <div className="flex space-x-2 ml-2">
                                            <button
                                                onClick={() => restoreTask(task.id)}
                                                className="p-1 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                title="Restore task"
                                            >
                                                <FiRefreshCw className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className={`p-1 rounded-full ${confirmingId === task.id
                                                    ? 'bg-red-500 text-white'
                                                    : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                                    }`}
                                                title={confirmingId === task.id ? 'Click again to permanently delete' : 'Delete permanently'}
                                            >
                                                {confirmingId === task.id ? (
                                                    <FiAlertCircle className="h-4 w-4" />
                                                ) : (
                                                    <FiTrash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </Motion.li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
                    Items in trash will be automatically deleted after 30 days
                </div>
            </Motion.div>
        </Motion.div>
    );
}

export default TrashView; 