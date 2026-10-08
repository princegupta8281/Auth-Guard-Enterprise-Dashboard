import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, MoreHorizontal, Clock, CheckCircle2, Circle, X, Trash2 } from 'lucide-react';
import { tasksApi, getApiErrorMessage } from '../services/api';

const Projects = () => {
  const [columns] = useState([
    { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-base-800' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-primary-50 dark:bg-primary-500/10' },
    { id: 'review', title: 'In Review', color: 'bg-amber-50 dark:bg-amber-500/10' },
    { id: 'done', title: 'Completed', color: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ]);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    columnId: 'todo',
    priority: 'Medium',
    dateStr: 'Today'
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await tasksApi.list();
      setTasks(data);
    } catch (err) {
      console.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openModal = (task = null, columnId = 'todo') => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        columnId: task.column,
        priority: task.priority,
        dateStr: task.date
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        columnId,
        priority: 'Medium',
        dateStr: 'Today'
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await tasksApi.update(editingTask.id, formData);
      } else {
        await tasksApi.create(formData);
      }
      await fetchTasks();
      closeModal();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to save task'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksApi.delete(id);
      await fetchTasks();
      if (editingTask?.id === id) closeModal();
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete task'));
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return 'text-accent-500 bg-accent-50 dark:bg-accent-500/10';
      case 'Medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
      default: return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 h-[calc(100vh-4rem)] flex flex-col text-slate-900 dark:text-slate-200">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 flex-shrink-0 animate-fade-in">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-slate-900 dark:text-white flex items-center tracking-tight">
            <FolderKanban className="mr-3 h-8 w-8 text-primary-500" />
            Projects
          </h1>
          <p className="mt-2 text-slate-800 dark:text-slate-100 font-medium">Manage your tasks and workflows visually.</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2 hover:-translate-y-1">
          <Plus className="h-5 w-5" /> New Task
        </button>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex gap-6 min-w-max h-full">
          {columns.map(col => (
            <div key={col.id} className={`w-80 flex flex-col rounded-3xl p-4 border border-slate-200/60 dark:border-white/5 ${col.color} transition-colors`}>
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{col.title}</h3>
                <span className="h-6 w-6 rounded-full bg-white dark:bg-base-900 flex items-center justify-center text-xs font-bold shadow-sm">
                  {tasks.filter(t => t.column === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
                {loading ? (
                  <div className="text-center py-4 text-slate-500">Loading...</div>
                ) : (
                  tasks.filter(t => t.column === col.id).map(task => (
                    <div key={task.id} onClick={() => openModal(task)} className="bg-white dark:bg-base-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-white/5 group hover:shadow-md transition-all cursor-pointer hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white leading-tight mb-4">{task.title}</h4>
                      
                      <div className="flex justify-between items-center text-xs font-medium text-slate-800 dark:text-slate-100 pt-3 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {task.date}
                        </div>
                        {col.id === 'done' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300 dark:text-base-600" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button onClick={() => openModal(null, col.id)} className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold hover:bg-white dark:hover:bg-base-800 hover:border-slate-400 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Task
              </button>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-base-900 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
              <button onClick={closeModal} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-base-800 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-base-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                  placeholder="Enter task title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Column</label>
                  <select 
                    value={formData.columnId}
                    onChange={e => setFormData({...formData, columnId: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-base-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                  >
                    {columns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-base-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date/Milestone</label>
                <input 
                  type="text" 
                  value={formData.dateStr}
                  onChange={e => setFormData({...formData, dateStr: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-base-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                  placeholder="e.g. Oct 12"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 font-bold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-base-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 font-bold rounded-xl bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/30 transition-colors">
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
