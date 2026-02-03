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
    Platform,
    TextInput,
    ScrollView,
    Alert
} from 'react-native';
import { Plus, Package, Clock, CheckCircle2, PlayCircle, History, Filter, Wrench, Search, X as CloseIcon } from 'lucide-react-native';
import api from '../../src/api/axios';
import { useAuth } from '../../src/context/AuthContext';
import NewReceptionForm from '../../src/components/NewReceptionForm';
import FinishModal from '../../src/components/FinishModal';
import PiecesModal from '../../src/components/PiecesModal';

const STATUS_FILTERS = [
    { label: 'Tous', value: 'all' },
    { label: 'Reçu', value: 'recus' },
    { label: 'En cours', value: 'en cours' },
    { label: 'Retour', value: 'retour' },
];

export default function ReceptionScreen() {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const [receptions, setReceptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    // Action states
    const [actionLoading, setActionLoading] = useState(false);
    const [finishModalVisible, setFinishModalVisible] = useState(false);
    const [piecesModalVisible, setPiecesModalVisible] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const fetchReceptions = async () => {
        try {
            const response = await api.get('/receptions');
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];

            // If not admin, we could potentially filter on the server, but for now we filter here
            // to ensure they only see what they need.
            // First In, First Out (Oldest First)
            const sorted = data.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });

            setReceptions(sorted);
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

    const handleStartWork = async (id) => {
        setActionLoading(true);
        try {
            await api.patch(`/receptions/${id}/etat`, { etat: 'en cours' });
            fetchReceptions();
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de démarrer le travail');
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenFinish = (id) => {
        setSelectedProductId(id);
        setFinishModalVisible(true);
    };

    const handleOpenPieces = (id) => {
        setSelectedProductId(id);
        setPiecesModalVisible(true);
    };

    const handleFinishWork = async (serial) => {
        setActionLoading(true);
        try {
            await api.patch(`/receptions/${selectedProductId}/etat`, {
                etat: 'finit',
                serialNumber: serial || undefined
            });
            setFinishModalVisible(false);
            fetchReceptions();
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de finaliser la réparation');
        } finally {
            setActionLoading(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredReceptions = receptions.filter(item => {
        // Hide finished products that aren't returned (they go to another tab)
        if (item.etat === 'finit' && !item.isReturned) return false;

        // Search Filter
        const searchLower = searchTerm.toLowerCase();
        const clientName = (item.client?.name || '').toLowerCase();
        const carModel = (item.etrier?.carModel || '').toLowerCase();
        const receptionNum = (item.receptionNumber || '').toLowerCase();

        const matchesSearch = clientName.includes(searchLower) ||
            carModel.includes(searchLower) ||
            receptionNum.includes(searchLower);

        if (!matchesSearch) return false;

        if (statusFilter === 'all') return true;
        if (statusFilter === 'retour') return item.isReturned;

        // Treat returned as "en cours" for display if that's the filter
        const displayEtat = item.isReturned ? 'en cours' : item.etat;
        return displayEtat === statusFilter;
    });

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
                    item.isReturned ? styles.statusReturn :
                        item.etat === 'en cours' ? styles.statusInProgress :
                            item.etat === 'recus' ? styles.statusReceived : styles.statusFinished
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.isReturned ? styles.statusReturnText :
                            item.etat === 'en cours' ? styles.statusInProgressText :
                                item.etat === 'recus' ? styles.statusReceivedText : styles.statusFinishedText
                    ]}>
                        {item.isReturned ? 'Retour' :
                            item.etat === 'recus' ? 'Reçu' :
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

                {/* Actions */}
                <View style={styles.actionRow}>
                    {item.etat === 'recus' && (
                        <TouchableOpacity
                            style={styles.actionButtonStart}
                            onPress={() => handleStartWork(item._id)}
                            disabled={actionLoading}
                        >
                            <PlayCircle size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>Commencer</Text>
                        </TouchableOpacity>
                    )}
                    {(item.etat === 'en cours' || item.isReturned) && (
                        <>
                            <TouchableOpacity
                                style={styles.actionButtonPieces}
                                onPress={() => handleOpenPieces(item._id)}
                                disabled={actionLoading}
                            >
                                <Wrench size={18} color="#2563eb" />
                                <Text style={styles.actionButtonTextPieces}>Pièces</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButtonFinish}
                                onPress={() => handleOpenFinish(item._id)}
                                disabled={actionLoading}
                            >
                                <CheckCircle2 size={18} color="#fff" />
                                <Text style={styles.actionButtonText}>Terminer</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
            <View style={styles.searchHeader}>
                <View style={styles.searchContainer}>
                    <Search size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher par client, modèle..."
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        autoCapitalize="none"
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <CloseIcon size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Status Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {STATUS_FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            style={[
                                styles.filterButton,
                                statusFilter === filter.value && styles.filterButtonActive
                            ]}
                            onPress={() => setStatusFilter(filter.value)}
                        >
                            <Text style={[
                                styles.filterText,
                                statusFilter === filter.value && styles.filterTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredReceptions}
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

            <FinishModal
                visible={finishModalVisible}
                onClose={() => setFinishModalVisible(false)}
                onConfirm={handleFinishWork}
                loading={actionLoading}
                products={receptions}
            />

            <PiecesModal
                visible={piecesModalVisible}
                onClose={() => setPiecesModalVisible(false)}
                productId={selectedProductId}
            />
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
    // Search Styles
    searchHeader: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1e293b',
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
    filterContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    filterScroll: {
        padding: 16,
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 99,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterButtonActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#fff',
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
    statusReturn: { backgroundColor: '#fff1f2' },
    statusText: { fontSize: 11, fontWeight: '700' },
    statusReceivedText: { color: '#2563eb' },
    statusInProgressText: { color: '#854d0e' },
    statusFinishedText: { color: '#166534' },
    statusReturnText: { color: '#be123c' },
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
        marginBottom: 16,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButtonStart: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonPieces: {
        flex: 0.8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    actionButtonTextPieces: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '700',
    },
    actionButtonFinish: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#166534',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
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
