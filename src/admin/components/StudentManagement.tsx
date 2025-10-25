// src/admin/components/StudentManagement.tsx
import React, { useState, useEffect } from "react";
import { AdminRoute } from "./AdminRoute";
import AdminLayout from "./AdminLayout";
import { config } from "../../../config";

// Interface que coincide con TU backend
interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  dni: string;
  phone_number?: string;
  status: "active" | "inactive" | "banned";
  created_at: string;
  student?: {
    document_number: string;
  };
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [filterField, setFilterField] = useState<
    "first_name" | "last_name" | "email" | "dni"
  >("first_name");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "banned"
  >("all");

  // ✅ FUNCIONES MEJORADAS DE AUTENTICACIÓN
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

  // ✅ CARGAR ESTUDIANTES - MEJORADO
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/students`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📊 API Response:", result);

      let studentsData = [];

      if (result.data && Array.isArray(result.data.data)) {
        studentsData = result.data.data;
      } else if (Array.isArray(result.data)) {
        studentsData = result.data;
      } else if (Array.isArray(result)) {
        studentsData = result;
      } else {
        studentsData = [];
      }

      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar estudiantes";
      setError(errorMessage);
      console.error("❌ Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ FILTRADO MEJORADO
  useEffect(() => {
    let filtered = students;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((student) => {
        const value = student[filterField]?.toString().toLowerCase() || "";
        return value.includes(searchTerm.toLowerCase());
      });
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, students, filterField, statusFilter]);

  // ✅ AGREGAR ESTUDIANTE - MEJORADO
  const handleAddStudent = async (studentData: any) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/students`,
        {
          method: "POST",
          body: JSON.stringify({
            first_name: studentData.name,
            last_name: studentData.lastName,
            email: studentData.email,
            dni: studentData.dni || `DNI${Date.now()}`,
            password: "password123",
            phone_number: studentData.phone,
            status: studentData.status || "active",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchStudents();
        setShowModal(false);
        showNotification("✅ Estudiante creado exitosamente", "success");
      } else {
        throw new Error(result.message || "Error al crear estudiante");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear estudiante";
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // ✅ EDITAR ESTUDIANTE - MEJORADO
  const handleEditStudent = async (studentData: any) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/students/${studentData.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            first_name: studentData.name,
            last_name: studentData.lastName,
            email: studentData.email,
            dni: studentData.dni,
            phone_number: studentData.phone,
            status: studentData.status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchStudents();
        setEditingStudent(null);
        setShowModal(false);
        showNotification("✅ Estudiante actualizado exitosamente", "success");
      } else {
        throw new Error(result.message || "Error al actualizar estudiante");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar estudiante";
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // ✅ ELIMINAR ESTUDIANTE - MEJORADO
  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este estudiante?")) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/students/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchStudents();
        showNotification("✅ Estudiante eliminado exitosamente", "success");
      } else {
        throw new Error(result.message || "Error al eliminar estudiante");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar estudiante";
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, "error");
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

  // Estadísticas
  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    inactive: students.filter((s) => s.status === "inactive").length,
    banned: students.filter((s) => s.status === "banned").length,
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout title="Gestión de Estudiantes">
          <div className="w-full max-w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Gestión de Estudiantes
                </h1>
                <p className="text-gray-400">Cargando estudiantes...</p>
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
        <AdminLayout title="Gestión de Estudiantes">
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
                  onClick={fetchStudents}
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
      <AdminLayout title="Gestión de Estudiantes">
        <div className="w-full max-w-full space-y-6">
          {/* Tarjetas de Estadísticas - Optimizado para ancho completo */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">
                  Total Estudiantes
                </div>
                <div className="h-5 w-5 text-blue-400">👥</div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-xs text-gray-400 mt-1">
                Registrados en el sistema
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">Activos</div>
                <div className="h-5 w-5 text-green-400">✅</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.active}
              </div>
              <p className="text-xs text-gray-400 mt-1">Estudiantes activos</p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">
                  Inactivos
                </div>
                <div className="h-5 w-5 text-yellow-400">⏸️</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.inactive}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Estudiantes inactivos
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">
                  Baneados
                </div>
                <div className="h-5 w-5 text-red-400">🚫</div>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.banned}
              </div>
              <p className="text-xs text-gray-400 mt-1">Estudiantes baneados</p>
            </div>
          </div>

          {/* Alternativa con botones más prominentes */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Buscar por Nombre
            </h3>

            <div className="flex flex-col lg:flex-row lg:items-start gap-4">
              {/* Campos de búsqueda */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Buscar por nombre...
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-600 rounded-lg pl-10 pr-4 py-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🔍</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Término de búsqueda
                  </p>
                </div>

                <div className="sm:w-48">
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Filtrar por estado
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full border border-gray-600 rounded-lg px-3 py-3 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                    <option value="banned">Baneados</option>
                  </select>
                </div>
              </div>

              {/* Botones - alineados al inicio */}
              <div className="flex gap-2 lg:pt-7">
                {" "}
                {/* padding-top para alinear con campos */}
                <button
                  onClick={handleRenewSession}
                  className="inline-flex items-center px-4 py-3 bg-gray-600 text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
                >
                  <span className="mr-2">🔄</span>
                  Renovar Sesión
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">+</span>
                  Agregar Estudiante
                </button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {filteredStudents.length} estudiante
                {filteredStudents.length !== 1 ? "s" : ""} encontrado
                {filteredStudents.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          {/* Tabla de Estudiantes - Ancho completo optimizado */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      ESTUDIANTE
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      CONTACTO
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      ESTADO
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-gray-800">
                  {Array.isArray(filteredStudents) &&
                    filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {student.first_name[0]}
                                {student.last_name[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-white">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-gray-400">
                                DNI: {student.dni}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {student.email}
                          </div>
                          <div className="text-sm text-gray-400">
                            {student.phone_number || "Sin teléfono"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              student.status === "active"
                                ? "bg-green-900 text-green-300"
                                : student.status === "inactive"
                                ? "bg-yellow-900 text-yellow-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {student.status === "active"
                              ? "Activo"
                              : student.status === "inactive"
                              ? "Inactivo"
                              : "Baneado"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setEditingStudent(student);
                                setShowModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 px-4 py-2 rounded transition-colors font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 px-4 py-2 rounded transition-colors font-medium"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Estado vacío */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-750 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">👥</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {students.length === 0
                    ? "No hay estudiantes registrados"
                    : "No se encontraron estudiantes"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {students.length === 0
                    ? "Comienza agregando el primer estudiante al sistema."
                    : "Intenta ajustar los filtros de búsqueda."}
                </p>
                {students.length === 0 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">+</span>
                    Agregar Primer Estudiante
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <StudentFormModal
            student={editingStudent}
            onSave={editingStudent ? handleEditStudent : handleAddStudent}
            onClose={() => {
              setShowModal(false);
              setEditingStudent(null);
            }}
          />
        )}
      </AdminLayout>
    </AdminRoute>
  );
}

// Modal
interface StudentFormModalProps {
  student: Student | null;
  onSave: (student: any) => void;
  onClose: () => void;
}

function StudentFormModal({ student, onSave, onClose }: StudentFormModalProps) {
  const [formData, setFormData] = useState({
    id: student?.id || "", // ← AGREGAR ESTO
    name: student?.first_name || "",
    lastName: student?.last_name || "",
    email: student?.email || "",
    dni: student?.dni || "",
    phone: student?.phone_number || "",
    status: student?.status || "active",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
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
              {student ? "Editar Estudiante" : "Agregar Estudiante"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="Ej: Juan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Apellido
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="Ej: Pérez"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
              placeholder="ejemplo@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              DNI
            </label>
            <input
              type="text"
              required
              value={formData.dni}
              onChange={(e) =>
                setFormData({ ...formData, dni: e.target.value })
              }
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
              placeholder="12345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Teléfono
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
              placeholder="+51 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="banned">Baneado</option>
            </select>
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
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : student
                ? "Actualizar"
                : "Crear Estudiante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
