export interface Category {
    id: number;
    name: string;
    color: string;
}

export interface Todo {
    id: number;
    title: string;
    description: string | null;
    completed: boolean;
    owner: string;
    category?: Category | null;
    created_at: string;
    updated_at: string;
}

export interface TodoInput {
    title: string;
    description?: string;
    completed?: boolean;
    category_id?: number | null;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}
