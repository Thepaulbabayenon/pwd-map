// File: src/lib/types.ts
export interface PersonMedia {
  id: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  description?: string | null;
  fileId?: string | null;
  fileName?: string | null;
}

export interface Child {
  id: number;
  name: string;
  age: number;
  disability: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  address: string;
}
  
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

// src/types/map.ts
export interface PersonImage {
  imageUrl: string;
  description?: string;
}

export interface PersonMapData {
  id: number;
  firstName: string;
  lastName: string;
  latitude: number;
  longitude: number;
  disabilityType: string;
  specificDisability?: string;
  images?: PersonImage[];
  media: PersonMedia[];
}
