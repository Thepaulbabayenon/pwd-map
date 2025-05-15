// lib/types.ts

export interface PersonImage {
  id?: string;
  personId?: string;
  imageUrl: string;
  description?: string;
  uploadedAt?: Date;
}

export interface PersonMedia {
  id?: string;
  personId?: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  description?: string;
  uploadedAt?: Date;
}

export interface PersonMapData {
  id: string;
  firstName: string;
  lastName: string;
  latitude: number;
  longitude: number;
  disabilityType: string;
  specificDisability?: string;
  images?: PersonImage[];
  media?: PersonMedia[];
}

export interface Facility {
  id: string;
  type: string;
  name: string;
  lat: number;
  lng: number;
}