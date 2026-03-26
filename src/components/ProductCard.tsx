import { Link } from 'react-router-dom';
import { Star, Tag, Truck } from 'lucide-react';
import { motion } from 'motion/react';
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
      className="group bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300 h-full flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden shrink-0">
          <img
            src={product.images[0] || 'https://picsum.photos/seed/product/400/400'}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[calc(100%-2rem)]">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 w-fit max-w-full">
              <Tag className="w-3 h-3 text-green-600 shrink-0" />
              <span className="truncate">{product.category}</span>
            </span>
            {product.delivery && (
              <span className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm flex items-center gap-1 w-fit max-w-full">
                <Truck className="w-3 h-3 shrink-0" />
                <span className="truncate">{product.delivery}</span>
              </span>
            )}
          </div>
          <div className="absolute bottom-4 right-4">
            <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-gray-900">{rating}</span>
            </div>
          </div>

          {/* Sold Badge */}
          {product.status === 'sold' && (
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center">
              <span className="px-6 py-3 bg-white text-gray-900 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl border-2 border-gray-100">
                Vendido
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="space-y-1.5 mb-3">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors leading-snug min-h-[2.5rem]">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto gap-2">
            <p className="text-lg font-black text-gray-900 truncate">
              {formatCurrency(product.price)}
            </p>
            <div className="w-8 h-8 shrink-0 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
              <Star className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
