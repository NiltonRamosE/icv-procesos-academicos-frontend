import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/app-sidebar"
import { ChartAreaInteractive } from "@/dashboard/components/chart-area-interactive"
import { DataTable } from "@/dashboard/components/data-table"
import { SectionCards } from "@/dashboard/components/section-cards"
import { SiteHeader } from "@/dashboard/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { config } from "config"

export default function DashboardICV() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.group('🔄 DASHBOARD: Inicialización');
    
    // Leer cookie con JSON del login de Google
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? decodeURIComponent(match[2]) : null
    }

    const authDataStr = getCookie('auth_data')
    console.log("authDataStr", authDataStr)
    if (authDataStr) {
      const authData = JSON.parse(authDataStr)
      console.log("authData", authData)
      localStorage.setItem('token', JSON.stringify(authData.token))
      localStorage.setItem('user', JSON.stringify(authData.user))
      document.cookie = "auth_data=; path=/; max-age=0"
    }
    const t = window.localStorage.getItem("token");
    const u = window.localStorage.getItem("user");
    
    console.log('🔑 Token from localStorage:', t ? `${t.substring(0, 30)}...` : 'NO TOKEN');
    console.log('👤 User from localStorage (raw):', u);
    
    setToken(t ?? null)
    
    try { 
      const userData = u ? JSON.parse(u) : null;
      setUser(userData);
      
      console.log('✅ Parsed user data:', userData);
      console.log('🎭 User role:', userData?.role);
      console.log('📧 User email:', userData?.email);
      console.log('🆔 User id:', userData?.id);
      
      if (userData && t) {
        console.log('✅ Usuario y token válidos, iniciando carga del dashboard...');
        fetchDashboardData(userData.role, t);
      } else {
        console.warn('⚠️ No hay token o usuario, no se puede cargar el dashboard');
        setError('No hay sesión activa. Por favor inicia sesión.');
        setLoading(false);
      }
    } catch (error) { 
      console.error('❌ Error parsing user data:', error);
      setUser(null);
      setError('Error al procesar datos de usuario');
      setLoading(false);
    }
    
    setMounted(true)
  }, [])


  const fetchDashboardData = async (role: string, token: string) => {
    console.group('📡 DASHBOARD: Fetch Data');
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '';
      
      // Determinar el endpoint según el rol
      switch(role) {
        case 'admin':
          endpoint = `${config.apiUrl}/api/admin/dashboard`;
          break;
        case 'teacher':
        case 'instructor':
          endpoint = `${config.apiUrl}/api/teacher/dashboard`;
          break;
        case 'student':
          endpoint = `${config.apiUrl}/api/student/dashboard`;
          break;
        default:
          console.warn('⚠️ Rol no reconocido, usando endpoint de student por defecto');
          endpoint = `${config.apiUrl}/api/student/dashboard`;
      }

      console.log('🌐 API URL:', config.apiUrl);
      console.log('📍 Endpoint completo:', endpoint);
      console.log('🔑 Token (preview):', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
      console.log('🎭 Role:', role);

      console.log('⏳ Iniciando petición fetch...');
      const startTime = performance.now();

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      console.log('📊 Response recibida:', {
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        ok: response.ok,
        headers: {
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Dashboard data recibida exitosamente');
        console.log('📦 Data completa:', data);
        console.log('📊 Stats:', data.stats);
        console.log('📈 Chart data:', data.enrollment_trend || data.students_per_group || data.grades_trend);
        console.log('📋 Table data:', data.recent_activity || data.upcoming_classes || data.upcoming_evaluations);
        
        setDashboardData(data);
        console.log('✅ Estado actualizado con los datos del dashboard');
        
      } else {
        const errorText = await response.text();
        console.error('❌ Error HTTP:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorMessage = 'Error al cargar el dashboard';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
          console.error('❌ Error JSON:', errorJson);
        } catch (e) {
          console.error('❌ Error (texto plano):', errorText);
        }
        
        setError(errorMessage);
        
        // Si es 401, el token expiró o es inválido
        if (response.status === 401) {
          console.warn('⚠️ Token inválido o expirado (401)');
          setError('Sesión expirada. Por favor inicia sesión nuevamente.');
          // Opcional: Limpiar localStorage y redirigir
          // window.localStorage.clear();
          // window.location.href = '/login';
        } else if (response.status === 403) {
          console.warn('⚠️ Acceso denegado (403)');
          setError('No tienes permisos para acceder a este dashboard.');
        } else if (response.status === 404) {
          console.warn('⚠️ Perfil no encontrado (404)');
          setError('No se encontró tu perfil. Contacta al administrador.');
        }
      }
    } catch (error) {
      console.error('❌ Error en fetchDashboardData:', error);
      console.error('❌ Error stack:', (error as Error).stack);
      setError('Error de conexión con el servidor. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  if (!mounted) {
    console.log('⏳ Componente no montado aún...');
    return null;
  }

  console.log('🎨 Renderizando dashboard:', {
    loading,
    error,
    hasData: !!dashboardData,
    user: user?.email,
    role: user?.role
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" token={token} user={user}/>
      <SidebarInset>
        <SiteHeader 
          title={`Dashboard: ${
            user?.role === 'admin' ? 'Administración' : 
            user?.role === 'teacher' || user?.role === 'instructor' ? 'Docente' : 
            'Estudiante'
          }`}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {loading ? (
                <div className="px-4 lg:px-6">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Cargando datos del dashboard...</p>
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="px-4 lg:px-6">
                  <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Error</h3>
                    <p className="text-muted-foreground">{error}</p>
                    <button 
                      onClick={() => {
                        console.log('🔄 Reintentando carga del dashboard...');
                        fetchDashboardData(user?.role, token!);
                      }}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <SectionCards data={dashboardData} role={user?.role} />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive data={dashboardData} role={user?.role} />
                  </div>
                  <DataTable data={dashboardData} role={user?.role} />
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}