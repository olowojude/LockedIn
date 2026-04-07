// components/Tasks.jsx
import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Check, Target, Sparkles, Activity, Award, ChevronRight } from "lucide-react";

const Tasks = ({ tasks, loading, error, onAddTask, onDeleteTask, onToggleTask, onUpdateTask }) => {
  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200/60 rounded-2xl animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-gray-200/60 rounded-full w-32 animate-pulse"></div>
            <div className="h-3 bg-gray-200/60 rounded-full w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100/50 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200/60 rounded-full"></div>
                <div className="flex-1 h-4 bg-gray-200/60 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50/80 backdrop-blur-xl border border-red-200/60 rounded-3xl p-6 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-red-700 font-bold text-lg mb-2">Error Loading Tasks</h3>
          <p className="text-red-600/80 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100/40 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-300/50 to-transparent"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-800 font-bold text-xl">Tasks</h3>
            <p className="text-gray-600 text-sm">Click to edit, enter to save</p>
          </div>
          {tasks.length > 0 && (
            <div className="ml-auto flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
              <span className="text-gray-600 text-sm font-medium">
                {tasks.filter(t => t.completed).length} done
              </span>
            </div>
          )}
        </div>

        {/* Daily Progress - shown right after header when tasks exist */}
        {tasks.length > 0 && (
          <div className="mb-6 pb-6 border-b border-gray-200/40">
            <DailyProgress tasks={tasks} />
          </div>
        )}

        {/* Tasks List or Empty State */}
        {tasks.length === 0 ? (
          <div className="text-center py-12 relative">
            <div className="w-20 h-20 bg-gray-200/60 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-gray-700 font-bold text-lg mb-2">No tasks yet</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mb-6">
              Ready to get started? Add your first task below.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {tasks.map((task, index) => (
              <TaskInput
                key={task.id}
                task={task}
                index={index}
                onUpdate={(newText) => onUpdateTask(task.id, newText)}
                onDelete={() => onDeleteTask(task.id)}
                onToggle={() => onToggleTask(task)}
                onEnterPress={() => onAddTask("")}
              />
            ))}
          </div>
        )}
        
        {/* New Task Input */}
        <NewTaskInput onAddTask={onAddTask} />
      </div>
    </div>
  );
};

const NewTaskInput = ({ onAddTask }) => {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && text.trim()) {
      onAddTask(text);
      setText("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className="w-6 h-6 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center group-hover:border-violet-400 transition-colors duration-300">
        <Plus className="w-3 h-3 text-gray-400 group-hover:text-violet-500 transition-colors duration-300" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a new task..."
        className="flex-1 bg-transparent border-none outline-none text-gray-800 text-lg placeholder-gray-400 py-3 border-b border-gray-200/60 focus:border-violet-400 transition-colors duration-300"
      />
    </div>
  );
};

const TaskInput = ({ task, index, onUpdate, onDelete, onToggle, onEnterPress }) => {
  const [text, setText] = useState(task.title);
  const [isEditing, setIsEditing] = useState(task.title === "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (text.trim()) {
        onUpdate(text);
        setIsEditing(false);
        onEnterPress();
      } else {
        onDelete();
      }
    }
    if (e.key === "Escape") {
      setText(task.title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    if (text.trim()) {
      onUpdate(text);
      setIsEditing(false);
    } else {
      onDelete();
    }
  };

  const handleToggle = () => {
    onToggle();
    setIsEditing(false);
  };

  return (
    <div 
      className="flex items-center gap-3 group py-3 px-3 -mx-3 rounded-2xl hover:bg-white/50 transition-all duration-300 relative overflow-hidden"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'slideInUp 0.4s ease-out forwards'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <button
        onClick={handleToggle}
        className={`w-6 h-6 flex-shrink-0 border-2 rounded-full flex items-center justify-center transition-all duration-300 relative ${
          task.completed
            ? "bg-gradient-to-br from-emerald-500 to-green-500 border-emerald-500 shadow-lg"
            : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/50"
        }`}
      >
        {task.completed && (
          <Check className="w-3 h-3 text-white" />
        )}
        {!task.completed && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200/40 to-purple-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
      </button>
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 bg-white/60 backdrop-blur-xl border border-violet-300/60 rounded-xl px-4 py-2 text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
          autoFocus
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-lg cursor-text py-2 transition-all duration-300 relative ${
            task.completed 
              ? "text-gray-500 line-through opacity-75" 
              : "text-gray-800 group-hover:text-gray-900"
          }`}
        >
          {text}
        </div>
      )}
    </div>
  );
};

const DailyProgress = ({ tasks }) => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg"></div>
          <span className="text-gray-800 font-semibold drop-shadow-sm">Daily Progress</span>
        </div>
        <span className="text-gray-600 text-sm font-mono bg-gray-100/80 px-3 py-1 rounded-full shadow-sm">
          {completedTasks}/{tasks.length}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="relative h-3 bg-gray-200/60 rounded-full overflow-hidden mb-4 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent"></div>
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
          style={{ width: `${completionPercentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span className="text-gray-700">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="text-gray-700 font-medium">{completionPercentage}%</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 opacity-70" />
      </div>
    </div>
  );
};

export default Tasks;