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
    TextInput,
} from 'react-native';
import { CheckSquare, Hash, Clock, User, ChevronRight, PackageCheck, RotateCcw, Search, X as CloseIcon } from 'lucide-react-native';
import api from '../../src/api/axios';
import ProductDetailModal from '../../src/components/ProductDetailModal';
import ReturnModal from '../../src/components/ReturnModal';
import { useAuth } from '../../src/context/AuthContext';

export default function DeliveredScreen() {
    const { user: currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const isDelivered = (item) => item.delivered === 'yes' || item.delivered === true;

    const fetchDeliveredProducts = async () => {
        try {
            const response = await api.get('/receptions');
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];

            // Logic from web: etat in [finit, returner] AND delivered is true/yes
            const filtered = data.filter(r =>
                (r.etat?.toLowerCase() === 'finit' || r.etat?.toLowerCase() === 'returner' || r.isReturned) &&
                isDelivered(r)
            );

            // Sort by updatedAt or date (First In, First Out - Oldest First)
            const sorted = filtered.sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.date);
                const dateB = new Date(b.updatedAt || b.date);
                return dateA - dateB;
            });

            setProducts(sorted);
        } catch (error) {
            console.error('Error fetching delivered products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDeliveredProducts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDeliveredProducts();
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

            fetchDeliveredProducts();
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

    const getSerialNumber = (extra) => {
        if (!extra) return 'SANS-SÉRIE';
        return typeof extra.serialNumber === 'string'
            ? extra.serialNumber
            : extra.serialNumber?.serialNumber || 'SANS-SÉRIE';
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => handleOpenDetail(item)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.serialBadge, { backgroundColor: '#f0fdf4' }]}>
                    <Hash size={14} color="#16a34a" />
                    <Text style={[styles.serialText, { color: '#16a34a' }]}>
                        {getSerialNumber(item.extra)}
                    </Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{item.isReturned ? 'Retourné' : 'Livré'}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{item.client?.name || 'Client inconnu'}</Text>
                        <Text style={styles.etrierModel}>{item.etrier?.carModel || 'Modèle inconnu'}</Text>
                    </View>
                    {isAdmin && (
                        <TouchableOpacity
                            style={[
                                styles.returnIconBtn,
                                item.isReturned && styles.returnIconBtnDisabled
                            ]}
                            onPress={() => !item.isReturned && handleReturn(item._id)}
                            disabled={item.isReturned}
                        >
                            <RotateCcw size={20} color={item.isReturned ? "#94a3b8" : "#ef4444"} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.metaInfo, item.isReturned && { borderTopColor: '#fee2e2' }]}>
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
            </View>
        </TouchableOpacity>
    );

    const filteredProducts = products.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const clientName = (item.client?.name || '').toLowerCase();
        const serialNumber = getSerialNumber(item.extra).toLowerCase();
        const carModel = (item.etrier?.carModel || '').toLowerCase();

        return clientName.includes(searchLower) ||
            serialNumber.includes(searchLower) ||
            carModel.includes(searchLower);
    });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#16a34a" />
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
                        <PackageCheck size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Aucun produit livré</Text>
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
        paddingBottom: 32,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    serialBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    returnIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    returnIconBtnDisabled: {
        backgroundColor: '#cbd5e1', // Darker grey
    },
    serialText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563eb',
    },
    statusBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    cardBody: {
        padding: 16,
    },
    clientName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    etrierModel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    metaInfo: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
        paddingTop: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: '600',
    }
});
