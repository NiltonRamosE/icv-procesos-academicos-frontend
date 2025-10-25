// src/admin/components/AdminManagement.tsx
import React, { useState, useEffect } from "react";
import { AdminRoute } from "./AdminRoute";
import AdminLayout from "./AdminLayout";
import { config } from "../../../config";

// Interface basada en tu controlador PHP
interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  dni: string;
  phone_number?: string;
  address?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  country?: string;
  status: "active" | "inactive" | "banned";
  created_at: string;
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  const [filterField, setFilterField] = useState<
    "first_name" | "last_name" | "email" | "dni"
  >("first_name");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "banned"
  >("all");

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

  // ✅ CARGAR ADMINISTRADORES
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/admins`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("📊 API Response Admins:", result);

      let adminsData = [];

      if (result.data && Array.isArray(result.data.data)) {
        adminsData = result.data.data;
      } else if (Array.isArray(result.data)) {
        adminsData = result.data;
      } else if (Array.isArray(result)) {
        adminsData = result;
      } else {
        adminsData = [];
      }

      setAdmins(adminsData);
      setFilteredAdmins(adminsData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar administradores";
      setError(errorMessage);
      console.error("❌ Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ FILTRADO MEJORADO
  useEffect(() => {
    let filtered = admins;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((admin) => {
        const value = admin[filterField]?.toString().toLowerCase() || "";
        return value.includes(searchTerm.toLowerCase());
      });
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((admin) => admin.status === statusFilter);
    }

    setFilteredAdmins(filtered);
  }, [searchTerm, admins, filterField, statusFilter]);

  // ✅ AGREGAR ADMINISTRADOR
  const handleAddAdmin = async (adminData: any) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/admins`,
        {
          method: "POST",
          body: JSON.stringify({
            first_name: adminData.name,
            last_name: adminData.lastName,
            email: adminData.email,
            dni: adminData.dni || `DNI${Date.now()}`,
            password: "password123",
            phone_number: adminData.phone,
            address: adminData.address,
            birth_date: adminData.birth_date,
            gender: adminData.gender,
            country: adminData.country,
            status: adminData.status || "active",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchAdmins();
        setShowModal(false);
        showNotification("✅ Administrador creado exitosamente", "success");
      } else {
        throw new Error(result.message || "Error al crear administrador");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear administrador";
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // ✅ EDITAR ADMINISTRADOR
  const handleEditAdmin = async (adminData: any) => {
    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/admins/${adminData.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            first_name: adminData.name,
            last_name: adminData.lastName,
            email: adminData.email,
            dni: adminData.dni,
            phone_number: adminData.phone,
            address: adminData.address,
            birth_date: adminData.birth_date,
            gender: adminData.gender,
            country: adminData.country,
            status: adminData.status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchAdmins();
        setEditingAdmin(null);
        setShowModal(false);
        showNotification("✅ Administrador actualizado exitosamente", "success");
      } else {
        throw new Error(result.message || "Error al actualizar administrador");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al actualizar administrador";
      setError(errorMessage);
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // ✅ ELIMINAR ADMINISTRADOR
  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este administrador?")) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(
        `${config.apiUrl}/api/admins/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Error ${response.status}`);
      }

      if (result.success) {
        await fetchAdmins();
        showNotification("✅ Administrador eliminado exitosamente", "success");
      } else {
        throw new Error(result.message || "Error al eliminar administrador");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al eliminar administrador";
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
    total: admins.length,
    active: admins.filter((s) => s.status === "active").length,
    inactive: admins.filter((s) => s.status === "inactive").length,
    banned: admins.filter((s) => s.status === "banned").length,
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout title="Gestión de Administradores">
          <div className="w-full max-w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Gestión de Administradores
                </h1>
                <p className="text-gray-400">Cargando administradores...</p>
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
        <AdminLayout title="Gestión de Administradores">
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
                  onClick={fetchAdmins}
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
      <AdminLayout title="Gestión de Administradores">
        <div className="w-full max-w-full space-y-6">
          {/* Tarjetas de Estadísticas */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-gray-300">
                  Total Administradores
                </div>
                <div className="h-5 w-5 text-blue-400">👨‍💼</div>
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
              <p className="text-xs text-gray-400 mt-1">Administradores activos</p>
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
                Administradores inactivos
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
              <p className="text-xs text-gray-400 mt-1">Administradores baneados</p>
            </div>
          </div>

          {/* Panel de Búsqueda y Filtros */}
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
                  Agregar Administrador
                </button>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {filteredAdmins.length} administrador
                {filteredAdmins.length !== 1 ? "es" : ""} encontrado
                {filteredAdmins.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Tabla de Administradores */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-750">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      ADMINISTRADOR
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
                      INFORMACIÓN
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
                  {Array.isArray(filteredAdmins) &&
                    filteredAdmins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="hover:bg-gray-750 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {admin.first_name[0]}
                                {admin.last_name[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-white">
                                {admin.first_name} {admin.last_name}
                              </div>
                              <div className="text-sm text-gray-400">
                                DNI: {admin.dni}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {admin.email}
                          </div>
                          <div className="text-sm text-gray-400">
                            {admin.phone_number || "Sin teléfono"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">
                            {admin.country || "Sin país"}
                          </div>
                          <div className="text-sm text-gray-400">
                            {admin.gender ? 
                              admin.gender === 'male' ? 'Masculino' : 
                              admin.gender === 'female' ? 'Femenino' : 'Otro' 
                              : 'Sin género'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              admin.status === "active"
                                ? "bg-green-900 text-green-300"
                                : admin.status === "inactive"
                                ? "bg-yellow-900 text-yellow-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {admin.status === "active"
                              ? "Activo"
                              : admin.status === "inactive"
                              ? "Inactivo"
                              : "Baneado"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setEditingAdmin(admin);
                                setShowModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 px-4 py-2 rounded transition-colors font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
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
            {filteredAdmins.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-750 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">👨‍💼</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {admins.length === 0
                    ? "No hay administradores registrados"
                    : "No se encontraron administradores"}
                </h3>
                <p className="text-gray-400 mb-4">
                  {admins.length === 0
                    ? "Comienza agregando el primer administrador al sistema."
                    : "Intenta ajustar los filtros de búsqueda."}
                </p>
                {admins.length === 0 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">+</span>
                    Agregar Primer Administrador
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <AdminFormModal
            admin={editingAdmin}
            onSave={editingAdmin ? handleEditAdmin : handleAddAdmin}
            onClose={() => {
              setShowModal(false);
              setEditingAdmin(null);
            }}
          />
        )}
      </AdminLayout>
    </AdminRoute>
  );
}

// Modal para Administradores
interface AdminFormModalProps {
  admin: Admin | null;
  onSave: (admin: any) => void;
  onClose: () => void;
}

function AdminFormModal({ admin, onSave, onClose }: AdminFormModalProps) {
  const [formData, setFormData] = useState({
    id: admin?.id || "",
    name: admin?.first_name || "",
    lastName: admin?.last_name || "",
    email: admin?.email || "",
    dni: admin?.dni || "",
    phone: admin?.phone_number || "",
    address: admin?.address || "",
    birth_date: admin?.birth_date || "",
    gender: admin?.gender || "other",
    country: admin?.country || "",
    status: admin?.status || "active",
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
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-gray-700 sticky top-0 bg-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {admin ? "Editar Administrador" : "Agregar Administrador"}
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                País
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
                placeholder="Ej: Perú"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Dirección
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
              placeholder="Dirección completa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) =>
                  setFormData({ ...formData, birth_date: e.target.value })
                }
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Género
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value as any })
                }
                className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
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
                : admin
                ? "Actualizar"
                : "Crear Administrador"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}