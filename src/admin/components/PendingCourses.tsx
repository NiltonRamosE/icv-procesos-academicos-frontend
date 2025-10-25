// src/admin/components/PendingCourses.tsx
import React, { useState, useEffect } from "react";
import { AdminRoute } from "./AdminRoute";
import AdminLayout from "./AdminLayout";
import { config } from "../../../config";

// Interface basada en tu modelo Course
interface Course {
  id: number;
  title: string;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  categories?: any[];
  instructors?: any[];
  price?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  thumbnail?: string;
}

export default function PendingCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  // ✅ FUNCIONES DE AUTENTICACIÓN
  const checkAndRenewToken = async (): Promise<string | null> => {
    let token = localStorage.getItem("token")?.replace(/^"|"$/g, "");

    if (!token) {
      console.log("❌ No hay token disponible");
      return null;
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        console.log("✅ Token válido");
        return token;
      }
    } catch (error) {
      console.log("❌ Error verificando token:", error);
    }

    console.log("🔄 Token expirado");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
    return null;
  };

  const makeAuthenticatedRequest = async (
    url: string,
    options: RequestInit = {}
  ) => {
    let token = await checkAndRenewToken();

    if (!token) {
      throw new Error(
        "No hay token de autenticación disponible. Por favor, inicia sesión."
      );
    }

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    if (response.status === 401) {
      console.log("🔄 Token expirado durante la request");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    return response;
  };

  // ✅ CARGAR CURSOS PENDIENTES - RUTA CORRECTA
  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/pending-courses`, // ← RUTA CORRECTA
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📊 API Response Pending Courses:", result);

      let coursesData = [];

      if (result.data && Array.isArray(result.data.data)) {
        coursesData = result.data.data;
      } else if (Array.isArray(result.data)) {
        coursesData = result.data;
      } else if (Array.isArray(result)) {
        coursesData = result;
      } else {
        coursesData = [];
      }

      setCourses(coursesData);
      setFilteredCourses(coursesData);
      setSelectedCourses([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar cursos pendientes";
      setError(errorMessage);
      console.error("❌ Error fetching pending courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  // ✅ FILTRADO
  useEffect(() => {
    let filtered = courses;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((course) => {
        const searchableFields = [
          course.title,
          course.name,
          course.description,
          course.instructors?.[0]?.name,
          course.categories?.[0]?.name
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableFields.includes(searchTerm.toLowerCase());
      });
    }

    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

  // ✅ APROBAR CURSO - RUTA CORRECTA
  const handleApproveCourse = async (courseId: number) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/courses/${courseId}/approve`, // ← RUTA CORRECTA
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchPendingCourses();
        showNotification("✅ Curso aprobado exitosamente", "success");
      } else {
        throw new Error(result.message || "Error al aprobar curso");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al aprobar curso";
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // ✅ RECHAZAR CURSO - RUTA CORRECTA
  const handleRejectCourse = async () => {
    if (!selectedCourse) return;

    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/courses/${selectedCourse.id}/reject`, // ← RUTA CORRECTA
        {
          method: "POST",
          body: JSON.stringify({
            reason: rejectReason,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchPendingCourses();
        setShowRejectModal(false);
        setSelectedCourse(null);
        setRejectReason("");
        showNotification("✅ Curso rechazado exitosamente", "success");
      } else {
        throw new Error(result.message || "Error al rechazar curso");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al rechazar curso";
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // ✅ APROBACIÓN MASIVA - RUTA CORRECTA
  const handleBulkApprove = async () => {
    if (selectedCourses.length === 0) {
      showNotification("❌ Selecciona al menos un curso", "error");
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/courses/bulk-approve`, // ← RUTA CORRECTA
        {
          method: "POST",
          body: JSON.stringify({
            course_ids: selectedCourses,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchPendingCourses();
        showNotification(`✅ ${selectedCourses.length} cursos aprobados exitosamente`, "success");
      } else {
        throw new Error(result.message || "Error al aprobar cursos");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al aprobar cursos";
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // ✅ SELECCIÓN/DESELECCIÓN DE CURSOS
  const handleSelectCourse = (courseId: number) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.id));
    }
  };

  // ✅ FUNCIÓN DE NOTIFICACIÓN
  const showNotification = (
    message: string,
    type: "success" | "error" | "info"
  ) => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
      type === "success"
        ? "bg-green-900 border-green-500 text-green-300"
        : type === "error"
        ? "bg-red-900 border-red-500 text-red-300"
        : "bg-blue-900 border-blue-500 text-blue-300"
    }`;
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">${
          type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"
        }</span>
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-white">
          ×
        </button>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  };

  // Función para renovar sesión
  const handleRenewSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout title="Cursos Pendientes">
          <div className="w-full max-w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Cursos Pendientes
                </h1>
                <p className="text-gray-400">Cargando cursos pendientes...</p>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-lg border border-gray-700 animate-pulse p-6"
                >
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (error) {
    return (
      <AdminRoute>
        <AdminLayout title="Cursos Pendientes">
          <div className="w-full max-w-full">
            <div className="bg-red-900/20 border border-red-700/20 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-700/20 rounded-full flex items-center justify-center">
                  <span className="text-red-400">❌</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-400">
                    Error de Autenticación
                  </h3>
                  <p className="text-gray-400">{error}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={fetchPendingCourses}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Reintentar
                </button>
                <button
                  onClick={handleRenewSession}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Ir al Login
                </button>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout title="Cursos Pendientes">
        <div className="w-full max-w-full space-y-6">
          {/* Estadísticas Rápidas */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">
                  Total Pendientes
                </div>
                <div className="h-5 w-5 text-yellow-400">⏳</div>
              </div>
              <div className="text-2xl font-bold text-white">{courses.length}</div>
              <p className="text-xs text-gray-400 mt-1">
                Cursos en revisión
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">Seleccionados</div>
                <div className="h-5 w-5 text-blue-400">📋</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {selectedCourses.length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Para aprobación masiva</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">
                  Filtrados
                </div>
                <div className="h-5 w-5 text-green-400">🔍</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {filteredCourses.length}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Resultados de búsqueda
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">
                  Acciones
                </div>
                <div className="h-5 w-5 text-purple-400">⚡</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {selectedCourses.length > 0 ? "Listo" : "Esperando"}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {selectedCourses.length > 0 ? "Aprobar selección" : "Selecciona cursos"}
              </p>
            </div>
          </div>

          {/* Panel de Búsqueda y Acciones */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Revisión de Cursos Pendientes
            </h3>

            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Campo de búsqueda */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Buscar cursos...
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por título, descripción o instructor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-600 rounded-lg pl-10 pr-4 py-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Busca por título, descripción, categoría o instructor
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 lg:pt-7">
                <button
                  onClick={handleRenewSession}
                  className="inline-flex items-center px-4 py-3 bg-gray-600 text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
                >
                  <span className="mr-2">🔄</span>
                  Renovar Sesión
                </button>
                {selectedCourses.length > 0 && (
                  <button
                    onClick={handleBulkApprove}
                    className="inline-flex items-center px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <span className="mr-2">✅</span>
                    Aprobar Selección ({selectedCourses.length})
                  </button>
                )}
                <button
                  onClick={fetchPendingCourses}
                  className="inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">🔄</span>
                  Actualizar
                </button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {filteredCourses.length} curso{filteredCourses.length !== 1 ? "s" : ""} pendiente{filteredCourses.length !== 1 ? "s" : ""} de revisión
              </span>
              {selectedCourses.length > 0 && (
                <span className="text-sm text-blue-400">
                  {selectedCourses.length} curso{selectedCourses.length !== 1 ? "s" : ""} seleccionado{selectedCourses.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Tabla de Cursos Pendientes */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCourses.length === filteredCourses.length && filteredCourses.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-3">SELECCIONAR</span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      CURSO
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      INSTRUCTOR
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      DETALLES
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      FECHA
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                  {Array.isArray(filteredCourses) &&
                    filteredCourses.map((course) => (
                      <tr
                        key={course.id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleSelectCourse(course.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {course.title?.[0] || 'C'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-white">
                                {course.title || course.name}
                              </div>
                              <div className="text-sm text-gray-400 line-clamp-2">
                                {course.description?.substring(0, 100)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {course.instructors?.[0]?.name || 'Instructor no asignado'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {course.categories?.[0]?.name || 'Sin categoría'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            Nivel: {course.level ? 
                              course.level === 'beginner' ? 'Principiante' :
                              course.level === 'intermediate' ? 'Intermedio' : 'Avanzado'
                              : 'No especificado'
                            }
                          </div>
                          <div className="text-sm text-gray-400">
                            Duración: {course.duration ? `${course.duration} hrs` : 'No especificada'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {new Date(course.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(course.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveCourse(course.id)}
                              className="text-green-400 hover:text-green-300 bg-green-900/30 hover:bg-green-900/50 px-4 py-2 rounded transition-colors font-medium"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowRejectModal(true);
                              }}
                              className="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 px-4 py-2 rounded transition-colors font-medium"
                            >
                              Rechazar
                            </button>
                            <button
                              onClick={() => {
                                // Aquí podrías implementar una vista previa del curso
                                showNotification("👀 Función de vista previa en desarrollo", "info");
                              }}
                              className="text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 px-4 py-2 rounded transition-colors font-medium"
                            >
                              Vista Previa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Estado vacío */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-750 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">✅</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {courses.length === 0
                    ? "No hay cursos pendientes de revisión"
                    : "No se encontraron cursos con los filtros aplicados"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {courses.length === 0
                    ? "Todos los cursos han sido revisados y aprobados."
                    : "Intenta ajustar los términos de búsqueda."}
                </p>
                <button
                  onClick={fetchPendingCourses}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">🔄</span>
                  Actualizar Lista
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Rechazo */}
        {showRejectModal && selectedCourse && (
          <RejectCourseModal
            course={selectedCourse}
            onReject={handleRejectCourse}
            onClose={() => {
              setShowRejectModal(false);
              setSelectedCourse(null);
              setRejectReason("");
            }}
            reason={rejectReason}
            onReasonChange={setRejectReason}
          />
        )}
      </AdminLayout>
    </AdminRoute>
  );
}

// Modal para Rechazar Curso (se mantiene igual)
interface RejectCourseModalProps {
  course: Course;
  onReject: () => void;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
}

function RejectCourseModal({ course, onReject, onClose, reason, onReasonChange }: RejectCourseModalProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Por favor, proporciona un motivo para el rechazo.");
      return;
    }

    setLoading(true);
    try {
      await onReject();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-w-md w-full">
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Rechazar Curso
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Contenido del Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-gray-300 mb-2">
              Estás a punto de rechazar el curso:
            </p>
            <p className="text-white font-semibold text-lg">
              {course.title || course.name}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Motivo del rechazo *
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder-gray-400"
              placeholder="Explica por qué estás rechazando este curso..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Este motivo será registrado para futuras referencias.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-gray-200 py-3 px-4 rounded-lg font-medium hover:bg-gray-500 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !reason.trim()}
            >
              {loading ? "Rechazando..." : "Rechazar Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}