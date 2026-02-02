import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const loadToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('userToken');
                const userData = await SecureStore.getItemAsync('userData');
                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (e) {
                console.error('Failed to load auth data', e);
            } finally {
                setLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (name, password) => {
        try {
            const response = await api.post('/users/login', { name, password });
            const { token, user: userData } = response.data;

            await SecureStore.setItemAsync('userToken', token);
            await SecureStore.setItemAsync('userData', JSON.stringify(userData));

            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userData');
            setUser(null);
        } catch (e) {
            console.error('Logout error:', e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
