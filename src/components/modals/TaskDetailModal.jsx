import { useState, useEffect, useRef } from 'react';
import { FiX, FiCalendar, FiFlag, FiTag, FiTrash2, FiEdit2, FiSave, FiChevronLeft, FiFile, FiMic, FiMessageSquare, FiPaperclip } from 'react-icons/fi';
import { PRIORITIES, useTaskContext } from '../../context/TaskContext';
import TaskLabel from '../ui/TaskLabel';
import { AnimatePresence } from 'framer-motion';

function TaskDetailModal({ isOpen, onClose, task }) {
    const { updateTask, deleteTask } = useTaskContext();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: PRIORITIES.MEDIUM,
        labels: [],
        comments: []
    });
    const [newLabel, setNewLabel] = useState('');
    const [newComment, setNewComment] = useState('');
    const [commentAttachments, setCommentAttachments] = useState([]);
    const [isAddingLabel, setIsAddingLabel] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const commentFileInputRef = useRef(null);
    const commentsEndRef = useRef(null);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                priority: task.priority || PRIORITIES.MEDIUM,
                labels: task.labels || [],
                comments: task.comments || []
            });
            // Reset edit mode when task changes
            setIsEditMode(false);
            setIsDeleting(false);
        }
    }, [task]);

    // Scroll to bottom of comments when new comment is added
    useEffect(() => {
        if (commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [formData.comments]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateTask(task.id, formData);
            setIsEditMode(false);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDelete = async () => {
        if (isDeleting) {
            try {
                await deleteTask(task.id);
                onClose();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        } else {
            setIsDeleting(true);
            // Auto-clear confirmation after 3 seconds
            setTimeout(() => setIsDeleting(false), 3000);
        }
    };



    const addLabel = (label) => {
        if (!formData.labels.includes(label) && label.trim()) {
            setFormData(prev => ({
                ...prev,
                labels: [...prev.labels, label]
            }));
        }
        setNewLabel('');
        setIsAddingLabel(false);
    };

    const removeLabel = (label) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.filter(l => l !== label)
        }));
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const handleCommentAttachmentUpload = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => {
            const isImage = file.type.startsWith('image/');
            const isAudio = file.type.startsWith('audio/');

            return {
                id: Math.random().toString(36).substr(2, 9),
                url: URL.createObjectURL(file),
                name: file.name,
                type: file.type,
                fileType: isImage ? 'image' : isAudio ? 'audio' : 'file',
                createdAt: new Date().toISOString()
            };
        });

        setCommentAttachments(prev => [...prev, ...newAttachments]);
    };

    const removeCommentAttachment = (attachmentId) => {
        setCommentAttachments(prev => prev.filter(attachment => attachment.id !== attachmentId));
    };

    const addComment = async (e) => {
        e.preventDefault();
        if (newComment.trim() || commentAttachments.length > 0) {
            const comment = {
                id: Math.random().toString(36).substr(2, 9),
                text: newComment,
                createdAt: new Date().toISOString(),
                attachments: commentAttachments
            };

            // Update local state
            const updatedComments = [...formData.comments, comment];
            setFormData(prev => ({
                ...prev,
                comments: updatedComments
            }));

            // Persist data to database
            try {
                await updateTask(task.id, { comments: updatedComments });
                setNewComment('');
                setCommentAttachments([]);
            } catch (error) {
                console.error('Error saving comment:', error);
            }
        }
    };

    const removeComment = async (commentId) => {
        const updatedComments = formData.comments.filter(comment => comment.id !== commentId);
        setFormData(prev => ({
            ...prev,
            comments: updatedComments
        }));

        // Persist data to database
        try {
            await updateTask(task.id, { comments: updatedComments });
        } catch (error) {
            console.error('Error removing comment:', error);
        }
    };

    // Make sure changes are saved when closing modal
    const handleClose = async () => {
        // If there are unsaved changes and we're not in edit mode, save them
        if (!isEditMode) {
            try {
                // This ensures any changes are persisted
                await updateTask(task.id, formData);
            } catch (error) {
                console.error('Error saving task changes:', error);
            }
        }
        // Then close the modal
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                        <div className="flex items-center">
                            {isEditMode && (
                                <button
                                    onClick={toggleEditMode}
                                    className="mr-2 text-gray-500 hover:text-gray-700 p-1"
                                    title="Back to view mode"
                                >
                                    <FiChevronLeft className="h-5 w-5" />
                                </button>
                            )}
                            <h2 className="text-lg font-medium">
                                {isEditMode ? 'Edit Task' : 'Task Details'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-1">
                            {!isEditMode && (
                                <button
                                    onClick={toggleEditMode}
                                    className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                                    title="Edit Task"
                                >
                                    <FiEdit2 className="h-5 w-5" />
                                </button>
                            )}
                            {isEditMode && (
                                <button
                                    onClick={handleSubmit}
                                    className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                                    title="Save Changes"
                                >
                                    <FiSave className="h-5 w-5" />
                                </button>
                            )}
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                title="Close"
                            >
                                <FiX className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            {isEditMode ? (
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            ) : (
                                <h3 className="text-xl font-medium text-gray-900">{formData.title}</h3>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            {isEditMode ? (
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            ) : (
                                <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 min-h-[100px]">
                                    {formData.description ? (
                                        <p className="whitespace-pre-wrap">{formData.description}</p>
                                    ) : (
                                        <p className="text-gray-400 italic">No description provided</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiCalendar className="h-4 w-4 mr-1" />
                                        <span>Due Date</span>
                                    </div>
                                </label>
                                {isEditMode ? (
                                    <input
                                        type="date"
                                        id="dueDate"
                                        name="dueDate"
                                        value={formData.dueDate}
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                ) : (
                                    <div className="bg-gray-50 rounded-md p-2 text-sm">
                                        {formData.dueDate ? (
                                            <span className="text-gray-700">
                                                {new Date(formData.dueDate).toLocaleDateString()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">No due date</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <FiFlag className="h-4 w-4 mr-1" />
                                        <span>Priority</span>
                                    </div>
                                </label>
                                {isEditMode ? (
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value={PRIORITIES.LOW}>Low</option>
                                        <option value={PRIORITIES.MEDIUM}>Medium</option>
                                        <option value={PRIORITIES.HIGH}>High</option>
                                    </select>
                                ) : (
                                    <div className="bg-gray-50 rounded-md p-2 text-sm flex items-center">
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${formData.priority === PRIORITIES.HIGH ? 'bg-red-500' :
                                            formData.priority === PRIORITIES.MEDIUM ? 'bg-yellow-500' :
                                                'bg-blue-500'
                                            }`}></span>
                                        <span className="text-gray-700">
                                            {formData.priority === PRIORITIES.HIGH ? 'High' :
                                                formData.priority === PRIORITIES.MEDIUM ? 'Medium' :
                                                    'Low'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FiTag className="h-4 w-4 mr-1" />
                                        <span>Labels</span>
                                    </div>
                                    {isEditMode && !isAddingLabel && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingLabel(true)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                        >
                                            + Add Label
                                        </button>
                                    )}
                                </div>
                            </label>

                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.labels.map(label => (
                                    <TaskLabel
                                        key={label}
                                        label={label}
                                        onRemove={isEditMode ? () => removeLabel(label) : null}
                                    />
                                ))}
                                {formData.labels.length === 0 && (
                                    <span className="text-sm text-gray-400 italic">No labels</span>
                                )}
                            </div>

                            {isEditMode && isAddingLabel && (
                                <div className="flex gap-2 mt-3">
                                    <input
                                        type="text"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        className="flex-1 border rounded-md px-3 py-1 text-sm"
                                        placeholder="Enter label"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addLabel(newLabel)}
                                        className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingLabel(false)}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div className="mt-6 pt-4 border-t">
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <FiMessageSquare className="h-4 w-4 mr-1" />
                                Comments & Attachments
                            </h3>

                            <div className="mb-4 max-h-64 overflow-y-auto">
                                {formData.comments && formData.comments.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {formData.comments.map(comment => (
                                            <div key={comment.id} className="bg-gray-50 p-3 rounded-md relative">
                                                {comment.text && (
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{comment.text}</p>
                                                )}

                                                {/* Comment Attachments */}
                                                {comment.attachments && comment.attachments.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 my-2">
                                                        {comment.attachments.map(attachment => (
                                                            <div key={attachment.id} className="bg-white rounded-md border p-2 max-w-full">
                                                                {attachment.fileType === 'image' ? (
                                                                    <div className="mb-1">
                                                                        <img
                                                                            src={attachment.url}
                                                                            alt={attachment.name}
                                                                            className="max-h-40 max-w-full object-contain rounded"
                                                                        />
                                                                    </div>
                                                                ) : attachment.fileType === 'audio' ? (
                                                                    <div className="mb-1">
                                                                        <p className="text-xs text-gray-500 mb-1">{attachment.name}</p>
                                                                        <audio controls className="w-full h-8">
                                                                            <source src={attachment.url} type={attachment.type} />
                                                                            Your browser does not support the audio element.
                                                                        </audio>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center">
                                                                        <FiFile className="h-4 w-4 text-gray-500 mr-2" />
                                                                        <a
                                                                            href={attachment.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-sm text-blue-600 hover:underline"
                                                                        >
                                                                            {attachment.name}
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center">
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(comment.createdAt).toLocaleString()}
                                                    </div>
                                                    {isEditMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeComment(comment.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <FiX className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={commentsEndRef} />
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No comments yet</p>
                                )}
                            </div>

                            {/* Add Comment Form */}
                            <div className="flex flex-col gap-3">
                                <textarea
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey && (newComment.trim() || commentAttachments.length > 0)) {
                                            e.preventDefault();
                                            addComment(e);
                                        }
                                    }}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[60px] resize-none"
                                />

                                {/* Comment Attachments Preview */}
                                {commentAttachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 py-2">
                                        {commentAttachments.map(attachment => (
                                            <div key={attachment.id} className="relative bg-gray-50 rounded-md p-2 max-w-[150px]">
                                                {attachment.fileType === 'image' ? (
                                                    <div className="relative w-full h-20">
                                                        <img
                                                            src={attachment.url}
                                                            alt={attachment.name}
                                                            className="h-full w-full object-cover rounded"
                                                        />
                                                    </div>
                                                ) : attachment.fileType === 'audio' ? (
                                                    <div className="flex items-center">
                                                        <FiMic className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-xs text-gray-700 truncate max-w-[100px]">
                                                            {attachment.name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <FiFile className="h-4 w-4 text-gray-500 mr-2" />
                                                        <span className="text-xs text-gray-700 truncate max-w-[100px]">
                                                            {attachment.name}
                                                        </span>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeCommentAttachment(attachment.id)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <FiX className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => commentFileInputRef.current?.click()}
                                            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                                            title="Attach files"
                                        >
                                            <FiPaperclip className="h-5 w-5" />
                                        </button>
                                        <input
                                            type="file"
                                            multiple
                                            className="hidden"
                                            ref={commentFileInputRef}
                                            onChange={handleCommentAttachmentUpload}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={addComment}
                                        disabled={!newComment.trim() && commentAttachments.length === 0}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                                    >
                                        <span className="flex items-center">
                                            <FiMessageSquare className="h-4 w-4 mr-1" />
                                            Comment
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t mt-6">
                            {isEditMode ? (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className={`flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${isDeleting
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'text-red-600 hover:bg-red-50'
                                        }`}
                                >
                                    <FiTrash2 className="h-4 w-4 mr-1" />
                                    {isDeleting ? 'Confirm Delete' : 'Delete Task'}
                                </button>
                            ) : (
                                <div></div>
                            )}

                            <div className="flex gap-2">
                                {isEditMode ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={toggleEditMode}
                                            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={toggleEditMode}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                                    >
                                        Edit Task
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AnimatePresence>
    );
}

export default TaskDetailModal; 