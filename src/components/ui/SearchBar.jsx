import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function SearchBar({ onSearch }) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <motion.div
            className="relative w-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative flex items-center">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <FiSearch className="text-gray-400 h-4 w-4" />
                </div>
                <motion.input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={handleChange}
                    className="w-full py-2 pl-9 pr-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                />
                <AnimatePresence>
                    {searchTerm && (
                        <motion.button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiX className="h-4 w-4" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default SearchBar; 