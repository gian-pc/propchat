'use client'

import { useState } from 'react';
import { PropertyFilters } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Definimos los filtros que este Navbar puede manejar
interface NavbarProps {
  filters: PropertyFilters;
  onFiltersChange: (newFilters: PropertyFilters) => void;
}

// Opciones para el filtro de Camas/Baños
const bedOptions = [
  { id: "beds-0", label: "Cualquiera", value: undefined },
  { id: "beds-1", label: "1+", value: 1 },
  { id: "beds-2", label: "2+", value: 2 },
  { id: "beds-3", label: "3+", value: 3 },
  { id: "beds-4", label: "4+", value: 4 },
];

export default function Navbar({ filters, onFiltersChange }: NavbarProps) {
  
  // --- Manejadores de Filtros ---

  // 1. Venta/Alquiler
  const handleTransactionChange = (value: string) => {
    // value es 'all', 'rent', 'sale'
    const transaction_type = value === 'all' ? undefined : (value as 'rent' | 'sale');
    onFiltersChange({ ...filters, transaction_type });
  };

  // 2. Precio
  const handlePriceChange = (value: string) => {
    let min_price: number | undefined;
    let max_price: number | undefined;

    switch (value) {
      case "0-1000":
        min_price = 0; max_price = 1000; break;
      case "1000-2000":
        min_price = 1000; max_price = 2000; break;
      case "2000+":
        min_price = 2000; max_price = undefined; break;
      case "0-50k": // Para ventas
        min_price = 0; max_price = 50000; break;
      case "50k-100k":
        min_price = 50000; max_price = 100000; break;
      case "100k+":
        min_price = 100000; max_price = undefined; break;
      default: // 'any'
        min_price = undefined; max_price = undefined;
    }
    onFiltersChange({ ...filters, min_price, max_price });
  };
  
  // Helper para saber qué rango de precio mostrar
  const getPriceRangeValue = () => {
    if (filters.min_price === 0 && filters.max_price === 1000) return "0-1000";
    if (filters.min_price === 1000 && filters.max_price === 2000) return "1000-2000";
    if (filters.min_price === 2000 && !filters.max_price) return "2000+";
    if (filters.min_price === 0 && filters.max_price === 50000) return "0-50k";
    if (filters.min_price === 50000 && filters.max_price === 100000) return "50k-100k";
    if (filters.min_price === 100000 && !filters.max_price) return "100k+";
    return "any";
  };

  // 3. Tipo de Propiedad
  const handleTypeChange = (value: string) => {
    const property_type = value === 'all' ? undefined : value;
    onFiltersChange({ ...filters, property_type });
  };

  // 4. Camas/Baños
  const handleBedsChange = (value?: number) => {
    onFiltersChange({ ...filters, bedrooms: value });
  };

  return (
    <nav className="w-full h-16 bg-white border-b border-gray-200 flex items-center px-6 z-20">
      <div className="flex items-center gap-4 md:gap-8 w-full">
        {/* Logo */}
        <h1 className="text-xl font-bold text-gray-800">PropChat</h1>

        {/* Separador */}
        <Separator orientation="vertical" className="h-6" />

        {/* Filtros Principales */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Filtro 1: Venta/Alquiler (Nuevo) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[120px]">
                {filters.transaction_type === 'rent' ? 'Alquiler' : filters.transaction_type === 'sale' ? 'Venta' : 'Cualquiera'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Tipo de Transacción</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup 
                value={filters.transaction_type || 'all'}
                onValueChange={handleTransactionChange}
              >
                <DropdownMenuRadioItem value="all">Cualquiera</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="rent">Alquiler</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="sale">Venta</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro 2: Precio (Modificado) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Precio</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuRadioGroup 
                value={getPriceRangeValue()} 
                onValueChange={handlePriceChange}
              >
                <DropdownMenuLabel>Cualquier Precio</DropdownMenuLabel>
                <DropdownMenuRadioItem value="any">Cualquiera</DropdownMenuRadioItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Alquiler (mensual)</DropdownMenuLabel>
                <DropdownMenuRadioItem value="0-1000">$0 - $1,000</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="1000-2000">$1,000 - $2,000</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="2000+">$2,000+</DropdownMenuRadioItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Venta (total)</DropdownMenuLabel>
                <DropdownMenuRadioItem value="0-50k">$0 - $50,000</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="50k-100k">$50,000 - $100,000</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="100k+">$100,000+</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filtro 3: Tipo de Propiedad (Ya lo tenías) */}
          <div className="flex items-center gap-2">
            <Label htmlFor="property-type" className="hidden md:block">Tipo</Label>
            <Select 
              value={filters.property_type || 'all'}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger id="property-type" className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="apartment">Departamento</SelectItem>
                <SelectItem value="house">Casa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro 4: Camas y Baños (Nuevo) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Camas y Baños</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dormitorios</Label>
                  <div className="flex flex-wrap gap-2">
                    {bedOptions.map(option => (
                      <Button
                        key={option.id}
                        variant={filters.bedrooms === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleBedsChange(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* <Separator />
                
                // Aquí podrías añadir la lógica para 'bathrooms'
                // Por ahora lo dejamos solo con 'bedrooms' para 
                // no complicar el backend (que solo filtra por 'bedrooms')
                
                <div className="space-y-2">
                  <Label>Baños</Label>
                  // ... (lógica similar para baños) ...
                </div>
                */}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
}