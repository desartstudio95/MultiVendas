import { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  ChevronRight, 
  Package, 
  Box, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  MessageCircle, 
  TrendingUp, 
  Sparkles, 
  Phone, 
  Award,
  Layers,
  ShoppingBag,
  Car, 
  Shirt, 
  Smartphone, 
  Home as HomeIcon, 
  Wrench, 
  Apple, 
  Construction, 
  Briefcase, 
  Dog,
  Beer,
  Droplets,
  Flower,
  Gamepad2,
  Factory,
  Watch,
  Footprints,
  Baby,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ProductCard from '../components/ProductCard';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, getDoc, doc } from 'firebase/firestore';

export const CATEGORY_ICONS: Record<string, any> = {
  'Carros': Car,
  'Moda': Shirt,
  'Eletrónicos': Smartphone,
  'Relógios': Watch,
  'Sapatos': Footprints,
  'Roupa Infantil': Baby,
  'Imóveis': HomeIcon,
  'Serviços': Wrench,
  'Alimentos': Apple,
  'Construção': Construction,
  'Escritório': Briefcase,
  'Ração': Dog,
  'Bebidas': Beer,
  'Cosméticos': Sparkles,
  'Sabonetes': Droplets,
  'Perfumes': Flower,
  'Brinquedos': Gamepad2,
  'Máquinas Industriais': Factory,
  'Outros': Box,
};

const CATEGORIES: Category[] = [
  { id: '1', name: 'Carros', icon: 'Car' },
  { id: '2', name: 'Moda', icon: 'Shirt' },
  { id: '3', name: 'Eletrónicos', icon: 'Smartphone' },
  { id: '17', name: 'Relógios', icon: 'Watch' },
  { id: '18', name: 'Sapatos', icon: 'Footprints' },
  { id: '19', name: 'Roupa Infantil', icon: 'Baby' },
  { id: '4', name: 'Imóveis', icon: 'Home' },
  { id: '5', name: 'Serviços', icon: 'Wrench' },
  { id: '6', name: 'Alimentos', icon: 'Apple' },
  { id: '7', name: 'Construção', icon: 'Construction' },
  { id: '8', name: 'Escritório', icon: 'Briefcase' },
  { id: '10', name: 'Ração', icon: 'Dog' },
  { id: '11', name: 'Bebidas', icon: 'Beer' },
  { id: '12', name: 'Cosméticos', icon: 'Sparkles' },
  { id: '13', name: 'Sabonetes', icon: 'Droplets' },
  { id: '14', name: 'Perfumes', icon: 'Flower' },
  { id: '15', name: 'Brinquedos', icon: 'Gamepad2' },
  { id: '16', name: 'Máquinas Industriais', icon: 'Factory' },
  { id: '9', name: 'Outros', icon: 'Box' },
];

