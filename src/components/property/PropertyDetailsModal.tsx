'use client'

import { useState } from 'react'
import { X, Heart, Share2, MapPin, Bed, Bath, Maximize, Car, Building, Calendar, Check } from 'lucide-react'
import { Property } from '@/types/property'

interface PropertyDetailsModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

export default function PropertyDetailsModal({ property, isOpen, onClose }: PropertyDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!property || !isOpen) return null

  // Imágenes de ejemplo (en producción vendrían del backend)
  const images = [
    property.imageUrl,
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  ]

  const amenities = [
    'WiFi de alta velocidad',
    'Aire acondicionado',
    'Calefacción',
    'Cocina equipada',
    'Lavadora',
    'TV Cable',
    'Estacionamiento',
    'Seguridad 24/7',
    'Ascensor',
    'Área de juegos',
    'Gimnasio',
    'Piscina'
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Detalles de la propiedad</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Image Gallery */}
          <div className="relative h-96 bg-gray-900">
            <img
              src={images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                >
                  <span className="text-2xl">←</span>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                >
                  <span className="text-2xl">→</span>
                </button>
              </>
            )}

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Main Info */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column - Main Details */}
              <div className="md:col-span-2 space-y-6">
                {/* Title and Price */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-5 h-5" />
                    <span>{property.district}, Lima, Perú</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    ${property.price}
                    <span className="text-xl text-gray-500 font-normal">/mes</span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <Bed className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Habitaciones</div>
                  </div>
                  <div className="text-center">
                    <Bath className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Baños</div>
                  </div>
                  <div className="text-center">
                    <Maximize className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold text-gray-900">{property.area}m²</div>
                    <div className="text-sm text-gray-600">Área</div>
                  </div>
                  <div className="text-center">
                    <Building className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold text-gray-900 capitalize">{property.type}</div>
                    <div className="text-sm text-gray-600">Tipo</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Hermosa propiedad ubicada en una de las mejores zonas de {property.district}. 
                    Este {property.type} cuenta con excelente iluminación natural, espacios amplios 
                    y acabados de primera calidad. Perfecto para familias o profesionales que buscan 
                    comodidad y ubicación privilegiada.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    La propiedad se encuentra cerca de centros comerciales, restaurantes, parques 
                    y con fácil acceso a transporte público. Zona segura con vigilancia 24/7.
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Amenidades</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Map */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Ubicación</h3>
                  <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Mapa de ubicación</p>
                      <p className="text-sm">{property.district}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact Card */}
              <div className="md:col-span-1">
                <div className="sticky top-6 bg-white border border-gray-200 rounded-xl p-6 shadow-lg space-y-4">
                  <div className="text-center pb-4 border-b">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      ${property.price}
                    </div>
                    <div className="text-sm text-gray-500">por mes</div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
                    Contactar ahora
                  </button>

                  <button className="w-full bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4 rounded-xl font-semibold transition-all">
                    Agendar visita
                  </button>

                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-all">
                    Enviar mensaje
                  </button>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Disponible inmediatamente</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Car className="w-4 h-4" />
                      <span>Incluye estacionamiento</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      Código de propiedad: #{property.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}