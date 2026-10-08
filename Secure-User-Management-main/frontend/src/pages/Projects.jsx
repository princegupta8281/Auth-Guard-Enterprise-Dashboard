import React, { useCallback, useEffect, useState } from 'react';
import { FolderKanban, Plus, Pencil, Trash2, X } from 'lucide-react';
import { getApiErrorMessage, projectsApi } from '../services/api';

const initialForm = { name: '', description: '', status: 'PLANNING', dueDate: '' };
const statuses = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await projectsApi.list();
      setProjects(data);
      setError('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Projects could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const openModal = (project = null) => {
    setEditingProject(project);
    setFormData(project
      ? {
        name: project.name,
        description: project.description || '',
        status: project.status || 'PLANNING',
        dueDate: project.dueDate || '',
      }
      : initialForm);
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setFormData(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingProject) {
        await projectsApi.update(editingProject.id, formData);
      } else {
        await projectsApi.create(formData);
      }
      setLoading(true);
      await fetchProjects();
      closeModal();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'The project could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return;
    try {
      await projectsApi.delete(project.id);
      setProjects((currentProjects) => currentProjects.filter(({ id }) => id !== project.id));
      setError('');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'The project could not be deleted.'));
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 text-slate-900 dark:text-slate-100 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="flex items-center text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            <FolderKanban className="mr-3 h-8 w-8 text-primary-600 dark:text-primary-400" />
            Projects
          </h1>
          <p className="mt-2 text-slate-700 dark:text-slate-200">Create and manage your projects.</p>
        </div>
        <button type="button" onClick={() => openModal()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-700 px-5 py-3 font-bold text-white shadow-sm hover:bg-primary-800 focus-visible:outline-offset-2 dark:bg-primary-600 dark:hover:bg-primary-500">
          <Plus size={18} /> New Project
        </button>
      </header>

      {error && !modalOpen && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-100" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => { setLoading(true); fetchProjects(); }} className="shrink-0 underline underline-offset-2">Try again</button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center font-medium text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200" role="status">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-white/15 dark:bg-slate-900">
          <FolderKanban className="mx-auto mb-3 h-9 w-9 text-slate-500 dark:text-slate-300" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">No projects yet</h2>
          <p className="mt-1 text-slate-700 dark:text-slate-300">Create a project to keep its details and progress in one place.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">{project.name}</h2>
                  <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {project.status.replaceAll('_', ' ')}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => openModal(project)} aria-label={`Edit ${project.name}`} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white">
                    <Pencil size={16} />
                  </button>
                  <button type="button" onClick={() => handleDelete(project)} aria-label={`Delete ${project.name}`} className="rounded-lg p-2 text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/50">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-4 min-h-12 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{project.description || 'No description provided.'}</p>
              {project.dueDate && <p className="mt-4 text-xs font-semibold text-slate-700 dark:text-slate-300">Due {project.dueDate}</p>}
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="project-form-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="project-form-title" className="text-xl font-bold text-slate-950 dark:text-white">{editingProject ? 'Edit Project' : 'New Project'}</h2>
              <button type="button" onClick={closeModal} aria-label="Close project form" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"><X size={19} /></button>
            </div>
            {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-900 dark:bg-red-950/50 dark:text-red-100" role="alert">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Project name
                <input required maxLength={120} value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 placeholder:text-slate-500 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400" />
              </label>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Description
                <textarea rows={3} maxLength={2000} value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} className="mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 placeholder:text-slate-500 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Status
                  <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                    {statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Due date
                  <input type="date" value={formData.dueDate} onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/30 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="rounded-lg px-4 py-2 font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-primary-700 px-4 py-2 font-bold text-white hover:bg-primary-800 disabled:cursor-wait disabled:opacity-60 dark:bg-primary-600 dark:hover:bg-primary-500">{saving ? 'Saving…' : editingProject ? 'Save changes' : 'Create project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
