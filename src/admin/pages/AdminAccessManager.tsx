import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  UserX,
  UserCheck,
  Edit2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  X,
} from 'lucide-react';
import { contentApi, AdminUserModel } from '../../services/contentApi';
import { authApi } from '../../services/authApi';

/**
 * Grantable permission keys — must match the server whitelist (ADMIN_PERMISSIONS in server/auth.ts).
 * User management (Admin Access) is superadmin-only by role and is intentionally not listed here.
 */
const AVAILABLE_PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'pages', label: 'Info & Legal Pages, Translations' },
  { key: 'homepage', label: 'Homepage & Why Stay' },
  { key: 'villas', label: 'Villas & Rooms' },
  { key: 'gallery', label: 'Photo Gallery' },
  { key: 'videos', label: 'Videos & Reel' },
  { key: 'facilities', label: 'Facilities & Spa' },
  { key: 'testimonials', label: 'Reviews & Testimonials' },
  { key: 'dining', label: 'Dining & Menus' },
  { key: 'experiences', label: 'Island Experiences' },
  { key: 'safari', label: 'Safari Packages' },
  { key: 'transfers', label: 'Chauffeur & Transfers' },
  { key: 'contact', label: 'Contact & WhatsApp' },
  { key: 'seo', label: 'SEO & Metadata' },
  { key: 'media', label: 'Media Library' },
  { key: 'settings', label: 'Settings, Navigation & Footer' },
  { key: 'support', label: 'Guest Messages' },
];

const PERMISSION_KEYS = AVAILABLE_PERMISSIONS.map((p) => p.key);
const PERMISSION_LABELS: Record<string, string> = Object.fromEntries(
  AVAILABLE_PERMISSIONS.map((p) => [p.key, p.label])
);

/** Keeps only keys the server accepts (drops legacy values such as the 'all' wildcard). */
const sanitizePermissions = (perms: unknown): string[] =>
  Array.isArray(perms) ? PERMISSION_KEYS.filter((key) => perms.includes(key)) : [];

