"use client";
import { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  Users,
  Mail,
  Calendar,
  Check,
  X,
} from "lucide-react";

export default function AdminDashboard({ session, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // page loading
  const [addLoading, setAddLoading] = useState(false); // add user loading
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "moderator",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else if (res.status === 403) {
        setError("Admin access required");
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      setError("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAddLoading(true);

    try {
      let body;
      if (bulkEmails.trim()) {
        body = {
          emails: bulkEmails
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean),
          name: newUser.name,
          role: newUser.role,
        };
      } else if (newUser.email.trim()) {
        body = { ...newUser };
      } else {
        setError("Enter at least one email address.");
        setAddLoading(false);
        return;
      }

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(
          Array.isArray(data.results) && data.results.length > 1
            ? "Users processed: " +
                data.results.map((r) => `${r.email} (${r.status})`).join(", ")
            : "User added successfully."
        );
        setNewUser({ email: "", name: "", role: "moderator" });
        setBulkEmails("");
        setShowAddForm(false);
        fetchUsers();
      } else if (res.status === 403) {
        setError("Admin access required");
      } else {
        setError(data.error || "Failed to add user");
      }
    } catch (error) {
      setError("Error adding user");
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (res.ok) {
        setSuccess(
          `User ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
        fetchUsers();
      } else if (res.status === 403) {
        setError("Admin access required");
      } else {
        setError("Failed to update user");
      }
    } catch (error) {
      setError("Error updating user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        // Some routes may return 204 with no JSON body
        setSuccess("User deleted successfully");
        fetchUsers();
      } else if (res.status === 204) {
        // No content but treated as success/no-op
        setSuccess("User already deleted");
        fetchUsers();
      } else if (res.status === 403) {
        setError("Admin access required");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to delete user");
      }
    } catch (error) {
      setError("Error deleting user");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-blue-100">Manage Authorized Users</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Alerts */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Check className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-800">
                    {users.filter((u) => u.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-600">Admins</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add User Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-black">Authorized Users</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-4">Add New User</h3>
              <form
                onSubmit={handleAddUser}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center"
              >
                <input
                  type="email"
                  placeholder="Email address"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                  disabled={addLoading}
                />
                <input
                  type="text"
                  placeholder="Full name (optional)"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                  disabled={addLoading}
                />
                <input
                  type="text"
                  placeholder="Bulk emails (comma-separated)"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  className="border rounded px-3 py-2"
                  disabled={addLoading}
                />
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="border rounded px-3 py-2"
                  disabled={addLoading}
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
                >
                  {addLoading ? (
                    <span className="animate-spin rounded-full border-b-2 border-white w-5 h-5"></span>
                  ) : (
                    "Add User"
                  )}
                </button>
              </form>
              <div className="text-xs text-gray-400 mt-2">
                Tip: If you fill “bulk emails”, the single email field is ignored.
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Added
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.user?.image ? (
                            <img
                              src={user.user.image}
                              alt=""
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <Mail className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-black">
                              {user.name || user.user?.name || "No name"}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-500">by {user.addedBy}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleActive(user.id, user.isActive)
                            }
                            className={`p-1 rounded ${
                              user.isActive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                            title={user.isActive ? "Deactivate" : "Activate"}
                          >
                            {user.isActive ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>

                          {user.email !== session.user.email && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 rounded text-red-600 hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No authorized users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
