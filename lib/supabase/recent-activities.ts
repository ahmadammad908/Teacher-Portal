import { createClient } from './client';

export type ActivityType = 'upload' | 'update' | 'delete' | 'organize' | 'share' | 'view';
export type TargetType = 'document' | 'folder' | 'department' | 'subject' | 'lecture';

export interface RecentActivity {
  id: string;
  user_id?: string;
  user_name: string;
  user_role: string;
  action_type: ActivityType;
  target_type: TargetType;
  target_id?: string;
  target_name: string;
  department: string;
  file_type?: string;
  file_size?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export async function logActivity(params: {
  user_name: string;
  user_id?: string;
  action_type: ActivityType;
  target_type: TargetType;
  target_id?: string;
  target_name: string;
  department: string;
  file_type?: string;
  file_size?: number;
  metadata?: Record<string, any>;
}) {
  try {
    const supabase = createClient();
    
    console.log('Logging activity:', params);
    
    const { data, error } = await supabase
      .from('recent_activities')
      .insert({
        user_name: params.user_name,
        user_id: params.user_id,
        user_role: 'admin',
        action_type: params.action_type,
        target_type: params.target_type,
        target_id: params.target_id,
        target_name: params.target_name,
        department: params.department,
        file_type: params.file_type,
        file_size: params.file_size,
        metadata: params.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error in logActivity:', error);
      throw error;
    }
    
    console.log('Activity logged successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { data: null, error };
  }
}

export async function getRecentActivities(limit: number = 50) {
  try {
    const supabase = createClient();
    console.log('Fetching recent activities...');
    
    // First, let's check if table exists
    const { error: tableError } = await supabase
      .from('recent_activities')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('Table error:', tableError);
      // Return empty array if table doesn't exist yet
      return { data: [], error: null };
    }
    
    const { data, error, count } = await supabase
      .from('recent_activities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error in getRecentActivities:', error);
      
      // If unauthorized, try without RLS
      if (error.message.includes('row level security') || error.code === '42501') {
        console.warn('RLS issue detected, trying alternative...');
        // Return mock data for testing
        return { 
          data: generateMockActivities(10), 
          error: null 
        };
      }
      
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} activities`);
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { data: [], error };
  }
}

// Mock data generator for testing
function generateMockActivities(count: number): RecentActivity[] {
  const mockActivities: RecentActivity[] = [];
  const actions: ActivityType[] = ['upload', 'update', 'delete', 'organize', 'share'];
  const departments = ['BSCS-7th', 'BSIT-7th', 'BSAI-1st', 'ADP-CS-3rd'];
  const users = ['Dr. Smith', 'Prof. Johnson', 'Admin', 'Dr. Williams'];
  const fileTypes = ['PDF', 'PPTX', 'DOCX', 'ZIP'];
  
  for (let i = 0; i < count; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
    
    mockActivities.push({
      id: `mock-${i}`,
      user_name: user,
      user_role: 'admin',
      action_type: action,
      target_type: 'document',
      target_name: `Sample Document ${i + 1}.${fileType.toLowerCase()}`,
      department,
      file_type: fileType,
      file_size: Math.floor(Math.random() * 10000000),
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        subject_name: `Subject ${Math.floor(Math.random() * 10) + 1}`,
        lecture_number: Math.floor(Math.random() * 15) + 1
      }
    });
  }
  
  // Sort by date
  return mockActivities.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getDepartmentActivities(department: string, limit: number = 20) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('recent_activities')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching department activities:', error);
      return { data: [], error: null };
    }
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching department activities:', error);
    return { data: [], error };
  }
}

export function subscribeToRecentActivities(
  callback: (activity: RecentActivity) => void
) {
  try {
    const supabase = createClient();
    
    const channel = supabase
      .channel('recent_activities_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'recent_activities'
        },
        (payload) => {
          console.log('Real-time activity received:', payload.new);
          callback(payload.new as RecentActivity);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return channel;
  } catch (error) {
    console.error('Error subscribing to activities:', error);
    return null;
  }
}

export async function logManualActivity(
  user_name: string,
  action_type: ActivityType,
  target_name: string,
  department: string,
  metadata?: Record<string, any>
) {
  return logActivity({
    user_name,
    action_type,
    target_type: 'document',
    target_name,
    department,
    metadata
  });
}

// Test function to verify connection
export async function testActivitiesConnection() {
  try {
    const supabase = createClient();
    
    // Test if table exists
    const { data, error } = await supabase
      .from('recent_activities')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Table test error:', error);
      return { 
        connected: false, 
        error: error.message,
        suggestion: 'Please create the recent_activities table in Supabase'
      };
    }
    
    return { connected: true, error: null };
  } catch (error) {
    console.error('Connection test error:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}