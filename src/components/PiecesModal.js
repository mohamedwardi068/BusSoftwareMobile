import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { X, Search, Barcode, Plus, Minus, Trash2, Check, Save } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../api/axios';

export default function PiecesModal({ visible, onClose, productId }) {
    const [allPieces, setAllPieces] = useState([]);
    const [addedPieces, setAddedPieces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [scanning, setScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    // Fetch pieces and current selection
    useEffect(() => {
        if (visible && productId) {
            fetchInitialData();
        }
    }, [visible, productId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Get all available pieces
            const piecesRes = await api.get('/pieces');
            const piecesData = Array.isArray(piecesRes.data) ? piecesRes.data : piecesRes.data.data || [];
            setAllPieces(piecesData);

            // Get current reception details to see added pieces
            const receptionRes = await api.get(`/receptions/${productId}`);
            const reception = receptionRes.data;

            if (reception.extra?.pieces && reception.extra?.pieceCounters) {
                const initialAdded = reception.extra.pieces.map(pieceId => {
                    const piece = piecesData.find(p => p._id === pieceId);
                    return {
                        id: pieceId,
                        designation: piece?.designation || 'Pièce inconnue',
                        referenceArticle: piece?.referenceArticle || 'N/A',
                        quantity: reception.extra.pieceCounters[pieceId] || 1
                    };
                });
                setAddedPieces(initialAdded);
            } else {
                setAddedPieces([]);
            }
        } catch (error) {
            console.error('Error fetching piece data:', error);
            Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPiece = (piece) => {
        setAddedPieces(prev => {
            const existing = prev.find(p => p.id === piece._id);
            if (existing) {
                return prev.map(p => p.id === piece._id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, {
                id: piece._id,
                designation: piece.designation,
                referenceArticle: piece.referenceArticle,
                quantity: 1
            }];
        });
        setSearchTerm('');
    };

    const updateQuantity = (id, delta) => {
        setAddedPieces(prev => prev.map(p => {
            if (p.id === id) {
                const newQty = Math.max(1, p.quantity + delta);
                return { ...p, quantity: newQty };
            }
            return p;
        }));
    };

    const removePiece = (id) => {
        setAddedPieces(prev => prev.filter(p => p.id !== id));
    };

    const handleBarcodeScanned = ({ data }) => {
        setScanning(false);
        const normalized = data.trim().toUpperCase();
        const found = allPieces.find(p =>
            p.barCode?.toUpperCase() === normalized ||
            p.referenceArticle?.toUpperCase() === normalized
        );

        if (found) {
            handleAddPiece(found);
            Alert.alert('Succès', `Ajouté: ${found.designation}`);
        } else {
            Alert.alert('Inconnu', 'Aucune pièce trouvée pour ce code.');
        }
    };

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            const pieces = addedPieces.map(p => p.id);
            const pieceCounters = addedPieces.reduce((acc, curr) => {
                acc[curr.id] = curr.quantity;
                return acc;
            }, {});

            await api.patch(`/receptions/${productId}/extra`, {
                pieces,
                pieceCounters
            });
            onClose();
        } catch (error) {
            console.error('Error saving pieces:', error);
            Alert.alert('Erreur', 'Impossible d\'enregistrer les modifications');
        } finally {
            setSaveLoading(false);
        }
    };

    const startScanning = async () => {
        if (!permission?.granted) {
            const res = await requestPermission();
            if (!res.granted) {
                Alert.alert('Permission', 'L\'accès à la caméra est requis pour scanner.');
                return;
            }
        }
        setScanning(true);
    };

    const filteredList = searchTerm.length > 0
        ? allPieces.filter(p =>
            p.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.referenceArticle.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10)
        : [];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Gestion des pièces</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.body}
                    >
                        {/* Search & Scan Actions */}
                        <View style={styles.searchSection}>
                            <View style={styles.searchInputWrapper}>
                                <Search size={20} color="#94a3b8" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Rechercher par référence..."
                                    value={searchTerm}
                                    onChangeText={setSearchTerm}
                                    autoCapitalize="none"
                                />
                                {searchTerm.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchTerm('')}>
                                        <X size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.scanButton}
                                onPress={startScanning}
                            >
                                <Barcode size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Results Dropdown-like */}
                        {filteredList.length > 0 && (
                            <View style={styles.searchResults}>
                                <FlatList
                                    data={filteredList}
                                    keyExtractor={item => item._id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.resultItem}
                                            onPress={() => handleAddPiece(item)}
                                        >
                                            <View>
                                                <Text style={styles.resultName}>{item.designation}</Text>
                                                <Text style={styles.resultRef}>{item.referenceArticle}</Text>
                                            </View>
                                            <Plus size={20} color="#2563eb" />
                                        </TouchableOpacity>
                                    )}
                                    style={styles.resultList}
                                />
                            </View>
                        )}

                        {/* Added Pieces List */}
                        <View style={styles.addedSection}>
                            <Text style={styles.sectionTitle}>Pièces ajoutées ({addedPieces.length})</Text>
                            {loading ? (
                                <ActivityIndicator style={styles.loader} color="#2563eb" />
                            ) : (
                                <FlatList
                                    data={addedPieces}
                                    keyExtractor={item => item.id}
                                    renderItem={({ item }) => (
                                        <View style={styles.pieceCard}>
                                            <View style={styles.pieceInfo}>
                                                <Text style={styles.pieceName}>{item.designation}</Text>
                                                <Text style={styles.pieceRef}>{item.referenceArticle}</Text>
                                            </View>
                                            <View style={styles.quantityControls}>
                                                <TouchableOpacity
                                                    style={styles.qtyBtn}
                                                    onPress={() => updateQuantity(item.id, -1)}
                                                >
                                                    <Minus size={16} color="#475569" />
                                                </TouchableOpacity>
                                                <Text style={styles.qtyText}>{item.quantity}</Text>
                                                <TouchableOpacity
                                                    style={styles.qtyBtn}
                                                    onPress={() => updateQuantity(item.id, 1)}
                                                >
                                                    <Plus size={16} color="#475569" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.deleteBtn}
                                                    onPress={() => removePiece(item.id)}
                                                >
                                                    <Trash2 size={18} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                    ListEmptyComponent={
                                        <View style={styles.emptyContainer}>
                                            <Text style={styles.emptyText}>Aucune pièce. Scannez un code ou recherchez une référence.</Text>
                                        </View>
                                    }
                                />
                            )}
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[styles.saveButton, saveLoading && styles.disabledButton]}
                            onPress={handleSave}
                            disabled={saveLoading}
                        >
                            {saveLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Save size={20} color="#fff" />
                                    <Text style={styles.saveText}>Enregistrer</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </KeyboardAvoidingView>

                    {/* Scanner Overlay */}
                    {scanning && (
                        <View style={styles.scannerWrapper}>
                            <CameraView
                                style={styles.camera}
                                barcodeScannerSettings={{
                                    barcodeTypes: ['ean13', 'code128', 'qr'],
                                }}
                                onBarcodeScanned={handleBarcodeScanned}
                            />
                            <View style={styles.scannerOverlay}>
                                <View style={styles.scannerHole} />
                                <TouchableOpacity
                                    style={styles.cancelScan}
                                    onPress={() => setScanning(false)}
                                >
                                    <Text style={styles.cancelText}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
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
    container: {
        backgroundColor: '#fff',
        height: '90%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
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
    body: {
        flex: 1,
        padding: 24,
    },
    searchSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        gap: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1e293b',
    },
    scanButton: {
        backgroundColor: '#2563eb',
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchResults: {
        position: 'absolute',
        top: 80,
        left: 24,
        right: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        maxHeight: 300,
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    resultName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    resultRef: {
        fontSize: 12,
        color: '#64748b',
    },
    addedSection: {
        flex: 1,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pieceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        marginBottom: 12,
    },
    pieceInfo: {
        flex: 1,
        marginRight: 10,
    },
    pieceName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    pieceRef: {
        fontSize: 12,
        color: '#64748b',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        minWidth: 20,
        textAlign: 'center',
    },
    deleteBtn: {
        marginLeft: 8,
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#166534',
        padding: 18,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 20,
    },
    loader: {
        marginTop: 40,
    },
    scannerWrapper: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        zIndex: 100,
    },
    camera: {
        flex: 1,
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    scannerHole: {
        width: '100%',
        aspectRatio: 1,
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cancelScan: {
        marginTop: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});
