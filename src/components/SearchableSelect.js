import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { Search, X } from 'lucide-react-native';

const SearchableSelect = ({
    label,
    data,
    onSelect,
    placeholder,
    value,
    displayKey = 'name'
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState('');

    const filteredData = data.filter(item =>
        item[displayKey]?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.trigger}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.triggerText, !value && styles.placeholder]}>
                    {value ? value[displayKey] : placeholder}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchBar}>
                        <Search size={20} color="#94a3b8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Rechercher..."
                            value={search}
                            onChangeText={setSearch}
                            autoFocus
                        />
                    </View>

                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.item}
                                onPress={() => {
                                    onSelect(item);
                                    setModalVisible(false);
                                    setSearch('');
                                }}
                            >
                                <Text style={styles.itemText}>{item[displayKey]}</Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Aucun résultat</Text>
                        }
                    />
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    trigger: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
    },
    triggerText: {
        fontSize: 16,
        color: '#1e293b',
    },
    placeholder: {
        color: '#94a3b8',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        margin: 16,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    item: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    itemText: {
        fontSize: 16,
        color: '#1e293b',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#94a3b8',
    },
});

export default SearchableSelect;
