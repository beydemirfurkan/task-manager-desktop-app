import { FiCheckSquare, FiBarChart2, FiPlus } from 'react-icons/fi';

function Header({ title, onAddTask, onOpenReport }) {
    return (
        <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center space-x-2">
                <FiCheckSquare className="h-5 w-5 text-indigo-600" />
                <h1 className="text-lg font-semibold text-gray-800 truncate">
                    {title || "Task Manager"}
                </h1>
            </div>
            <div className="flex items-center space-x-2">
                {onOpenReport && (
                    <button
                        onClick={onOpenReport}
                        className="flex items-center text-sm px-3 py-1.5 border rounded-md bg-white hover:bg-gray-50"
                        title="View Reports"
                    >
                        <FiBarChart2 className="h-4 w-4 mr-1 text-indigo-600" />
                        <span>Reports</span>
                    </button>
                )}
                {onAddTask && (
                    <button
                        onClick={onAddTask}
                        className="flex items-center text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        <FiPlus className="h-4 w-4 mr-1" />
                        <span>Add Task</span>
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header; 