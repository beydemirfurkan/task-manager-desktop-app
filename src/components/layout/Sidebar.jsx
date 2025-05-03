import { FiCheckCircle, FiClock, FiList, FiPlus, FiTrash2, FiSettings } from 'react-icons/fi';
import { useTaskContext, DEFAULT_STATUSES } from '../../context/TaskContext';

function Sidebar({ onAddTask, activeStatus, setActiveStatus, onOpenTrash, onOpenSettings }) {
    const { getFilteredTasks, statusColumns } = useTaskContext();

    // Define default columns in case statusColumns is empty
    const defaultColumns = [
        { id: DEFAULT_STATUSES.TODO, name: 'To Do', icon: 'list' },
        { id: DEFAULT_STATUSES.IN_PROGRESS, name: 'In Progress', icon: 'clock' },
        { id: DEFAULT_STATUSES.COMPLETED, name: 'Completed', icon: 'check-circle' }
    ];

    // Get status item with icon based on the statusColumns
    const getStatusItems = () => {
        console.log("Status columns in Sidebar:", statusColumns);

        // Use statusColumns if available, otherwise fall back to default columns
        const columnsToUse = statusColumns && statusColumns.length > 0
            ? statusColumns
            : defaultColumns;

        return columnsToUse.map(column => ({
            id: column.id,
            label: column.name || 'Unknown',
            // The icon is rendered dynamically based on column.icon in the JSX
            icon: column.icon || 'list'
        }));
    };

    // Map of icon strings to actual icon components
    const getIconComponent = (iconName) => {
        const iconMap = {
            'list': <FiList className="h-5 w-5" />,
            'clock': <FiClock className="h-5 w-5" />,
            'check-circle': <FiCheckCircle className="h-5 w-5" />
        };
        return iconMap[iconName] || <FiList className="h-5 w-5" />;
    };

    return (
        <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen flex flex-col">
            <div className="p-4">
                <button
                    onClick={onAddTask}
                    className="btn btn-primary w-full flex items-center justify-center space-x-2"
                >
                    <FiPlus className="h-5 w-5" />
                    <span>Add Task</span>
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto">
                <ul className="px-2">
                    {getStatusItems().map((item) => (
                        <li key={item.id} className="mb-1">
                            <button
                                onClick={() => setActiveStatus(item.id)}
                                className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${activeStatus === item.id
                                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {getIconComponent(item.icon)}
                                <span className="ml-3">{item.label}</span>
                                <span className="ml-auto bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5">
                                    {getFilteredTasks(item.id).length}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <ul>
                    <li className="mb-1">
                        <button
                            onClick={onOpenSettings}
                            className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <FiSettings className="h-5 w-5" />
                            <span className="ml-3">Settings</span>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={onOpenTrash}
                            className="w-full flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <FiTrash2 className="h-5 w-5" />
                            <span className="ml-3">Trash</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar; 