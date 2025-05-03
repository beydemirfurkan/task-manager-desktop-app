import { FiList, FiGrid } from 'react-icons/fi';
import { motion } from 'framer-motion';

function ViewSwitcher({ currentView, onViewChange }) {
    return (
        <motion.div
            className="flex border rounded-md overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.button
                onClick={() => onViewChange('list')}
                className={`flex items-center px-3 py-1.5 text-xs ${currentView === 'list'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                whileHover={{ backgroundColor: currentView === 'list' ? "#e0e7ff" : "#f9fafb" }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <FiList className="mr-1 h-3.5 w-3.5" />
                </motion.div>
                <span>List</span>
            </motion.button>
            <motion.button
                onClick={() => onViewChange('board')}
                className={`flex items-center px-3 py-1.5 text-xs ${currentView === 'board'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                whileHover={{ backgroundColor: currentView === 'board' ? "#e0e7ff" : "#f9fafb" }}
                whileTap={{ scale: 0.95 }}
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <FiGrid className="mr-1 h-3.5 w-3.5" />
                </motion.div>
                <span>Board</span>
            </motion.button>
        </motion.div>
    );
}

export default ViewSwitcher; 