export type User = {
    id: number;
    username: string;
    points: number;
    avatar_url: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    isAdmin: boolean;
};
