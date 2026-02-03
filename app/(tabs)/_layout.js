import { Tabs, useRouter } from 'expo-router';
import { Package, ClipboardList, LogOut, Settings2, Users, CheckSquare, BarChart3 } from 'lucide-react-native';
import { TouchableOpacity, Alert, Platform, View, Text } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function TabLayout() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const isAdmin = user?.role === 'admin';

    const handleLogout = () => {
        Alert.alert(
            "Déconnexion",
            "Voulez-vous vraiment vous déconnecter ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Déconnexion",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace('/login');
                    }
                }
            ]
        );
    };

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#2563eb',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: {
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
            },
            headerStyle: {
                backgroundColor: '#fff',
            },
            headerShadowVisible: false,
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: '#1aa3d9',
                        marginRight: 4
                    }}>BUS</Text>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: '#1a2a4f'
                    }}>SERVICES</Text>
                </View>
            ),
            headerRight: () => (
                <TouchableOpacity
                    onPress={handleLogout}
                    style={{ marginRight: 16 }}
                >
                    <LogOut size={22} color="#64748b" />
                </TouchableOpacity>
            ),
        }}>
            <Tabs.Screen
                name="reception"
                options={{
                    tabBarLabel: 'Réception',
                    tabBarIcon: ({ color }) => <Package size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="finished"
                options={{
                    tabBarLabel: 'Finis',
                    tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="delivered"
                options={{
                    href: isAdmin ? "/delivered" : null,
                    tabBarLabel: 'Livrés',
                    tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="recapitulatif"
                options={{
                    href: isAdmin ? "/recapitulatif" : null,
                    tabBarLabel: 'Récap',
                    tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    href: isAdmin ? "/settings" : null,
                    tabBarLabel: 'Paramètres',
                    tabBarIcon: ({ color }) => <Settings2 size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
