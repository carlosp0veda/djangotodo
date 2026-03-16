"use client";
import React, { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTodoStore } from "../../store/useTodoStore";
import {
    useTodosQuery,
    useAddCategoryMutation,
    useUpdateTodoMutation,
    useDeleteTodoMutation
} from "../../hooks/useTodos";
import { Sidebar } from "../Sidebar";
import { EmptyState } from "../EmptyState";
import { Button } from "../Button/Button";
import { NoteCard } from "../NoteCard";
import { NoteViewModal } from "../NoteViewModal/NoteViewModal";
import styles from "./TodoApp.module.css";

export default function TodoApp() {
    const { logout } = useAuth();
    const store = useTodoStore();

    const { data: todos = [], isLoading: todosLoading, error: todosError } = useTodosQuery(store.filterCategoryId);

    const addCategoryMutation = useAddCategoryMutation();
    const updateTodoMutation = useUpdateTodoMutation();
    const deleteTodoMutation = useDeleteTodoMutation();

    useEffect(() => {
        if (todosError) {
            const message = todosError instanceof Error ? todosError.message : "";
            if (message.includes("401")) {
                logout();
            }
        }
    }, [todosError, logout]);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const { newCategoryName, newCategoryColor } = store;
        if (!newCategoryName.trim()) return;

        addCategoryMutation.mutate({ name: newCategoryName, color: newCategoryColor }, {
            onSuccess: () => store.setIsCreatingCategory(false)
        });
    };

    const filteredTodos = todos.filter(todo =>
        todo.title.toLowerCase().includes(store.searchTerm.toLowerCase())
    );

    if (todosLoading && todos.length === 0) {
        return (
            <div className={styles.loading}>
                Loading tasks...
            </div>
        );
    }

    return (
        <div className={styles.app}>
            <Sidebar />

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <Button
                        onClick={() => store.setEditingTodoId('new')}
                        icon={<span style={{ fontSize: '1.125rem', lineHeight: 1 }}>+</span>}
                    >
                        New Note
                    </Button>
                </header>

                {todosError && (
                    <div className={styles.errorBanner}>
                        {todosError instanceof Error ? todosError.message : "An error occurred"}
                    </div>
                )}

                {/* Grid of Notes */}
                <div className={filteredTodos.length === 0 ? styles.gridEmpty : styles.grid}>
                    {filteredTodos.length === 0 ? (
                        <EmptyState />
                    ) : (
                        filteredTodos.map((todo) => (
                            <NoteCard
                                key={todo.id}
                                todo={todo}
                                onToggleComplete={(id, currentStatus) => updateTodoMutation.mutate({ id, data: { completed: !currentStatus } })}
                                onDelete={(id) => deleteTodoMutation.mutate(id)}
                            />
                        ))
                    )}
                </div>
            </main>

            {/* Category Creation Modal */}
            {store.isCreatingCategory && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <h2 className={styles.modalTitle}>New Category</h2>
                        <form onSubmit={handleAddCategory} className={styles.modalForm}>
                            <input
                                autoFocus
                                type="text"
                                value={store.newCategoryName}
                                onChange={(e) => store.setNewCategoryName(e.target.value)}
                                placeholder="Category name..."
                                className={styles.modalInput}
                            />
                            <div className={styles.colorPickerContainer}>
                                <label className={styles.colorLabel}>Label Color</label>
                                <div className={styles.colorPickerSection}>
                                    <input
                                        type="color"
                                        value={store.newCategoryColor}
                                        onChange={(e) => store.setNewCategoryColor(e.target.value)}
                                        className={styles.colorInput}
                                    />
                                    <span className={styles.colorHex}>{store.newCategoryColor.toUpperCase()}</span>
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <Button
                                    type="submit"
                                    disabled={addCategoryMutation.isPending}
                                    className={styles.modalActionBtn}
                                >
                                    {addCategoryMutation.isPending ? "Creating..." : "Create"}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => store.setIsCreatingCategory(false)}
                                    className={styles.modalActionBtn}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Note Modal */}
            {store.editingTodoId !== null && <NoteViewModal key={store.editingTodoId} />}

        </div>
    );
}
