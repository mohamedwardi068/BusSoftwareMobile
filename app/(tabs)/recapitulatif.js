import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    ChevronDown,
    ChevronUp,
    Hash,
} from 'lucide-react-native';
import api from '../../src/api/axios';
import ProductDetailModal from '../../src/components/ProductDetailModal';

const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function RecapitulatifScreen() {
    const [loading, setLoading] = useState(true);
    const [monthlyGroups, setMonthlyGroups] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPrime, setTotalPrime] = useState(0);
    const [currentMonthStats, setCurrentMonthStats] = useState({ count: 0 });
    const [expandedMonths, setExpandedMonths] = useState({});

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [receptionsRes, piecesRes] = await Promise.all([
                api.get('/receptions'),
                api.get('/pieces')
            ]);

            const allReceptions = Array.isArray(receptionsRes.data) ? receptionsRes.data : (receptionsRes.data.data || []);
            const filtered = allReceptions.filter(rec => rec.etat === "finit" || rec.isReturned);

            setTotalProducts(filtered.length);

            const groups = {};
            const now = new Date();
            const currentMY = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

            filtered.forEach((rec) => {
                const date = new Date(rec.date);
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                const type = rec.isReturned ? "retourné" : rec.etat;

                if (!groups[monthYear]) {
                    groups[monthYear] = {
                        products: [],
                        finitCount: 0,
                        retourneCount: 0
                    };
                }

                groups[monthYear].products.push({
                    ...rec,
                    type
                });

                if (type === "finit") groups[monthYear].finitCount++;
                if (type === "retourné") groups[monthYear].retourneCount++;
            });

            const sortedGroups = Object.entries(groups)
                .map(([monthYear, groupData]) => {
                    const [year, month] = monthYear.split("-");
                    const prime = groupData.finitCount * 1.5 - groupData.retourneCount * 5;

                    return {
                        id: monthYear,
                        month: monthNames[Number(month) - 1],
                        year,
                        products: groupData.products,
                        count: groupData.products.length,
                        finitCount: groupData.finitCount,
                        retourneCount: groupData.retourneCount,
                        prime,
                    };
                })
                .sort((a, b) => {
                    const dateA = new Date(Number(a.year), monthNames.indexOf(a.month));
                    const dateB = new Date(Number(b.year), monthNames.indexOf(b.month));
                    return dateB.getTime() - dateA.getTime();
                });

            const totalP = sortedGroups.reduce((sum, group) => sum + group.prime, 0);
            const currentG = sortedGroups.find(g => g.id === currentMY);

            setMonthlyGroups(sortedGroups);
            setTotalPrime(totalP);
            setCurrentMonthStats(currentG || { count: 0 });

            // Expand latest month by default
            if (sortedGroups.length > 0) {
                setExpandedMonths({ [sortedGroups[0].id]: true });
            }
        } catch (error) {
            console.error('Recap fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleMonth = (id) => {
        setExpandedMonths(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleProductPress = (product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const StatusCard = ({ title, value, subtitle, icon: Icon, color }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{title}</Text>
                <View style={[styles.cardIcon, { backgroundColor: color + '10' }]}>
                    <Icon size={20} color={color} />
                </View>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardValue}>{value}</Text>
                <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
        </View>
    );

    const renderMonthItem = ({ item }) => {
        const isExpanded = expandedMonths[item.id];
        return (
            <View style={styles.monthGroup}>
                <TouchableOpacity
                    style={styles.monthHeader}
                    onPress={() => toggleMonth(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.monthTitleRow}>
                        <Text style={styles.monthName}>{item.month} {item.year}</Text>
                        <View style={styles.monthBadge}>
                            <Text style={styles.monthBadgeText}>{item.count} items</Text>
                        </View>
                    </View>
                    <View style={styles.monthRight}>
                        <Text style={styles.monthPrime}>{item.prime.toFixed(2)} DT</Text>
                        {isExpanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.monthContent}>
                        {item.products.map((p, index) => (
                            <TouchableOpacity
                                key={p._id}
                                style={[styles.productItem, index === 0 && { borderTopWidth: 0 }]}
                                onPress={() => handleProductPress(p)}
                            >
                                <View style={styles.productMain}>
                                    <View style={styles.serialRow}>
                                        <Hash size={14} color="#2563eb" />
                                        <Text style={styles.serialText}>
                                            {typeof p.extra?.serialNumber === 'string'
                                                ? p.extra.serialNumber
                                                : p.receptionNumber}
                                        </Text>
                                    </View>
                                    <Text style={styles.clientText}>{p.client?.name || 'Client inconnu'}</Text>
                                </View>
                                <View style={[
                                    styles.typeBadge,
                                    { backgroundColor: p.type === 'finit' ? '#f0fdf4' : '#fef2f2' }
                                ]}>
                                    <Text style={[
                                        styles.typeText,
                                        { color: p.type === 'finit' ? '#16a34a' : '#ef4444' }
                                    ]}>
                                        {p.type === 'finit' ? 'Fini' : 'Retour'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Calcul du récapitulatif...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.statsGrid}>
                    <StatusCard
                        title="Total Général"
                        value={totalProducts}
                        subtitle="Réparations totales"
                        icon={TrendingUp}
                        color="#2563eb"
                    />
                    <StatusCard
                        title="Ce Mois"
                        value={currentMonthStats.count}
                        subtitle={`${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`}
                        icon={Calendar}
                        color="#16a34a"
                    />
                    <StatusCard
                        title="Prime Totale"
                        value={`${totalPrime.toFixed(2)} DT`}
                        subtitle="Cumul des bonus"
                        icon={BarChart3}
                        color="#7c3aed"
                    />
                </View>

                <View style={styles.listContainer}>
                    <Text style={styles.sectionTitle}>Historique Mensuel</Text>
                    <FlatList
                        data={monthlyGroups}
                        keyExtractor={item => item.id}
                        renderItem={renderMonthItem}
                        scrollEnabled={false}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            </ScrollView>

            <ProductDetailModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                product={selectedProduct}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    statsGrid: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    listContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 4,
    },
    listContent: {
        gap: 12,
    },
    monthGroup: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    monthTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    monthName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    monthBadge: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
    },
    monthBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#2563eb',
    },
    monthRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    monthPrime: {
        fontSize: 14,
        fontWeight: '800',
        color: '#2563eb',
    },
    monthContent: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#fff',
    },
    productItem: {
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f8fafc',
    },
    productMain: {
        flex: 1,
    },
    serialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    serialText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
        fontFamily: 'monospace',
    },
    clientText: {
        fontSize: 13,
        color: '#64748b',
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 99,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    }
});
