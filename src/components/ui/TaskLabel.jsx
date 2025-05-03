import { FiTag, FiX } from 'react-icons/fi';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// Enhanced color palette with better contrast and more options
const labelColors = {
    work: 'bg-blue-50 text-blue-700 border-blue-200',
    personal: 'bg-purple-50 text-purple-700 border-purple-200',
    urgent: 'bg-red-50 text-red-700 border-red-200',
    idea: 'bg-green-50 text-green-700 border-green-200',
    meeting: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blocked: 'bg-orange-50 text-orange-700 border-orange-200',
    bug: 'bg-rose-50 text-rose-700 border-rose-200',
    feature: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    enhancement: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    design: 'bg-pink-50 text-pink-700 border-pink-200',
    documentation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    research: 'bg-violet-50 text-violet-700 border-violet-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200'
};

function TaskLabel({ label, onRemove, selectable = false, selected = false, onClick, small = false }) {
    // Try to match by word rather than exact match for better color assignment
    const getColorClass = () => {
        const labelLower = label.toLowerCase();

        // Try direct match first
        if (labelColors[labelLower]) {
            return labelColors[labelLower];
        }

        // Try partial match on keywords
        for (const [key, value] of Object.entries(labelColors)) {
            if (labelLower.includes(key) && key !== 'default') {
                return value;
            }
        }

        // Fall back to default
        return labelColors.default;
    };

    const colorClass = getColorClass();
    const sizeClasses = small
        ? 'text-[10px] px-1.5 py-0.5'
        : 'text-xs px-2 py-0.5';

    // Selectable variant (used in filters)
    if (selectable) {
        return (
            <Motion.button
                onClick={() => onClick && onClick(label)}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center ${sizeClasses} rounded-full border transition-colors ${colorClass} ${selected ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}`}
            >
                <FiTag className={`${small ? 'h-2.5 w-2.5 mr-0.5' : 'h-3 w-3 mr-1'}`} />
                <span className="font-medium">{label}</span>
            </Motion.button>
        );
    }

    // Read-only variant (used in card view)
    if (!onRemove) {
        return (
            <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
                className={`inline-flex items-center ${sizeClasses} rounded-full border ${colorClass}`}
            >
                <FiTag className={`${small ? 'h-2.5 w-2.5 mr-0.5' : 'h-3 w-3 mr-1'}`} />
                <span className="font-medium">{label}</span>
            </Motion.div>
        );
    }

    // Removable variant (used in detail modal)
    return (
        <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            whileHover={{ scale: 1.05 }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
            }}
            className={`inline-flex items-center ${sizeClasses} rounded-full border group ${colorClass} relative pr-4`}
        >
            <FiTag className={`${small ? 'h-2.5 w-2.5 mr-0.5' : 'h-3 w-3 mr-1'}`} />
            <span className="font-medium">{label}</span>
            <AnimatePresence>
                <Motion.button
                    onClick={() => onRemove(label)}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    whileHover={{
                        scale: 1.2,
                        backgroundColor: '#FEE2E2',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 border border-gray-200 shadow-sm text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove label"
                >
                    <FiX className={`${small ? 'h-2 w-2' : 'h-2.5 w-2.5'}`} />
                </Motion.button>
            </AnimatePresence>
        </Motion.div>
    );
}

export default TaskLabel; 