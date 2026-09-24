import { Link } from 'react-router-dom';
import { Star, Tag, Truck, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Mock rating since it's not in the Product type but requested
  const rating = 4.5;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:shadow-green-100/50 transition-all duration-300 h-full flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden shrink-0">
          <img
            src={product.images[0] || 'https://picsum.photos/seed/product/400/400'}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 max-w-[calc(100%-1.5rem)]">
            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-gray-900 text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 w-fit max-w-full">
              <Tag className="w-2.5 h-2.5 text-green-600 shrink-0" />
              <span className="truncate">{product.category}</span>
            </span>
            {product.delivery && (
              <span className="px-2 py-0.5 bg-green-600/90 text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 w-fit max-w-full">
                <Truck className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{product.delivery}</span>
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3 text-white">
             <div className="bg-black/20 backdrop-blur-md p-1.5 rounded-full shadow-sm inline-flex items-center justify-center">
               <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
             </div>
          </div>

          {/* Sold Badge */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="px-4 py-2 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl border border-gray-100">
                Vendido
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 flex flex-col flex-grow">
          <div className="space-y-1 mb-2.5">
            <h3 className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors leading-snug min-h-[2rem]">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-gray-50 mt-auto gap-2">
            <p className="text-sm font-black text-gray-900 truncate">
              {formatCurrency(product.price)}
            </p>
            <div className="w-7 h-7 shrink-0 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
