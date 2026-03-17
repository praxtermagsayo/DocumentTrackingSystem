import { useState, useEffect, useCallback } from 'react';
import { Building, Plus, Trash2, UserPlus, Users, Search, X, Check, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    fetchUsersWithDepartments,
    assignUserToDepartment,
    UserProfileWithDepartment
} from '../services/departments';
import { Department } from '../types';
import { toast } from '../lib/toast';
import { PageTransition } from './page-transition';
import { Skeleton } from './ui/skeleton';

export function Departments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<UserProfileWithDepartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'list' | 'users'>('list');

    // Department Form State
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [deptName, setDeptName] = useState('');
    const [deptCode, setDeptCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [depts, usersList] = await Promise.all([
                fetchDepartments(),
                fetchUsersWithDepartments()
            ]);
            setDepartments(depts);
            setUsers(usersList);
        } catch (err) {
            toast.error('Failed to load department data');
            console.error(err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        // Real-time subscriptions
        const deptsChannel = supabase
            .channel('public:departments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, () => {
                loadData(true);
            })
            .subscribe();

        const profilesChannel = supabase
            .channel('public:profiles-depts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                loadData(true);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(deptsChannel);
            supabase.removeChannel(profilesChannel);
        };
    }, [loadData]);

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deptName.trim() || !deptCode.trim()) {
            toast.error('Name and Code are required');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing) {
                await updateDepartment(isEditing, deptName.trim(), deptCode.trim().toUpperCase());
                toast.success('Department updated');
            } else {
                await createDepartment(deptName.trim(), deptCode.trim().toUpperCase());
                toast.success('Department created');
            }
            setDeptName('');
            setDeptCode('');
            setIsEditing(null);
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Action failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure? This will unassign all users from this department.')) return;
        try {
            await deleteDepartment(id);
            toast.success('Department deleted');
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete');
        }
    };

    const handleAssign = async (userId: string, deptId: string | null) => {
        try {
            await assignUserToDepartment(userId, deptId);
            toast.success('User assignment updated');
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Assignment failed');
        }
    };

    const filteredUsers = users.filter(u =>
        u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const cardStyle = { backgroundColor: 'var(--card)', borderColor: 'var(--border)' };
    const textStyle = { color: 'var(--foreground)' };
    const mutedStyle = { color: 'var(--muted-foreground)' };
    const inputStyle = { backgroundColor: 'var(--input-background)', color: 'var(--foreground)', borderColor: 'var(--border)' };

    const [selectedDeptIdForAssignment, setSelectedDeptIdForAssignment] = useState<string | null>(null);
    const [selectedUsersForBulk, setSelectedUsersForBulk] = useState<string[]>([]);
    const [isAddingUsers, setIsAddingUsers] = useState(false);
    const [addUserSearch, setAddUserSearch] = useState('');

    const selectedDept = departments.find(d => d.id === selectedDeptIdForAssignment);
    const departmentUsers = users.filter(u => u.department_id === selectedDeptIdForAssignment);
    const unassignedUsers = users.filter(u => !u.department_id);

    // Refresh user data specifically for the active tab/view
    const loadUsers = useCallback(async () => {
        const data = await fetchUsersWithDepartments();
        setUsers(data);
    }, []);

    useEffect(() => {
        if (activeTab === 'users' || selectedDeptIdForAssignment) {
            loadUsers();
        }
    }, [activeTab, selectedDeptIdForAssignment, loadUsers]);

    const filteredUnassigned = unassignedUsers.filter(u =>
        u.display_name?.toLowerCase().includes(addUserSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(addUserSearch.toLowerCase())
    );

    const handleBulkAssign = async () => {
        if (!selectedDeptIdForAssignment || selectedUsersForBulk.length === 0) return;
        setIsSubmitting(true);
        try {
            await Promise.all(selectedUsersForBulk.map(uid => assignUserToDepartment(uid, selectedDeptIdForAssignment)));
            toast.success(`Assigned ${selectedUsersForBulk.length} users to ${selectedDept?.name}`);
            setSelectedUsersForBulk([]);
            setIsAddingUsers(false);
            await loadData();
        } catch (err: any) {
            toast.error(err.message || 'Bulk assignment failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageTransition className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2" style={textStyle}>
                        <Building className="size-6 text-blue-600" />
                        Department Management
                    </h1>
                    <p className="mt-1" style={mutedStyle}>Manage institutional departments and user assignments</p>
                </div>
            </div>

            <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                <button
                    onClick={() => {
                        setActiveTab('list');
                        setSelectedDeptIdForAssignment(null);
                    }}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'list' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'
                        }`}
                    style={activeTab !== 'list' ? mutedStyle : undefined}
                >
                    Departments
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-blue-500'
                        }`}
                    style={activeTab !== 'users' ? mutedStyle : undefined}
                >
                    User Assignment
                </button>
            </div>

            {activeTab === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border p-6 sticky top-6" style={cardStyle}>
                            <h2 className="text-lg font-semibold mb-4" style={textStyle}>
                                {isEditing ? 'Edit Department' : 'Create Department'}
                            </h2>
                            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={textStyle}>Department Name</label>
                                    <input
                                        type="text"
                                        value={deptName}
                                        onChange={(e) => setDeptName(e.target.value)}
                                        placeholder="e.g. Finance Department"
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={textStyle}>Department Code</label>
                                    <input
                                        type="text"
                                        value={deptCode}
                                        onChange={(e) => setDeptCode(e.target.value)}
                                        placeholder="e.g. FIN"
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                                        {isEditing ? 'Update' : 'Create'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(null);
                                                setDeptName('');
                                                setDeptCode('');
                                            }}
                                            className="px-4 py-2 rounded-lg border font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl border overflow-hidden" style={cardStyle}>
                            <table className="w-full">
                                <thead className="bg-[var(--muted)]/50 border-b" style={{ borderColor: 'var(--border)' }}>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={mutedStyle}>Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={mutedStyle}>Code</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={mutedStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                    {loading ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i}>
                                                <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                                                <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : departments.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center" style={mutedStyle}>
                                                No departments found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        departments.map((dept) => (
                                            <tr key={dept.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium" style={textStyle}>{dept.name}</td>
                                                <td className="px-6 py-4 text-sm" style={mutedStyle}>
                                                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-mono text-xs">
                                                        {dept.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setIsEditing(dept.id);
                                                                setDeptName(dept.name);
                                                                setDeptCode(dept.code);
                                                            }}
                                                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                            style={mutedStyle}
                                                        >
                                                            <UserPlus className="size-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(dept.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="size-4" />
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
                </div>
            ) : !selectedDeptIdForAssignment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map(dept => {
                        const count = users.filter(u => u.department_id === dept.id).length;
                        return (
                            <button
                                key={dept.id}
                                onClick={() => setSelectedDeptIdForAssignment(dept.id)}
                                className="p-6 rounded-xl border text-left hover:border-blue-500 transition-all group"
                                style={cardStyle}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Users className="size-5" />
                                    </div>
                                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800" style={mutedStyle}>
                                        {dept.code}
                                    </span>
                                </div>
                                <h3 className="font-semibold" style={textStyle}>{dept.name}</h3>
                                <p className="text-sm mt-1" style={mutedStyle}>{count} assigned users</p>
                                <div className="mt-4 flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Manage Users <ChevronRight className="size-3 ml-1" />
                                </div>
                            </button>
                        );
                    })}
                    {departments.length === 0 && (
                        <div className="col-span-full py-12 text-center rounded-xl border-2 border-dashed" style={{ borderColor: 'var(--border)' }}>
                            <Building className="size-12 mx-auto mb-3 opacity-20" style={textStyle} />
                            <p style={mutedStyle}>No departments available for assignment.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => {
                                setSelectedDeptIdForAssignment(null);
                                setIsAddingUsers(false);
                                loadData();
                            }}
                            className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
                            style={mutedStyle}
                        >
                            <ChevronLeft className="size-4" />
                            Back to Departments
                        </button>
                        <h2 className="text-lg font-semibold" style={textStyle}>{selectedDept?.name}</h2>
                        <button
                            onClick={() => setIsAddingUsers(!isAddingUsers)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            {isAddingUsers ? <X className="size-4" /> : <Plus className="size-4" />}
                            {isAddingUsers ? 'Cancel' : 'Add Users'}
                        </button>
                    </div>

                    {isAddingUsers && (
                        <div className="p-6 rounded-xl border animate-in slide-in-from-top-4" style={cardStyle}>
                            <h3 className="text-sm font-semibold mb-4" style={textStyle}>Add Users to {selectedDept?.name}</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={mutedStyle} />
                                    <input
                                        type="text"
                                        placeholder="Search unassigned users..."
                                        value={addUserSearch}
                                        onChange={(e) => setAddUserSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                                        style={inputStyle}
                                    />
                                </div>

                                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 fade-scroll border-y py-4" style={{ borderColor: 'var(--border)' }}>
                                    {filteredUnassigned.length === 0 ? (
                                        <p className="text-center py-8 text-sm" style={mutedStyle}>No unassigned users found.</p>
                                    ) : (
                                        filteredUnassigned.map(u => (
                                            <label
                                                key={u.id}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--muted)]/50 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsersForBulk.includes(u.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedUsersForBulk([...selectedUsersForBulk, u.id]);
                                                        } else {
                                                            setSelectedUsersForBulk(selectedUsersForBulk.filter(id => id !== u.id));
                                                        }
                                                    }}
                                                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium" style={textStyle}>{u.display_name}</p>
                                                    <p className="text-xs" style={mutedStyle}>{u.email}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-xs" style={mutedStyle}>
                                        {selectedUsersForBulk.length} users selected
                                    </p>
                                    <button
                                        onClick={handleBulkAssign}
                                        disabled={selectedUsersForBulk.length === 0 || isSubmitting}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                        Assign Selected
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="rounded-xl border overflow-hidden" style={cardStyle}>
                        <table className="w-full">
                            <thead className="bg-[var(--muted)]/50 border-b" style={{ borderColor: 'var(--border)' }}>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={mutedStyle}>User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={mutedStyle}>Email</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={mutedStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i}>
                                            <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                                            <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : departmentUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center" style={mutedStyle}>
                                            No users assigned to this department.
                                        </td>
                                    </tr>
                                ) : (
                                    departmentUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-[var(--muted)]/30 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium" style={textStyle}>{u.display_name}</td>
                                            <td className="px-6 py-4 text-sm" style={mutedStyle}>{u.email}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleAssign(u.id, null)}
                                                    className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                                                >
                                                    Unassign
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </PageTransition>
    );
}
