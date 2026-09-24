import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Maximize2, 
  X, 
  Tag, 
  Truck, 
  Building, 
  User, 
  Calendar,
  Lock,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        try {
          const productDoc = await getDoc(doc(db, 'products', id));
          if (productDoc.exists()) {
            const data = { id: productDoc.id, ...productDoc.data() } as Product;
            setProduct(data);

            // Update SEO & Social Meta
            const titleStr = `${data.title} – ${formatCurrency(data.price)} | MultiVendas Moçambique`;
            document.title = titleStr;

            // Structured Data JSON-LD
            const schemaData = {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": data.title,
              "image": data.images?.[0] || "",
              "description": data.description || data.title,
              "sku": data.reference || `MV-${data.id.slice(0, 6).toUpperCase()}`,
              "offers": {
                "@type": "Offer",
                "priceCurrency": "MZN",
                "price": data.price,
                "availability": data.status === 'sold' ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                "itemCondition": "https://schema.org/UsedCondition"
              }
            };

            const existingScript = document.getElementById('jsonld-product');
            if (existingScript) existingScript.remove();

            const script = document.createElement('script');
            script.id = 'jsonld-product';
            script.type = 'application/ld+json';
            script.text = JSON.stringify(schemaData);
            document.head.appendChild(script);

            // Check favorite state
            try {
              const favs = JSON.parse(localStorage.getItem('multivendas_favs') || '[]');
              setIsFavorite(favs.includes(data.id));
            } catch {
              // Ignore localStorage error
            }
          } else {
            toast.error("Anúncio não encontrado.");
            navigate('/categories');
          }
        } catch (error: any) {
          console.error("Fetch product error:", error);
          toast.error("Erro ao carregar o anúncio.");
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }

    return () => {
      document.title = "MultiVendas – Vendas inteligentes, resultados reais | Moçambique";
      const existingScript = document.getElementById('jsonld-product');
      if (existingScript) existingScript.remove();
    };
  }, [id, navigate]);

  const toggleFavorite = () => {
    if (!product) return;
    try {
      const favs = JSON.parse(localStorage.getItem('multivendas_favs') || '[]');
      let updated: string[];
      if (favs.includes(product.id)) {
        updated = favs.filter((itemId: string) => itemId !== product.id);
        setIsFavorite(false);
        toast.info("Removido dos anúncios guardados");
      } else {
        updated = [...favs, product.id];
        setIsFavorite(true);
        toast.success("Anúncio guardado com sucesso!");
      }
      localStorage.setItem('multivendas_favs', JSON.stringify(updated));
    } catch {
      setIsFavorite(!isFavorite);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = product?.title || 'MultiVendas';
    const shareText = `Veja este anúncio na MultiVendas: ${product?.title} por ${formatCurrency(product?.price || 0)}!\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link do anúncio copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Carregando detalhes do anúncio...</p>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const sellerPhoneClean = (product.sellerPhone || product.sellerContacts?.[0] || '+258873319094').replace(/\D/g, '');
  const refCode = product.reference || `MV-${product.id.slice(0, 6).toUpperCase()}`;
  const sellerName = product.sellerName || 'MultiVendas';
  const condition = product.condition || 'Usado';
  const location = product.location || 'Moçambique';

  const waMessage = `Olá ${sellerName}! Vi o anúncio "${product.title}" (${refCode}) no valor de ${formatCurrency(product.price)} na MultiVendas e tenho interesse em negociar. O produto ainda está disponível?`;
  const waUrl = `https://wa.me/${sellerPhoneClean}?text=${encodeURIComponent(waMessage)}`;
  const telUrl = `tel:+${sellerPhoneClean}`;

  return (
    <div className="space-y-8 pb-20 md:pb-12 max-w-6xl mx-auto">
      {/* Top Breadcrumbs & Action Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Link to="/" className="hover:text-slate-900 transition-colors">Início</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to={`/categories?cat=${encodeURIComponent(product.category)}`} className="hover:text-slate-900 transition-colors truncate">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-semibold truncate max-w-[200px]">{refCode}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            <Heart className={cn("w-4 h-4", isFavorite ? "fill-red-500 text-red-500" : "")} />
            <span className="hidden sm:inline">{isFavorite ? "Guardado" : "Guardar"}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Partilhar</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery (Left) vs Purchase Module (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: IMAGE GALLERY */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm group">
            <img 
              src={images[currentImageIndex]} 
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Sold Banner */}
            {product.status === 'sold' && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
                <span className="px-6 py-2.5 bg-red-600 text-white font-extrabold uppercase tracking-widest text-sm rounded-xl shadow-xl">
                  Anúncio Vendido
                </span>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-800 hover:bg-white transition-opacity opacity-90 hover:opacity-100"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-800 hover:bg-white transition-opacity opacity-90 hover:opacity-100"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Fullscreen Trigger */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-900 transition-colors shadow-sm"
              title="Ver em ecrã inteiro"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-slate-100",
                    idx === currentImageIndex 
                      ? "border-emerald-600 ring-2 ring-emerald-500/20" 
                      : "border-slate-200 opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}

          {/* Product Description */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Descrição do Anúncio</span>
            </h2>
            <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {product.description || "Nenhuma descrição detalhada fornecida pelo vendedor."}
            </div>
          </div>

          {/* Características / Especificações */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Características</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Categoria</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{product.category}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Estado</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{condition}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Localização</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{location}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Entrega</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{product.delivery || 'A combinar'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Referência</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{refCode}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Status</p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  {product.status === 'sold' ? 'Vendido' : 'Disponível'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: CONTIGUOUS PURCHASE & NEGOTIATION MODULE */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
            {/* Metadata Line */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {condition}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {location}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-400">Ref: {refCode}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-baseline justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Preço anunciado</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                    {formatCurrency(product.price)}
                  </span>
                  {product.negotiable !== false && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      Negociável
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3">
              {/* PRIMARY CTA: NEGOCIAR PELO WHATSAPP */}
              <a
                href={product.status === 'sold' ? undefined : waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg",
                  product.status === 'sold'
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed pointer-events-none"
                    : "bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-600/20 active:scale-[0.99]"
                )}
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>NEGOCIAR PELO WHATSAPP</span>
              </a>

              {/* SECONDARY ROW */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={product.status === 'sold' ? undefined : telUrl}
                  className={cn(
                    "py-3 px-4 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors",
                    product.status === 'sold' && "pointer-events-none opacity-50"
                  )}
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Ligar para vendedor</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigate('/chat');
                  }}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-slate-600" />
                  <span>Chat na plataforma</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center pt-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Publicado na MultiVendas · Contacto directo e sem taxas</span>
            </div>
          </div>

          {/* VENDEDOR CARD: "Sobre o vendedor" */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sobre o vendedor</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg overflow-hidden shrink-0">
                <User className="w-7 h-7 text-slate-400" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-slate-900 truncate">{sellerName}</h4>
                  <span title="Identidade verificada" className="inline-flex">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{product.sellerType || 'Vendedor Verificado'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Activo na MultiVendas desde 2024</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                to={`/categories?search=${encodeURIComponent(sellerName)}`}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Ver todos os anúncios deste vendedor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* SEGURANÇA: "Negocie com segurança" */}
          <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Negocie com segurança</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>Confirme o produto antes de efectuar quaisquer pagamentos antecipados.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>Marque encontros em locais públicos e seguros em Moçambique.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>Confirme a documentação e propriedade quando se tratar de viaturas ou imóveis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">•</span>
                <span>Não partilhe códigos pessoais de M-Pesa, E-Mola ou dados bancários.</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link to="/seguranca" className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1">
                <span>Ver guia completo de segurança</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN MODAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white">
              <div className="text-sm font-semibold">
                {product.title} ({currentImageIndex + 1} de {images.length})
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Image Stage */}
            <div className="relative flex-1 flex items-center justify-center max-h-[80vh] my-4">
              <img
                src={images[currentImageIndex]}
                alt={product.title}
                className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Strip */}
            <div className="flex gap-2 justify-center overflow-x-auto py-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={cn(
                    "w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                    i === currentImageIndex ? "border-emerald-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE STICKY BOTTOM WHATSAPP CTA BAR (Strict 15% Viewport Cap) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 md:hidden shadow-lg flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Preço</p>
          <p className="text-base font-extrabold text-slate-900 tracking-tight truncate tabular-nums">
            {formatCurrency(product.price)}
          </p>
        </div>

        <a
          href={product.status === 'sold' ? undefined : waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white shadow-md transition-all",
            product.status === 'sold'
              ? "bg-slate-300 text-slate-500 pointer-events-none"
              : "bg-[#25D366] hover:bg-[#20ba5a]"
          )}
        >
          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
          <span className="truncate">NEGOCIAR NO WHATSAPP</span>
        </a>
      </div>
    </div>
  );
}
