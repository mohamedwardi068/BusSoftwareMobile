import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { User, Shield, Users, Package, LogOut, ChevronRight, Wrench, Settings2, UserPlus, UserMinus, Trash2 } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import AddUserModal from '../../src/components/AddUserModal';
import DeleteUserModal from '../../src/components/DeleteUserModal';
import DeleteAccountModal from '../../src/components/DeleteAccountModal';

export default function ParametresScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [addUserVisible, setAddUserVisible] = useState(false);
    const [deleteUserVisible, setDeleteUserVisible] = useState(false);
    const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);

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

    const MenuItem = ({ icon: Icon, title, subtitle, onPress, color = "#2563eb", danger = false }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIcon, { backgroundColor: danger ? '#fef2f2' : (color + '10') }]}>
                <Icon size={22} color={danger ? '#ef4444' : color} />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, danger && { color: '#ef4444' }]}>{title}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            {/* Header / Profile */}
            <View style={styles.header}>
                <View style={styles.profileIcon}>
                    <User size={40} color="#fff" />
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{user?.name || 'Utilisateur'}</Text>
                    <View style={styles.roleBadge}>
                        <Shield size={12} color="#16a34a" />
                        <Text style={styles.roleText}>{user?.role === 'admin' ? 'Administrateur' : 'Technicien'}</Text>
                    </View>
                </View>
            </View>

            {/* Admin Management Section */}
            {user?.role === 'admin' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gestion Système</Text>
                    <View style={styles.menuList}>
                        <MenuItem
                            icon={UserPlus}
                            title="Ajouter un utilisateur"
                            subtitle="Créer un nouveau compte technicien"
                            onPress={() => setAddUserVisible(true)}
                        />
                        <MenuItem
                            icon={UserMinus}
                            title="Gérer les utilisateurs"
                            subtitle="Supprimer des comptes existants"
                            onPress={() => setDeleteUserVisible(true)}
                        />
                        <MenuItem
                            icon={Users}
                            title="Clients"
                            subtitle="Gérer la base de données clients"
                            onPress={() => Alert.alert("Infos", "La gestion complète sera disponible prochainement.")}
                        />
                        <MenuItem
                            icon={Wrench}
                            title="Pièces de rechange"
                            subtitle="Inventaire et codes-barres"
                            onPress={() => Alert.alert("Infos", "La gestion complète sera disponible prochainement.")}
                        />
                    </View>
                </View>
            )}

            {/* Account Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Compte</Text>
                <View style={styles.menuList}>
                    <MenuItem
                        icon={Settings2}
                        title="Détails du compte"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon={Trash2}
                        title="Supprimer mon compte"
                        danger={true}
                        onPress={() => setDeleteAccountVisible(true)}
                    />
                    <MenuItem
                        icon={LogOut}
                        title="Déconnexion"
                        danger={true}
                        onPress={handleLogout}
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.versionText}>Bus Manager Mobile v1.1</Text>
                <Text style={styles.copyrightText}>© 2026 Bus Software</Text>
            </View>

            {/* Modals */}
            <AddUserModal
                visible={addUserVisible}
                onClose={() => setAddUserVisible(false)}
                onSuccess={() => { }}
            />
            <DeleteUserModal
                visible={deleteUserVisible}
                onClose={() => setDeleteUserVisible(false)}
                onSuccess={() => { }}
            />
            <DeleteAccountModal
                visible={deleteAccountVisible}
                onClose={() => setDeleteAccountVisible(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    profileIcon: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    profileInfo: {
        marginLeft: 20,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#dcfce7',
        gap: 6,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#16a34a',
        textTransform: 'uppercase',
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 8,
    },
    menuList: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        flex: 1,
        marginLeft: 16,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    menuSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '600',
    },
    copyrightText: {
        fontSize: 11,
        color: '#cbd5e1',
        marginTop: 4,
    }
});
