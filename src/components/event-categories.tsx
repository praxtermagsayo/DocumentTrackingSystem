import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Tag, Pencil, Trash2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as eventCategoryService from '../services/eventCategories';
import type { EventCategory, EventCategoryStatus } from '../types';
import { toast } from '../lib/toast';
import { formatDate } from '../lib/format';
import { useApp } from '../contexts/AppContext';
import { PageTransition } from './page-transition';
import { Skeleton } from './ui/skeleton';

export function EventCategories() {
  const navigate = useNavigate();
  const { user } = useApp();
  const isAdmin = user?.role === 'admin';
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<EventCategoryStatus>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<EventCategoryStatus>('active');
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  const loadCategories = useCallback(async (silent = false) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    if (!silent) setLoading(true);
    try {
      const data = await eventCategoryService.fetchEventCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();

    // Real-time subscription
    const channel = supabase
      .channel('public:event_categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_categories' }, () => {
        loadCategories(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadCategories]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Enter a category name');
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      toast.error('Please sign in');
      return;
    }
    setIsCreating(true);
    try {
      await eventCategoryService.createEventCategory(session.user.id, name.trim(), status);
      toast.success('Category created');
      setName('');
      setStatus('active');
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await eventCategoryService.updateEventCategory(id, editName.trim(), editStatus);
      toast.success('Category updated');
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? Activities using it may be affected.')) return;
    try {
      await eventCategoryService.deleteEventCategory(id);
      toast.success('Category deleted');
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const startEdit = (cat: EventCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditStatus(cat.status);
  };

  return (
    <PageTransition className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/activities')}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Activities
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2" style={textStyle}>
          <Tag className="size-6" />
          Event Categories
        </h1>
        <p className="mt-1" style={mutedStyle}>
          Create and manage categories for your activities
        </p>
      </div>

      {isAdmin && (
        <div className="flex border-b mb-6" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'
              }`}
            style={activeTab !== 'list' ? mutedStyle : undefined}
          >
            List of Categories
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'create' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'
              }`}
            style={activeTab !== 'create' ? mutedStyle : undefined}
          >
            Create New
          </button>
        </div>
      )}

      {activeTab === 'create' && isAdmin && (
        <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={textStyle}>
            <Plus className="size-5" />
            Create a category
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium mb-2" style={textStyle}>
                Category name <span className="text-red-500">*</span>
              </label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meeting, Training, Workshop"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="category-status" className="block text-sm font-medium mb-2" style={textStyle}>
                Status
              </label>
              <select
                id="category-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as EventCategoryStatus)}
                className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                style={inputStyle}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create category'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
          <h2 className="text-lg font-semibold mb-4" style={textStyle}>List of Categories</h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : categories.length === 0 ? (
            <p style={mutedStyle}>No categories yet. Create one above.</p>
          ) : (
            <ul className="space-y-4 animate-stagger">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center gap-4 py-3 px-4 rounded-lg animate-elastic-slide transition-elastic hover:scale-[1.01] shadow-sm"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  {editingId === cat.id ? (
                    <div className="flex-1 flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 min-w-[120px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={inputStyle}
                        autoFocus
                      />
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as EventCategoryStatus)}
                        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={inputStyle}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleUpdate(cat.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-2 border rounded-lg text-sm hover:opacity-80"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-lg" style={textStyle}>{cat.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${cat.status === 'active' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/20' : 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/20'}`}>
                            {cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm" style={mutedStyle}>
                          <span>Created by {cat.creatorName}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>{formatDate(cat.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(cat)}
                            className="p-2 rounded-lg hover:opacity-80"
                            style={mutedStyle}
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id)}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:opacity-80"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </PageTransition>
  );
}
