"use client";

import React from "react";
import { useTodoStore } from "../../store/useTodoStore";
import { useCategoriesQuery } from "../../hooks/useTodos";
import { useAuth } from "../../hooks/useAuth";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
    const store = useTodoStore();
    const { data: categories = [] } = useCategoriesQuery();
    const { logout } = useAuth();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>All Categories</h2>
                <nav className={styles.nav}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => store.setFilterCategoryId(cat.id)}
                            className={`${styles.categoryBtn} ${store.filterCategoryId === cat.id ? styles.categoryBtnActive : ''}`}
                        >
                            <span
                                className={styles.colorDot}
                                style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className={styles.footer}>
                <button
                    onClick={() => store.setIsCreatingCategory(true)}
                    className={styles.newCategoryBtn}
                >
                    + New Category
                </button>
                <button
                    onClick={logout}
                    className={styles.signOutLink}
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
