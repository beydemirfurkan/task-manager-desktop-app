import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import TaskCard from './TaskCard';

export function SortableTaskItem({ id, task, onEdit, containerIds }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        active,
    } = useSortable({
        id,
        data: {
            type: 'task',
            task,
            // Allow dropping on the specified container IDs
            allowedDroppableContainers: containerIds,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        cursor: 'grab',
        position: 'relative',
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            data-is-dragging={isDragging}
            className={`${isDragging ? 'z-50' : ''}`}
        >
            <motion.div
                whileHover={{ scale: isDragging ? 1 : 1.02 }}
                whileTap={{ scale: isDragging ? 1 : 0.98 }}
                className="transform-none" // Prevent motion from conflicting with dnd transform
            >
                <TaskCard
                    task={task}
                    onEdit={onEdit}
                    view="board"
                />
            </motion.div>
        </div>
    );
} 