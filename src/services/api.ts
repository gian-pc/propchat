// src/services/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// --- Interface de Property (Actualizada) ---
export interface Property {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  district: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  type: 'apartment' | 'house';
  description?: string;
  department: string;
  transaction_type: 'rent' | 'sale'; // <-- ¡Actualizada!
}

// --- Interface de PropertyFilters (Actualizada) ---
export interface PropertyFilters {
  district?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  property_type?: string;
  transaction_type?: 'rent' | 'sale'; // <-- ¡Actualizada!
  department?: string; // (Este lo usa la IA)
}

// --- Interface de PropertiesResponse (Sin cambios) ---
export interface PropertiesResponse {
  properties: Property[];
  total: number;
}

// --- Interface de ChatRequest (Sin cambios) ---
export interface ChatRequest {
  message: string;
  context?: any;
}

// --- ¡INTERFACE MODIFICADA! ---
export interface ChatResponse {
  response: string;
  filters: PropertyFilters | null; // <-- ¡Actualizada para la IA!
}

// API Functions
export const api = {
  // Get all properties with optional filters
  async getProperties(filters?: PropertyFilters): Promise<PropertiesResponse> {
    const params = new URLSearchParams();
    
    if (filters?.district) params.append('district', filters.district);
    if (filters?.min_price) params.append('min_price', filters.min_price.toString());
    if (filters?.max_price) params.append('max_price', filters.max_price.toString());
    if (filters?.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
    if (filters?.property_type) params.append('property_type', filters.property_type);
    if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type); // <-- ¡Actualizado!

    const url = `${API_BASE_URL}/api/properties${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    
    return response.json();
  },

  // Get single property by ID
  async getProperty(id: string): Promise<Property> {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch property');
    }
    
    const data = await response.json();
    return data.property;
  },

  // Send chat message
  async sendChatMessage(message: string, context?: any): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, context }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return response.json();
  },

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
};