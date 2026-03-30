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
import { Wrench, FileText, Hash, Barcode, X, Plus } from 'lucide-react-native';
import api from '../api/axios';

export default function AddPieceModal({ visible, onClose, onSuccess }) {
    const [designation, setDesignation] = useState('');
    const [referenceArticle, setReferenceArticle] = useState('');
    const [barcode, setBarcode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!designation.trim() || !referenceArticle.trim() || !barcode.trim()) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            await api.post('/pieces', { designation, referenceArticle, barcode });
            Alert.alert('Succès', 'Pièce ajoutée avec succès');
            setDesignation('');
            setReferenceArticle('');
            setBarcode('');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            Alert.alert('Erreur', error.response?.data?.error || "Échec de l'ajout");
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
                            <Wrench size={24} color="#2563eb" />
                            <Text style={styles.title}>Ajouter une pièce</Text>
                        </View>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {/* Designation */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <FileText size={14} color="#64748b" />
                                <Text style={styles.label}>Désignation</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: Filtre à air"
                                value={designation}
                                onChangeText={setDesignation}
                            />
                        </View>

                        {/* Reference Article */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Hash size={14} color="#64748b" />
                                <Text style={styles.label}>Référence Article</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: REF-1234"
                                value={referenceArticle}
                                onChangeText={setReferenceArticle}
                                autoCapitalize="characters"
                            />
                        </View>

                        {/* Barcode */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Barcode size={14} color="#64748b" />
                                <Text style={styles.label}>Code-barres</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 1234567890123"
                                value={barcode}
                                onChangeText={setBarcode}
                                keyboardType="numeric"
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
                                    <Plus size={20} color="#fff" />
                                    <Text style={styles.submitText}>Enregistrer la pièce</Text>
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
