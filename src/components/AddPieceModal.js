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
import { Wrench, Settings, Barcode, X } from 'lucide-react-native';
import api from '../api/axios';

export default function AddPieceModal({ visible, onClose, onSuccess }) {
    const [designation, setDesignation] = useState('');
    const [referenceArticle, setReferenceArticle] = useState('');
    const [barcode, setBarcode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async () => {
        setErrorMessage('');
        if (!designation.trim() || !referenceArticle.trim() || !barcode.trim()) {
            setErrorMessage('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            await api.post('/pieces', { 
                designation, 
                referenceArticle, 
                barcode 
            });
            Alert.alert('Succès', 'Pièce ajoutée avec succès');
            if (onSuccess) onSuccess();
            handleClose();
        } catch (error) {
            console.error('Add piece error:', error);
            let errorMsg = error.response?.data?.error || 'Échec de l\'ajout de la pièce';
            
            if (errorMsg === 'Reference article already exists') {
                errorMsg = 'Cette référence article existe déjà';
            } else if (errorMsg === 'Barcode already exists') {
                errorMsg = 'Ce code barre existe déjà';
            } else if (errorMsg === 'Designation, Reference Article, and Barcode are required') {
                errorMsg = 'Veuillez remplir tous les champs obligatoires';
            } else if (errorMsg === 'Server error') {
                errorMsg = 'Erreur du serveur, veuillez réessayer';
            }

            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDesignation('');
        setReferenceArticle('');
        setBarcode('');
        setErrorMessage('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Wrench size={24} color="#2563eb" />
                            <Text style={styles.title}>Ajouter une pièce</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {errorMessage ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Settings size={14} color="#64748b" />
                                <Text style={styles.label}>Désignation</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Nom de la pièce"
                                value={designation}
                                onChangeText={setDesignation}
                                autoCapitalize="sentences"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Settings size={14} color="#64748b" />
                                <Text style={styles.label}>Référence Article</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: REF-12345"
                                value={referenceArticle}
                                onChangeText={setReferenceArticle}
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Barcode size={14} color="#64748b" />
                                <Text style={styles.label}>Code Barre</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Numéro de code barre"
                                value={barcode}
                                onChangeText={setBarcode}
                                keyboardType="default"
                            />
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
                                    <Wrench size={20} color="#fff" />
                                    <Text style={styles.submitText}>Ajouter la pièce</Text>
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
    errorContainer: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fca5a5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
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
