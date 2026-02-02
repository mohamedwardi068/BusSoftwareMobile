import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    FlatList,
} from 'react-native';
import { UserMinus, User, Search, X, AlertTriangle, Trash2 } from 'lucide-react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function DeleteUserModal({ visible, onClose, onSuccess }) {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            // Exclude self
            const filtered = data.filter(u => u._id !== currentUser?.id && u._id !== currentUser?._id);
            setUsers(filtered);
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchUsers();
            setSearchTerm('');
            setSelectedUser(null);
            setConfirmationVisible(false);
        }
    }, [visible]);

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setConfirmationVisible(true);
        setConfirmationText('');
    };

    const confirmDeletion = async () => {
        if (confirmationText !== 'SUPPRIMER') return;

        setLoading(true);
        try {
            await api.delete(`/users/${selectedUser._id}`);
            Alert.alert('Succès', 'Utilisateur supprimé définitivement.');
            setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
            setConfirmationVisible(false);
            onSuccess();
        } catch (error) {
            console.error('Delete user error:', error);
            Alert.alert('Erreur', error.response?.data?.error || 'Échec de la suppression');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderUserItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleDeleteClick(item)}
        >
            <View style={styles.userAvatar}>
                <User size={20} color="#ef4444" />
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userRole}>{item.role === 'admin' ? 'Administrateur' : 'Technicien'}</Text>
            </View>
            <Trash2 size={20} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => confirmationVisible ? setConfirmationVisible(false) : onClose()}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <UserMinus size={24} color="#ef4444" />
                            <Text style={styles.title}>Supprimer un utilisateur</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBar}>
                        <Search size={18} color="#94a3b8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher par nom..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>

                    {loading && users.length === 0 ? (
                        <ActivityIndicator style={{ marginVertical: 40 }} color="#ef4444" />
                    ) : (
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={item => item._id}
                            renderItem={renderUserItem}
                            style={styles.userList}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
                            }
                        />
                    )}

                    {/* Inner Confirmation Modal */}
                    <Modal
                        visible={confirmationVisible}
                        transparent={true}
                        animationType="fade"
                    >
                        <View style={styles.confirmOverlay}>
                            <View style={styles.confirmContent}>
                                <View style={styles.confirmHeader}>
                                    <AlertTriangle size={32} color="#ef4444" />
                                    <Text style={styles.confirmTitle}>Action Irréversible</Text>
                                </View>

                                <Text style={styles.confirmText}>
                                    Voulez-vous vraiment supprimer définitivement <Text style={{ fontWeight: 'bold' }}>{selectedUser?.name || 'cet utilisateur'}</Text> ?{"\n"}
                                    Toutes ses données seront perdues.
                                </Text>

                                <View style={styles.confirmInputGroup}>
                                    <Text style={styles.confirmLabel}>Tapez "SUPPRIMER" pour confirmer :</Text>
                                    <TextInput
                                        style={styles.confirmInput}
                                        placeholder="SUPPRIMER"
                                        value={confirmationText}
                                        onChangeText={setConfirmationText}
                                        autoCapitalize="characters"
                                    />
                                </View>

                                <View style={styles.confirmActions}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => setConfirmationVisible(false)}
                                    >
                                        <Text style={styles.cancelBtnText}>Annuler</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.confirmBtn,
                                            confirmationText !== 'SUPPRIMER' && { opacity: 0.5 }
                                        ]}
                                        disabled={confirmationText !== 'SUPPRIMER' || loading}
                                        onPress={confirmDeletion}
                                    >
                                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Supprimer</Text>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    userList: {
        marginBottom: 20,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    userAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    userRole: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        paddingVertical: 40,
        color: '#94a3b8',
        fontSize: 15,
    },
    confirmOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        elevation: 10,
    },
    confirmHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ef4444',
    },
    confirmText: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 20,
    },
    confirmInputGroup: {
        marginBottom: 24,
    },
    confirmLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    confirmInput: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#ef4444',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    confirmBtn: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#ef4444',
        alignItems: 'center',
    },
    confirmBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    }
});
