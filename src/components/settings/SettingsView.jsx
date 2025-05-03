import { useState } from 'react';
import { FiX, FiSettings, FiColumns, FiGrid } from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';
import ColumnsManager from './ColumnsManager';

function SettingsView({ onClose }) {
    const [activeTab, setActiveTab] = useState('columns');

    const tabs = [
        { id: 'columns', label: 'Status Columns', icon: <FiColumns className="h-4 w-4 mr-2" /> },
        { id: 'appearance', label: 'Appearance', icon: <FiGrid className="h-4 w-4 mr-2" /> },
    ];

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
                className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center">
                        <FiSettings className="h-5 w-5 mr-2 text-indigo-600" />
                        <h2 className="text-lg font-medium">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 border-r bg-gray-50">
                        <nav className="p-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm mb-1 ${activeTab === tab.id
                                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {activeTab === 'columns' && (
                            <ColumnsManager />
                        )}
                        {activeTab === 'appearance' && (
                            <div className="bg-white rounded-lg shadow p-4">
                                <h3 className="text-lg font-medium mb-4">Appearance Settings</h3>
                                <p className="text-gray-500">Appearance settings will be added in a future update.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Motion.div>
        </Motion.div>
    );
}

export default SettingsView; 