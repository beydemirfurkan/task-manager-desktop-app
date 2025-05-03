import { useState, useEffect } from 'react'
import { TaskProvider, DEFAULT_STATUSES, useTaskContext } from './context/TaskContext'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import MobileNavigation from './components/layout/MobileNavigation'
import TaskList from './components/tasks/TaskList'
import BoardView from './components/tasks/BoardView'
import TaskFormModal from './components/modals/TaskFormModal'
import TaskDetailModal from './components/modals/TaskDetailModal'
import Toast from './components/ui/Toast'
import TrashView from './components/trash/TrashView'
import SettingsView from './components/settings/SettingsView'
import SearchBar from './components/ui/SearchBar'
import FilterDropdown from './components/ui/FilterDropdown'
import ViewSwitcher from './components/ui/ViewSwitcher'
import { FiPlus, FiTrash2, FiSettings } from 'react-icons/fi'
import { AnimatePresence } from 'framer-motion'
import ReportPage from './components/ReportPage'

function TaskManager() {
  const {
    toast,
    showToast,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    timeFilter,
    setTimeFilter,
    selectedLabels,
    toggleLabelSelection,
    getAvailableLabels,
    clearFilters,
    STATUSES,
    statusColumns,
    PRIORITIES
  } = useTaskContext();

  // Use DEFAULT_STATUSES.TODO as initial value, but update it when statusColumns is loaded
  const [activeStatus, setActiveStatus] = useState(DEFAULT_STATUSES.TODO);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Update activeStatus if needed when statusColumns change
  useEffect(() => {
    if (statusColumns && statusColumns.length > 0) {
      // Check if current activeStatus exists in statusColumns
      const statusExists = statusColumns.some(col => col.id === activeStatus);

      // If not, set it to the first column's id
      if (!statusExists) {
        setActiveStatus(statusColumns[0].id);
      }

      console.log("Active status:", activeStatus);
      console.log("Status columns in App:", statusColumns);
    }
  }, [statusColumns, activeStatus]);

  // Check if the screen is mobile-sized
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Initial check
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile)

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const handleAddTask = () => {
    setEditingTask(null)
    setIsTaskModalOpen(true)
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setIsTaskDetailModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  const handleCloseTaskDetail = () => {
    setIsTaskDetailModalOpen(false)
    setSelectedTask(null)
  }

  const handleCloseToast = () => {
    showToast('', '')
  }

  const handleOpenTrash = () => {
    setIsTrashOpen(true)
  }

  const handleCloseTrash = () => {
    setIsTrashOpen(false)
  }

  const handleOpenSettings = () => {
    setIsSettingsOpen(true)
  }

  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
  }

  const handleOpenReport = () => {
    setIsReportOpen(true)
  }

  const handleCloseReport = () => {
    setIsReportOpen(false)
  }

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  // Handle label selection for filtering
  const handleLabelSelect = (label) => {
    toggleLabelSelection(label)
  }

  // Handle time filter change
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter)
  }

  const handlePriorityFilter = (priority) => {
    setSelectedPriority(priority === selectedPriority ? null : priority)
  }

  // Get the title based on current active status
  const getStatusTitle = () => {
    // Find status title from all available columns (default + custom)
    const currentStatus = STATUSES[Object.keys(STATUSES).find(key =>
      STATUSES[key] === activeStatus
    )];

    if (currentStatus === STATUSES.TODO) return 'To Do';
    if (currentStatus === STATUSES.IN_PROGRESS) return 'In Progress';
    if (currentStatus === STATUSES.COMPLETED) return 'Completed';

    // For custom statuses, find the name from Task Context
    return currentStatus || 'Tasks';
  }

  // Check if filters are active
  const hasActiveFilters = () => {
    return searchTerm || selectedLabels.length > 0 || timeFilter !== 'all' || selectedPriority;
  }

  const handleClearFilters = () => {
    clearFilters();
    setSelectedPriority(null);
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        onAddTask={handleAddTask}
        onOpenReport={handleOpenReport}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Only visible on larger screens */}
        {!isMobile && (
          <Sidebar
            activeStatus={activeStatus}
            setActiveStatus={setActiveStatus}
            onAddTask={handleAddTask}
            statusColumns={statusColumns}
            STATUSES={STATUSES}
            onOpenTrash={handleOpenTrash}
            onOpenSettings={handleOpenSettings}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            {/* Top bar */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                {viewMode === 'list' ? getStatusTitle() : 'Board View'}
                {selectedPriority && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({PRIORITIES[Object.keys(PRIORITIES).find(key => PRIORITIES[key] === selectedPriority)] || 'Unknown'} Priority)
                  </span>
                )}
              </h1>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearch={handleSearch}
                />

                <div className="flex items-center gap-2 ml-auto">
                  <FilterDropdown
                    availableLabels={getAvailableLabels()}
                    selectedLabels={selectedLabels}
                    onLabelSelect={handleLabelSelect}
                    timeFilter={timeFilter}
                    onTimeFilterChange={handleTimeFilterChange}
                  />

                  <ViewSwitcher
                    currentView={viewMode}
                    onViewChange={setViewMode}
                  />

                  {!isMobile && (
                    <>
                      <button
                        onClick={handleOpenSettings}
                        className="flex items-center text-xs py-1.5 px-3 border rounded-md bg-white hover:bg-gray-50"
                        title="Settings"
                      >
                        <FiSettings className="h-3.5 w-3.5 text-gray-500" />
                      </button>

                      <button
                        onClick={handleOpenTrash}
                        className="flex items-center text-xs py-1.5 px-3 border rounded-md bg-white hover:bg-gray-50"
                        title="Trash"
                      >
                        <FiTrash2 className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Filters active indicator with clear button */}
              {hasActiveFilters() && (
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>Filters active</span>
                  <button
                    onClick={handleClearFilters}
                    className="ml-2 underline text-indigo-600 hover:text-indigo-800"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Priority filter buttons */}
              <div className="flex mt-4 space-x-2">
                {Object.entries(PRIORITIES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handlePriorityFilter(value)}
                    className={`py-1 px-3 text-xs rounded-full border ${selectedPriority === value
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {key.charAt(0) + key.slice(1).toLowerCase()}
                  </button>
                ))}
                {selectedPriority && (
                  <button
                    onClick={() => setSelectedPriority(null)}
                    className="py-1 px-3 text-xs rounded-full bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  >
                    All Priorities
                  </button>
                )}
              </div>
            </div>

            {viewMode === 'list' ? (
              <TaskList
                status={activeStatus}
                onViewTask={handleViewTask}
                priority={selectedPriority}
              />
            ) : (
              <BoardView
                onViewTask={handleViewTask}
                priority={selectedPriority}
              />
            )}
          </div>
        </main>

        {/* Show mobile navigation on small screens */}
        {isMobile && (
          <MobileNavigation
            activeStatus={activeStatus}
            setActiveStatus={setActiveStatus}
            onAddTask={handleAddTask}
            onOpenSettings={handleOpenSettings}
          />
        )}
      </div>

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
      />

      <TaskDetailModal
        isOpen={isTaskDetailModalOpen}
        onClose={handleCloseTaskDetail}
        task={selectedTask}
      />

      {/* Trash view modal */}
      <AnimatePresence>
        {isTrashOpen && <TrashView onClose={handleCloseTrash} />}
      </AnimatePresence>

      {/* Settings view modal */}
      <AnimatePresence>
        {isSettingsOpen && <SettingsView onClose={handleCloseSettings} />}
      </AnimatePresence>

      {/* Report view modal */}
      <AnimatePresence>
        {isReportOpen && <ReportPage onClose={handleCloseReport} />}
      </AnimatePresence>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </div>
  )
}

function App() {
  return (
    <TaskProvider>
      <TaskManager />
    </TaskProvider>
  )
}

export default App
