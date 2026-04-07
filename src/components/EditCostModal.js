import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { X, Check } from 'lucide-react-native';

export default function EditCostModal({ visible, onClose, onConfirm, loading, currentCost }) {
    const [cost, setCost] = useState('');

    useEffect(() => {
        if (visible) {
            setCost(currentCost ? String(currentCost) : '');
        }
    }, [visible, currentCost]);

    const handleConfirm = () => {
        onConfirm(cost.trim());
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
                        <Text style={styles.title}>
                            Modifier le Coût Total
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.body}>
                        <Text style={styles.description}>
                            Saisissez le coût total pour ce produit (en DT).
                        </Text>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ex: 1500"
                                value={cost}
                                onChangeText={setCost}
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                loading && styles.buttonDisabled
                            ]}
                            onPress={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Check size={20} color="#fff" />
                                    <Text style={styles.confirmButtonText}>
                                        Enregistrer
                                    </Text>
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
    description: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
        lineHeight: 20,
    },
    inputWrapper: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
    },
    input: {
        fontSize: 16,
        color: '#1e293b',
    },
    confirmButton: {
        flexDirection: 'row',
        backgroundColor: '#059669', // Emerald/green color
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
