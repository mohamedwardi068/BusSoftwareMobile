import { useEffect } from 'react';
import { useRouter, SplashScreen } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                // Use replace to prevent going back to index
                router.replace('/(tabs)/reception');
            } else {
                router.replace('/login');
            }
        }
    }, [user, loading]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
    );
}
