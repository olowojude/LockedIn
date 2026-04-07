import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import api from '../../utils/api'; // ✅ FIXED: Use centralized API
import DailyTasksModal from './DailyTaskModal';



const MonthlyOverview = ({ onRefresh }) => {
  const [monthlyData, setMonthlyData] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchMonthlyData();
  }, [currentDate]);

  const fetchMonthlyData = async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      
      const response = await api.get(`/monthly-overview/?month=${month}&year=${year}`);
      
      setMonthlyData(response.data);
    } catch (err) {
      console.error('Error fetching monthly data:', err);
      
      if (err.response?.status === 401) {
        setError('Please log in again');
      } else if (err.response?.status === 404) {
        setError('Monthly overview endpoint not found. Check your backend URL configuration.');
      } else if (err.response?.status === 500) {
        setError('Server error. Check your backend logs.');
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to load monthly overview');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchMonthlyData(true);
    if (onRefresh) {
      onRefresh();
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getSquareColor = (day) => {
    if (day.total_tasks === 0) return 'bg-gray-100 border-gray-200';
    if (day.is_locked_in) return 'bg-green-500 border-green-600 shadow-sm';
    
    const rate = day.completion_rate;
    if (rate >= 75) return 'bg-green-300 border-green-400';
    if (rate >= 50) return 'bg-yellow-300 border-yellow-400';
    if (rate >= 25) return 'bg-orange-300 border-orange-400';
    return 'bg-red-200 border-red-300';
  };

  const isToday = (day) => {
    const today = new Date();
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.day);
    return dayDate.toDateString() === today.toDateString();
  };

  const handleDayClick = (day) => {
    setSelectedDate(day.date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded mb-4 w-32"></div>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="w-6 h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="text-center text-red-600">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm mb-2 font-medium">Monthly Overview Error</p>
          <p className="text-xs mb-3 text-gray-600">{error}</p>
          <button 
            onClick={() => fetchMonthlyData()}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors mr-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-red-500" />
          Monthly Overview
        </h2>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="px-2 py-1 bg-red-50 rounded text-sm font-medium text-red-700 min-w-[100px] text-center">
            {monthlyData?.month_name} {monthlyData?.year}
          </div>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 ml-1"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={index} className="text-center text-xs font-medium text-gray-500 p-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ 
            length: new Date(monthlyData.year, monthlyData.month - 1, 1).getDay() 
          }, (_, i) => (
            <div key={`empty-${i}`} className="w-6 h-6"></div>
          ))}
          
          {monthlyData?.daily_data?.map(day => (
            <div
              key={day.day}
              onClick={() => handleDayClick(day)}
              className={`w-6 h-6 rounded border cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10 relative ${getSquareColor(day)} ${
                isToday(day) ? 'ring-2 ring-blue-400 ring-offset-1' : ''
              } hover:ring-2 hover:ring-gray-400`}
            >
              <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                {day.day}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-green-50 rounded p-2 text-center border border-green-200">
          <div className="text-lg font-bold text-green-600">
            {monthlyData?.statistics?.total_locked_in_days || 0}
          </div>
          <div className="text-xs text-green-700">Locked In Days</div>
        </div>
        
        <div className="bg-red-50 rounded p-2 text-center border border-red-200">
          <div className="text-lg font-bold text-red-600">
            {monthlyData?.statistics?.locked_in_percentage || 0}%
          </div>
          <div className="text-xs text-red-700">Success Rate</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
          <span className="text-gray-600">No tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
          <span className="text-gray-600">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-300 border border-yellow-400 rounded"></div>
          <span className="text-gray-600">Med</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 border border-green-600 rounded"></div>
          <span className="text-gray-600">Locked In!</span>
        </div>
      </div>
      
      {monthlyData && new Date().getMonth() + 1 === monthlyData.month && new Date().getFullYear() === monthlyData.year && (
        <div className="mt-2 text-center">
          <span className="text-xs text-blue-600 flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            Today is highlighted with a blue ring
          </span>
        </div>
      )}
      
      <DailyTasksModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedDate={selectedDate}
        monthData={monthlyData}
      />
    </div>
  );
};

export default MonthlyOverview;