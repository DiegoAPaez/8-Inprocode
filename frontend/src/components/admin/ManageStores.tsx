import React, {useEffect, useRef, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {adminApi} from '../../services/api';
import type {CreateStoreRequest, Store, UpdateStoreRequest} from '../../types/store';
import type {User} from '../../types/auth';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

interface StoreFormData {
    name: string;
    latitude: number | '';
    longitude: number | '';
}

export const ManageStores: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
    const queryClient = useQueryClient();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
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

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [0, 0], // Default center
            zoom: 0
        });

        // Wait for map to load before setting loaded state
        map.current.on('load', () => {
            setMapLoaded(true);
        });

        // Add click event to select coordinates
        map.current.on('click', (e) => {
            const {lng, lat} = e.lngLat;
            setSelectedCoordinates({lat, lng});

            if (isCreateModalOpen) {
                setSelectedCoordinates({lat, lng});
                setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                }));
            }
        });

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
                setMapLoaded(false);
            }
        };
    }, [isCreateModalOpen]);

    // Update markers when stores change and map is loaded
    useEffect(() => {
        if (!map.current || !mapLoaded) return;

        // Clear existing markers
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};

        // Add markers for each store
        stores.forEach(store => {
            markersRef.current[store.id] = new mapboxgl.Marker({color: '#3B82F6'})
                .setLngLat([store.longitude, store.latitude])
                .setPopup(
                    new mapboxgl.Popup({offset: 25}).setHTML(
                        `<div>
              <h3 class="font-semibold">${store.name}</h3>
              <p class="text-sm text-gray-600">Lat: ${store.latitude.toFixed(6)}</p>
              <p class="text-sm text-gray-600">Lng: ${store.longitude.toFixed(6)}</p>
            </div>`
                    )
                )
                .addTo(map.current);
        });

        // Fit map to show all stores if any exist
        if (stores.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            stores.forEach(store => {
                bounds.extend([store.longitude, store.latitude]);
            });
            map.current.fitBounds(bounds, {padding: 50});
        }
    }, [stores, mapLoaded]);

    const resetForm = () => {
        setFormData({
            name: '',
            latitude: '',
            longitude: ''
        });
        setSelectedCoordinates(null);
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
                            onClick={() => {
                                setIsCreateModalOpen(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Add New Store
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Store Locations</h3>
                    <p className="text-sm text-gray-600">
                        Interactive map showing all restaurant locations. Click on the map to select coordinates when
                        creating a new store.
                    </p>
                </div>
                <div
                    ref={mapContainer}
                    className="h-96 w-full"
                    style={{minHeight: '400px'}}
                />
            </div>

            {/* Stores List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">All Stores</h3>
                    <p className="text-sm text-gray-600">
                        Manage your restaurant locations
                    </p>
                </div>
                <div className="overflow-x-auto">
                    {storesLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading stores...</div>
                    ) : stores.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No stores found. Create your first store
                            location.</div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Store Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Coordinates
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {stores.map((store) => (
                                <tr key={store.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{store.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {store.latitude.toFixed(6)}, {store.longitude.toFixed(6)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => {
                                                handleViewUsers(store);
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            View Users
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleEditStore(store);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDeleteStore(store);
                                            }}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Store Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Store</h3>

                        {selectedCoordinates && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-700">
                                    📍 Selected
                                    coordinates: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleCreateStore} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Store Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData(prev => ({...prev, name: e.target.value}));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.latitude}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            latitude: e.target.value === '' ? '' : Number(e.target.value)
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.longitude}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            longitude: e.target.value === '' ? '' : Number(e.target.value)
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                    required
                                />
                            </div>
                            <p className="text-sm text-gray-600">
                                Click on the map to automatically fill coordinates
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createStoreMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {createStoreMutation.isPending ? 'Creating...' : 'Create Store'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Store Modal */}
            {isEditModalOpen && selectedStore && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Store</h3>
                        <form onSubmit={handleUpdateStore} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Store Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => {
                                        setFormData(prev => ({...prev, name: e.target.value}));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.latitude}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            latitude: e.target.value === '' ? '' : Number(e.target.value)
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.longitude}
                                    onChange={(e) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            longitude: e.target.value === '' ? '' : Number(e.target.value)
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        resetForm();
                                        setSelectedStore(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateStoreMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {updateStoreMutation.isPending ? 'Updating...' : 'Update Store'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Store Users Modal */}
            {isUsersModalOpen && selectedStore && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Users at {selectedStore.name}
                        </h3>
                        <div className="max-h-96 overflow-y-auto">
                            {storeUsers.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No users assigned to this store.</p>
                            ) : (
                                <div className="space-y-2">
                                    {storeUsers.map((user: User) => (
                                        <div key={user.id}
                                             className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <div className="font-medium text-gray-900">{user.username}</div>
                                                <div className="text-sm text-gray-600">{user.email}</div>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {user.roles.map(role => role.name).join(', ') || 'No roles'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => {
                                    setIsUsersModalOpen(false);
                                    setSelectedStore(null);
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
