import { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Search } from 'lucide-react';
import { addMember, removeMember } from './groupService';
import type { Group, User } from '../../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface GroupMembersModalProps {
    group: Group;
    onClose: () => void;
}

export default function GroupMembersModal({ group, onClose }: GroupMembersModalProps) {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [members, setMembers] = useState<string[]>(group.members);

    useEffect(() => {
        (async () => {
            const snap = await getDocs(collection(db, 'users'));
            const users = snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
            setAllUsers(users);
        })();
    }, []);

    const filtered = allUsers.filter(
        (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    async function handleAdd(userId: string) {
        await addMember(group.id, userId);
        setMembers((prev) => [...prev, userId]);
    }

    async function handleRemove(userId: string) {
        await removeMember(group.id, userId);
        setMembers((prev) => prev.filter((id) => id !== userId));
    }

    const memberUsers = filtered.filter((u) => members.includes(u.id));
    const nonMemberUsers = filtered.filter((u) => !members.includes(u.id));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content group-members-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{group.name} — Members ({members.length})</h2>
                    <button onClick={onClose} className="modal-close"><X size={20} /></button>
                </div>

                <div className="group-search-bar">
                    <Search size={16} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search students..."
                        className="input-field"
                    />
                </div>

                {memberUsers.length > 0 && (
                    <div className="group-member-section">
                        <h3>Current Members</h3>
                        {memberUsers.map((u) => (
                            <div key={u.id} className="group-member-row">
                                <div>
                                    <span className="group-member-name">{u.name}</span>
                                    <span className="group-member-email">{u.email}</span>
                                </div>
                                <button onClick={() => handleRemove(u.id)} className="btn-danger group-member-action">
                                    <UserMinus size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {nonMemberUsers.length > 0 && (
                    <div className="group-member-section">
                        <h3>Available Students</h3>
                        {nonMemberUsers.map((u) => (
                            <div key={u.id} className="group-member-row">
                                <div>
                                    <span className="group-member-name">{u.name}</span>
                                    <span className="group-member-email">{u.email}</span>
                                </div>
                                <button onClick={() => handleAdd(u.id)} className="btn-secondary group-member-action">
                                    <UserPlus size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
