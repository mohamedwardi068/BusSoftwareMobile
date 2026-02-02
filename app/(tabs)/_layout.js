import { Tabs } from 'expo-router';
import { Package, ClipboardList, User } from 'lucide-react-native';

export default function TabLayout() {
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
            headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 20,
                color: '#1e293b',
            }
        }}>
            <Tabs.Screen
                name="reception"
                options={{
                    title: 'Réception',
                    tabBarLabel: 'Réception',
                    tabBarIcon: ({ color }) => <Package size={24} color={color} />,
                }}
            />
            {/* You can add more tabs here later */}
        </Tabs>
    );
}
