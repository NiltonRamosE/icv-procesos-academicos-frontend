// src/lib/api/graduatesApi.ts
import { config } from "config";

// ✅ CORREGIDO: Agregar /api si config.apiUrl no lo tiene
const API_URL = config.apiUrl.endsWith('/api') 
  ? config.apiUrl 
  : `${config.apiUrl}/api`;

// ✅ Función para limpiar el token
const cleanToken = (token: string | null): string => {
  if (!token) return '';
  let cleaned = token.replace(/^["']|["']$/g, '').trim();
  return cleaned;
};

// ============================================
// TIPOS / INTERFACES
// ============================================

export interface EmploymentProfileData {
  employment_status: string;
  company_name: string;
  position: string;
  start_date: string;
  salary_range: string;
  industry: string;
  is_related_to_studies: boolean;
}

export interface SurveyQuestion {
  id: number;
  question: string;
  type: "text" | "rating" | "multiple_choice";
  options?: string[];
}

export interface Survey {
  id: number;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  completed: boolean;
  completed_at?: string;
}

export interface StatisticsData {
  total_graduates: number;
  employed_count: number;
  employment_rate: number;
  average_salary_range: string;
  related_work_percentage: number;
  top_industries: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  employment_by_status: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

// ============================================
// EMPLOYMENT PROFILE API
// ============================================

export const employmentProfileApi = {
  async get(token: string): Promise<EmploymentProfileData | null> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO: Sin /api duplicado
      const response = await fetch(`${API_URL}/employment-profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
      });
      
      if (response.status === 404) {
        return null;
      }

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        throw new Error("Error al obtener el perfil laboral");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error en employmentProfileApi.get:", error);
      throw error;
    }
  },

  async save(token: string, data: EmploymentProfileData): Promise<EmploymentProfileData> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/employment-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al guardar el perfil laboral");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error en employmentProfileApi.save:", error);
      throw error;
    }
  },

  async delete(token: string): Promise<void> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/employment-profile`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        throw new Error("Error al eliminar el perfil laboral");
      }
    } catch (error) {
      console.error("Error en employmentProfileApi.delete:", error);
      throw error;
    }
  },
};

// ============================================
// SURVEYS API
// ============================================

export const surveysApi = {
  async list(token: string): Promise<Survey[]> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const url = `${API_URL}/surveys`;
      
      console.log('🔍 Fetching surveys from:', url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cleanedToken}`,
          "Accept": "application/json",
        },
      });

      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token inválido o expirado');
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || "Error al obtener las encuestas");
      }

      const result = await response.json();
      console.log('✅ Surveys loaded:', result);
      return result.data || [];
    } catch (error) {
      console.error("❌ Error en surveysApi.list:", error);
      throw error;
    }
  },

  async get(token: string, surveyId: number): Promise<Survey> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/surveys/${surveyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        throw new Error("Error al obtener la encuesta");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error en surveysApi.get:", error);
      throw error;
    }
  },

  async submitResponse(
    token: string,
    surveyId: number,
    answers: Record<number, string>
  ): Promise<void> {
    try {
      const cleanedToken = cleanToken(token);
      
      console.log('📤 Enviando respuestas al servidor...');
      console.log('📋 Survey ID:', surveyId);
      console.log('📝 Answers:', answers);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/surveys/${surveyId}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      console.log('📡 Response status:', response.status);

      if (response.status === 401) {
        console.error('❌ 401 Unauthorized al enviar respuestas');
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('❌ Error response:', error);
        throw new Error(error.message || "Error al enviar las respuestas");
      }

      console.log('✅ Respuestas enviadas exitosamente');
    } catch (error) {
      console.error("❌ Error en surveysApi.submitResponse:", error);
      throw error;
    }
  },

  async getResponse(
    token: string,
    surveyId: number
  ): Promise<Record<number, string>> {
    try {
      const cleanedToken = cleanToken(token);
      
      console.log('📖 Obteniendo respuestas de encuesta ID:', surveyId);
      
      // ✅ CORREGIDO: Ahora la ruta está bien en api.php
      const response = await fetch(`${API_URL}/surveys/${surveyId}/responses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (response.status === 404) {
        console.log('ℹ️ No hay respuestas guardadas para esta encuesta');
        return {};
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Error al obtener las respuestas");
      }

      const result = await response.json();
      console.log('✅ Respuestas obtenidas del servidor:', result);
      
      const answersMap: Record<number, string> = {};
      
      if (result.data?.answers) {
        result.data.answers.forEach((item: any) => {
          answersMap[item.question_id] = item.answer;
        });
      }
      
      console.log('✅ Respuestas mapeadas:', answersMap);
      return answersMap;
    } catch (error) {
      console.error("❌ Error en surveysApi.getResponse:", error);
      throw error;
    }
  },

  // ============================================
  // ADMIN: Gestión de encuestas
  // ============================================

  async create(
    token: string,
    data: {
      title: string;
      target_type?: string;
      questions: Array<{
        question_text: string;
        question_type: "text" | "rating" | "multiple_choice";
      }>;
    }
  ): Promise<Survey> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/surveys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la encuesta");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error en surveysApi.create:", error);
      throw error;
    }
  },

  async update(
    token: string,
    surveyId: number,
    data: {
      title?: string;
      target_type?: string;
    }
  ): Promise<Survey> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/surveys/${surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar la encuesta");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error en surveysApi.update:", error);
      throw error;
    }
  },

  async delete(token: string, surveyId: number): Promise<void> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/surveys/${surveyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        throw new Error("Error al eliminar la encuesta");
      }
    } catch (error) {
      console.error("Error en surveysApi.delete:", error);
      throw error;
    }
  },
};

// ============================================
// STATISTICS API (ADMIN ONLY)
// ============================================

export const statisticsApi = {
  async get(token: string): Promise<StatisticsData> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/graduate-statistics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        throw new Error("Error al obtener las estadísticas");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error en statisticsApi.get:", error);
      throw error;
    }
  },

  async exportReport(token: string): Promise<StatisticsData> {
    try {
      const cleanedToken = cleanToken(token);
      
      // ✅ CORREGIDO
      const response = await fetch(`${API_URL}/graduate-statistics/export`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanedToken}`,
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      }

      if (!response.ok) {
        throw new Error("Error al exportar el reporte");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error en statisticsApi.exportReport:", error);
      throw error;
    }
  },
};

// ============================================
// EXPORTAR API COMPLETA
// ============================================

export const graduatesApi = {
  employmentProfile: employmentProfileApi,
  surveys: surveysApi,
  statistics: statisticsApi,
};

export default graduatesApi;