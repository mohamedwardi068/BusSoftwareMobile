import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Modal,
} from 'react-native';
import { Plus, Package, Clock, CheckCircle2 } from 'lucide-react-native';
import api from '../../src/api/axios';
import NewReceptionForm from '../../src/components/NewReceptionForm';

export default function ReceptionScreen() {
    const [receptions, setReceptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchReceptions = async () => {
        try {
            const response = await api.get('/receptions');
            setReceptions(response.data.data);
        } catch (error) {
            console.error('Error fetching receptions:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReceptions();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReceptions();
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.receptionBadge}>
                    <Text style={styles.receptionNumber}>{item.receptionNumber}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.etat === 'en cours' ? styles.statusInProgress :
                        item.etat === 'recus' ? styles.statusReceived : styles.statusFinished
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.etat === 'en cours' ? styles.statusInProgressText :
                            item.etat === 'recus' ? styles.statusReceivedText : styles.statusFinishedText
                    ]}>
                        {item.etat === 'recus' ? 'Reçu' :
                            item.etat === 'en cours' ? 'En cours' : 'Fini'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.clientName}>{item.client?.name || 'Client inconnu'}</Text>
                <Text style={styles.etrierModel}>{item.etrier?.carModel || 'Modèle inconnu'}</Text>

                <View style={styles.footer}>
                    <View style={styles.infoRow}>
                        <Clock size={14} color="#64748b" />
                        <Text style={styles.dateText}>
                            {new Date(item.date).toLocaleDateString('fr-FR')}
                        </Text>
                    </View>
                    <Text style={styles.positionText}>{item.position || ''}</Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={receptions}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Package size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Aucune réception trouvée</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Plus size={32} color="#fff" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <NewReceptionForm
                    onClose={() => setModalVisible(false)}
                    onSuccess={() => {
                        setModalVisible(false);
                        fetchReceptions();
                    }}
                />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    receptionBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    receptionNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
    },
    statusReceived: { backgroundColor: '#eff6ff' },
    statusInProgress: { backgroundColor: '#fefce8' },
    statusFinished: { backgroundColor: '#f0fdf4' },
    statusText: { fontSize: 11, fontWeight: '700' },
    statusReceivedText: { color: '#2563eb' },
    statusInProgressText: { color: '#854d0e' },
    statusFinishedText: { color: '#166534' },
    clientName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    etrierModel: {
        fontSize: 15,
        color: '#64748b',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 13,
        color: '#64748b',
    },
    positionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: '#2563eb',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    emptyState: {
        padding: 60,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
        color: '#94a3b8',
        fontSize: 16,
    },
});
