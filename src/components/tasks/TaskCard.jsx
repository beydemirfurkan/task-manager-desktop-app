import { useState } from 'react';
import { FiCheckCircle, FiClock, FiCalendar, FiFlag } from 'react-icons/fi';
import { PRIORITIES, useTaskContext } from '../../context/TaskContext';
import TaskLabel from '../ui/TaskLabel';
import { motion } from 'framer-motion';

const priorityClasses = {
    [PRIORITIES.LOW]: 'bg-blue-50 text-blue-700 border border-blue-200',
    [PRIORITIES.MEDIUM]: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    [PRIORITIES.HIGH]: 'bg-red-50 text-red-700 border border-red-200',
};

const priorityLabels = {
    [PRIORITIES.LOW]: 'Low',
    [PRIORITIES.MEDIUM]: 'Medium',
    [PRIORITIES.HIGH]: 'High',
};

// Task status progress indicators
const statusProgress = {
    TODO: 0,
    IN_PROGRESS: 50,
    COMPLETED: 100
};

function TaskCard({ task, onView, view = 'list' }) {
    const { updateTask, completeTask, STATUSES } = useTaskContext();

    // Format the date
    const formatDate = (isoString) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Check if date is today
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }

        // Check if date is tomorrow
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }

        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    // Calculate if due date is overdue
    const isOverdue = () => {
        if (!task.dueDate || task.status === STATUSES.COMPLETED) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Get status icon
    const getStatusIcon = () => {
        switch (task.status) {
            case STATUSES.COMPLETED:
                return <FiCheckCircle className="h-3.5 w-3.5 text-green-500" />;
            case STATUSES.IN_PROGRESS:
                return <FiClock className="h-3.5 w-3.5 text-yellow-500" />;
            default:
                return null;
        }
    };

    // Get task progress value
    const getTaskProgress = () => {
        const status = task.status || 'TODO';
        return statusProgress[status] || 0;
    };

    // Handle task completion toggle
    const handleCompletionToggle = (e) => {
        e.stopPropagation(); // Prevent opening detail modal when toggling completion
        if (task.status === STATUSES.COMPLETED) {
            updateTask(task.id, { status: STATUSES.TODO, completedAt: null });
        } else {
            completeTask(task.id);
        }
    };

    // Get border style based on priority and status
    const getBorderStyle = () => {
        if (task.status === STATUSES.COMPLETED) {
            return 'border-l-4 border-l-green-400 bg-gray-50 opacity-85';
        } else if (task.priority === PRIORITIES.HIGH) {
            return 'border-l-4 border-l-red-400';
        } else if (task.priority === PRIORITIES.MEDIUM) {
            return 'border-l-4 border-l-yellow-400';
        } else {
            return 'border-l-4 border-l-blue-200';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{
                scale: 1.01,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={() => onView(task)}
            className={`bg-white rounded-lg relative transition-all duration-200 cursor-pointer ${getBorderStyle()} shadow-sm`}
        >
            {/* Task Progress Bar */}
            {task.status !== STATUSES.COMPLETED && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 rounded-t-lg overflow-hidden">
                    <motion.div
                        className={`h-full ${task.status === STATUSES.IN_PROGRESS ? 'bg-yellow-400' : 'bg-indigo-400'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${getTaskProgress()}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>
            )}

            <div className="p-3.5 sm:p-4">
                {/* Task header with title and actions */}
                <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                        <motion.label
                            className="inline-flex items-center cursor-pointer"
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCompletionToggle}
                        >
                            <input
                                type="checkbox"
                                checked={task.status === STATUSES.COMPLETED}
                                onChange={() => { }} // Controlled by click handler on the label
                                className="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                            />
                        </motion.label>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className={`text-sm font-medium pr-2 ${task.status === STATUSES.COMPLETED ? 'line-through text-gray-500' : 'text-gray-900'
                                }`}>
                                {task.title}
                                {getStatusIcon() && (
                                    <span className="ml-2 inline-flex items-center">{getStatusIcon()}</span>
                                )}
                            </h3>
                        </div>

                        {/* Note/Description section - simplified preview */}
                        {task.description && (
                            <div className="mt-2">
                                <div className="text-xs text-gray-500 mt-1.5 mb-2">
                                    <div className="line-clamp-2">{task.description}</div>
                                </div>
                            </div>
                        )}

                        {/* Task labels */}
                        {task.labels && task.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                                {task.labels.map(label => (
                                    <TaskLabel
                                        key={label}
                                        label={label}
                                        small
                                    />
                                ))}
                            </div>
                        )}

                        {/* Task metadata */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                            {task.dueDate && (
                                <div
                                    className={`inline-flex items-center px-2 py-1 rounded-full 
                                        ${isOverdue() ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100'}`}
                                >
                                    <FiCalendar className={`h-3 w-3 mr-1 ${isOverdue() ? 'text-red-500' : 'text-gray-500'}`} />
                                    <span className={isOverdue() ? 'text-red-700' : 'text-gray-700'}>
                                        {formatDate(task.dueDate)}
                                        {isOverdue() && ' (Overdue)'}
                                    </span>
                                </div>
                            )}

                            {task.priority && (
                                <div className={`inline-flex items-center px-2 py-1 rounded-full ${priorityClasses[task.priority]}`}>
                                    <FiFlag className="h-3 w-3 mr-1" />
                                    <span>{priorityLabels[task.priority]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default TaskCard; 