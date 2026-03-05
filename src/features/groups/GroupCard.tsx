import { Trash2, Users } from 'lucide-react';
import type { Group } from '../../types';

interface GroupCardProps {
    group: Group;
    onDelete: (id: string) => void;
    onManageMembers: (group: Group) => void;
}

export default function GroupCard({ group, onDelete, onManageMembers }: GroupCardProps) {
    return (
        <div className="group-card">
            <div className="group-card-header">
                <h3>{group.name}</h3>
                {group.stage && <span className="lecture-tag">{group.stage}</span>}
            </div>
            <div className="group-card-body">
                {group.description && <p className="group-card-desc">{group.description}</p>}
                <div className="group-card-stats">
                    <Users size={14} />
                    <span>{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
            <div className="group-card-footer">
                <button onClick={() => onManageMembers(group)} className="btn-secondary">
                    <Users size={14} /> Members
                </button>
                <button onClick={() => onDelete(group.id)} className="btn-danger">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}
