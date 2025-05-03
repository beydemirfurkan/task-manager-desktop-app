import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import TaskCard from './TaskCard';
import { FiInbox } from 'react-icons/fi';
import { motion } from 'framer-motion';

function TaskList({ status, onViewTask, priority }) {
    const { getFilteredTasks, isLoading } = useTaskContext();
    const tasks = getFilteredTasks(status, priority);
    const [sortMethod, setSortMethod] = useState('newest'); // newest, oldest, due

    // Sort tasks based on the selected method
    const sortedTasks = [...tasks].sort((a, b) => {
        switch (sortMethod) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'due':
                // If no due date, place at the end
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            default:
                return 0;
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <motion.div
                    className="rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <motion.div
                className="bg-gray-50 rounded-lg p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <FiInbox className="h-8 w-8 mb-2" />
                    <p className="text-sm">No tasks found in this category</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {sortedTasks.map(task => (
                <TaskCard
                    key={task.id}
                    task={task}
                    onView={() => onViewTask(task)}
                    view="list"
                />
            ))}
        </motion.div>
    );
}

export default TaskList; 