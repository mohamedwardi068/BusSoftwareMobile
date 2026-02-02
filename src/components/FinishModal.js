import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { X, Hash, Sparkles } from 'lucide-react-native';

export default function FinishModal({ visible, onClose, onConfirm, loading }) {
    const [serialNumber, setSerialNumber] = useState('');

    const handleConfirm = () => {
        onConfirm(serialNumber.trim() || null);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Finaliser la réparation</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                        <Text style={styles.label}>Numéro de série</Text>
                        <View style={styles.inputWrapper}>
                            <Hash size={20} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Laisser vide pour auto-générer"
                                value={serialNumber}
                                onChangeText={setSerialNumber}
                                autoCapitalize="characters"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                        <Text style={styles.hint}>
                            Si vous laissez ce champ vide, le système générera automatiquement un numéro de série séquentiel.
                        </Text>

                        <TouchableOpacity
                            style={[styles.confirmButton, loading && styles.buttonDisabled]}
                            onPress={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Sparkles size={20} color="#fff" />
                                    <Text style={styles.confirmButtonText}>Marquer comme Fini</Text>
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
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    body: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#1e293b',
    },
    hint: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 12,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    confirmButton: {
        flexDirection: 'row',
        backgroundColor: '#166534',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
