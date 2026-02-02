import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { X, Package, User, Clock, Hash, MapPin, Wrench, CheckCircle2 } from 'lucide-react-native';
import api from '../api/axios';

const { height } = Dimensions.get('window');

export default function ProductDetailModal({ visible, product, onClose }) {
    const [allPieces, setAllPieces] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && product) {
            fetchAllPieces();
        }
    }, [visible, product]);

    const fetchAllPieces = async () => {
        setLoading(true);
        try {
            const response = await api.get('/pieces');
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];
            setAllPieces(data);
        } catch (error) {
            console.error('Error fetching pieces for detail modal:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    // Resolve pieces data from IDs and counters
    const piecesIds = product.extra?.pieces || [];
    const counters = product.extra?.pieceCounters || {};

    const resolvedPieces = piecesIds.map(id => {
        const pieceInfo = allPieces.find(p => p._id === id);
        return {
            id,
            name: pieceInfo?.designation || 'Pièce inconnue',
            ref: pieceInfo?.referenceArticle || 'N/A',
            quantity: counters[id] || 1
        };
    });

    const DetailRow = ({ icon: Icon, label, value, color = "#64748b" }) => (
        <View style={styles.detailRow}>
            <View style={[styles.iconContainer, { backgroundColor: color + '10' }]}>
                {Icon && <Icon size={18} color={color} />}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value || 'Non renseigné'}</Text>
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Détails de Réparation</Text>
                            <Text style={styles.subtitle}>#{product.receptionNumber}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                        {loading && (
                            <ActivityIndicator size="small" color="#2563eb" style={{ marginVertical: 10 }} />
                        )}

                        {/* Section: Informations Générales */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Véhicule & Client</Text>
                            <View style={styles.infoCard}>
                                <DetailRow icon={User} label="Client" value={product.client?.name} color="#2563eb" />
                                <DetailRow icon={Package} label="Modèle" value={product.etrier?.carModel} color="#8b5cf6" />
                                <DetailRow icon={MapPin} label="Position" value={product.position} color="#f59e0b" />
                            </View>
                        </View>

                        {/* Section: État & Dates */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Statut & Traçabilité</Text>
                            <View style={styles.infoCard}>
                                <DetailRow icon={Hash} label="Numéro de Série" value={product.extra?.serialNumber} color="#10b981" />
                                <DetailRow icon={Clock} label="Date Réception" value={new Date(product.date).toLocaleDateString('fr-FR')} color="#64748b" />
                                <DetailRow icon={CheckCircle2} label="Date Fin" value={new Date(product.updatedAt || product.date).toLocaleDateString('fr-FR')} color="#16a34a" />
                            </View>
                        </View>

                        {/* Section: Pièces Utilisées */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Pièces de rechange</Text>
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>{resolvedPieces.length}</Text>
                                </View>
                            </View>

                            {resolvedPieces.length > 0 ? (
                                <View style={styles.piecesList}>
                                    {resolvedPieces.map((item, index) => (
                                        <View key={index} style={styles.pieceItem}>
                                            <View style={styles.pieceIcon}>
                                                <Wrench size={16} color="#64748b" />
                                            </View>
                                            <View style={styles.pieceInfo}>
                                                <Text style={styles.pieceName}>{item.name}</Text>
                                                <Text style={styles.pieceRef}>Réf: {item.ref}</Text>
                                            </View>
                                            <View style={styles.qtyContainer}>
                                                <Text style={styles.qtyText}>x{item.quantity}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <View style={styles.emptyPieces}>
                                    <Text style={styles.emptyPiecesText}>Aucune pièce enregistrée</Text>
                                </View>
                            )}
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: height * 0.85,
        paddingTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e293b',
    },
    subtitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 2,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 16,
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    label: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 1,
    },
    countBadge: {
        backgroundColor: '#e2e8f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    countText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#64748b',
    },
    piecesList: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        overflow: 'hidden',
    },
    pieceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8fafc',
    },
    pieceIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pieceInfo: {
        flex: 1,
        marginLeft: 12,
    },
    pieceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    pieceRef: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 1,
    },
    qtyContainer: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    qtyText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#2563eb',
    },
    emptyPieces: {
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 20,
    },
    emptyPiecesText: {
        color: '#94a3b8',
        fontSize: 14,
    }
});
