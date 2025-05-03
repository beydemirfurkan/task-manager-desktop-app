import { useState, useRef, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiCheck } from 'react-icons/fi';
import TaskLabel from './TaskLabel';
import { motion, AnimatePresence } from 'framer-motion';

function FilterDropdown({
    availableLabels,
    selectedLabels,
    onLabelSelect,
    timeFilter,
    onTimeFilterChange
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const timeFilters = [
        { id: 'all', label: 'All Tasks' },
        { id: 'today', label: 'Due Today' },
        { id: 'week', label: 'Due This Week' },
        { id: 'overdue', label: 'Overdue' }
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-xs py-1.5 px-3 border rounded-md bg-white hover:bg-gray-50"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
                <FiFilter className="mr-1.5 h-3.5 w-3.5 text-gray-500" />
                <span>Filter</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <FiChevronDown className="ml-1.5 h-3.5 w-3.5 text-gray-500" />
                </motion.div>
                {(selectedLabels.length > 0 || timeFilter !== 'all') && (
                    <motion.span
                        className="ml-1.5 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                        {selectedLabels.length + (timeFilter !== 'all' ? 1 : 0)}
                    </motion.span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute right-0 mt-1 bg-white border rounded-md shadow-md z-10 w-56 py-1"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        <div className="px-3 py-2 border-b">
                            <h3 className="text-xs font-medium text-gray-700">Filter by date</h3>
                            <div className="mt-1.5 space-y-1">
                                {timeFilters.map(filter => (
                                    <motion.button
                                        key={filter.id}
                                        onClick={() => onTimeFilterChange(filter.id)}
                                        className="flex items-center w-full text-xs px-2 py-1 hover:bg-gray-100 rounded text-left"
                                        whileHover={{ x: 3 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span className="w-4">
                                            {timeFilter === filter.id && (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <FiCheck className="h-3.5 w-3.5 text-indigo-600" />
                                                </motion.div>
                                            )}
                                        </span>
                                        <span className="ml-2">{filter.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="px-3 py-2">
                            <h3 className="text-xs font-medium text-gray-700">Filter by label</h3>
                            <motion.div
                                className="mt-2 flex flex-wrap gap-1"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.05
                                        }
                                    }
                                }}
                                initial="hidden"
                                animate="show"
                            >
                                {availableLabels.map(label => (
                                    <motion.div
                                        key={label}
                                        variants={{
                                            hidden: { opacity: 0, y: 10 },
                                            show: { opacity: 1, y: 0 }
                                        }}
                                    >
                                        <TaskLabel
                                            label={label}
                                            selectable
                                            selected={selectedLabels.includes(label)}
                                            onClick={() => onLabelSelect(label)}
                                        />
                                    </motion.div>
                                ))}
                                {availableLabels.length === 0 && (
                                    <span className="text-xs text-gray-500">No labels available</span>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default FilterDropdown; 