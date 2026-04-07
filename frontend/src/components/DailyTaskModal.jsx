// components/DailyTasksModal.jsx 
import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle, Circle, Clock } from 'lucide-react';
import api from '../../utils/api'; // ✅ FIXED: Use centralized API

// ✅ REMOVED: hardcoded API URL

const DailyTasksModal = ({ isOpen, onClose, selectedDate, monthData }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchDailyTasks();
    }
  }, [isOpen, selectedDate]);


  const fetchDailyTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/daily-tasks/?date=${selectedDate}`);
      setTasks(response.data.tasks || []);
    } catch (err) {
      console.error('Error fetching daily tasks:', err);
      setError('Failed to load tasks for this day');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDayStats = () => {
    if (!monthData || !selectedDate) return null;
    
    const dayData = monthData.daily_data?.find(day => day.date === selectedDate);
    return dayData;
  };

  const dayStats = getDayStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-lg font-bold text-gray-800">Daily Tasks</h2>
              <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {dayStats && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  <strong>{dayStats.completed_tasks}/{dayStats.total_tasks}</strong> completed
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  dayStats.is_locked_in 
                    ? 'bg-green-100 text-green-700' 
                    : dayStats.total_tasks > 0 
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {dayStats.is_locked_in ? 'Locked In! 🔥' : dayStats.total_tasks > 0 ? `${dayStats.completion_rate}%` : 'No Tasks'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto max-h-96">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={fetchDailyTasks}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="p-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No tasks for this day</p>
                  <p className="text-gray-400 text-sm mt-1">This was a rest day!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 mb-3">Tasks for this day:</h3>
                  {tasks.map((task, index) => (
                    <div
                      key={task.id || index}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        task.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${
                          task.completed 
                            ? 'text-gray-600 line-through' 
                            : 'text-gray-800'
                        }`}>
                          {task.title}
                        </p>
                        {task.date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {new Date(task.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Tasks are read-only for past days
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyTasksModal;