import { create } from 'zustand';
import { TodoStore } from '@/types';

export const useTodoStore = create<TodoStore>((set) => ({
    filterCategoryId: null,
    searchTerm: '',
    editingTodoId: null,

    isCreatingCategory: false,
    newCategoryName: '',
    newCategoryColor: '#3B82F6',

    setFilterCategoryId: (id: number | null) => set({ filterCategoryId: id }),
    setSearchTerm: (term: string) => set({ searchTerm: term }),
    setEditingTodoId: (id: number | 'new' | null) => set({ editingTodoId: id }),
    setIsCreatingCategory: (val: boolean) => set({ isCreatingCategory: val, newCategoryName: '', newCategoryColor: '' }),
    setNewCategoryName: (val: string) => set({ newCategoryName: val }),
    setNewCategoryColor: (val: string) => set({ newCategoryColor: val }),
}));
