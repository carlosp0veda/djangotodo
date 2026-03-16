import React, { useState, useRef, useEffect } from 'react';
import { Category } from '../../lib/types';
import styles from './CategoryDropdown.module.css';

interface CategoryDropdownProps {
    categories: Category[];
    selectedCategoryId: number | null;
    onChange: (id: number | null) => void;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
    categories,
    selectedCategoryId,
    onChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (id: number | null) => {
        onChange(id);
        setIsOpen(false);
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <button
                type="button"
                className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.content}>
                    {selectedCategory ? (
                        <span
                            className={styles.dot}
                            style={{ backgroundColor: selectedCategory.color }}
                        />
                    ) : (
                        <span className={styles.placeholderDot} />
                    )}
                    <span>{selectedCategory?.name || 'No Category'}</span>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <button
                        type="button"
                        className={`${styles.item} ${selectedCategoryId === null ? styles.itemSelected : ''}`}
                        onClick={() => handleSelect(null)}
                    >
                        <span className={styles.placeholderDot} />
                        No Category
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            className={`${styles.item} ${selectedCategoryId === category.id ? styles.itemSelected : ''}`}
                            onClick={() => handleSelect(category.id)}
                        >
                            <span
                                className={styles.dot}
                                style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
