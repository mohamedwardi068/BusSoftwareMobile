import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <Stack
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#2563eb', // Blue-600 like the web app
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                    }}
                >
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ title: 'Connexion', headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
