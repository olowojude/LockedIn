// src/config.js
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const API_ENDPOINTS = {
  tasks: `${API_BASE_URL}/tasks`,
  userStreak: `${API_BASE_URL}/user-streak`,
  monthlyOverview: `${API_BASE_URL}/monthly-overview`,
  yearlyOverview: `${API_BASE_URL}/yearly-overview`,
  dailyTasks: `${API_BASE_URL}/daily-tasks`,
};