import { useState, useEffect } from 'react';

interface DashboardData {
  cards?: any;
  enrollment_trend?: any[];
  students_per_group?: any[];
  grades_trend?: any[];
  recent_activity?: any[];
  upcoming_classes?: any[];
  upcoming_evaluations?: any[];
}

interface UseDashboardReturn {
  data: DashboardData | null;
  role: string;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [role, setRole] = useState<string>('student');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    console.log('🚀 [useDashboard] Starting fetch...');
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token'); // O donde guardes tu token
      console.log('🔑 [useDashboard] Token:', token ? 'Present' : 'Missing');

      const response = await fetch('http://localhost:8000/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('📡 [useDashboard] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [useDashboard] Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [useDashboard] Success response:', result);
      console.log('👤 [useDashboard] Role detected:', result.role);
      console.log('📊 [useDashboard] Data keys:', Object.keys(result.data || {}));

      setData(result.data);
      setRole(result.role);

      // Log específico por rol
      if (result.role === 'admin') {
        console.log('👑 [Admin] Cards:', result.data?.cards);
        console.log('👑 [Admin] Trend records:', result.data?.enrollment_trend?.length || 0);
      } else if (result.role === 'teacher' || result.role === 'instructor') {
        console.log('👨‍🏫 [Teacher] Cards:', result.data?.cards);
        console.log('👨‍🏫 [Teacher] Groups:', result.data?.students_per_group?.length || 0);
      } else {
        console.log('👨‍🎓 [Student] Cards:', result.data?.cards);
        console.log('👨‍🎓 [Student] Grades:', result.data?.grades_trend?.length || 0);
      }

    } catch (err) {
      console.error('💥 [useDashboard] Fatal error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
      console.log('🏁 [useDashboard] Fetch completed');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    role,
    loading,
    error,
    refetch: fetchDashboard
  };
}