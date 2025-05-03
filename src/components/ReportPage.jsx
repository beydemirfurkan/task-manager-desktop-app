import { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { FiPieChart, FiBarChart2, FiClock, FiCalendar, FiCheck, FiXCircle } from 'react-icons/fi';
import { motion as Motion } from 'framer-motion';

function ReportPage({ onClose }) {
    const { tasks, STATUSES, PRIORITIES } = useTaskContext();
    const [reportData, setReportData] = useState({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        priorityDistribution: {},
        statusDistribution: {},
        completionRate: 0,
        averageCompletionTime: 0,
    });

    useEffect(() => {
        if (tasks && tasks.length > 0) {
            const now = new Date();
            const completed = tasks.filter(task => task.status === STATUSES.COMPLETED);
            const inProgress = tasks.filter(task => task.status === STATUSES.IN_PROGRESS);
            const pending = tasks.filter(task => task.status !== STATUSES.COMPLETED && task.status !== STATUSES.IN_PROGRESS);
            const overdue = tasks.filter(task =>
                task.status !== STATUSES.COMPLETED &&
                task.dueDate &&
                new Date(task.dueDate) < now
            );

            // Priority distribution
            const priorityDist = {};
            Object.values(PRIORITIES).forEach(priority => {
                priorityDist[priority] = tasks.filter(task => task.priority === priority).length;
            });

            // Status distribution
            const statusDist = {};
            Object.values(STATUSES).forEach(status => {
                statusDist[status] = tasks.filter(task => task.status === status).length;
            });

            // Calculate completion rate
            const completionRate = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

            // Calculate average completion time (in days) for completed tasks
            let totalCompletionDays = 0;
            let tasksWithCompletionTime = 0;

            completed.forEach(task => {
                if (task.createdAt && task.completedAt) {
                    const createdDate = new Date(task.createdAt);
                    const completedDate = new Date(task.completedAt);
                    const diffTime = Math.abs(completedDate - createdDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    totalCompletionDays += diffDays;
                    tasksWithCompletionTime++;
                }
            });

            const avgCompletionTime = tasksWithCompletionTime > 0 ?
                (totalCompletionDays / tasksWithCompletionTime).toFixed(1) : 0;

            setReportData({
                totalTasks: tasks.length,
                completedTasks: completed.length,
                inProgressTasks: inProgress.length,
                pendingTasks: pending.length,
                overdueTasks: overdue.length,
                priorityDistribution: priorityDist,
                statusDistribution: statusDist,
                completionRate: completionRate.toFixed(1),
                averageCompletionTime: avgCompletionTime,
            });
        }
    }, [tasks, STATUSES, PRIORITIES]);

    const TaskDistributionCard = ({ title, icon: Icon, value, total, color }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {total > 0 && (
                        <p className="ml-2 text-sm text-gray-500">
                            {Math.round((value / total) * 100)}%
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
            <Motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-medium">Task Report</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FiXCircle className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4">
                    {tasks.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">No tasks available to generate a report.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FiBarChart2 className="mr-2 h-4 w-4" />
                                        Task Overview
                                    </h3>
                                    <div className="text-3xl font-bold text-gray-900">
                                        {reportData.totalTasks}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Total Tasks
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <div className="text-green-600 font-medium">
                                                {reportData.completedTasks}
                                            </div>
                                            <div className="text-gray-500">Completed</div>
                                        </div>
                                        <div>
                                            <div className="text-yellow-500 font-medium">
                                                {reportData.inProgressTasks}
                                            </div>
                                            <div className="text-gray-500">In Progress</div>
                                        </div>
                                        <div>
                                            <div className="text-blue-500 font-medium">
                                                {reportData.pendingTasks}
                                            </div>
                                            <div className="text-gray-500">Pending</div>
                                        </div>
                                        <div>
                                            <div className="text-red-500 font-medium">
                                                {reportData.overdueTasks}
                                            </div>
                                            <div className="text-gray-500">Overdue</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FiPieChart className="mr-2 h-4 w-4" />
                                        Completion Rate
                                    </h3>
                                    <div className="flex items-center">
                                        <div className="relative w-20 h-20">
                                            <svg viewBox="0 0 36 36" className="w-full h-full">
                                                <path
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="#eee"
                                                    strokeWidth="3"
                                                />
                                                <path
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    fill="none"
                                                    stroke="#4f46e5"
                                                    strokeWidth="3"
                                                    strokeDasharray={`${reportData.completionRate}, 100`}
                                                />
                                            </svg>
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-semibold">
                                                {reportData.completionRate}%
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm text-gray-500">
                                                Average completion time
                                            </div>
                                            <div className="text-lg font-semibold flex items-center">
                                                {reportData.averageCompletionTime}
                                                <span className="text-sm text-gray-500 ml-1">days</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <TaskDistributionCard
                                    title="Completed Tasks"
                                    icon={FiCheck}
                                    value={reportData.completedTasks}
                                    total={reportData.totalTasks}
                                    color="bg-green-500"
                                />
                                <TaskDistributionCard
                                    title="In Progress Tasks"
                                    icon={FiClock}
                                    value={reportData.inProgressTasks}
                                    total={reportData.totalTasks}
                                    color="bg-yellow-500"
                                />
                                <TaskDistributionCard
                                    title="Overdue Tasks"
                                    icon={FiCalendar}
                                    value={reportData.overdueTasks}
                                    total={reportData.totalTasks}
                                    color="bg-red-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                                        Priority Distribution
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(reportData.priorityDistribution).map(([priority, count]) => (
                                            <div key={priority} className="flex items-center">
                                                <div className="w-24 text-xs text-gray-500">
                                                    {priority === PRIORITIES.HIGH ? 'High' :
                                                        priority === PRIORITIES.MEDIUM ? 'Medium' : 'Low'}
                                                </div>
                                                <div className="relative flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full ${priority === PRIORITIES.HIGH ? 'bg-red-500' :
                                                            priority === PRIORITIES.MEDIUM ? 'bg-yellow-500' : 'bg-blue-400'
                                                            }`}
                                                        style={{ width: `${reportData.totalTasks > 0 ? (count / reportData.totalTasks) * 100 : 0}%` }}
                                                    ></div>
                                                </div>
                                                <div className="w-10 text-right text-xs ml-2">
                                                    {count}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                                        Status Distribution
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.entries(reportData.statusDistribution).map(([status, count]) => {
                                            let statusName = status;
                                            let statusColor = 'bg-gray-400';

                                            if (status === STATUSES.COMPLETED) {
                                                statusName = 'Completed';
                                                statusColor = 'bg-green-500';
                                            } else if (status === STATUSES.IN_PROGRESS) {
                                                statusName = 'In Progress';
                                                statusColor = 'bg-yellow-500';
                                            } else if (status === STATUSES.TODO) {
                                                statusName = 'To Do';
                                                statusColor = 'bg-blue-500';
                                            }

                                            return (
                                                <div key={status} className="flex items-center">
                                                    <div className="w-24 text-xs text-gray-500">
                                                        {statusName}
                                                    </div>
                                                    <div className="relative flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`absolute top-0 left-0 h-full ${statusColor}`}
                                                            style={{ width: `${reportData.totalTasks > 0 ? (count / reportData.totalTasks) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="w-10 text-right text-xs ml-2">
                                                        {count}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </Motion.div>
        </Motion.div>
    );
}

export default ReportPage; 