import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Category } from '../types';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { MapPin, ChevronRight, Package, Box } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';

import { 
  Car, 
  Shirt, 
  Smartphone, 
  Home as HomeIcon, 
  Wrench, 
  Apple, 
  Construction, 
  Briefcase, 
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, any> = {
  'Carros': Car,
  'Moda': Shirt,
  'Eletrónicos': Smartphone,
  'Imóveis': HomeIcon,
  'Serviços': Wrench,
  'Alimentos': Apple,
  'Construção': Construction,
  'Escritório': Briefcase,
  'Outros': Box,
};

const CATEGORIES: Category[] = [
  { id: '1', name: 'Carros', icon: 'Car' },
  { id: '2', name: 'Moda', icon: 'Shirt' },
  { id: '3', name: 'Eletrónicos', icon: 'Smartphone' },
  { id: '4', name: 'Imóveis', icon: 'Home' },
  { id: '5', name: 'Serviços', icon: 'Wrench' },
  { id: '6', name: 'Alimentos', icon: 'Apple' },
  { id: '7', name: 'Construção', icon: 'Construction' },
  { id: '8', name: 'Escritório', icon: 'Briefcase' },
  { id: '9', name: 'Outros', icon: 'Box' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .slice(0, 20) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
      if (error.message.includes('permission') || error.message.includes('insufficient')) {
        handleFirestoreError(error, OperationType.LIST, 'products');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero / Search Section */}
      <section className="relative h-64 md:h-80 rounded-[40px] overflow-hidden flex items-center px-8 shadow-2xl shadow-green-100 group">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://i.ibb.co/ZRc6N6Cy/3c9a2d6b-93a8-46be-b915-d36d4ae3e7a7.jpg" 
            alt="MultiVendas Background" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              O que você está <br /> <span className="text-yellow-400">procurando hoje?</span>
            </h1>
            <div className="flex items-center gap-3 text-white/90 text-sm font-medium bg-white/10 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-white/20">
              <MapPin className="w-4 h-4 text-yellow-400" />
              <span>Moçambique, Maputo</span>
            </div>
          </motion.div>
        </div>

        <div className="absolute right-12 bottom-0 hidden lg:block">
          <motion.img 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            src="https://images.unsplash.com/photo-1556742049-02e49f9d2a10?auto=format&fit=crop&q=80&w=400" 
            alt="Marketplace" 
            className="h-72 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Categories Horizontal Scroll */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Categorias Populares</h2>
          <Link to="/categories" className="text-sm font-medium text-green-600 flex items-center gap-1">
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name] || Box;
            return (
              <Link 
                key={cat.id}
                to={`/categories?cat=${cat.name}`}
                className="flex-shrink-0 flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:bg-green-50 transition-all duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-gray-600 group-hover:text-green-600 transition-colors">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Destaques em Moçambique</h2>
          <div className="flex gap-2">
            <Link to="/categories" className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-green-500 transition-colors">Novos</Link>
            <Link to="/categories" className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-green-500 transition-colors">Preço</Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl p-3 space-y-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum produto encontrado.</p>
            <p className="text-sm text-gray-400">O administrador ainda não publicou produtos.</p>
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="bg-yellow-400 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold text-gray-900">Compre com Segurança</h3>
          <p className="text-gray-800 max-w-md">Todos os produtos são verificados pela nossa agência para garantir a melhor experiência.</p>
          <Link to="/seguranca" className="inline-block mt-4 px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-colors">Saiba Mais</Link>
        </div>
        <div className="flex -space-x-4">
          {[1, 2, 3, 4].map(i => (
            <img 
              key={i}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} 
              alt="" 
              className="w-12 h-12 rounded-full border-4 border-yellow-400 bg-white"
            />
          ))}
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400 bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
            +500
          </div>
        </div>
      </section>
    </div>
  );
}
