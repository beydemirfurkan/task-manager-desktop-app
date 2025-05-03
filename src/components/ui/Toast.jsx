import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const toastClasses = {
    success: 'bg-green-50 text-green-700 border-green-100',
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
};

const toastIcons = {
    success: <FiCheckCircle className="h-4 w-4 text-green-500" />,
    error: <FiAlertCircle className="h-4 w-4 text-red-500" />,
    info: <FiInfo className="h-4 w-4 text-blue-500" />,
};

function Toast({ show, message, type = 'info', onClose }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 300); // Match with transition duration

            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!show && !isVisible) return null;

    return (
        <div
            className={`fixed bottom-20 sm:bottom-4 left-1/2 transform -translate-x-1/2 max-w-xs w-full px-3 py-2 rounded-lg shadow-md border ${toastClasses[type]} transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
        >
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {toastIcons[type]}
                </div>
                <div className="ml-2 flex-1">
                    <p className="text-xs font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                    <FiX className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default Toast; 