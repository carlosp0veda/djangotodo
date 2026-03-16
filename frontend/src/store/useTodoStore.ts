import { create } from 'zustand';

interface TodoStore {
    filterCategoryId: number | null;
    searchTerm: string;
    editingTodoId: number | 'new' | null;

    isCreatingCategory: boolean;
    newCategoryName: string;
    newCategoryColor: string;

    setFilterCategoryId: (id: number | null) => void;
    setSearchTerm: (term: string) => void;
    setEditingTodoId: (id: number | 'new' | null) => void;
    setIsCreatingCategory: (val: boolean) => void;
    setNewCategoryName: (name: string) => void;
    setNewCategoryColor: (color: string) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
    filterCategoryId: null,
    searchTerm: '',
    editingTodoId: null,

    isCreatingCategory: false,
    newCategoryName: '',
    newCategoryColor: '#3B82F6',

    setFilterCategoryId: (id) => set({ filterCategoryId: id }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setEditingTodoId: (id) => set({ editingTodoId: id }),
    setIsCreatingCategory: (val) => set({ isCreatingCategory: val, newCategoryName: '', newCategoryColor: '' }),
    setNewCategoryName: (val) => set({ newCategoryName: val }),
    setNewCategoryColor: (val) => set({ newCategoryColor: val }),
}));
