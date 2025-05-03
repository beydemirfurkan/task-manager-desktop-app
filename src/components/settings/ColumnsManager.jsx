import { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useTaskContext, DEFAULT_STATUSES } from '../../context/TaskContext';
import ColumnFormModal from '../modals/ColumnFormModal';

function ColumnsManager() {
    const { statusColumns, deleteStatusColumn } = useTaskContext();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingColumn, setEditingColumn] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Get icon component based on icon name
    const getIconComponent = (iconName) => {
        // This is a placeholder - we would need to import and map all possible icons
        // For now, we'll just return the name
        return iconName;
    };

    const handleAddColumn = () => {
        setIsAddModalOpen(true);
    };

    const handleEditColumn = (column) => {
        setEditingColumn(column);
        setIsEditModalOpen(true);
    };

    const handleDeleteColumn = async (column) => {
        if (confirmDelete === column.id) {
            try {
                await deleteStatusColumn(column.id);
                setConfirmDelete(null);
            } catch (error) {
                // Error handling is already done in the context
            }
        } else {
            setConfirmDelete(column.id);
            // Auto-reset confirmation after 3 seconds
            setTimeout(() => {
                setConfirmDelete(null);
            }, 3000);
        }
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingColumn(null);
    };

    // Filter out default columns that shouldn't be editable
    const customColumns = statusColumns.filter(column =>
        ![DEFAULT_STATUSES.TODO, DEFAULT_STATUSES.IN_PROGRESS, DEFAULT_STATUSES.COMPLETED]
            .includes(column.id)
    );

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Status Columns</h2>
                <button
                    onClick={handleAddColumn}
                    className="flex items-center text-sm bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
                >
                    <FiPlus className="mr-1" /> Add Column
                </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Show default columns (non-editable) */}
                        {statusColumns
                            .filter(column => [DEFAULT_STATUSES.TODO, DEFAULT_STATUSES.IN_PROGRESS, DEFAULT_STATUSES.COMPLETED].includes(column.id))
                            .map((column) => (
                                <tr key={column.id} className="bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="mr-2">{getIconComponent(column.icon)}</span>
                                            <span>{column.name}</span>
                                            <span className="ml-2 text-xs text-gray-500">(Default)</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {column.id}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-block h-4 w-4 rounded-full bg-${column.color}-500`}></span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        Default columns cannot be modified
                                    </td>
                                </tr>
                            ))}

                        {/* Show custom columns (editable) */}
                        {customColumns.length > 0 ? (
                            customColumns.map((column) => (
                                <motion.tr
                                    key={column.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="mr-2">{getIconComponent(column.icon)}</span>
                                            <span>{column.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {column.id}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-block h-4 w-4 rounded-full bg-${column.color}-500`}></span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditColumn(column)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            <FiEdit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteColumn(column)}
                                            className={`${confirmDelete === column.id
                                                    ? 'text-red-600 hover:text-red-900'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">
                                    No custom status columns added yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p>Custom columns will appear on your board view. Tasks can be dragged between columns to change their status.</p>
            </div>

            {/* Add column modal */}
            <ColumnFormModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
            />

            {/* Edit column modal */}
            <ColumnFormModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                editingColumn={editingColumn}
            />
        </div>
    );
}

export default ColumnsManager; 