const OPPORTUNITIES = [
  { name: 'Carros', label: 'Automóveis', desc: 'Viaturas e veículos', icon: Car },
  { name: 'Eletrónicos', label: 'Eletrónicos', desc: 'Smartphones e aparelhos', icon: Smartphone },
  { name: 'Moda', label: 'Moda & Estilo', desc: 'Roupas e calçados', icon: Shirt },
  { name: 'Imóveis', label: 'Imóveis', desc: 'Casas, terrenos e espaços', icon: HomeIcon },
];

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          aria-label="Voltar ao topo"
          className="fixed bottom-24 md:bottom-8 right-6 z-50 p-3.5 bg-gray-900 text-white rounded-full shadow-xl hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <ChevronRight className="w-5 h-5 -rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedHeroCategory, setSelectedHeroCategory] = useState('');
  
  // Default headline and subtitle as requested in V2 spec, while preserving CMS override support
  const [homeData, setHomeData] = useState({
    title: 'ENCONTRE.<br />VENDA.<br /><span class="text-green-500">NEGOCIE.</span>',
    subtitle: 'Boas oportunidades começam aqui.'
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch home page custom content (optional CMS banner)
        try {
          const homeDoc = await getDoc(doc(db, 'pages', 'home'));
          if (homeDoc.exists()) {
            const pbData = homeDoc.data();
            if (pbData.title || pbData.subtitle) {
              setHomeData({
                 title: pbData.title || 'ENCONTRE.<br />VENDA.<br /><span class="text-green-500">NEGOCIE.</span>',
                 subtitle: pbData.subtitle || 'Boas oportunidades começam aqui.'
              });
            }
          }
        } catch {
          // Gracefully fallback to default homeData
        }

        // Fetch active products
        try {
          const q = query(
            collection(db, 'products'), 
            where('status', '==', 'active'),
            limit(50)
          );
          const querySnapshot = await getDocs(q);
          let firestoreProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Product[];

          firestoreProducts.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          firestoreProducts = firestoreProducts.slice(0, 8);
          setProducts(firestoreProducts);
        } catch (e: any) {
          console.error("Fetch error [HomePage -> products]:", e);
          if (e?.message?.includes('permissions')) {
            toast.error("Erro de permissão ao carregar produtos");
          }
        }
      } catch (error: any) {
        console.error("HomePage fetchData error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.set('search', heroSearch.trim());
    if (selectedHeroCategory) params.set('cat', selectedHeroCategory);
    navigate(`/categories${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const whatsappSellUrl = "https://wa.me/258873319094?text=" + encodeURIComponent("Olá! Gostaria de vender um bem na MultiVendas.");

  return (
    <div className="space-y-12 md:space-y-20 pb-8">
      <ScrollToTopButton />

      {/* ========================================================================= */}
      {/* 2 — HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl md:rounded-[36px] overflow-hidden bg-green-950 text-white border border-green-800/80 shadow-2xl">
        {/* Background Image with Controlled Cinematic Scrim */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.ibb.co/ZRc6N6Cy/3c9a2d6b-93a8-46be-b915-d36d4ae3e7a7.jpg" 
            alt="MultiVendas Moçambique" 
            className="w-full h-full object-cover object-center opacity-[0.98] filter brightness-95"
            referrerPolicy="no-referrer"
            loading="eager"
          />
          {/* Gradients in green tones for branding and readability */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-green-950/80 via-green-950/50 to-green-900/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-green-950/60" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left / Main Text & Search */}
            <div className="lg:col-span-7 space-y-6">
              {/* Brand trust chip */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-green-300">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>Moçambique · Vendas inteligentes, resultados reais</span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05]"
                  dangerouslySetInnerHTML={{ __html: homeData.title }}
                />
                <p className="text-lg sm:text-xl font-bold text-gray-200">
                  {homeData.subtitle}
                </p>
                <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed max-w-xl">
                  Descubra produtos, encontre compradores e transforme os seus bens em oportunidades através da MultiVendas.
                </p>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a 
                  href="#anuncios-em-destaque" 
                  className="px-6 py-3.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-green-900/30 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explorar anúncios</span>
                </a>

                <a 
                  href={whatsappSellUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-sm transition-all duration-200 backdrop-blur-sm flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Phone className="w-4 h-4 text-green-400" />
                  <span>Quero vender um bem</span>
                </a>
              </div>

              {/* Hero Search Bar — Marketplace Style */}
              <div className="pt-2">
                <form 
                  onSubmit={handleHeroSearchSubmit}
                  className="bg-white/95 backdrop-blur-md p-2 rounded-2xl md:rounded-2xl border border-white shadow-2xl flex flex-col md:flex-row gap-2 text-gray-900"
                >
                  {/* Search Input */}
                  <div className="flex-1 flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200/80 focus-within:border-green-600 focus-within:bg-white transition-all">
                    <Search className="w-5 h-5 text-gray-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="O que procura? (ex: Carro, iPhone, Terreno...)"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200/80 focus-within:border-green-600 focus-within:bg-white transition-all md:max-w-[200px]">
                    <Layers className="w-4 h-4 text-gray-400 shrink-0" />
                    <select 
                      value={selectedHeroCategory}
                      onChange={(e) => setSelectedHeroCategory(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none cursor-pointer"
                    >
                      <option value="">Todas categorias</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Search Submit Button */}
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md shadow-green-600/20"
                  >
                    <Search className="w-4 h-4" />
                    <span>Pesquisar</span>
                  </button>
                </form>
              </div>

              {/* Hero Trust Indicators — Real, No Fake Stats */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-2 text-xs sm:text-sm font-semibold text-gray-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Compra e venda em Moçambique</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Contacto directo</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  <span>Negociação simples</span>
                </div>
              </div>
            </div>

            {/* Right / Opportunities Panel ("Explore oportunidades") */}
            <div className="lg:col-span-5">
              <div className="bg-green-950/70 backdrop-blur-xl border border-green-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-green-800/70 mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-400" />
                      <span>Explore oportunidades</span>
                    </h3>
                    <p className="text-xs text-green-200/80 mt-0.5">Acesso rápido aos segmentos mais procurados</p>
                  </div>
                  <Link 
                    to="/categories" 
                    className="text-xs font-semibold text-green-300 hover:text-green-200 flex items-center gap-1 transition-colors"
                  >
                    Ver todas <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {OPPORTUNITIES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.name}
                        to={`/categories?cat=${encodeURIComponent(item.name)}`}
                        className="p-3.5 rounded-xl bg-green-900/40 border border-green-800/60 hover:border-green-400/80 hover:bg-green-800/50 transition-all duration-200 group flex items-start gap-3 backdrop-blur-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-400/30 text-green-300 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-200">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-green-300 transition-colors truncate">
                            {item.label}
                          </p>
                          <p className="text-xs text-green-200/70 leading-tight mt-0.5 line-clamp-1">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Direct Help Callout */}
                <div className="mt-4 pt-4 border-t border-green-800/70 flex items-center justify-between text-xs text-green-200/80">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                    <span>Maputo & Províncias</span>
                  </span>
                  <a 
                    href="https://wa.me/258873319094" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-300 hover:text-white font-bold transition-colors"
                  >
                    WhatsApp: +258 873 319 094
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3 — CATEGORIAS                                                            */}
      {/* ========================================================================= */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200/70 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Explore por categoria
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Encontre rapidamente o que procura em diversas áreas.
            </p>
          </div>
          <Link 
            to="/categories" 
            className="inline-flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800 transition-colors w-fit"
          >
            <span>Ver todas as categorias</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid (Desktop) & Smooth Horizontal Scroll (Mobile) */}
        <div className="relative">
          {/* Mobile Horizontal Scroll */}
          <div className="flex md:hidden gap-3 overflow-x-auto pb-3 pt-1 scrollbar-hide -mx-4 px-4">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Box;
              return (
                <Link 
                  key={cat.id}
                  to={`/categories?cat=${encodeURIComponent(cat.name)}`}
                  className="flex-shrink-0 w-28 p-3 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col items-center justify-center text-center gap-2 group hover:border-green-500 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-green-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Balanced Grid */}
          <div className="hidden md:grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.name] || Box;
              return (
                <Link 
                  key={cat.id}
                  to={`/categories?cat=${encodeURIComponent(cat.name)}`}
                  className="p-3.5 bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-green-500 hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-700 flex items-center justify-center group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-green-600 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4 — ANÚNCIOS EM DESTAQUE                                                  */}
      {/* ========================================================================= */}
      <section id="anuncios-em-destaque" className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-gray-200/70 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-700 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Oportunidades em Destaque</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Encontre a sua próxima oportunidade
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Descubra produtos publicados e disponíveis para negociação na MultiVendas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link 
              to="/categories?sort=date-desc" 
              className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:border-green-600 hover:text-green-700 transition-colors"
            >
              Recentes
            </Link>
            <Link 
              to="/categories" 
              className="px-3.5 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Ver catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Product Grid / Loading / Empty State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3.5 space-y-3 animate-pulse shadow-xs">
                <div className="aspect-square bg-gray-200/80 rounded-xl" />
                <div className="space-y-2 pt-1">
                  <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="w-7 h-7 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-dashed border-gray-200 max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Ainda estamos a preparar novas oportunidades.
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Volte em breve ou seja o primeiro a publicar um produto através da nossa equipa comercial.
              </p>
            </div>
            <a 
              href={whatsappSellUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Quero vender</span>
            </a>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5 — SECÇÃO DE CONFIANÇA                                                   */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl md:rounded-[32px] border border-gray-200/80 p-6 sm:p-10 md:p-14 shadow-sm space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700">
            Diferenciais MultiVendas
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
            Porquê escolher a MultiVendas?
          </h2>
          <p className="text-sm sm:text-base text-gray-500 font-medium mt-2 leading-relaxed">
            Criamos uma infraestrutura comercial pensada para conectar vendedores e compradores com clareza, seriedade e agilidade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 01 VISIBILIDADE */}
          <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-green-200 hover:bg-white hover:shadow-md transition-all duration-200 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200/80 text-green-700 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-gray-400">01</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">
              VISIBILIDADE
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Apresente o seu produto a potenciais compradores em Moçambique com alcance focado.
            </p>
          </div>

          {/* 02 APRESENTAÇÃO */}
          <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-green-200 hover:bg-white hover:shadow-md transition-all duration-200 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200/80 text-green-700 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-gray-400">02</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">
              APRESENTAÇÃO
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Uma boa apresentação ajuda o seu anúncio a destacar-se e a transmitir credibilidade.
            </p>
          </div>

          {/* 03 CONTACTO DIRECTO */}
          <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-green-200 hover:bg-white hover:shadow-md transition-all duration-200 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200/80 text-green-700 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-gray-400">03</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">
              CONTACTO DIRECTO
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Facilitamos o contacto entre compradores e vendedores para agilizar perguntas e respostas.
            </p>
          </div>

          {/* 04 NEGOCIAÇÃO */}
          <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-green-200 hover:bg-white hover:shadow-md transition-all duration-200 space-y-3 group">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-white border border-gray-200/80 text-green-700 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-gray-400">04</span>
            </div>
            <h3 className="text-base font-bold text-gray-900">
              NEGOCIAÇÃO
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Negocie directamente e transforme o interesse legítimo em negócio concluído com sucesso.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6 — CTA PARA VENDEDORES                                                   */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl md:rounded-[36px] bg-gray-950 text-white p-8 sm:p-12 md:p-16 border border-gray-800 shadow-2xl">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-green-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Venda na MultiVendas
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              TEM UM BEM PARA VENDER?
            </h2>
            <p className="text-xl md:text-2xl font-bold text-green-400">
              Não deixe o seu património parado.
            </p>
          </div>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            Coloque o seu bem na MultiVendas e apresente-o a potenciais compradores. Facilitamos a negociação com atendimento personalizado e publicação profissional.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <a 
              href={whatsappSellUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-gray-950 font-black text-base rounded-xl transition-all duration-200 shadow-xl shadow-green-500/20 flex items-center justify-center gap-3 hover:-translate-y-0.5"
            >
              <Phone className="w-5 h-5 text-gray-950 shrink-0" />
              <span>Quero vender o meu bem</span>
            </a>

            <a 
              href="https://wa.me/258873319094"
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm rounded-xl transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <span className="text-gray-400">WhatsApp:</span>
              <span className="text-green-400 font-mono tracking-wide">+258 873 319 094</span>
            </a>
          </div>

          <div className="pt-4 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
            <p className="font-semibold text-gray-300">
              “Vendas inteligentes, resultados reais.”
            </p>
            <div className="flex items-center gap-4">
              <Link to="/como-comprar" className="hover:text-green-400 transition-colors">Como comprar</Link>
              <Link to="/seguranca" className="hover:text-green-400 transition-colors">Segurança</Link>
              <Link to="/termos" className="hover:text-green-400 transition-colors">Termos de uso</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