const formatDateTime = (value?: string | null): string => {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const AdminAccessManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUserModel[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [maxActive, setMaxActive] = useState(6);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState<AdminUserModel | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUserModel | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' as 'superadmin' | 'admin',
    permissions: AVAILABLE_PERMISSIONS.map((p) => p.key),
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const currentUser = authApi.getUser();
  const isSuperadmin = currentUser?.role === 'superadmin';
  const atCapacity = activeCount >= maxActive;

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await contentApi.getAdminUsers();
      setUsers(res.users);
      setActiveCount(res.activeCount);
      setMaxActive(res.maxActive);
      setAvailableSlots(res.availableSlots);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'admin',
      permissions: AVAILABLE_PERMISSIONS.map((p) => p.key),
    });
    setError(null);
    setSuccess(null);
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUserModel) => {
    setEditModalUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      // Never default a missing list to "everything": saving would silently grant full access.
      permissions: sanitizePermissions(user.permissions),
    });
    setError(null);
    setSuccess(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (activeCount >= maxActive) {
      setError(`The maximum of ${maxActive} active administrators has been reached. Disable an account first.`);
      return;
    }

    try {
      setSaving(true);
      await contentApi.createAdminUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        permissions: formData.role === 'superadmin' ? [] : sanitizePermissions(formData.permissions),
      });
      setSuccess(`Administrator ${formData.name} created successfully.`);
      setCreateModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create administrator.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;
    setError(null);
    setSuccess(null);

    const editingSelf = editModalUser.id === currentUser?.id;
    const payload: Partial<AdminUserModel> = { name: formData.name.trim() };
    // The server blocks changing your own role, so only send it for other accounts.
    if (!editingSelf) payload.role = formData.role;
    const effectiveRole = editingSelf ? editModalUser.role : formData.role;
    if (effectiveRole !== 'superadmin') payload.permissions = sanitizePermissions(formData.permissions);

    try {
      setSaving(true);
      await contentApi.updateAdminUser(editModalUser.id, payload);
      setSuccess(`Administrator ${formData.name} updated successfully.`);
      setEditModalUser(null);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update administrator.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: AdminUserModel) => {
    setError(null);
    setSuccess(null);
    if (user.id === currentUser?.id) {
      setError('You cannot disable your own account.');
      return;
    }
    if (user.status !== 'active' && activeCount >= maxActive) {
      setError(`Cannot enable ${user.name}: the maximum of ${maxActive} active administrators has been reached.`);
      return;
    }
    try {
      setSaving(true);
      if (user.status === 'active') {
        const confirmDisable = window.confirm(
          `Are you sure you want to deactivate ${user.name}? They will immediately lose access to the CMS.`
        );
        if (!confirmDisable) {
          setSaving(false);
          return;
        }
        await contentApi.disableAdminUser(user.id);
        setSuccess(`Deactivated administrator ${user.name}.`);
      } else {
        await contentApi.enableAdminUser(user.id);
        setSuccess(`Activated administrator ${user.name}.`);
      }
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUser) return;
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      await contentApi.resetAdminPassword(resetPasswordUser.id, newPassword);
      setSuccess(`Password for ${resetPasswordUser.name} has been reset. Their existing sessions are no longer valid.`);
      setResetPasswordUser(null);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permKey: string) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permKey);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== permKey) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permKey] };
      }
    });
  };

  // The page-level alert sits behind the modal overlay, so modals repeat the API error inline.
  const modalError = error ? (
    <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-start space-x-2">
      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
      <span>{error}</span>
    </div>
  ) : null;

  const editingSelf = !!editModalUser && editModalUser.id === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-adm-line pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-widest uppercase text-adm-accent mb-1">
            <Users className="w-4 h-4" />
            <span>SECURITY & ACCESS CONTROL</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-adm-text">Admin Access Management</h1>
          <p className="text-xs sm:text-sm text-adm-muted mt-1">
            Manage authorized staff and administrators who can access the Zanzirangi House CMS.
          </p>
        </div>

        {/* Quota & Action */}
        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-adm-surface border border-adm-line flex items-center space-x-2 text-xs font-mono">
            <span className="text-adm-muted">Active accounts:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-xs ${
                atCapacity
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
              }`}
            >
              {activeCount} / {maxActive}
            </span>
          </div>

          {isSuperadmin && (
            <button
              onClick={handleOpenCreate}
              disabled={atCapacity || saving}
              title={atCapacity ? `Maximum of ${maxActive} active accounts reached. Disable an account to free a slot.` : 'Add a new administrator'}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-colors cursor-pointer ${
                atCapacity
                  ? 'bg-adm-raised text-adm-faint cursor-not-allowed border border-adm-line'
                  : 'bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent font-bold shadow-md'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quota Information Callout */}
      <div className="p-4 rounded-xl bg-adm-panel border border-adm-line flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-adm-accent/10 border border-adm-accent/30 flex items-center justify-center text-adm-accent shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-adm-text font-medium">
              Security policy: maximum {maxActive} active accounts ({activeCount} in use)
            </p>
            <p className="text-adm-muted text-[11px]">
              Available slots: <span className="text-adm-accent font-mono font-bold">{availableSlots}</span>.
              Every active account counts, superadmins included. Disabled accounts stay in the database for
              auditing and do not count toward the limit.
            </p>
          </div>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-xs font-mono text-adm-text-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-adm-line bg-adm-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-adm-line bg-adm-bg/80 font-mono text-[11px] text-adm-muted uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 whitespace-nowrap">Last Login</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Permissions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-adm-line/60 font-sans">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-adm-muted font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-adm-accent" />
                    Loading administrator directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-adm-muted font-mono">
                    No administrators found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  const isUserSuperadmin = u.role === 'superadmin';
                  const userPerms = sanitizePermissions(u.permissions);
                  const initials = u.name
                    ? u.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'AD';

                  return (
                    <tr key={u.id} className="hover:bg-adm-surface transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-adm-line border border-adm-line-strong flex items-center justify-center font-mono text-xs text-adm-text shrink-0 font-bold">
                            {initials}
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="font-medium text-adm-text whitespace-nowrap">{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-adm-accent/20 text-adm-accent border border-adm-accent/30">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-adm-text-2 break-all">{u.email}</span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                            isUserSuperadmin
                              ? 'bg-adm-accent/20 text-adm-accent border border-adm-accent/40 font-bold'
                              : 'bg-adm-raised text-adm-text-2 border border-adm-line-strong'
                          }`}
                        >
                          {isUserSuperadmin ? (
                            <ShieldCheck className="w-3 h-3 text-adm-accent" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-adm-muted" />
                          )}
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono ${
                            u.status === 'active'
                              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                              : 'bg-adm-raised text-adm-muted border border-adm-line'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-400' : 'bg-adm-faint'
                            }`}
                          />
                          <span className="capitalize">{u.status}</span>
                        </span>
                      </td>

                      {/* Last Login */}
                      <td
                        className={`py-3 px-4 font-mono text-[11px] whitespace-nowrap ${
                          u.lastLogin ? 'text-adm-text-2' : 'text-adm-faint italic'
                        }`}
                        title={u.lastLogin || 'This account has never signed in'}
                      >
                        {formatDateTime(u.lastLogin)}
                      </td>

                      {/* Created */}
                      <td className="py-3 px-4 font-mono text-[11px] text-adm-muted whitespace-nowrap">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Permissions */}
                      <td className="py-3 px-4">
                        {isUserSuperadmin ? (
                          <span className="text-[11px] font-mono text-adm-accent font-semibold">Full access</span>
                        ) : userPerms.length === 0 ? (
                          <span className="text-[11px] font-mono text-adm-faint italic">No modules assigned</span>
                        ) : (
                          <div
                            className="flex flex-wrap gap-1 max-w-[260px]"
                            title={userPerms.map((p) => PERMISSION_LABELS[p] || p).join(', ')}
                          >
                            {userPerms.slice(0, 3).map((p) => (
                              <span
                                key={p}
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-adm-raised border border-adm-line text-adm-muted"
                              >
                                {PERMISSION_LABELS[p] || p}
                              </span>
                            ))}
                            {userPerms.length > 3 && (
                              <span className="text-[9px] font-mono px-1 py-0.5 text-adm-muted">
                                +{userPerms.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {isSuperadmin && (
                            <>
                              {/* Edit Profile / Perms */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(u)}
                                disabled={saving}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-[11px] font-mono text-adm-text-2 hover:text-adm-text transition-colors cursor-pointer disabled:opacity-50"
                                title="Edit name, role and permissions"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Enable / Disable (never for your own account) */}
                              {!isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(u)}
                                  disabled={saving || (u.status !== 'active' && atCapacity)}
                                  className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                    u.status === 'active'
                                      ? 'bg-amber-950/30 hover:bg-amber-900/50 border-amber-800/60 text-amber-300'
                                      : 'bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-800/60 text-emerald-300'
                                  }`}
                                  title={
                                    u.status === 'active'
                                      ? 'Disable this account'
                                      : atCapacity
                                        ? `Maximum of ${maxActive} active accounts reached`
                                        : 'Enable this account'
                                  }
                                >
                                  {u.status === 'active' ? (
                                    <UserX className="w-3.5 h-3.5" />
                                  ) : (
                                    <UserCheck className="w-3.5 h-3.5" />
                                  )}
                                  <span>{u.status === 'active' ? 'Disable' : 'Enable'}</span>
                                </button>
                              )}

                              {/* Reset Password */}
                              <button
                                type="button"
                                onClick={() => {
                                  setError(null);
                                  setSuccess(null);
                                  setNewPassword('');
                                  setConfirmNewPassword('');
                                  setResetPasswordUser(u);
                                }}
                                disabled={saving}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-adm-raised hover:bg-adm-line border border-adm-line-strong text-[11px] font-mono text-adm-text-2 hover:text-adm-text transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                title="Set a new password for this account"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Reset Password</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Administrator */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-adm-panel border border-adm-line rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-adm-line">
              <div>
                <h3 className="font-serif text-lg text-adm-text">Add New Administrator</h3>
                <p className="text-xs text-adm-muted">Provide account credentials and CMS permissions.</p>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="text-adm-muted hover:text-adm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              {modalError}
              <div>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-adm-faint" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                    placeholder="e.g. John Mwangi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-adm-faint" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                    placeholder="john@zanzirangihouse.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-adm-faint" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                      placeholder="Min 8 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-adm-faint" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                      placeholder="Re-type password"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Access Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      formData.role === 'admin'
                        ? 'bg-adm-accent/15 border-adm-accent text-adm-text'
                        : 'bg-adm-bg border-adm-line text-adm-muted'
                    }`}
                  >
                    <div className="font-mono text-xs uppercase font-bold text-adm-text">Admin</div>
                    <div className="text-[11px] text-adm-muted mt-0.5">Role-based module permissions</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'superadmin' })}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      formData.role === 'superadmin'
                        ? 'bg-adm-accent/15 border-adm-accent text-adm-text'
                        : 'bg-adm-bg border-adm-line text-adm-muted'
                    }`}
                  >
                    <div className="font-mono text-xs uppercase font-bold text-adm-accent">Superadmin</div>
                    <div className="text-[11px] text-adm-muted mt-0.5">Full unrestricted access</div>
                  </button>
                </div>
              </div>

              {formData.role === 'admin' && (
                <div>
                  <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1.5">
                    Module Permissions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isSelected = formData.permissions.includes(perm.key);
                      return (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() => togglePermission(perm.key)}
                          className={`px-2.5 py-1.5 rounded border text-[11px] font-mono text-left transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-adm-accent/20 border-adm-accent/60 text-adm-text'
                              : 'bg-adm-bg border-adm-line text-adm-faint'
                          }`}
                        >
                          <span className="truncate">{perm.label}</span>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-adm-accent-fill' : 'bg-adm-line'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-adm-line">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-muted hover:text-adm-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors"
                >
                  {saving ? 'Creating...' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Administrator */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-adm-panel border border-adm-line rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-adm-line">
              <div>
                <h3 className="font-serif text-lg text-adm-text">Edit Administrator</h3>
                <p className="text-xs text-adm-muted">Update profile and module permissions for {editModalUser.email}.</p>
              </div>
              <button onClick={() => setEditModalUser(null)} className="text-adm-muted hover:text-adm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              {modalError}
              <div>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-3 py-2 bg-adm-bg/50 border border-adm-line rounded-lg text-xs text-adm-faint cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={editingSelf}
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`p-3 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      editingSelf ? '' : 'cursor-pointer'
                    } ${
                      formData.role === 'admin'
                        ? 'bg-adm-accent/15 border-adm-accent text-adm-text'
                        : 'bg-adm-bg border-adm-line text-adm-muted'
                    }`}
                  >
                    <div className="font-mono text-xs uppercase font-bold text-adm-text">Admin</div>
                    <div className="text-[11px] text-adm-muted mt-0.5">Role-based permissions</div>
                  </button>

                  <button
                    type="button"
                    disabled={editingSelf}
                    onClick={() => setFormData({ ...formData, role: 'superadmin' })}
                    className={`p-3 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      editingSelf ? '' : 'cursor-pointer'
                    } ${
                      formData.role === 'superadmin'
                        ? 'bg-adm-accent/15 border-adm-accent text-adm-text'
                        : 'bg-adm-bg border-adm-line text-adm-muted'
                    }`}
                  >
                    <div className="font-mono text-xs uppercase font-bold text-adm-accent">Superadmin</div>
                    <div className="text-[11px] text-adm-muted mt-0.5">Full unrestricted access</div>
                  </button>
                </div>
                {editingSelf && (
                  <p className="text-[11px] text-adm-muted mt-1.5">
                    You cannot change your own role. Ask another superadmin if this needs to change.
                  </p>
                )}
              </div>

              {formData.role === 'superadmin' && (
                <p className="text-[11px] font-mono text-adm-accent">
                  Superadmins have full access to every module, including Admin Access.
                </p>
              )}

              {formData.role === 'admin' && (
                <div>
                  <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1.5">
                    Module Permissions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const isSelected = formData.permissions.includes(perm.key);
                      return (
                        <button
                          key={perm.key}
                          type="button"
                          onClick={() => togglePermission(perm.key)}
                          className={`px-2.5 py-1.5 rounded border text-[11px] font-mono text-left transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-adm-accent/20 border-adm-accent/60 text-adm-text'
                              : 'bg-adm-bg border-adm-line text-adm-faint'
                          }`}
                        >
                          <span className="truncate">{perm.label}</span>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-adm-accent-fill' : 'bg-adm-line'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-adm-line">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-muted hover:text-adm-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-adm-accent-fill hover:bg-adm-accent-hover text-adm-on-accent text-xs font-mono font-bold uppercase transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-adm-panel border border-adm-line rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-adm-line">
              <div>
                <h3 className="font-serif text-lg text-adm-text">Reset Password</h3>
                <p className="text-xs text-adm-muted">For {resetPasswordUser.name} ({resetPasswordUser.email})</p>
              </div>
              <button onClick={() => setResetPasswordUser(null)} className="text-adm-muted hover:text-adm-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="mt-5 space-y-4">
              {modalError}
              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200">
                {resetPasswordUser.id === currentUser?.id
                  ? 'Notice: this is your own account. Resetting the password signs you out everywhere, including this session.'
                  : 'Notice: resetting the password immediately signs this user out of every active session.'}
              </div>

              <div>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-adm-faint" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-adm-text-2 uppercase mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-adm-faint" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-adm-bg border border-adm-line rounded-lg text-xs text-adm-text focus:border-adm-accent outline-none"
                    placeholder="Re-type new password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-adm-line">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-4 py-2 rounded-lg bg-adm-raised text-xs font-mono text-adm-muted hover:text-adm-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black text-xs font-mono font-bold uppercase transition-colors"
                >
                  {saving ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
