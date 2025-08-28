import React, { useState, useEffect, useReducer } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Edit3, 
  Trash2, 
  User, 
  AlertCircle,
  BarChart3,
  TrendingUp,
  Target,
  Users
} from 'lucide-react';

// TaskCard component moved outside main component for clarity
const TaskCard = ({ task, onToggleComplete, onEdit, onDelete, getPriorityColor, getCategoryColor, isOverdue }) => (
  <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 hover:shadow-md transition-shadow ${
    task.completed ? 'border-green-500 bg-green-50' : 
    isOverdue(task.dueDate, task.completed) ? 'border-red-500' : 
    getPriorityColor(task.priority).replace('bg-', 'border-')
  }`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-start space-x-3 flex-1">
        <button
          onClick={() => onToggleComplete(task.id)}
          className="mt-1 flex-shrink-0"
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          {task.completed ? 
            <CheckCircle className="w-5 h-5 text-green-500" /> : 
            <Circle className="w-5 h-5 text-gray-400 hover:text-green-500" />
          }
        </button>
        <div className="flex-1">
          <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 ml-4">
        <button
          onClick={() => onEdit(task)}
          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
          aria-label="Edit task"
        >
          <Edit3 size={14} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <div className="flex items-center space-x-3">
        <span className={`px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
          {task.category}
        </span>
        <div className="flex items-center space-x-1">
          <User size={12} />
          <span>{task.assignee}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {isOverdue(task.dueDate, task.completed) && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
        <Clock size={12} />
        <span className={isOverdue(task.dueDate, task.completed) ? 'text-red-500 font-medium' : ''}>
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  </div>
);

// Task reducer with initial load case added
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, { ...action.payload, id: Date.now(), createdAt: new Date() }]
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'TOGGLE_COMPLETE':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : null }
            : task
        )
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
};

const TaskManagementDashboard = () => {
  const initialState = {
    tasks: [
      {
        id: 1,
        title: 'Complete React Dashboard',
        description: 'Build a comprehensive task management system with advanced features',
        priority: 'high',
        category: 'Development',
        assignee: 'John Doe',
        dueDate: '2025-09-05',
        completed: false,
        createdAt: new Date('2025-08-20')
      },
      {
        id: 2,
        title: 'Code Review',
        description: 'Review pull requests for the authentication module',
        priority: 'medium',
        category: 'Development',
        assignee: 'Jane Smith',
        dueDate: '2025-08-30',
        completed: true,
        createdAt: new Date('2025-08-25'),
        completedAt: new Date('2025-08-28')
      },
      {
        id: 3,
        title: 'Client Meeting Preparation',
        description: 'Prepare presentation slides for upcoming client meeting',
        priority: 'high',
        category: 'Business',
        assignee: 'Mike Johnson',
        dueDate: '2025-08-29',
        completed: false,
        createdAt: new Date('2025-08-26')
      }
    ],
    filter: 'all',
    searchQuery: ''
  };

  const [state, dispatch] = useReducer(taskReducer, initialState);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeView, setActiveView] = useState('board');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Development',
    assignee: '',
    dueDate: ''
  });

  // Note: localStorage functionality removed for Claude.ai compatibility
  // In a real environment, these useEffects would handle localStorage operations

  // Normalize date for overdue check
  const isOverdue = (dueDate, completed) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today && !completed;
  };

  // Sort tasks by dueDate ascending for consistent order
  const sortedTasks = [...state.tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Filter and search with sorted tasks
  const filteredTasks = sortedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    const matchesFilter = state.filter === 'all' || 
                         (state.filter === 'completed' && task.completed) ||
                         (state.filter === 'pending' && !task.completed) ||
                         (state.filter === 'high' && task.priority === 'high') ||
                         (state.filter === 'overdue' && isOverdue(task.dueDate, task.completed));
    
    return matchesSearch && matchesFilter;
  });

  // Analytics calculations
  const analytics = {
    total: state.tasks.length,
    completed: state.tasks.filter(t => t.completed).length,
    pending: state.tasks.filter(t => !t.completed).length,
    overdue: state.tasks.filter(t => isOverdue(t.dueDate, t.completed)).length,
    completionRate: state.tasks.length > 0 ? Math.round((state.tasks.filter(t => t.completed).length / state.tasks.length) * 100) : 0
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    if (editingTask) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { id: editingTask.id, updates: formData }
      });
      setEditingTask(null);
    } else {
      dispatch({ type: 'ADD_TASK', payload: formData });
    }
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Development',
      assignee: '',
      dueDate: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      category: task.category,
      assignee: task.assignee,
      dueDate: task.dueDate
    });
    setEditingTask(task);
    setShowAddForm(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Development': return 'bg-blue-100 text-blue-800';
      case 'Design': return 'bg-purple-100 text-purple-800';
      case 'Business': return 'bg-green-100 text-green-800';
      case 'Marketing': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">TaskFlow Pro</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('board')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeView === 'board' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    activeView === 'analytics' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'board' ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.completed}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.pending}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.overdue}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={state.filter}
                  onChange={(e) => dispatch({ type: 'SET_FILTER', payload: e.target.value })}
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="high">High Priority</option>
                  <option value="overdue">Overdue</option>
                </select>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
            {/* Task Grid */}
            <div className="grid gap-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={(id) => dispatch({ type: 'TOGGLE_COMPLETE', payload: id })}
                    onEdit={handleEdit}
                    onDelete={(id) => dispatch({ type: 'DELETE_TASK', payload: id })}
                    getPriorityColor={getPriorityColor}
                    getCategoryColor={getCategoryColor}
                    isOverdue={isOverdue}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks found. Create your first task to get started!</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Analytics View */
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h2>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Completion Rate</p>
                    <p className="text-3xl font-bold">{analytics.completionRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Tasks Completed</p>
                    <p className="text-3xl font-bold">{analytics.completed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Active Projects</p>
                    <p className="text-3xl font-bold">{new Set(state.tasks.map(t => t.category)).size}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>
            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Category</h3>
              <div className="space-y-4">
                {Object.entries(
                  state.tasks.reduce((acc, task) => {
                    acc[task.category] = (acc[task.category] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / state.tasks.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {state.tasks
                  .filter(task => task.completedAt)
                  .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                  .slice(0, 5)
                  .map(task => (
                    <div key={task.id} className="flex items-center space-x-3 py-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">
                          Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add/Edit Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.assignee}
                    onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTask(null);
                    setFormData({
                      title: '',
                      description: '',
                      priority: 'medium',
                      category: 'Development',
                      assignee: '',
                      dueDate: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementDashboard;
