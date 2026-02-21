import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import useAuth from '../../hooks/useAuth';
import { Edit, Trash2, Building2, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import './SchoolManagement.css';

function SchoolManagement() {
    const { user: currentUser } = useAuth();

    // Fetch schools
    const schools = useQuery(api.schools.listSchools);

    // Mutations
    const createSchool = useMutation(api.schools.createSchool);
    const updateSchool = useMutation(api.schools.updateSchool);
    const deleteSchool = useMutation(api.schools.deleteSchool);

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        schoolId: '',
        name: '',
        nameDv: '',
        atoll: '',
        island: '',
        isActive: true,
    });

    const resetForm = () => {
        setFormData({
            schoolId: '',
            name: '',
            nameDv: '',
            atoll: '',
            island: '',
            isActive: true,
        });
        setEditingSchool(null);
        setError('');
    };

    const handleOpenModal = (school = null) => {
        if (school) {
            setEditingSchool(school);
            setFormData({
                schoolId: school.schoolId,
                name: school.name,
                nameDv: school.nameDv || '',
                atoll: school.atoll,
                island: school.island,
                isActive: school.isActive,
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
            if (editingSchool) {
                // Update
                await updateSchool({
                    id: editingSchool._id,
                    schoolId: formData.schoolId.trim(),
                    name: formData.name.trim(),
                    nameDv: formData.nameDv.trim() || undefined,
                    atoll: formData.atoll.trim(),
                    island: formData.island.trim(),
                    isActive: formData.isActive,
                });
            } else {
                // Create
                await createSchool({
                    schoolId: formData.schoolId.trim(),
                    name: formData.name.trim(),
                    nameDv: formData.nameDv.trim() || undefined,
                    atoll: formData.atoll.trim(),
                    island: formData.island.trim(),
                    isActive: formData.isActive,
                });
            }
            handleCloseModal();
        } catch (err) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this school? Data dependent on this school may break!")) {
            try {
                await deleteSchool({ id });
            } catch (err) {
                alert("Failed to delete school: " + err.message);
            }
        }
    };

    if (schools === undefined) {
        return (
            <div className="school-management-loading">
                <div className="spinner"></div>
                <p>Loading schools...</p>
            </div>
        );
    }

    return (
        <div className="school-management-page">
            <div className="page-header">
                <div>
                    <h1>School Management</h1>
                    <p>Manage system registry of schools and institutions.</p>
                </div>
                <button className="primary-btn" onClick={() => handleOpenModal()}>
                    <Building2 size={18} /> Register School
                </button>
            </div>

            <div className="schools-table-container">
                <table className="schools-table">
                    <thead>
                        <tr>
                            <th>School ID</th>
                            <th>Name (EN / DV)</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schools.map(school => (
                            <tr key={school._id} className={!school.isActive ? 'inactive-row' : ''}>
                                <td>
                                    <span className="school-id-badge">{school.schoolId}</span>
                                </td>
                                <td>
                                    <div className="school-name-cell">
                                        <span className="school-name">{school.name}</span>
                                        {school.nameDv && <span className="school-name-dv font-dhivehi" dir="rtl">{school.nameDv}</span>}
                                    </div>
                                </td>
                                <td>
                                    <div className="location-cell">
                                        <MapPin size={14} className="location-icon" />
                                        <span>{school.atoll} - {school.island}</span>
                                    </div>
                                </td>
                                <td>
                                    {school.isActive ? (
                                        <span className="status-badge active"><CheckCircle2 size={14} /> Active</span>
                                    ) : (
                                        <span className="status-badge inactive"><XCircle size={14} /> Inactive</span>
                                    )}
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="icon-btn edit-btn"
                                        onClick={() => handleOpenModal(school)}
                                        title="Edit School"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className="icon-btn delete-btn"
                                        onClick={() => handleDelete(school._id)}
                                        title="Delete School"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {schools.length === 0 && (
                            <tr>
                                <td colSpan="5" className="empty-state">No schools registered yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingSchool ? 'Edit School' : 'Register New School'}</h2>
                        {error && <div className="modal-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="school-form">
                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>School ID *</label>
                                    <input
                                        type="text"
                                        name="schoolId"
                                        value={formData.schoolId}
                                        onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                                        placeholder="e.g. MOE-01"
                                        required
                                    />
                                </div>
                                <div className="form-group half-width checkbox-container">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        />
                                        Active
                                    </label>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>School Name (English) *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>School Name (Dhivehi)</label>
                                <input
                                    type="text"
                                    name="nameDv"
                                    className="font-dhivehi text-right"
                                    dir="rtl"
                                    value={formData.nameDv}
                                    onChange={(e) => setFormData({ ...formData, nameDv: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>Atoll *</label>
                                    <input
                                        type="text"
                                        value={formData.atoll}
                                        onChange={(e) => setFormData({ ...formData, atoll: e.target.value })}
                                        placeholder="e.g. K"
                                        required
                                    />
                                </div>

                                <div className="form-group half-width">
                                    <label>Island *</label>
                                    <input
                                        type="text"
                                        value={formData.island}
                                        onChange={(e) => setFormData({ ...formData, island: e.target.value })}
                                        placeholder="e.g. Male'"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={handleCloseModal} disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : (editingSchool ? 'Save Updates' : 'Register School')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SchoolManagement;
