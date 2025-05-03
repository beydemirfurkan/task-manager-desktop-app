import { useState, useEffect } from 'react';
import { FiX, FiChevronDown, FiList, FiClock, FiCheckCircle, FiCalendar, FiBox, FiFlag, FiTag, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskContext, DEFAULT_STATUSES } from '../../context/TaskContext';

const AVAILABLE_ICONS = [
    { id: 'list', component: <FiList /> },
    { id: 'clock', component: <FiClock /> },
    { id: 'check-circle', component: <FiCheckCircle /> },
    { id: 'calendar', component: <FiCalendar /> },
    { id: 'box', component: <FiBox /> },
    { id: 'flag', component: <FiFlag /> },
    { id: 'tag', component: <FiTag /> },
    { id: 'star', component: <FiStar /> },
];

const AVAILABLE_COLORS = [
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'green', class: 'bg-green-500' },
    { id: 'red', class: 'bg-red-500' },
    { id: 'yellow', class: 'bg-yellow-500' },
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'pink', class: 'bg-pink-500' },
    { id: 'indigo', class: 'bg-indigo-500' },
    { id: 'gray', class: 'bg-gray-500' },
];

function ColumnFormModal({ isOpen, onClose, editingColumn = null }) {
    const { addStatusColumn, updateStatusColumn, statusColumns } = useTaskContext();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('tag');
    const [color, setColor] = useState('blue');
    const [idValue, setIdValue] = useState('');
    const [showIconDropdown, setShowIconDropdown] = useState(false);
    const [showColorDropdown, setShowColorDropdown] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!editingColumn;

    // Load column data if editing
    useEffect(() => {
        if (editingColumn) {
            setName(editingColumn.name || '');
            setIcon(editingColumn.icon || 'tag');
            setColor(editingColumn.color || 'blue');
            setIdValue(editingColumn.id || '');
        } else {
            setName('');
            setIcon('tag');
            setColor('blue');
            setIdValue('');
        }
    }, [editingColumn]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Input validation
        if (!name.trim()) {
            setError('Column name is required');
            return;
        }

        // Check if ID already exists (for new columns)
        const normalizedId = idValue.trim() ? idValue.trim().toLowerCase().replace(/\s+/g, '-') : name.toLowerCase().replace(/\s+/g, '-');

        if (!isEditing) {
            const existingColumn = statusColumns.find(col => col.id === normalizedId);
            if (existingColumn) {
                setError('A column with this ID already exists');
                return;
            }

            // Don't allow overriding default statuses
            if (Object.values(DEFAULT_STATUSES).includes(normalizedId)) {
                setError('This ID is reserved for default statuses');
                return;
            }
        }

        try {
            if (isEditing) {
                await updateStatusColumn(editingColumn.id, {
                    name,
                    icon,
                    color
                });
            } else {
                await addStatusColumn({
                    id: normalizedId,
                    name,
                    icon,
                    color
                });
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save column');
        }
    };

    const getIconComponent = (iconId) => {
        const iconObj = AVAILABLE_ICONS.find(i => i.id === iconId);
        return iconObj ? iconObj.component : <FiTag />;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
                className="bg-white rounded-lg shadow-lg w-full max-w-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium">
                        {isEditing ? 'Edit Status Column' : 'Add Status Column'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    {error && (
                        <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Column Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Review, Blocked, Testing"
                            autoFocus
                        />
                    </div>

                    {!isEditing && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Column ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={idValue}
                                onChange={(e) => setIdValue(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Auto-generated from name if empty"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Used as unique identifier, auto-generated if left empty
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Icon
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowIconDropdown(!showIconDropdown)}
                                className="w-full p-2 border rounded flex items-center justify-between focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <span className="flex items-center">
                                    {getIconComponent(icon)}
                                    <span className="ml-2">{icon}</span>
                                </span>
                                <FiChevronDown />
                            </button>

                            <AnimatePresence>
                                {showIconDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border p-2 max-h-52 overflow-y-auto"
                                    >
                                        <div className="grid grid-cols-4 gap-2">
                                            {AVAILABLE_ICONS.map((iconObj) => (
                                                <button
                                                    type="button"
                                                    key={iconObj.id}
                                                    onClick={() => {
                                                        setIcon(iconObj.id);
                                                        setShowIconDropdown(false);
                                                    }}
                                                    className={`p-2 flex items-center justify-center rounded hover:bg-gray-100 ${icon === iconObj.id ? 'bg-indigo-50 text-indigo-600' : ''
                                                        }`}
                                                >
                                                    {iconObj.component}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowColorDropdown(!showColorDropdown)}
                                className="w-full p-2 border rounded flex items-center justify-between focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <span className="flex items-center">
                                    <span className={`h-4 w-4 rounded-full ${AVAILABLE_COLORS.find(c => c.id === color)?.class || 'bg-blue-500'}`}></span>
                                    <span className="ml-2">{color}</span>
                                </span>
                                <FiChevronDown />
                            </button>

                            <AnimatePresence>
                                {showColorDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border p-2"
                                    >
                                        <div className="grid grid-cols-4 gap-2">
                                            {AVAILABLE_COLORS.map((colorObj) => (
                                                <button
                                                    type="button"
                                                    key={colorObj.id}
                                                    onClick={() => {
                                                        setColor(colorObj.id);
                                                        setShowColorDropdown(false);
                                                    }}
                                                    className={`p-2 flex flex-col items-center rounded hover:bg-gray-100 ${color === colorObj.id ? 'bg-gray-100' : ''
                                                        }`}
                                                >
                                                    <span className={`h-6 w-6 rounded-full ${colorObj.class}`}></span>
                                                    <span className="text-xs mt-1">{colorObj.id}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                            {isEditing ? 'Update Column' : 'Add Column'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default ColumnFormModal; 