import { useState } from 'react';
import { Plus, UsersRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGroups } from './useGroups';
import { createGroup, deleteGroup } from './groupService';
import GroupCard from './GroupCard';
import GroupMembersModal from './GroupMembersModal';
import type { Group } from '../../types';

export default function GroupsManagementPage() {
    const { currentUser } = useAuth();
    const { groups, isLoading } = useGroups();

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [stage, setStage] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    async function handleCreate() {
        if (!name.trim()) { alert('Group name is required.'); return; }

        await createGroup({
            name: name.trim(),
            description: description.trim(),
            stage: stage.trim() || undefined,
            members: [],
            createdBy: currentUser?.id ?? '',
        });

        setName('');
        setDescription('');
        setStage('');
        setShowForm(false);
    }

    async function handleDelete(groupId: string) {
        if (!confirm('Delete this group? This cannot be undone.')) return;
        await deleteGroup(groupId);
    }

    if (isLoading) {
        return <div className="analytics-loading"><div className="loading-spinner" /><p>Loading groups...</p></div>;
    }

    return (
        <div className="groups-page">
            <div className="groups-header">
                <div className="groups-header-left">
                    <UsersRound size={28} />
                    <h1>Student Groups</h1>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    <Plus size={16} /> {showForm ? 'Cancel' : 'Create Group'}
                </button>
            </div>

            {showForm && (
                <div className="card group-create-form">
                    <div className="quiz-meta-grid">
                        <div className="form-group">
                            <label>Group Name *</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g., Section A" />
                        </div>
                        <div className="form-group">
                            <label>Stage</label>
                            <input value={stage} onChange={(e) => setStage(e.target.value)} className="input-field" placeholder="e.g., Stage 1" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <input value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="Optional description" />
                    </div>
                    <button onClick={handleCreate} className="btn-primary">Create</button>
                </div>
            )}

            {groups.length === 0 ? (
                <div className="quiz-empty">
                    <UsersRound size={48} strokeWidth={1} />
                    <p>No groups created yet.</p>
                </div>
            ) : (
                <div className="quiz-grid">
                    {groups.map((g) => (
                        <GroupCard
                            key={g.id}
                            group={g}
                            onDelete={handleDelete}
                            onManageMembers={setSelectedGroup}
                        />
                    ))}
                </div>
            )}

            {selectedGroup && (
                <GroupMembersModal
                    group={selectedGroup}
                    onClose={() => setSelectedGroup(null)}
                />
            )}
        </div>
    );
}
