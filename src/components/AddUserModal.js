import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { UserPlus, User, Lock, X } from 'lucide-react-native';
import api from '../api/axios';

export default function AddUserModal({ visible, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim() || !password.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/users', { name, password, role });
            Alert.alert('Succès', 'Utilisateur ajouté avec succès');
            setName('');
            setPassword('');
            setRole('user');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Add user error:', error);
            Alert.alert('Erreur', error.response?.data?.error || 'Échec de l\'ajout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <UserPlus size={24} color="#2563eb" />
                            <Text style={styles.title}>Ajouter un utilisateur</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <User size={14} color="#64748b" />
                                <Text style={styles.label}>Nom d'utilisateur</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Nom"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Lock size={14} color="#64748b" />
                                <Text style={styles.label}>Mot de passe</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Mot de passe"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Rôle</Text>
                            <View style={styles.roleTabs}>
                                <TouchableOpacity
                                    style={[styles.roleTab, role === 'user' && styles.roleTabActive]}
                                    onPress={() => setRole('user')}
                                >
                                    <Text style={[styles.roleTabText, role === 'user' && styles.roleTabTextActive]}>Technicien</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.roleTab, role === 'admin' && styles.roleTabActive]}
                                    onPress={() => setRole('admin')}
                                >
                                    <Text style={[styles.roleTabText, role === 'admin' && styles.roleTabTextActive]}>Admin</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <UserPlus size={20} color="#fff" />
                                    <Text style={styles.submitText}>Ajouter l'utilisateur</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
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
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
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
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    roleTabs: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 4,
        gap: 4,
    },
    roleTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    roleTabActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    roleTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    roleTabTextActive: {
        color: '#2563eb',
    },
    submitButton: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 10,
        marginTop: 10,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    }
});
