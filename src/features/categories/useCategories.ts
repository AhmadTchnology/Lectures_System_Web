import { useState, useEffect } from 'react';
import type { Category } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OfflineDataCache } from '../../utils/offlineDataCache';
import * as categoryService from './categoryService';

export function useCategories() {
    const { isAuthenticated } = useAuth();
    const isOnline = useOnlineStatus();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load cached first
    useEffect(() => {
        const cached = OfflineDataCache.getCachedCategories();
        if (cached) setCategories(cached);
    }, []);

    // Subscribe to Firebase
    useEffect(() => {
        if (!isAuthenticated || !isOnline) return;

        const unsubscribe = categoryService.subscribeCategories((list) => {
            if (list.length > 0) setCategories(list);
        });

        return () => unsubscribe();
    }, [isAuthenticated, isOnline]);

    const addCategory = async (name: string, type: 'subject' | 'stage') => {
        if (!name.trim()) return;
        setIsLoading(true);
        try {
            await categoryService.addCategory(name, type);
            alert('Category added successfully');
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Error adding category');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCategory = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        setIsLoading(true);
        try {
            await categoryService.deleteCategory(categoryId);
            alert('Category deleted successfully');
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        categories,
        isLoading,
        addCategory,
        deleteCategory,
    };
}
