import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  LayoutGrid, 
  Search, 
  Filter, 
  ChevronRight, 
  Star, 
  ShoppingCart,
  Package,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  Car, 
  Shirt, 
  Smartphone, 
  Home as HomeIcon, 
  Wrench, 
  Apple, 
  Construction, 
  Briefcase, 
  Box 
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
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

const PRODUCTS_PER_PAGE = 6;

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat') || 'Todos';
  const initialSort = searchParams.get('sort') as any || 'date-desc';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'price-asc' | 'price-desc'>(initialSort);
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setLoading(true);
    // We fetch products for the category and filter status client-side to avoid requiring composite indexes
    let q = query(collection(db, 'products'));

    if (activeCategory !== 'Todos') {
      q = query(
        collection(db, 'products'),
        where('category', '==', activeCategory)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const filteredProducts = products
    .filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const sortOptions = [
    { id: 'date-desc', label: 'Mais Recentes' },
    { id: 'date-asc', label: 'Mais Antigos' },
    { id: 'price-asc', label: 'Menor Preço' },
    { id: 'price-desc', label: 'Maior Preço' },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-green-600" />
              {activeCategory === 'Todos' ? 'Explorar Categorias' : activeCategory}
            </h1>
            {activeCategory !== 'Todos' && (
              <p className="text-sm text-gray-500">Encontre os melhores anúncios de {activeCategory.toLowerCase()} em Moçambique.</p>
            )}
          </div>
          <div className="flex gap-2 relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className={cn(
                "p-2 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-green-600 transition-colors flex items-center gap-2",
                showSortMenu && "text-green-600 border-green-200"
              )}
            >
              <ArrowUpDown className="w-5 h-5" />
              <span className="text-xs font-bold hidden md:block">
                {sortOptions.find(o => o.id === sortBy)?.label}
              </span>
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowSortMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden"
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id as any);
                          setSearchParams(prev => {
                            prev.set('sort', option.id);
                            return prev;
                          });
                          setShowSortMenu(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left text-sm font-bold transition-colors",
                          sortBy === option.id ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={`Pesquisar em ${activeCategory}...`}
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[24px] shadow-sm focus:ring-2 focus:ring-green-500 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Categories */}
        <aside className="w-full md:w-64 space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Filtrar por Categoria</h2>
          <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <button 
              onClick={() => setSearchParams({})}
              className={cn(
                "flex-shrink-0 px-4 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-3",
                activeCategory === 'Todos' ? "bg-green-600 text-white shadow-lg shadow-green-100" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              )}
            >
              <div className="w-6 h-6 flex items-center justify-center">📦</div>
              Todos
            </button>
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Box;
              return (
                <button 
                  key={cat.id}
                  onClick={() => setSearchParams({ cat: cat.name })}
                  className={cn(
                    "flex-shrink-0 px-4 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-3",
                    activeCategory === cat.name ? "bg-green-600 text-white shadow-lg shadow-green-100" : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                  )}
                >
                  <div className={cn("w-6 h-6 flex items-center justify-center", activeCategory === cat.name ? "text-white" : "text-green-600")}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Mostrando <span className="font-bold text-gray-900">{filteredProducts.length}</span> resultados</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-3xl p-4 space-y-4 animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-2xl"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group hover:border-green-200 transition-all"
                  >
                    <Link to={`/product/${product.id}`}>
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] font-bold">4.8</span>
                        </div>
                        {product.status === 'sold' && (
                          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="px-4 py-2 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                              Vendido
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">{product.category}</p>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-2">{product.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-gray-900">{formatCurrency(product.price)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white border border-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-10 h-10 rounded-xl font-bold text-sm transition-all",
                          currentPage === page 
                            ? "bg-green-600 text-white shadow-lg shadow-green-100" 
                            : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-white border border-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-gray-200">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-900 font-bold text-lg">Nenhum produto nesta categoria</p>
              <p className="text-sm text-gray-500 mt-2">Tente mudar os filtros ou pesquisar por outro termo.</p>
              <button 
                onClick={() => setSearchParams({})}
                className="mt-6 px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-all"
              >
                Ver Todos os Produtos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
