import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as activityService from '../services/activities';
import * as eventCategoryService from '../services/eventCategories';
import type { Activity, EventCategory } from '../types';
import { formatDate } from '../lib/format';
import { PageTransition } from './page-transition';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';

function toLocalDateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toLocalDateTime(d: Date): string {
  const date = toLocalDateOnly(d);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${date}T${h}:${min}`;
}

export function Activities() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [postDate, setPostDate] = useState(() => toLocalDateOnly(new Date()));
  const [eventStart, setEventStart] = useState(() => {
    const d = new Date();
    d.setMinutes(0);
    return toLocalDateTime(d);
  });
  const [eventEnd, setEventEnd] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    return toLocalDateTime(d);
  });
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
  const textStyle = { color: 'var(--foreground)' };
  const mutedStyle = { color: 'var(--muted-foreground)' };
  const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    try {
      const cats = await eventCategoryService.fetchEventCategories(session.user.id);
      setCategories(cats);
    } catch (err) {
      setCategories([]);
      console.error('Failed to load event categories:', err);
      toast.error('Could not load categories. Make sure the migration add-activity-scheduling.sql was run.');
    }
    try {
      const acts = await activityService.fetchActivities(session.user.id);
      setActivities(acts);
    } catch {
      setActivities([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      toast.error('Please sign in');
      return;
    }
    if (!categoryId) {
      toast.error('Create at least one event category first');
      navigate('/event-categories');
      return;
    }
    const start = new Date(eventStart);
    const end = new Date(eventEnd);
    if (end <= start) {
      toast.error('Event end must be after event start');
      return;
    }
    setIsSubmitting(true);
    try {
      await activityService.createActivity({
        userId: session.user.id,
        postDate,
        eventStart: start.toISOString(),
        eventEnd: end.toISOString(),
        categoryId,
        description,
      });
      toast.success('Activity posted');
      setPostDate(toLocalDateOnly(new Date()));
      const nextStart = new Date();
      nextStart.setMinutes(0);
      setEventStart(toLocalDateTime(nextStart));
      const nextEnd = new Date(nextStart);
      nextEnd.setHours(nextEnd.getHours() + 1);
      setEventEnd(toLocalDateTime(nextEnd));
      setDescription('');
      await loadData();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : err instanceof Error ? err.message : 'Failed to post activity';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this activity?')) return;
    try {
      await activityService.deleteActivity(id);
      toast.success('Activity deleted');
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete activity');
    }
  };

  return (
    <PageTransition className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/event-categories')}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Manage Categories
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2" style={textStyle}>
            <Calendar className="size-6" />
            Activity Schedule
          </h1>
          <p className="mt-1" style={mutedStyle}>
            Post and manage your scheduled activities
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {showCreateForm ? 'Cancel' :
            <>
              <Plus className="size-4" />
              <span>Post Activity</span>
            </>}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={textStyle}>
            <Plus className="size-5" />
            Post an activity
          </h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : categories.length === 0 ? (
            <p style={mutedStyle}>
              <button
                type="button"
                onClick={() => navigate('/event-categories')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create an event category
              </button>{' '}
              first to post activities.
            </p>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="post-date" className="block text-sm font-medium mb-2" style={textStyle}>
                    Post date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="post-date"
                    type="date"
                    value={postDate}
                    onChange={(e) => setPostDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-2" style={textStyle}>
                    Event category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full pl-4 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    style={inputStyle}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-start" className="block text-sm font-medium mb-2" style={textStyle}>
                    Event start <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="event-start"
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="event-end" className="block text-sm font-medium mb-2" style={textStyle}>
                    Event end <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="event-end"
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2" style={textStyle}>
                  Event description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Describe the activity..."
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Activity'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="rounded-lg shadow-sm border p-6" style={cardStyle}>
        <h2 className="text-lg font-semibold mb-4" style={textStyle}>List of Events</h2>
        {loading ? (
          <p style={mutedStyle}>Loading...</p>
        ) : activities.length === 0 ? (
          <p style={mutedStyle}>No events yet. Post one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left py-3 px-4 font-medium" style={textStyle}>Event Name</th>
                  <th className="text-left py-3 px-4 font-medium" style={textStyle}>Event Start</th>
                  <th className="text-left py-3 px-4 font-medium" style={textStyle}>Event End</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => {
                  const catName = categories.find((c) => c.id === act.categoryId)?.name ?? 'Unknown';
                  const eventName = act.description?.trim() || catName || '—';
                  const dateTimeOpts = { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' as const };
                  return (
                    <tr
                      key={act.id}
                      style={{ borderBottom: '1px solid var(--border)' }}
                      className="hover:bg-[var(--muted)]/50 transition-colors"
                    >
                      <td className="py-3 px-4" style={textStyle}>{eventName}</td>
                      <td className="py-3 px-4" style={mutedStyle}>
                        {formatDate(act.eventStart, dateTimeOpts)}
                      </td>
                      <td className="py-3 px-4" style={mutedStyle}>
                        {formatDate(act.eventEnd, dateTimeOpts)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleDelete(act.id)}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:opacity-80"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
