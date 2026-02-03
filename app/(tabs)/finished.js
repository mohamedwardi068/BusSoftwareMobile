import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform,
    TextInput
} from 'react-native';
import { ClipboardList, CheckCircle, RotateCcw, Hash, Clock, User, ChevronRight, Search, X as CloseIcon } from 'lucide-react-native';
import api from '../../src/api/axios';
import { useAuth } from '../../src/context/AuthContext';
import ProductDetailModal from '../../src/components/ProductDetailModal';
import ReturnModal from '../../src/components/ReturnModal';

export default function FinishedScreen() {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [justDelivered, setJustDelivered] = useState(new Set());

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);

    const isDelivered = (item) => item.delivered === 'yes' || item.delivered === true;

    const fetchFinishedProducts = async () => {
        try {
            const response = await api.get('/receptions');
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];

            // Filter: etat is 'finit' or 'isReturned' is true, and NOT delivered
            const filtered = data.filter(p =>
                (p.etat === 'finit' || p.isReturned) && !isDelivered(p)
            );

            // Sort: First In, First Out (Oldest First) - primarily by date
            const sorted = filtered.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.date);
                const dateB = new Date(b.updatedAt || b.date);
                return dateA - dateB;
            });

            setProducts(sorted);
        } catch (error) {
            console.error('Error fetching finished products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFinishedProducts();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');

    const getSerialNumber = (extra) => {
        if (!extra) return 'SANS-SÉRIE';
        return typeof extra.serialNumber === 'string'
            ? extra.serialNumber
            : extra.serialNumber?.serialNumber || 'SANS-SÉRIE';
    };

    const filteredProducts = products.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const clientName = (item.client?.name || '').toLowerCase();
        const serialNumber = getSerialNumber(item.extra).toLowerCase();
        const carModel = (item.etrier?.carModel || '').toLowerCase();

        return clientName.includes(searchLower) ||
            serialNumber.includes(searchLower) ||
            carModel.includes(searchLower);
    });

    const onRefresh = () => {
        setRefreshing(true);
        fetchFinishedProducts();
    };

    const handleDeliver = (id) => {
        Alert.alert(
            "Livraison",
            "Marquer ce produit comme livré ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Confirmer",
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await api.patch(`/receptions/${id}/delivered`);
                            setJustDelivered(prev => new Set(prev).add(id));
                            // Refresh after a short delay so user sees the "Livré" state
                            setTimeout(() => {
                                fetchFinishedProducts();
                            }, 1500);
                        } catch (error) {
                            Alert.alert('Erreur', 'Échec de la mise à jour');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [selectedReturnId, setSelectedReturnId] = useState(null);

    const handleReturn = (id) => {
        setSelectedReturnId(id);
        setReturnModalVisible(true);
    };

    const handleConfirmReturn = async (reason) => {
        if (!selectedReturnId) return;

        setActionLoading(true);
        try {
            if (isAdmin) {
                // Admin flow: Approve + Complete
                await api.patch(`/receptions/${selectedReturnId}/approve-return`);
                await api.post(`/receptions/${selectedReturnId}/complete-return`);
                Alert.alert('Succès', 'Retour finalisé avec succès');
            } else {
                // User flow: Request return
                await api.post(`/receptions/${selectedReturnId}/request-return`, { reason });
                Alert.alert('Succès', 'Demande de retour envoyée avec succès');
            }

            fetchFinishedProducts();
        } catch (error) {
            console.error('Return error:', error);
            Alert.alert('Erreur', isAdmin ? 'Échec du traitement du retour' : 'Échec de la demande de retour');
        } finally {
            setActionLoading(false);
            setReturnModalVisible(false);
            setSelectedReturnId(null);
        }
    };

    const handleOpenDetail = (product) => {
        setSelectedProduct(product);
        setDetailVisible(true);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handleOpenDetail(item)}
        >
            <View style={styles.cardHeader}>
                <View style={styles.serialBadge}>
                    <Hash size={14} color="#2563eb" />
                    <Text style={styles.serialText}>{getSerialNumber(item.extra)}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    item.isReturned ? styles.statusReturn : styles.statusFinished
                ]}>
                    <Text style={[
                        styles.statusText,
                        item.isReturned ? styles.statusReturnText : styles.statusFinishedText
                    ]}>
                        {item.isReturned ? 'Retourné' : 'Fini'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{item.client?.name || 'Client inconnu'}</Text>
                        <Text style={styles.etrierModel}>{item.etrier?.carModel || 'Modèle inconnu'}</Text>
                    </View>
                    <ChevronRight size={18} color="#cbd5e1" />
                </View>

                <View style={styles.metaInfo}>
                    <View style={styles.infoRow}>
                        <User size={14} color="#64748b" />
                        <Text style={styles.metaText}>{item.user?.name || 'Inconnu'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Clock size={14} color="#64748b" />
                        <Text style={styles.metaText}>
                            {new Date(item.updatedAt || item.date).toLocaleDateString('fr-FR')}
                        </Text>
                    </View>
                </View>

                {isAdmin && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[
                                styles.actionButtonDeliver,
                                (isDelivered(item) || justDelivered.has(item._id)) && { backgroundColor: '#16a34a', opacity: 0.8 }
                            ]}
                            onPress={() => handleDeliver(item._id)}
                            disabled={actionLoading || isDelivered(item) || justDelivered.has(item._id)}
                        >
                            <CheckCircle size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>
                                {isDelivered(item) || justDelivered.has(item._id) ? 'Livré' : 'Livrer'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.actionButtonReturn,
                                (actionLoading || item.isReturned || isDelivered(item) || justDelivered.has(item._id)) && styles.actionButtonDisabled
                            ]}
                            onPress={() => handleReturn(item._id)}
                            disabled={actionLoading || item.isReturned || isDelivered(item) || justDelivered.has(item._id)}
                        >
                            <RotateCcw size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>
                                {item.isReturned ? 'Retourné' : 'Retour'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
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
                        placeholder="Rechercher par série, client..."
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

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <ClipboardList size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Aucun produit fini en attente</Text>
                    </View>
                }
            />

            <ProductDetailModal
                visible={detailVisible}
                product={selectedProduct}
                onClose={() => setDetailVisible(false)}
            />

            <ReturnModal
                visible={returnModalVisible}
                onClose={() => setReturnModalVisible(false)}
                onConfirm={handleConfirmReturn}
                loading={actionLoading}
                isAdmin={isAdmin}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    listContent: {
        padding: 16,
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
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    serialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    serialText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2563eb',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
    },
    statusFinished: { backgroundColor: '#f0fdf4' },
    statusReturn: { backgroundColor: '#fff1f2' },
    statusText: { fontSize: 11, fontWeight: '700' },
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
        marginBottom: 16,
    },
    metaInfo: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#64748b',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButtonDeliver: {
        flex: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#166534',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonReturn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#be123c',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    actionButtonDisabled: {
        opacity: 0.8, // Less transparent
        backgroundColor: '#64748b', // Darker slate
    },
    emptyState: {
        padding: 80,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        color: '#94a3b8',
        fontSize: 16,
        textAlign: 'center',
    },
});
