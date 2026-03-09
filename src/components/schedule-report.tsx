import { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as activityService from '../services/activities';
import * as eventCategoryService from '../services/eventCategories';
import type { Activity, EventCategory } from '../types';
import { formatDate } from '../lib/format';

export function ScheduleReport() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [categories, setCategories] = useState<EventCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            loadData();
        }, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const loadData = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        try {
            const cats = await eventCategoryService.fetchEventCategories(session.user.id);
            setCategories(cats);
        } catch {
            setCategories([]);
        }
        try {
            const allActs = await activityService.fetchActivities(session.user.id);

            // Filter for current week (Sunday to Saturday)
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const dayOfWeek = now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - dayOfWeek); // Sunday

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
            endOfWeek.setHours(23, 59, 59, 999);

            const thisWeekActs = allActs.filter((act) => {
                const actStart = new Date(act.eventStart);
                const actEnd = new Date(act.eventEnd);
                return (actStart >= startOfWeek && actStart <= endOfWeek) ||
                    (actEnd >= startOfWeek && actEnd <= endOfWeek);
            });

            // Sort by start date
            thisWeekActs.sort((a, b) => new Date(a.eventStart).getTime() - new Date(b.eventStart).getTime());

            setActivities(thisWeekActs);
        } catch {
            setActivities([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Group activities by date
    const groupedActivities = activities.reduce((acc, act) => {
        const actDate = new Date(act.eventStart);
        actDate.setHours(0, 0, 0, 0);
        const dateStr = actDate.toISOString();
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(act);
        return acc;
    }, {} as Record<string, Activity[]>);

    const sortedDates = Object.keys(groupedActivities).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Airport/TV style schedule UI
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-6 md:p-12 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto">
                <header className="mb-12 flex items-end justify-between border-b border-slate-700 pb-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-amber-400 flex items-center gap-4">
                            <Calendar className="size-10 md:size-12" />
                            Weekly Schedule
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium mt-2 tracking-wide">
                            {formatDate(new Date().toISOString(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-5xl font-mono font-bold text-slate-200">
                            {formatDate(new Date().toISOString(), { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-amber-400 font-bold tracking-widest uppercase mt-1">Local Time</div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-slate-400 font-mono text-xl tracking-widest uppercase">Loading Schedule...</p>
                        </div>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <Calendar className="size-24 text-slate-600 mb-6" />
                        <h2 className="text-3xl font-bold text-slate-400 uppercase tracking-widest">No Events Scheduled</h2>
                        <p className="text-slate-500 text-xl mt-2">The current week is clear.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {sortedDates.map((dateStr) => {
                            const acts = groupedActivities[dateStr];
                            const dateObj = new Date(dateStr);
                            const isToday = new Date().toDateString() === dateObj.toDateString();

                            return (
                                <div key={dateStr} className={`rounded-xl overflow-hidden shadow-2xl ${isToday ? 'ring-2 ring-amber-400 ring-offset-4 ring-offset-[#0f172a]' : ''}`}>
                                    <div className={`bg-slate-800 px-8 py-4 border-b border-slate-700 flex items-center justify-between ${isToday ? 'bg-slate-700' : ''}`}>
                                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-slate-100">
                                            {formatDate(dateObj.toISOString(), { weekday: 'long' })}
                                            <span className="text-slate-400 font-medium ml-4 text-xl md:text-2xl">
                                                {formatDate(dateObj.toISOString(), { month: 'short', day: 'numeric' })}
                                            </span>
                                        </h2>
                                        {isToday && (
                                            <span className="bg-amber-400 text-slate-900 font-bold px-4 py-1 rounded-full text-sm tracking-widest uppercase animate-pulse">
                                                Today
                                            </span>
                                        )}
                                    </div>

                                    <div className="bg-slate-900/80 backdrop-blur-sm shadow-inner">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-900 text-slate-400 top-0 border-b border-slate-800 uppercase tracking-widest text-xs md:text-sm font-bold">
                                                    <th className="py-4 px-8 w-[20%]">Time</th>
                                                    <th className="py-4 px-8 w-[40%]">Event</th>
                                                    <th className="py-4 px-8 w-[25%] hidden md:table-cell">Category</th>
                                                    <th className="py-4 px-8 w-[15%] text-right">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/50">
                                                {acts.map((act) => {
                                                    const catName = categories.find((c) => c.id === act.categoryId)?.name ?? 'Unknown';
                                                    const eventName = act.description?.trim() || catName || '—';

                                                    const start = new Date(act.eventStart);
                                                    const end = new Date(act.eventEnd);
                                                    const isHappeningNow = isToday && new Date() >= start && new Date() <= end;

                                                    const durationMs = end.getTime() - start.getTime();
                                                    const durationMins = Math.round(durationMs / 60000);
                                                    const hours = Math.floor(durationMins / 60);
                                                    const mins = durationMins % 60;
                                                    const durationStr = hours > 0
                                                        ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
                                                        : `${mins}m`;

                                                    return (
                                                        <tr
                                                            key={act.id}
                                                            className={`group transition-all duration-300 hover:bg-slate-800 ${isHappeningNow ? 'bg-slate-800/80 relative' : ''}`}
                                                        >
                                                            {/* Glowing indicator line for active event */}
                                                            {isHappeningNow && (
                                                                <td className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]"></td>
                                                            )}

                                                            <td className="py-5 md:py-6 px-8 font-mono text-lg md:text-xl font-bold whitespace-nowrap text-amber-400">
                                                                {formatDate(act.eventStart, { hour: '2-digit', minute: '2-digit' })}
                                                                <span className="text-slate-500 mx-2 font-normal text-base">-</span>
                                                                {formatDate(act.eventEnd, { hour: '2-digit', minute: '2-digit' })}
                                                            </td>
                                                            <td className="py-5 md:py-6 px-8">
                                                                <div className={`text-xl md:text-2xl font-bold ${isHappeningNow ? 'text-white' : 'text-slate-200'}`}>
                                                                    {eventName}
                                                                </div>
                                                                {/* Mobile category view */}
                                                                <div className="mt-2 md:hidden">
                                                                    <span className="inline-block px-3 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-semibold text-slate-300 tracking-wider">
                                                                        {catName}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-5 md:py-6 px-8 hidden md:table-cell">
                                                                <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold tracking-wider uppercase ${isHappeningNow ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                                                    {catName}
                                                                </span>
                                                            </td>
                                                            <td className="py-5 md:py-6 px-8 text-right font-mono text-lg text-slate-500 font-medium">
                                                                {durationStr}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
