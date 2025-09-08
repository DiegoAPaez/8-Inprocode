export interface Store {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface CreateStoreRequest {
  name: string;
  latitude: number;
  longitude: number;
}

export interface UpdateStoreRequest {
  name: string;
  latitude: number;
  longitude: number;
}
