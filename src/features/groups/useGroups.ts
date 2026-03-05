import { useState, useEffect } from 'react';
import { subscribeGroups } from './groupService';
import type { Group } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export function useGroups() {
    const { currentUser } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeGroups(
            (list) => {
                setGroups(list);
                setIsLoading(false);
            },
            () => setIsLoading(false)
        );
        return unsub;
    }, []);

    const myGroups = groups.filter((g) =>
        currentUser ? g.members.includes(currentUser.id) : false
    );

    return { groups, myGroups, isLoading };
}
