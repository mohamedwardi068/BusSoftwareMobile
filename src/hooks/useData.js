import { useState, useCallback } from 'react';
import api from '../api/axios';

export const useData = () => {
    const [clients, setClients] = useState([]);
    const [etriers, setEtriers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAppData = useCallback(async () => {
        setLoading(true);
        try {
            const [clientsRes, etriersRes] = await Promise.all([
                api.get('/clients'),
                api.get('/etriers')
            ]);
            setClients(clientsRes.data);
            setEtriers(etriersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    return { clients, etriers, loading, fetchAppData };
};
