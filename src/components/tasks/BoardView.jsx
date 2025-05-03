import { useTaskContext } from '../../context/TaskContext';
import TaskCard from './TaskCard';
import { FiInbox, FiList, FiClock, FiCheckCircle, FiTag, FiFlag, FiCalendar, FiBox, FiStar, FiPlusCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef, useMemo } from 'react';
import {
    DndContext,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    pointerWithin,
    useDraggable,
    useDroppable
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// Map of icon strings to actual icon components
const iconMap = {
    'list': <FiList className="h-4 w-4 mr-2" />,
    'clock': <FiClock className="h-4 w-4 mr-2" />,
    'check-circle': <FiCheckCircle className="h-4 w-4 mr-2" />,
    'tag': <FiTag className="h-4 w-4 mr-2" />,
    'calendar': <FiCalendar className="h-4 w-4 mr-2" />,
    'flag': <FiFlag className="h-4 w-4 mr-2" />,
    'box': <FiBox className="h-4 w-4 mr-2" />,
    'star': <FiStar className="h-4 w-4 mr-2" />
};

// Column color styles
const columnColors = {
    'todo': 'bg-gray-50',
    'in_progress': 'bg-blue-50/30',
    'completed': 'bg-green-50/30',
    'default': 'bg-gray-50'
};

// Draggable task component
function DraggableTask({ task, onView }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        data: {
            type: 'Task',
            task
        }
    });

    return (
        <motion.div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${isDragging ? 'opacity-50 scale-95' : ''}`}
            whileTap={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <TaskCard
                task={task}
                onView={onView}
                view="board"
            />
        </motion.div>
    );
}

// Droppable column component
function DroppableColumn({ column, tasks, onViewTask }) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column
        }
    });

    // Get icon component for a column
    const getIconComponent = (iconName) => {
        return iconMap[iconName] || <FiTag className="h-4 w-4 mr-2" />;
    };

    // Get background style for column based on ID or default
    const getColumnBackground = (columnId) => {
        return columnColors[columnId] || columnColors.default;
    };

    return (
        <motion.div
            className={`rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 
                ${isOver ? 'ring-2 ring-indigo-400 shadow-md scale-[1.02]' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            layout
        >
            <div className="flex items-center justify-between p-3 border-b bg-white">
                <div className="flex items-center">
                    {getIconComponent(column.icon)}
                    <h3 className="font-medium text-sm">{column.name}</h3>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{tasks.length}</span>
            </div>

            <div
                ref={setNodeRef}
                className={`min-h-[220px] p-2 space-y-3 transition-colors ${getColumnBackground(column.id)} ${isOver ? 'bg-indigo-50/70' : ''}`}
                style={{
                    boxShadow: isOver ? 'inset 0 0 15px rgba(79, 70, 229, 0.1)' : 'none'
                }}
            >
                <AnimatePresence>
                    {tasks.map(task => (
                        <DraggableTask
                            key={task.id}
                            task={task}
                            onView={() => onViewTask(task)}
                        />
                    ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                    <motion.div
                        className="flex flex-col items-center justify-center text-gray-400 p-4 h-28"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <FiInbox className="h-6 w-6 mb-2" />
                        <p className="text-sm">No tasks</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

function BoardView({ onEditTask, onViewTask, priority }) {
    const { getFilteredTasks, isLoading, updateTask, statusColumns } = useTaskContext();
    const [activeId, setActiveId] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [activeColumn, setActiveColumn] = useState(null);

    // Configure mouse and touch sensors for better mobile experience
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 5, // Reduced distance for easier activation
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 150, // Reduced delay for quicker activation
            tolerance: 8, // Increased tolerance for easier dragging
        },
    });

    const sensors = useSensors(mouseSensor, touchSensor);

    // Get column IDs for drag and drop context
    const columnIds = useMemo(() => statusColumns.map(col => col.id), [statusColumns]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-32">
                <motion.div
                    className="rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
        );
    }

    // Handle drag start - set the active task
    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);

        // Set active task for the overlay
        if (active.data.current?.type === 'Task') {
            setActiveTask(active.data.current.task);
            // Find the column this task belongs to
            statusColumns.forEach(col => {
                const tasks = getFilteredTasks(col.id, priority);
                if (tasks.some(t => t.id === active.id)) {
                    setActiveColumn(col.id);
                }
            });
        }
    };

    // Handle drag end - update task status
    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setActiveTask(null);
            setActiveColumn(null);
            return;
        }

        // If dragging a task and dropping over a column
        if (active.data.current?.type === 'Task' &&
            over.data.current?.type === 'Column') {

            // Update task status to the target column ID
            updateTask(active.id, { status: over.id });
        }

        setActiveId(null);
        setActiveTask(null);
        setActiveColumn(null);
    };

    // Customize drop animation
    const dropAnimation = {
        duration: 250,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-1">
                {statusColumns.map(column => {
                    const tasks = getFilteredTasks(column.id, priority);
                    return (
                        <DroppableColumn
                            key={column.id}
                            column={column}
                            tasks={tasks}
                            onViewTask={onViewTask}
                        />
                    );
                })}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask && (
                    <motion.div
                        className="opacity-95 pointer-events-none cursor-grabbing transform scale-105 shadow-2xl rounded-lg z-50"
                        animate={{
                            scale: 1.05,
                            boxShadow: "0 20px 30px rgba(0, 0, 0, 0.15)",
                            rotate: ['0deg', '0.5deg', '-0.5deg', '0deg'],
                            transition: {
                                rotate: {
                                    repeat: Infinity,
                                    duration: 1.5
                                }
                            }
                        }}
                    >
                        <TaskCard
                            task={activeTask}
                            onView={() => { }} // Disable view while dragging
                            view="board"
                        />
                    </motion.div>
                )}
            </DragOverlay>
        </DndContext>
    );
}

export default BoardView; 