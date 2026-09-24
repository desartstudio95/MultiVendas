import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ShieldCheck, CheckCircle2, Clock, Phone, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('multivendas_favs') || '[]');
      return favs.includes(product.id);
    } catch {
      return false;
    }
  });

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const favs = JSON.parse(localStorage.getItem('multivendas_favs') || '[]');
      let updated: string[];
      if (favs.includes(product.id)) {
        updated = favs.filter((id: string) => id !== product.id);
        setIsFavorite(false);
        toast.info('Removido dos favoritos');
      } else {
        updated = [...favs, product.id];
        setIsFavorite(true);
        toast.success('Salvo nos favoritos!');
      }
      localStorage.setItem('multivendas_favs', JSON.stringify(updated));
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  // Format date nicely
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Recente';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `Há ${diffDays} dias`;
      return new Date(dateStr).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' });
    } catch {
      return 'Recente';
    }
  };

  const sellerName = product.sellerName || 'MultiVendas';
  const isVerified = product.sellerVerified !== false;
  const condition = product.condition || 'Usado';
  const location = product.location || 'Moçambique';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col overflow-hidden h-full"
    >
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              // Graceful zero-broken-image fallback
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
            }}
          />

          {/* Top Overlay Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md shadow-sm">
              {product.category}
            </span>

            <button
              type="button"
              onClick={toggleFavorite}
              aria-label={isFavorite ? "Remover dos favoritos" : "Guardar anúncio"}
              className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-red-500 hover:bg-white shadow-sm flex items-center justify-center transition-colors"
            >
              <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
            </button>
          </div>

          {/* Sold Overlay */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-3.5 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg">
                Vendido
              </span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            {/* Metadata (Unboxed anti-pill discipline) */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 flex-wrap">
              <span className="text-emerald-700 font-semibold">{condition}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {location}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-[11px] text-slate-400">{formatDate(product.createdAt)}</span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
              {product.title}
            </h3>
          </div>

          {/* Bottom Section: Price & Seller */}
          <div className="pt-2.5 border-t border-slate-100 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400 font-medium">Preço</p>
              <p className="text-base font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatCurrency(product.price)}
              </p>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 truncate max-w-[120px]">
                <span className="truncate">{sellerName}</span>
                {isVerified && (
                  <span title="Vendedor Verificado" className="inline-flex">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold hover:underline mt-0.5">
                Ver anúncio →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
