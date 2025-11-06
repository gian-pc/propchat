// src/types/property.ts

export interface Property {
  id: string
  title: string
  price: number
  bedrooms: number
  bathrooms: number
  area: number
  district: string
  latitude: number
  longitude: number
  imageUrl: string
  type: 'apartment' | 'house' | 'studio' | 'loft'
}