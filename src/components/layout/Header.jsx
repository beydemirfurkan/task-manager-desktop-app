import { FiCheckSquare } from 'react-icons/fi';

function Header({ title }) {
    return (
        <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center space-x-2">
                <FiCheckSquare className="h-5 w-5 text-indigo-600" />
                <h1 className="text-lg font-semibold text-gray-800 truncate">
                    {title || "Task Manager"}
                </h1>
            </div>
        </header>
    );
}

export default Header; 