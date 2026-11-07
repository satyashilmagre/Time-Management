import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Layers,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../api/apiClient';
import { formatTime } from '../context/TimerContext';
import TimeBadge from '../components/common/TimeBadge';

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Edit Modal State
  const [editingActivity, setEditingActivity] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editClassification, setEditClassification] = useState('productive');
  const [editMinutes, setEditMinutes] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('categoryId', categoryFilter);
      if (classificationFilter) params.append('classification', classificationFilter);
      if (dateFilter) params.append('date', dateFilter);

      const [actRes, catRes] = await Promise.all([
        apiRequest(`/api/activities?${params.toString()}`),
        apiRequest('/api/categories'),
      ]);

      if (actRes.success) setActivities(actRes.activities || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error('loadActivities error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [categoryFilter, classificationFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadActivities();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity record?')) return;
    try {
      await apiRequest(`/api/activities/${id}`, { method: 'DELETE' });
      setActivities(activities.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  const openEditModal = (act) => {
    setEditingActivity(act);
    setEditName(act.name);
    setEditCategory(act.category_id ? String(act.category_id) : '');
    setEditClassification(act.productivity_classification);
    setEditMinutes(Math.round((act.duration_seconds || 0) / 60));
    setEditNotes(act.description || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const durSec = parseInt(editMinutes, 10) * 60;
      const res = await apiRequest(`/api/activities/${editingActivity.id}`, {
        method: 'PUT',
        body: {
          name: editName,
          category_id: editCategory ? parseInt(editCategory, 10) : null,
          productivity_classification: editClassification,
          duration_seconds: durSec,
          description: editNotes,
        },
      });

      if (res.success) {
        setActivities(activities.map((a) => (a.id === editingActivity.id ? res.activity : a)));
        setEditingActivity(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to update activity');
    } finally {
      setEditLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csvData = await apiRequest('/api/export/csv');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `time-intelligence-activities-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const totalFilteredSeconds = activities.reduce((acc, a) => acc + (a.duration_seconds || 0), 0);
  const productiveSeconds = activities
    .filter((a) => a.productivity_classification === 'productive')
    .reduce((acc, a) => acc + (a.duration_seconds || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Activity History & Logs
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Audit, filter, edit, and export every tracked moment.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Download className="h-3.5 w-3.5 text-indigo-500" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity or notes..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            />
          </form>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Classification */}
          <div>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All Classifications</option>
              <option value="productive">Productive</option>
              <option value="neutral">Neutral</option>
              <option value="unproductive">Unproductive</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            />
          </div>
        </div>

        {/* Filter summary counts */}
        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
          <span>
            Showing <strong>{activities.length}</strong> activity logs
          </span>
          <div className="flex gap-4">
            <span>
              Total Tracked: <strong className="text-slate-800 dark:text-slate-200">{formatTime(totalFilteredSeconds)}</strong>
            </span>
            <span>
              Productive: <strong className="text-emerald-600">{formatTime(productiveSeconds)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading activities...</td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No activities match your filters.</td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-900 dark:text-white">{act.name}</p>
                      {act.description && (
                        <p className="line-clamp-1 mt-0.5 text-[11px] text-slate-400">{act.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${act.category_color || '#6366f1'}15`, color: act.category_color || '#6366f1' }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: act.category_color || '#6366f1' }} />
                        {act.category_name || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <TimeBadge classification={act.productivity_classification} />
                    </td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {formatTime(act.duration_seconds)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {act.date instanceof Date ? act.date.toISOString().split('T')[0] : String(act.date).split('T')[0]}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(act)}
                          title="Edit Activity"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(act.id)}
                          title="Delete Activity"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Activity Modal */}
      {editingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Activity Record</h3>
              <button onClick={() => setEditingActivity(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Classification</label>
                  <select
                    value={editClassification}
                    onChange={(e) => setEditClassification(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="productive">Productive</option>
                    <option value="neutral">Neutral</option>
                    <option value="unproductive">Unproductive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingActivity(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
