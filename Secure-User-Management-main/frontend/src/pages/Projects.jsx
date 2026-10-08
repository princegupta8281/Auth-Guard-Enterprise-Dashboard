import React, { useState } from 'react';
import { FolderKanban, Plus, MoreHorizontal, Clock, CheckCircle2, Circle } from 'lucide-react';

const Projects = () => {
  const [columns] = useState([
    { id: 'todo', title: 'To Do', color: 'bg-slate-100 dark:bg-base-800' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-primary-50 dark:bg-primary-500/10' },
    { id: 'review', title: 'In Review', color: 'bg-amber-50 dark:bg-amber-500/10' },
    { id: 'done', title: 'Completed', color: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, title: 'Implement biometric auth', column: 'todo', priority: 'High', date: 'Oct 12' },
    { id: 2, title: 'Design system overhaul', column: 'in_progress', priority: 'Medium', date: 'Oct 15' },
    { id: 3, title: 'Security audit preparation', column: 'in_progress', priority: 'High', date: 'Oct 10' },
    { id: 4, title: 'Update privacy policy', column: 'review', priority: 'Low', date: 'Oct 05' },
    { id: 5, title: 'Onboarding flows', column: 'done', priority: 'Medium', date: 'Oct 01' },
  ]);
  
  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      title: 'New mock task added via API',
      column: 'todo',
      priority: 'Medium',
      date: 'Today'
    };
    setTasks(prev => [newTask, ...prev]);
    alert('API Call Mocked: Task created successfully!');
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
        <button onClick={handleAddTask} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2 hover:-translate-y-1">
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
                {tasks.filter(t => t.column === col.id).map(task => (
                  <div key={task.id} className="bg-white dark:bg-base-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-white/5 group hover:shadow-md transition-all cursor-pointer hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button className="text-slate-400 hover:text-slate-800 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-5 w-5" />
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
                ))}
              </div>
              
              <button onClick={handleAddTask} className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-100 font-bold hover:bg-white dark:hover:bg-base-800 hover:border-slate-400 dark:hover:border-white/20 transition-all flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" /> Add Task
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
