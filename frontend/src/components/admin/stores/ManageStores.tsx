import React, {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {adminApi} from '../../../services/api';
import type {CreateStoreRequest, Store, UpdateStoreRequest} from '../../../types/store';
import {StoreMap} from './StoreMap';
import {StoreForm} from './StoreForm';
import {StoreTable} from './StoreTable';
import {StoreUsersModal} from './StoreUsersModal';

interface StoreFormData {
    name: string;
    latitude: number | '';
    longitude: number | '';
}

export const ManageStores: React.FC = () => {
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [formData, setFormData] = useState<StoreFormData>({
        name: '',
        latitude: '',
        longitude: ''
    });

    // Fetch all stores
    const {data: stores = [], isLoading: storesLoading, refetch: refetchStores} = useQuery({
        queryKey: ['stores'],
        queryFn: adminApi.getAllStores,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch users for selected store
    const {data: storeUsers = []} = useQuery({
        queryKey: ['store-users', selectedStore?.id],
        queryFn: () => selectedStore ? adminApi.getUsersByStore(selectedStore.id) : Promise.resolve([]),
        enabled: !!selectedStore && isUsersModalOpen,
    });

    // Create store mutation
    const createStoreMutation = useMutation({
        mutationFn: adminApi.createStore,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['stores']});
            setIsCreateModalOpen(false);
            resetForm();
        },
    });

    // Update store mutation
    const updateStoreMutation = useMutation({
        mutationFn: ({id, data}: { id: number; data: UpdateStoreRequest }) =>
            adminApi.updateStore(id, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['stores']});
            setIsEditModalOpen(false);
            resetForm();
            setSelectedStore(null);
        },
    });

    // Delete store mutation
    const deleteStoreMutation = useMutation({
        mutationFn: adminApi.deleteStore,
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['stores']});
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            latitude: '',
            longitude: ''
        });
        setSelectedCoordinates(null);
    };

    const handleMapClick = (coordinates: { lat: number; lng: number }) => {
        if (isCreateModalOpen) {
            setSelectedCoordinates(coordinates);
            setFormData(prev => ({
                ...prev,
                latitude: coordinates.lat,
                longitude: coordinates.lng
            }));
        }
    };

    const handleCreateStore = (e: React.FormEvent) => {
        e.preventDefault();

        const createData: CreateStoreRequest = {
            name: formData.name,
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude)
        };

        createStoreMutation.mutate(createData);
    };

    const handleUpdateStore = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStore) return;

        const updateData: UpdateStoreRequest = {
            name: formData.name,
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude)
        };

        updateStoreMutation.mutate({id: selectedStore.id, data: updateData});
    };

    const handleEditStore = (store: Store) => {
        setSelectedStore(store);
        setFormData({
            name: store.name,
            latitude: store.latitude,
            longitude: store.longitude
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteStore = (store: Store) => {
        if (window.confirm(`Are you sure you want to delete "${store.name}"? This action cannot be undone.`)) {
            deleteStoreMutation.mutate(store.id);
        }
    };

    const handleViewUsers = (store: Store) => {
        setSelectedStore(store);
        setIsUsersModalOpen(true);
    };

    const handleCreateModalClose = () => {
        setIsCreateModalOpen(false);
        resetForm();
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        resetForm();
        setSelectedStore(null);
    };

    const handleUsersModalClose = () => {
        setIsUsersModalOpen(false);
        setSelectedStore(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Manage Stores</h2>
                        <p className="text-gray-600 mt-2">
                            Manage restaurant locations and store information
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => void refetchStores()}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add New Store
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Component */}
            <StoreMap
                stores={stores}
                onMapClick={handleMapClick}
                selectedCoordinates={selectedCoordinates}
            />

            {/* Stores Table Component */}
            <StoreTable
                stores={stores}
                isLoading={storesLoading}
                onEdit={handleEditStore}
                onDelete={handleDeleteStore}
                onViewUsers={handleViewUsers}
            />

            {/* Create Store Form Modal */}
            <StoreForm
                isOpen={isCreateModalOpen}
                onClose={handleCreateModalClose}
                onSubmit={handleCreateStore}
                formData={formData}
                setFormData={setFormData}
                selectedCoordinates={selectedCoordinates}
                isLoading={createStoreMutation.isPending}
            />

            {/* Edit Store Form Modal */}
            <StoreForm
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                onSubmit={handleUpdateStore}
                formData={formData}
                setFormData={setFormData}
                isEditing={true}
                isLoading={updateStoreMutation.isPending}
                store={selectedStore}
            />

            {/* Store Users Modal */}
            <StoreUsersModal
                isOpen={isUsersModalOpen}
                onClose={handleUsersModalClose}
                store={selectedStore}
                users={storeUsers}
            />
        </div>
    );
};
