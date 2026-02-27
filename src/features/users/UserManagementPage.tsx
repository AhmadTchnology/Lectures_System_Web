import React, { useState } from 'react';
import { User, UserX, Trash, Plus } from 'lucide-react';
import type { Role, EditUserState } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useUsers } from './useUsers';
import { useCategories } from '../categories/useCategories';

export default function UserManagementPage() {
    const { currentUser, isLoading: authLoading } = useAuth();
    const { users, isLoading, addUser, editUser, deleteUser, forceSignOutAll } = useUsers();
    const { categories, addCategory, deleteCategory, isLoading: catLoading } = useCategories();

    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<Role>('student');
    const [newCategory, setNewCategory] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<'subject' | 'stage'>('subject');

    const [editUserState, setEditUserState] = useState<EditUserState>({
        id: '', name: '', email: '', role: 'student', isOpen: false,
    });

    const subjects = categories.filter((c) => c.type === 'subject');
    const stages = categories.filter((c) => c.type === 'stage');

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        await addUser({ email: newUserEmail, password: newUserPassword, name: newUserName, role: newUserRole });
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserName('');
        setNewUserRole('student');
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await editUser(editUserState.id, { name: editUserState.name, email: editUserState.email, role: editUserState.role });
        setEditUserState({ id: '', name: '', email: '', role: 'student', isOpen: false });
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        await addCategory(newCategory, newCategoryType);
        setNewCategory('');
    };

    return (
        <div className="content-container">
            <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">User Management</h2>
                <button onClick={forceSignOutAll} className="btn-danger flex items-center gap-2" disabled={isLoading}>
                    <UserX size={18} /> Force Sign Out All Users
                </button>
            </div>

            <div className="card">
                <h3 className="card-title">Add New User</h3>
                <form onSubmit={handleAddUser}>
                    <div className="form-group">
                        <label htmlFor="newUserName">Name</label>
                        <input type="text" id="newUserName" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required className="input-field" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newUserEmail">Email</label>
                        <input type="email" id="newUserEmail" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required className="input-field" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newUserPassword">Password</label>
                        <input type="password" id="newUserPassword" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required className="input-field" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newUserRole">Role</label>
                        <select id="newUserRole" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as Role)} required className="input-field">
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? <span className="loading-spinner"></span> : 'Add User'}
                    </button>
                </form>
            </div>

            <div className="card mt-6">
                <h3 className="card-title">Categories Management</h3>
                <form onSubmit={handleAddCategory} className="mb-4">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Enter new category" className="input-field" required />
                        </div>
                        <select value={newCategoryType} onChange={(e) => setNewCategoryType(e.target.value as 'subject' | 'stage')} className="input-field" style={{ width: '150px' }}>
                            <option value="subject">Subject</option>
                            <option value="stage">Stage</option>
                        </select>
                        <button type="submit" className="btn-primary" disabled={catLoading}>
                            <Plus size={18} /> Add
                        </button>
                    </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Subjects</h4>
                        {subjects.map((category) => (
                            <div key={category.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-2">
                                <span>{category.name}</span>
                                <button onClick={() => deleteCategory(category.id)} className="btn-danger" disabled={catLoading}>
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-3">Stages</h4>
                        {stages.map((category) => (
                            <div key={category.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-2">
                                <span>{category.name}</span>
                                <button onClick={() => deleteCategory(category.id)} className="btn-danger" disabled={catLoading}>
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card mt-6">
                <h3 className="card-title">User List</h3>
                <div className="user-grid">
                    {users.map((user) => (
                        <div key={user.id} className="user-card">
                            <div className="user-card-header">
                                <div className="user-avatar-lg"><User size={32} /></div>
                                <span className={`role-badge role-${user.role}`}>{user.role}</span>
                            </div>
                            <div className="user-card-body">
                                <h4 className="user-card-name">{user.name}</h4>
                                <p className="user-card-email">{user.email}</p>
                            </div>
                            <div className="user-card-footer">
                                <div className="flex gap-2">
                                    <button onClick={() => setEditUserState({ id: user.id, name: user.name, email: user.email, role: user.role, isOpen: true })} className="btn-secondary flex-1" disabled={currentUser?.id === user.id}>
                                        Edit
                                    </button>
                                    <button onClick={() => deleteUser(user.id)} className="btn-danger" disabled={currentUser?.id === user.id || isLoading}>
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {editUserState.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-semibold mb-4">Edit User</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label htmlFor="editName">Name</label>
                                <input type="text" id="editName" value={editUserState.name} onChange={(e) => setEditUserState({ ...editUserState, name: e.target.value })} required className="input-field" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editEmail">Email</label>
                                <input type="email" id="editEmail" value={editUserState.email} onChange={(e) => setEditUserState({ ...editUserState, email: e.target.value })} required className="input-field" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editRole">Role</label>
                                <select id="editRole" value={editUserState.role} onChange={(e) => setEditUserState({ ...editUserState, role: e.target.value as Role })} required className="input-field">
                                    <option value="admin">Admin</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <button type="button" onClick={() => setEditUserState({ id: '', name: '', email: '', role: 'student', isOpen: false })} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
                                    {isLoading ? <span className="loading-spinner"></span> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
