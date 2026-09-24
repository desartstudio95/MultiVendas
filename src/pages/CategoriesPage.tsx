import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  X, 
  ArrowUpDown, 
  MapPin, 
  Tag, 
  Package, 
  Sparkles,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  'Todas',
  'Carros',
  'Imóveis',
  'Eletrónicos',
  'Moda',
  'Casa',
  'Máquinas Industriais',
  'Escritório',
  'Construção',
  'Serviços',
  'Alimentos',
  'Outros'
];

const PROVINCES = [
  'Todas as Localizações',
  'Maputo Cidade',
  'Maputo Província (Matola)',
  'Sofala (Beira)',
  'Nampula',
  'Tete',
  'Zambézia (Quelimane)',
  'Inhambane',
  'Gaza (Xai-Xai)',
  'Manica (Chimoio)',
  'Cabo Delgado (Pemba)',
  'Niassa (Lichinga)'
];

const CONDITIONS = [
  'Todos os estados',
  'Novo',
  'Como Novo',
  'Usado',
  'Recondicionado'
];

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter States from URL Params
  const queryParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('cat') || 'Todas';
  const locationParam = searchParams.get('location') || 'Todas as Localizações';
  const conditionParam = searchParams.get('condition') || 'Todos os estados';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const sortParam = searchParams.get('sort') || 'date-desc';

  // Local form state
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedLocation, setSelectedLocation] = useState(locationParam);
  const [selectedCondition, setSelectedCondition] = useState(conditionParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [sortBy, setSortBy] = useState(sortParam);

  // Sync state if URL changes
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('cat') || 'Todas');
    setSelectedLocation(searchParams.get('location') || 'Todas as Localizações');
    setSelectedCondition(searchParams.get('condition') || 'Todos os estados');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSortBy(searchParams.get('sort') || 'date-desc');
  }, [searchParams]);

  // Fetch all active products once, filter client-side for ultra-fast instant responsiveness
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'active'),
          limit(100)
        );
        const querySnapshot = await getDocs(q);
        const firestoreProducts = querySnapshot.docs.map(docSnapshot => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        })) as Product[];

        setProducts(firestoreProducts);
      } catch (err: any) {
        console.error("Fetch products error:", err);
        toast.error("Erro ao carregar os anúncios.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const updateFilters = (newParams: Record<string, string>) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };
    
    // Clean up empty params
    Object.keys(merged).forEach(key => {
      if (!merged[key] || merged[key] === 'Todas' || merged[key] === 'Todas as Localizações' || merged[key] === 'Todos os estados') {
        delete merged[key];
      }
    });

    setSearchParams(merged);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Todas');
    setSelectedLocation('Todas as Localizações');
    setSelectedCondition('Todos os estados');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('date-desc');
    setSearchParams({});
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search term
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(term);
        const matchDesc = p.description?.toLowerCase().includes(term);
        const matchCat = p.category?.toLowerCase().includes(term);
        const matchSeller = p.sellerName?.toLowerCase().includes(term);
        if (!matchTitle && !matchDesc && !matchCat && !matchSeller) return false;
      }

      // Category
      if (selectedCategory && selectedCategory !== 'Todas') {
        if (p.category !== selectedCategory) {
          // Fallback matching
          if (selectedCategory === 'Carros' && !p.category.toLowerCase().includes('carro') && !p.category.toLowerCase().includes('viatura')) {
            return false;
          }
          if (selectedCategory !== 'Carros') {
            return false;
          }
        }
      }

      // Location
      if (selectedLocation && selectedLocation !== 'Todas as Localizações') {
        if (!p.location?.toLowerCase().includes(selectedLocation.split(' ')[0].toLowerCase())) {
          return false;
        }
      }

      // Condition
      if (selectedCondition && selectedCondition !== 'Todos os estados') {
        if (p.condition !== selectedCondition) return false;
      }

      // Price Range
      const minP = parseFloat(minPrice);
      if (!isNaN(minP) && p.price < minP) return false;

      const maxP = parseFloat(maxPrice);
      if (!isNaN(maxP) && p.price > maxP) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      // Default: date-desc
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [products, searchQuery, selectedCategory, selectedLocation, selectedCondition, minPrice, maxPrice, sortBy]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'Todas' || selectedLocation !== 'Todas as Localizações' || selectedCondition !== 'Todos os estados' || minPrice || maxPrice;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-800">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            <span>Classificados em Moçambique</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Explorar Anúncios
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            Pesquise viaturas, imóveis, telemóveis e produtos diversos com negociação direta com vendedores locais.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por título, marca ou produto..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); updateFilters({ search: '' }); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shrink-0"
            >
              Pesquisar
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Layout: Filters Sidebar (Desktop) + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP FILTERS SIDEBAR */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filtros</span>
            </h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar</span>
              </button>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Categoria</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                updateFilters({ cat: e.target.value });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Localização</label>
            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                updateFilters({ location: e.target.value });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {PROVINCES.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Estado do Bem</label>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                updateFilters({ condition: e.target.value });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Faixa de Preço (MT)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateFilters({ minPrice: e.target.value });
                }}
                placeholder="Mínimo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateFilters({ maxPrice: e.target.value });
                }}
                placeholder="Máximo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Sell Callout */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-2">
            <p className="text-xs font-bold text-emerald-900">Tem algo para vender?</p>
            <p className="text-[11px] text-emerald-700">Publique seu anúncio grátis e receba propostas no WhatsApp.</p>
            <a
              href="https://wa.me/258873319094?text=Ol%C3%A1%2C%20gostaria%20de%20vender%20um%20bem%20na%20MultiVendas"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              Vender na MultiVendas
            </a>
          </div>
        </div>

        {/* RESULTS GRID & CONTROLS */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Sort & Mobile Filter Trigger Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <p className="text-xs text-slate-500 font-medium">
                Mostrando <span className="font-bold text-slate-900 tabular-nums">{filteredProducts.length}</span> anúncio(s)
              </p>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0">
                <ArrowUpDown className="w-3 h-3" />
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters({ sort: e.target.value });
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="date-desc">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Filtros activos:</span>
              {selectedCategory !== 'Todas' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                  {selectedCategory}
                  <button onClick={() => { setSelectedCategory('Todas'); updateFilters({ cat: '' }); }}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-900" />
                  </button>
                </span>
              )}
              {selectedLocation !== 'Todas as Localizações' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                  {selectedLocation}
                  <button onClick={() => { setSelectedLocation('Todas as Localizações'); updateFilters({ location: '' }); }}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-900" />
                  </button>
                </span>
              )}
              {selectedCondition !== 'Todos os estados' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                  {selectedCondition}
                  <button onClick={() => { setSelectedCondition('Todos os estados'); updateFilters({ condition: '' }); }}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-900" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                  Busca: "{searchQuery}"
                  <button onClick={() => { setSearchQuery(''); updateFilters({ search: '' }); }}>
                    <X className="w-3 h-3 text-slate-400 hover:text-slate-900" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-emerald-700 font-bold hover:underline ml-2"
              >
                Limpar todos
              </button>
            </div>
          )}

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
                  <div className="aspect-[4/3] bg-slate-200 rounded-xl" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-6 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <Package className="w-14 h-14 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nenhum anúncio encontrado</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Tente alterar os termos da busca ou limpar os filtros para encontrar o que procura.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Limpar Filtros
                </button>
                <a
                  href="https://wa.me/258873319094?text=Ol%C3%A1%2C%20gostaria%20de%20vender%20um%20bem%20na%20MultiVendas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center"
                >
                  Anunciar meu bem
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS SHEET */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/60 backdrop-blur-sm lg:hidden">
          <div className="w-full max-w-sm bg-white h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  <span>Filtros de Pesquisa</span>
                </h3>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    updateFilters({ cat: e.target.value });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Localização em Moçambique</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    updateFilters({ location: e.target.value });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Estado</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => {
                    setSelectedCondition(e.target.value);
                    updateFilters({ condition: e.target.value });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {CONDITIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Faixa de Preço (MT)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      updateFilters({ minPrice: e.target.value });
                    }}
                    placeholder="Mínimo"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      updateFilters({ maxPrice: e.target.value });
                    }}
                    placeholder="Máximo"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFiltersOpen(false);
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Limpar
              </button>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Ver Resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
