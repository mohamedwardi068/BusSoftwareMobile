import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useData } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from './SearchableSelect';
import api from '../api/axios';

const POSITIONS = [
    { label: 'Avant Gauche', value: 'avant gauche' },
    { label: 'Avant Droit', value: 'avant droit' },
    { label: 'Arrière Gauche', value: 'arrière gauche' },
    { label: 'Arrière Droit', value: 'arrière droit' },
];

export default function NewReceptionForm({ onClose, onSuccess }) {
    const { clients, etriers, loading, fetchAppData } = useData();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        client: null,
        etrier: null,
        position: 'avant gauche',
        observation: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAppData();
    }, [fetchAppData]);

    const handleSubmit = async () => {
        if (!formData.client || !formData.etrier) {
            Alert.alert('Erreur', 'Veuillez sélectionner un client et un étrier');
            return;
        }

        if (!user) {
            Alert.alert('Erreur', 'Session utilisateur introuvable');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/receptions', {
                client: formData.client._id,
                etrier: formData.etrier._id,
                user: user._id || user.id, // Support both formats
                position: formData.position,
                observation: formData.observation,
                etat: 'recus',
            });
            onSuccess();
        } catch (error) {
            console.error('Error submitting reception:', error);
            Alert.alert('Erreur', error.response?.data?.error || 'Échec de l\'enregistrement');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Nouvelle Réception</Text>
                <TouchableOpacity onPress={onClose}>
                    <X size={24} color="#64748b" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
                <SearchableSelect
                    label="Client"
                    data={clients}
                    value={formData.client}
                    onSelect={(client) => setFormData({ ...formData, client })}
                    placeholder="Sélectionner un client"
                    displayKey="name"
                />

                <SearchableSelect
                    label="Étrier (Modèle)"
                    data={etriers}
                    value={formData.etrier}
                    onSelect={(etrier) => setFormData({ ...formData, etrier })}
                    placeholder="Sélectionner un modèle"
                    displayKey="carModel"
                />

                <Text style={styles.label}>Position</Text>
                <View style={styles.positionContainer}>
                    {POSITIONS.map((pos) => (
                        <TouchableOpacity
                            key={pos.value}
                            style={[
                                styles.positionButton,
                                formData.position === pos.value && styles.positionButtonActive,
                            ]}
                            onPress={() => setFormData({ ...formData, position: pos.value })}
                        >
                            <Text style={[
                                styles.positionText,
                                formData.position === pos.value && styles.positionTextActive,
                            ]}>
                                {pos.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Observation</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    value={formData.observation}
                    onChangeText={(text) => setFormData({ ...formData, observation: text })}
                    placeholder="Ajouter une note..."
                />

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Enregistrer le produit</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 60,
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    form: {
        padding: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    positionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    positionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    positionButtonActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    positionText: {
        fontSize: 14,
        color: '#64748b',
    },
    positionTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#2563eb',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 40,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
