import { FiList, FiClock, FiCheckCircle, FiPlus, FiSettings } from 'react-icons/fi';
import { useTaskContext, DEFAULT_STATUSES } from '../../context/TaskContext';
import { motion } from 'framer-motion';

function MobileNavigation({ activeStatus, setActiveStatus, onAddTask, onOpenSettings }) {
    const { getFilteredTasks, statusColumns } = useTaskContext();

    // Define default columns in case statusColumns is empty
    const defaultColumns = [
        { id: DEFAULT_STATUSES.TODO, name: 'To Do', icon: 'list' },
        { id: DEFAULT_STATUSES.IN_PROGRESS, name: 'In Progress', icon: 'clock' },
        { id: DEFAULT_STATUSES.COMPLETED, name: 'Completed', icon: 'check-circle' }
    ];

    // Get the nav items from status columns
    const getNavItems = () => {
        console.log("Status columns in MobileNavigation:", statusColumns);

        // Use statusColumns if available, otherwise fall back to default columns
        const columnsToUse = statusColumns && statusColumns.length > 0
            ? statusColumns
            : defaultColumns;

        // Limit to maximum 4 items for mobile navigation
        return columnsToUse.slice(0, 4).map(column => ({
            id: column.id,
            label: column.name || 'Unknown',
            icon: getIconComponent(column.icon || 'list')
        }));
    };

    // Map icon strings to components
    const getIconComponent = (iconName) => {
        const iconMap = {
            'list': <FiList className="mobile-nav-icon" />,
            'clock': <FiClock className="mobile-nav-icon" />,
            'check-circle': <FiCheckCircle className="mobile-nav-icon" />
        };
        return iconMap[iconName] || <FiList className="mobile-nav-icon" />;
    };

    const navItems = getNavItems();

    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-10"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveStatus(item.id)}
                        className={`flex flex-col items-center justify-center px-3 py-2 text-xs rounded ${activeStatus === item.id
                            ? 'text-indigo-600 bg-indigo-50'
                            : 'text-gray-600'
                            }`}
                    >
                        {item.icon}
                        <span className="mt-1">{item.label}</span>
                        <span className={`text-xs bg-gray-100 px-1.5 rounded-full mt-1 ${activeStatus === item.id
                            ? 'text-indigo-600'
                            : 'text-gray-500'
                            }`}>
                            {getFilteredTasks(item.id).length}
                        </span>
                    </button>
                ))}

                <button
                    onClick={onOpenSettings}
                    className="flex flex-col items-center justify-center px-3 py-2 text-xs rounded text-gray-600"
                >
                    <FiSettings className="mobile-nav-icon" />
                    <span className="mt-1">Settings</span>
                </button>
            </div>
        </motion.div>
    );
}

export default MobileNavigation;

// Add this CSS to your global styles or create a component-specific CSS file
// .mobile-nav-icon { height: 1.25rem; width: 1.25rem; } 