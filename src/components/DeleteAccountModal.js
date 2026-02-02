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
import { Settings, AlertTriangle, X, Eye, EyeOff } from 'lucide-react-native';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function DeleteAccountModal({ visible, onClose }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmationText, setConfirmationText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNextStep = () => {
        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
            return;
        }
        setStep(2);
    };

    const confirmDeletion = async () => {
        if (confirmationText !== 'SUPPRIMER MON COMPTE') return;

        setLoading(true);
        try {
            const userId = user?.id || user?._id;
            await api.delete(`/users/${userId}`, {
                data: { password }
            });

            Alert.alert(
                'Succès',
                'Votre compte a été supprimé avec succès. Vous allez être déconnecté.',
                [{ text: 'OK', onPress: handleFinalLogout }]
            );
        } catch (error) {
            console.error('Account deletion error:', error);
            Alert.alert('Erreur', error.response?.data?.error || 'Échec de la suppression du compte');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalLogout = async () => {
        await logout();
        onClose();
        router.replace('/login');
    };

    const resetAndClose = () => {
        setStep(1);
        setPassword('');
        setConfirmationText('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={resetAndClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <AlertTriangle size={28} color="#ef4444" />
                            <Text style={styles.title}>Supprimer mon compte</Text>
                        </View>
                        <TouchableOpacity onPress={resetAndClose}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            Cette action est irréversible. Toutes vos données seront définitivement perdues.
                        </Text>
                    </View>

                    {step === 1 ? (
                        <View style={styles.stepContainer}>
                            <Text style={styles.label}>Confirmez votre mot de passe pour continuer :</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Votre mot de passe"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.btn, styles.cancelBtn]}
                                    onPress={resetAndClose}
                                >
                                    <Text style={styles.cancelBtnText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.nextBtn, password.length < 6 && { opacity: 0.5 }]}
                                    onPress={handleNextStep}
                                    disabled={password.length < 6}
                                >
                                    <Text style={styles.nextBtnText}>Continuer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.stepContainer}>
                            <Text style={styles.instructionText}>
                                Vous êtes sur le point de supprimer le compte <Text style={{ fontWeight: 'bold' }}>{user?.name}</Text>.
                            </Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Tapez "SUPPRIMER MON COMPTE" pour confirmer :</Text>
                                <TextInput
                                    style={[styles.input, { color: '#ef4444', fontWeight: 'bold', textAlign: 'center' }]}
                                    placeholder="SUPPRIMER MON COMPTE"
                                    value={confirmationText}
                                    onChangeText={setConfirmationText}
                                    autoCapitalize="characters"
                                />
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.btn, styles.cancelBtn]}
                                    onPress={() => setStep(1)}
                                >
                                    <Text style={styles.cancelBtnText}>Retour</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.btn,
                                        styles.deleteBtn,
                                        confirmationText !== 'SUPPRIMER MON COMPTE' && { opacity: 0.5 }
                                    ]}
                                    onPress={confirmDeletion}
                                    disabled={confirmationText !== 'SUPPRIMER MON COMPTE' || loading}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteBtnText}>Supprimer</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 24,
        elevation: 10,
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
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    warningBox: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fee2e2',
        borderRadius: 12,
        padding: 12,
        marginBottom: 24,
    },
    warningText: {
        fontSize: 13,
        color: '#b91c1c',
        fontWeight: '600',
        lineHeight: 18,
    },
    stepContainer: {
        gap: 20,
    },
    instructionText: {
        fontSize: 15,
        color: '#475569',
        textAlign: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4,
    },
    passwordContainer: {
        position: 'relative',
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
        top: 14,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    btn: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#f1f5f9',
    },
    cancelBtnText: {
        color: '#475569',
        fontWeight: '700',
    },
    nextBtn: {
        backgroundColor: '#2563eb',
    },
    nextBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
    deleteBtn: {
        backgroundColor: '#ef4444',
    },
    deleteBtnText: {
        color: '#fff',
        fontWeight: '700',
    }
});
