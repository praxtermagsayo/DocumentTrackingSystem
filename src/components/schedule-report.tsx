import { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import * as activityService from '../services/activities';
import * as eventCategoryService from '../services/eventCategories';
import type { Activity, EventCategory } from '../types';
import '../styles/weekly-schedule.css';

export function ScheduleReport() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<EventCategory[]>([]);
    const [theme, setTheme] = useState<'light' | 'dark'>(
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );

    const loadData = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        try {
            const cats = await eventCategoryService.fetchEventCategories();
            setCategories(cats);
        } catch {
            setCategories([]);
        }
        try {
            const allActs = await activityService.fetchActivities();

            // Calculate Mon-Fri for the current week
            const now = new Date();
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(now);
            monday.setDate(now.getDate() + diffToMonday);
            monday.setHours(0, 0, 0, 0);

            const friday = new Date(monday);
            friday.setDate(monday.getDate() + 4);
            friday.setHours(23, 59, 59, 999);

            // Filter activities that touch Mon-Fri
            const thisWeekActs = allActs.filter((act) => {
                const actStart = new Date(act.eventStart);
                const actEnd = new Date(act.eventEnd);
                return (actStart <= friday && actEnd >= monday);
            });

            // Sort by start date
            thisWeekActs.sort((a, b) => new Date(a.eventStart).getTime() - new Date(b.eventStart).getTime());

            setActivities(thisWeekActs);
        } catch {
            setActivities([]);
        }
        setLoading(false);
    }, []);

    // Auto-refresh and Real-time sync
    useEffect(() => {
        loadData();
        
        // Subscribe to real-time sync with improved reliability
        const channel = supabase
            .channel('public:activities')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'activities' },
                () => loadData()
            )
            .subscribe();

        // Robust Theme change detection
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains('dark');
            setTheme(isDark ? 'dark' : 'light');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // localStorage theme listener (for changes in Settings)
        const handleStorage = (eList: StorageEvent) => {
            if (eList.key === 'theme' || eList.key === 'dark-mode') {
                const isDark = document.documentElement.classList.contains('dark');
                setTheme(isDark ? 'dark' : 'light');
            }
        };
        window.addEventListener('storage', handleStorage);

        const interval = setInterval(() => loadData(), 5 * 60 * 1000);
        
        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
            observer.disconnect();
            window.removeEventListener('storage', handleStorage);
        };
    }, [loadData]);

    // Calculate dates for Mon-Fri
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekDays = [0, 1, 2, 3, 4].map(i => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return date;
    });

    const getGridPos = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const startIdx = Math.floor((start.getTime() - monday.getTime()) / (24 * 60 * 60 * 1000));
        const endIdx = Math.ceil((end.getTime() - monday.getTime()) / (24 * 60 * 60 * 1000));
        const colStart = Math.max(0, startIdx) + 1;
        const colEnd = Math.min(5, endIdx) + 1;
        if (colEnd <= colStart) return null;
        return { colStart, colSpan: colEnd - colStart };
    };

    const rows: Activity[][] = [];
    activities.forEach(act => {
        const pos = getGridPos(act.eventStart, act.eventEnd);
        if (!pos) return;
        let placed = false;
        for (const row of rows) {
            const overlaps = row.some(rowAct => {
                const rPos = getGridPos(rowAct.eventStart, rowAct.eventEnd);
                if (!rPos) return false;
                return !(pos.colStart >= rPos.colStart + rPos.colSpan || pos.colStart + pos.colSpan <= rPos.colStart);
            });
            if (!overlaps) {
                row.push(act);
                placed = true;
                break;
            }
        }
        if (!placed) rows.push([act]);
    });

    return (
        <div key={theme} className="schedule-container p-4 md:p-12 transition-colors duration-500">
            <div className="max-w-[1700px] mx-auto space-y-12">
                <header className="flex flex-col items-center gap-2 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black tracking-widest uppercase text-slate-900 dark:text-white">
                        {monday.toLocaleDateString('en-US', { month: 'long' })}
                        <span className="text-blue-600 dark:text-blue-400 ml-4">{monday.getFullYear()}</span>
                    </h1>
                    <div className="h-1 w-24 bg-blue-600 rounded-full"></div>
                </header>

                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid-main-container">
                        <div className="header-row" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
                            {weekDays.map((date, i) => {
                                const isToday = new Date().toDateString() === date.toDateString();
                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                                return (
                                    <div key={i} className={`day-header-cell ${isToday ? 'is-today' : ''} last:border-0`}>
                                        <div className={`text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                            {dayName}
                                        </div>
                                        <div className={`text-3xl font-black ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-400'}`}>
                                            {date.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="relative p-12">
                            <div className="absolute inset-0 grid pointer-events-none opacity-[0.03] dark:opacity-[0.05]" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="border-r border-slate-900 dark:border-white h-full last:border-0"></div>
                                ))}
                            </div>

                            <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
                                {weekDays.map((date, i) => {
                                    const isToday = new Date().toDateString() === date.toDateString();
                                    return <div key={i} className={`column-highlight ${isToday ? 'opacity-100' : 'opacity-0'}`}></div>
                                })}
                            </div>

                            <div className="relative z-10 space-y-12">
                                {rows.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-40 text-slate-300 dark:text-slate-700">
                                        <Calendar className="size-24 mb-8 opacity-20" />
                                        <p className="font-black uppercase tracking-[0.4em] text-sm">Empty Schedule</p>
                                    </div>
                                ) : (
                                    rows.map((row, rowIdx) => (
                                        <div key={rowIdx} className="grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '2rem' }}>
                                            {row.map(act => {
                                                const pos = getGridPos(act.eventStart, act.eventEnd);
                                                if (!pos) return null;
                                                const cat = categories.find(c => c.id === act.categoryId);
                                                const now = new Date();
                                                const actStart = new Date(act.eventStart);
                                                const actEnd = new Date(act.eventEnd);
                                                const isPast = now > actEnd;
                                                const isOngoing = now >= actStart && now <= actEnd;
                                                const formatT = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                                                const getDayLabel = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                                                const showDays = pos.colSpan > 1;

                                                return (
                                                    <div
                                                        key={act.id}
                                                        className={`event-card animate-wave ${isOngoing ? 'is-ongoing' : ''} ${isPast ? 'is-past' : ''}`}
                                                        style={{ gridColumn: `${pos.colStart} / span ${pos.colSpan}`, animationDelay: `${pos.colStart * 0.2}s` }}
                                                    >
                                                        <div className="flex flex-col h-full">
                                                            <div className="category-label bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 mb-3">
                                                                {cat?.name || 'Event'}
                                                            </div>
                                                            <h3 className="title mb-4">{act.description || cat?.name}</h3>
                                                            <div className="time-badge-group justify-center">
                                                                <div className="time-badge">
                                                                    {showDays && <span className="text-blue-500 font-bold mr-1">{getDayLabel(actStart)}</span>}
                                                                    {formatT(actStart)}
                                                                </div>
                                                                <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                                                                <div className="time-badge">
                                                                    {showDays && <span className="text-blue-500 font-bold mr-1">{getDayLabel(actEnd)}</span>}
                                                                    {formatT(actEnd)}
                                                                </div>
                                                                {isOngoing && (
                                                                    <div className="ml-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[9px] font-black uppercase tracking-tighter">
                                                                        <span className="relative flex h-1.5 w-1.5">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                                                        </span>
                                                                        Ongoing
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {showDays && <div className="multi-day-glow"><div className="multi-day-dot"></div></div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
