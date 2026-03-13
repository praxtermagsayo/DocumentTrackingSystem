import { supabase } from '../lib/supabase';
import type { Department } from '../types';

export async function fetchDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        code: row.code,
        createdAt: row.created_at
    }));
}

export async function createDepartment(name: string, code: string): Promise<Department> {
    const { data, error } = await supabase
        .from('departments')
        .insert({ name, code })
        .select()
        .single();

    if (error) throw error;
    return {
        id: data.id,
        name: data.name,
        code: data.code,
        createdAt: data.created_at
    };
}

export async function updateDepartment(id: string, name: string, code: string): Promise<void> {
    const { error } = await supabase
        .from('departments')
        .update({ name, code })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function assignUserToDepartment(userId: string, departmentId: string | null): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({ department_id: departmentId })
        .eq('id', userId);

    if (error) throw error;
}

export interface UserProfileWithDepartment {
    id: string;
    email: string;
    display_name: string;
    department_id: string | null;
    department_name?: string;
    department_code?: string;
}

export async function fetchUsersWithDepartments(): Promise<UserProfileWithDepartment[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
      id,
      email,
      display_name,
      department_id,
      departments:department_id (
        name,
        code
      )
    `)
        .order('display_name', { ascending: true });

    if (error) throw error;

    return (data || []).map((row: any) => ({
        id: row.id,
        email: row.email,
        display_name: row.display_name,
        department_id: row.department_id,
        department_name: row.departments?.name,
        department_code: row.departments?.code
    }));
}
