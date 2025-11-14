    "use client";

    import React, { createContext, useContext, useState, useEffect } from 'react';

    // Define User Interface
    export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    checkInTime?: string | null;
    checkOutTime?: string | null;
    }

    // Define Context Type
    interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isLoading: boolean;
    refetchUser: () => void;
    }

    const UserContext = createContext<UserContextType | undefined>(undefined);

    export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch user data from the API
    const fetchUser = async () => {
        setIsLoading(true);
        try {
        const res = await fetch("/api/auth/me", {
            // ✅ Đã thêm credentials: 'include' để đảm bảo cookie được gửi
            credentials: 'include', 
        });
        const data = await res.json();
        if (res.ok && data.user) {
            // This initial data pull includes the latest checkInTime and checkOutTime from the server
            setUser(data.user);
        } else {
            // Nếu API trả về 401, nó sẽ vào đây
            setUser(null);
        }
        } catch (error) {
            console.error("Failed to fetch user:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user data on initial mount
    useEffect(() => {
        fetchUser();
    }, []); // Empty dependency array ensures it runs only once

    return (
        <UserContext.Provider value={{ user, setUser, isLoading, refetchUser: fetchUser }}>
        {children}
        </UserContext.Provider>
    );
    };

    export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
    };
