import { useState, useEffect } from 'react';
import type { User, Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import * as userService from './userService';

export function useUsers() {
    const { currentUser, isAuthenticated } = useAuth();
    const isOnline = useOnlineStatus();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || currentUser?.role !== 'admin' || !isOnline) return;

        const unsubscribe = userService.subscribeUsers((list) => {
            setUsers(list);
        });

        return () => unsubscribe();
    }, [isAuthenticated, currentUser?.role, isOnline]);

    const addUser = async (data: {
        email: string;
        password: string;
        name: string;
        role: Role;
    }) => {
        setIsLoading(true);
        try {
            await userService.addUser(data);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                alert('Email is already in use');
            } else {
                alert('Error creating user: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const editUser = async (
        userId: string,
        data: { name: string; email: string; role: Role }
    ) => {
        setIsLoading(true);
        try {
            await userService.editUser(userId, data);
            alert('User updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (userId: string) => {
        if (currentUser?.id === userId) {
            alert('You cannot delete your own account!');
            return;
        }
        if (!confirm('Are you sure you want to delete this user?')) return;

        setIsLoading(true);
        try {
            await userService.deleteUser(userId);
            alert('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        } finally {
            setIsLoading(false);
        }
    };

    const forceSignOutAll = async () => {
        if (currentUser?.role !== 'admin') return;
        if (!confirm('Are you sure you want to force all users to sign out?')) return;

        setIsLoading(true);
        try {
            await userService.forceSignOutAll();
            alert('All users have been signed out successfully');
        } catch (error) {
            console.error('Error forcing sign out:', error);
            alert('Error forcing sign out');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        users,
        isLoading,
        addUser,
        editUser,
        deleteUser,
        forceSignOutAll,
    };
}
