import { useState } from 'react';

const LibraryPanel = ({ isOpen, onClose, taskHistory, onReAddTask, onPermanentDelete, onClearAllDeleted }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on active filter and search
  const filteredTasks = taskHistory.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeFilter) {
      case 'Completed':
        return task.completed && !task.deleted;
      case 'Active':
        return !task.completed && !task.deleted;
      case 'Deleted':
        return task.deleted;
      default: // 'All'
        return true;
    }
  });

  const safeFormatDate = (value) => {
    if (!value) return 'Unknown date'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return 'Unknown date'
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Group tasks by date
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    let dateKey

    // This app stores completion time as `completed_at`.
    // It stores creation time as `created_at` (used in useTasks ordering).
    if (task.completed) {
      dateKey = `Completed on ${safeFormatDate(task.completed_at)}`
    } else if (task.deleted) {
      dateKey = `Deleted on ${safeFormatDate(task.deleted_at)}`
    } else {
      dateKey = `Added on ${safeFormatDate(task.created_at)}`
    }

    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(task)
    return groups
  }, {});


  const reAddTask = (task) => {
    onReAddTask?.(task)
  };

  const permanentDelete = (taskId) => {
    onPermanentDelete?.(taskId)
  };

  const clearAllDeleted = () => {
    onClearAllDeleted?.()
  };

  // Get appropriate empty state message
  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return {
        title: 'No tasks found',
        description: 'No tasks match your search query'
      };
    }
    
    switch (activeFilter) {
      case 'Completed':
        return {
          title: 'No completed tasks',
          description: 'Tasks you complete will appear here'
        };
      case 'Active':
        return {
          title: 'No active tasks',
          description: 'Active tasks will appear here'
        };
      case 'Deleted':
        return {
          title: 'No deleted tasks',
          description: 'Tasks you delete will appear here'
        };
      default:
        return {
          title: 'No task history',
          description: 'Completed and deleted tasks will appear here'
        };
    }
  };

  if (!isOpen) return null;

  const emptyState = getEmptyStateMessage();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 translate-x-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Task History
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search past tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Tabs and Clear Button */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                {['All', 'Completed', 'Active', 'Deleted'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activeFilter === filter
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              
              {activeFilter === 'Deleted' && taskHistory.some(task => task.deleted) && (
                <button
                  onClick={clearAllDeleted}
                  className="px-3 py-1 text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto">
            {Object.keys(groupedTasks).length === 0 ? (
              // Empty State
              <div className="text-center py-12 px-4">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {emptyState.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {emptyState.description}
                </p>
              </div>
            ) : (
              // Grouped Tasks
              <div className="p-4 space-y-6">
                {Object.entries(groupedTasks)
                  .sort(([dateA], [dateB]) => {
                    const getDate = (dateString) => {
                      if (dateString.includes('Deleted on')) {
                        return new Date(dateString.replace('Deleted on ', ''));
                      } else if (dateString.includes('Completed on')) {
                        return new Date(dateString.replace('Completed on ', ''));
                      } else {
                        return new Date(dateString.replace('Added on ', ''));
                      }
                    };
                    
                    return getDate(dateB) - getDate(dateA);
                  })
                  .map(([date, tasks]) => (
                    <div key={date}>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        {date}
                      </h3>
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              task.deleted 
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                                : task.completed
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {/* Status Icon */}
                              {task.deleted ? (
                                <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              ) : task.completed ? (
                                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                              )}
                              
                              {/* Task Text */}
                              <span className={`text-sm truncate ${task.deleted ? 'text-red-700 dark:text-red-300' : task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                {task.text}
                              </span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {task.deleted ? (
                                <>
                                  <button
                                    onClick={() => reAddTask(task)}
                                    className="p-2 text-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                    aria-label="Restore task"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => permanentDelete(task.id)}
                                    className="p-2 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    aria-label="Permanently delete"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => reAddTask(task)}
                                  className="p-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                  aria-label="Re-add task"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LibraryPanel;