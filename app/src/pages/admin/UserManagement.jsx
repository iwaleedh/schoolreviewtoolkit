import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import useAuth from '../../hooks/useAuth';
import { Edit, Trash2, UserPlus, Shield, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import './UserManagement.css';

function UserManagement() {
    const { user: currentUser } = useAuth();

    // Fetch users
    const users = useQuery(api.users.listUsers);

    // Mutations
    const registerUser = useMutation(api.auth.register);
    const updateUser = useMutation(api.users.updateUser);
    const deleteUser = useMutation(api.users.deleteUser);

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'ANALYST',
        schoolId: '',
        assignedSchools: '', // comma separated string for ease
        isActive: true,
    });

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            name: '',
            role: 'ANALYST',
            schoolId: '',
            assignedSchools: '',
            isActive: true,
        });
        setEditingUser(null);
        setError('');
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                email: user.email,
                password: '', // Leave blank unless they want to change it
                name: user.name,
                role: user.role,
                schoolId: user.schoolId || '',
                assignedSchools: user.assignedSchools ? user.assignedSchools.join(', ') : '',
                isActive: user.isActive,
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const assignedArray = formData.assignedSchools
                ? formData.assignedSchools.split(',').map(s => s.trim()).filter(Boolean)
                : [];

            if (editingUser) {
                // Update
                await updateUser({
                    userId: editingUser._id,
                    name: formData.name,
                    role: formData.role,
                    schoolId: formData.schoolId || undefined,
                    assignedSchools: assignedArray,
                    isActive: formData.isActive,
                    password: formData.password || undefined,
                });
            } else {
                // Create
                if (!formData.email || !formData.password) {
                    throw new Error("Email and Password are required for new users.");
                }
                await registerUser({
                    email: formData.email.trim(),
                    password: formData.password,
                    name: formData.name,
                    role: formData.role,
                    schoolId: formData.schoolId || undefined,
                    assignedSchools: assignedArray,
                    createdBy: currentUser._id,
                });
            }
            handleCloseModal();
        } catch (err) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await deleteUser({ userId });
            } catch (err) {
                alert("Failed to delete user: " + err.message);
            }
        }
    };

    if (users === undefined) {
        return (
            <div className="user-management-loading">
                <div className="spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="user-management-page">
            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage system access, roles, and school assignments.</p>
                </div>
                <button className="primary-btn" onClick={() => handleOpenModal()}>
                    <UserPlus size={18} /> Add New User
                </button>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Assignment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className={!user.isActive ? 'inactive-row' : ''}>
                                <td>
                                    <div className="user-name-cell">
                                        <span className="user-name">{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                                        {user.role === 'ADMIN' && <ShieldAlert size={14} />}
                                        {user.role === 'ANALYST' && <Shield size={14} />}
                                        {user.role === 'PRINCIPAL' && <Shield size={14} />}
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.role === 'PRINCIPAL' && (
                                        <span className="assignment-text">School: {user.schoolId || 'None'}</span>
                                    )}
                                    {user.role === 'ANALYST' && (
                                        <span className="assignment-text">
                                            {user.assignedSchools?.length
                                                ? `${user.assignedSchools.length} Schools`
                                                : 'All Schools'}
                                        </span>
                                    )}
                                    {user.role === 'ADMIN' && <span className="assignment-text">System Wide</span>}
                                </td>
                                <td>
                                    {user.isActive ? (
                                        <span className="status-badge active"><CheckCircle2 size={14} /> Active</span>
                                    ) : (
                                        <span className="status-badge inactive"><XCircle size={14} /> Inactive</span>
                                    )}
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="icon-btn edit-btn"
                                        onClick={() => handleOpenModal(user)}
                                        title="Edit User"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className="icon-btn delete-btn"
                                        onClick={() => handleDelete(user._id)}
                                        title="Delete User"
                                        disabled={user._id === currentUser._id}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-state">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        {error && <div className="modal-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="user-form">
                            {/* Email */}
                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required={!editingUser}
                                    disabled={!!editingUser}
                                />
                                {editingUser && <small>Email cannot be changed after creation.</small>}
                            </div>

                            {/* Name */}
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="form-group">
                                <label>{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    minLength={8}
                                />
                            </div>

                            {/* Role */}
                            <div className="form-group">
                                <label>System Role *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="ANALYST">Analyst (QA Department)</option>
                                    <option value="PRINCIPAL">Principal (School Level)</option>
                                    <option value="ADMIN">System Administrator</option>
                                </select>
                            </div>

                            {/* Conditional Fields based on Role */}
                            {formData.role === 'PRINCIPAL' && (
                                <div className="form-group">
                                    <label>School ID *</label>
                                    <input
                                        type="text"
                                        value={formData.schoolId}
                                        onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                                        placeholder="e.g. SCH-001"
                                        required
                                    />
                                    <small>The Principal will only have access to this school's data.</small>
                                </div>
                            )}

                            {formData.role === 'ANALYST' && (
                                <div className="form-group">
                                    <label>Assigned Schools (IDs, separated by commas)</label>
                                    <input
                                        type="text"
                                        value={formData.assignedSchools}
                                        onChange={(e) => setFormData({ ...formData, assignedSchools: e.target.value })}
                                        placeholder="e.g. SCH-001, SCH-002"
                                    />
                                    <small>Leave blank to grant access to ALL schools.</small>
                                </div>
                            )}

                            {/* Status */}
                            {editingUser && editingUser._id !== currentUser._id && (
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        Account is Active
                                    </label>
                                    <small>Uncheck to immediately suspend access without deleting data.</small>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={handleCloseModal} disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : (editingUser ? 'Save Updates' : 'Create User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;
