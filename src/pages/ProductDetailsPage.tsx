import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, Review, Order } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  ChevronLeft, 
  Share2, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  ShoppingCart,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  ChevronRight as ChevronRightIcon,
  Star,
  User,
  Send,
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userHasPurchased, setUserHasPurchased] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
      checkPurchaseStatus();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, 'products', id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        toast.error("Produto não encontrado");
        navigate('/');
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Erro ao carregar produto");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = () => {
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', id)
    );

    return onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Review[];
      setReviews(reviewsData);
    });
  };

  const checkPurchaseStatus = async () => {
    if (!auth.currentUser || !id) return;
    
    // Simplify query to avoid composite index
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', auth.currentUser.uid)
    );
    
    const { getDocs } = await import('firebase/firestore');
    const querySnapshot = await getDocs(q);
    const hasPurchased = querySnapshot.docs.some(doc => {
      const data = doc.data();
      return data.productId === id && ['paid', 'delivered'].includes(data.status);
    });
    setUserHasPurchased(hasPurchased);
  };

  const handleMessage = () => {
    if (!auth.currentUser) {
      toast.error("Faça login para enviar mensagens");
      return;
    }
    navigate('/chat');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !product) return;
    if (!newComment.trim()) {
      toast.error("Escreva um comentário");
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Usuário',
        userPhoto: auth.currentUser.photoURL || '',
        rating: newRating,
        comment: newComment,
        createdAt: new Date().toISOString(),
      });
      
      toast.success("Avaliação enviada com sucesso!");
      setNewComment('');
      setNewRating(5);
      setShowReviewForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Erro ao enviar avaliação");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "4.8"; // Default fallback

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </button>
        <div className="flex gap-2">
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Carousel */}
        <div className="space-y-4">
          <div className="aspect-square relative rounded-[40px] overflow-hidden bg-white border border-gray-100 shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImageIndex}
                src={product.images[currentImageIndex]} 
                alt={product.title} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-900" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-900" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === currentImageIndex ? "bg-green-600 w-4" : "bg-gray-300"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentImageIndex(i)}
                  className={cn(
                    "flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all",
                    i === currentImageIndex ? "border-green-600 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {product.category}
              </span>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-bold text-yellow-700">{averageRating}</span>
                <span className="text-[10px] text-yellow-600/60">({reviews.length})</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Clock className="w-3 h-3" /> Publicado hoje
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">{product.location}, Moçambique</span>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-gray-900">{formatCurrency(product.price)}</span>
              </div>
              {product.status === 'sold' && (
                <span className="px-4 py-1.5 bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest border border-red-200">
                  Vendido
                </span>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              <a 
                href={product.status === 'sold' ? undefined : `https://wa.me/${product.sellerPhone?.replace(/\D/g, '') || '258840000000'}?text=Olá! Tenho interesse no produto: ${product.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full py-4 text-white rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2",
                  product.status === 'sold' 
                    ? "bg-gray-400 cursor-not-allowed shadow-none pointer-events-none" 
                    : "bg-green-500 hover:bg-green-600 shadow-green-100"
                )}
              >
                <Phone className="w-5 h-5" />
                {product.status === 'sold' ? 'Produto Indisponível' : `WhatsApp (MultiVendas)`}
              </a>
              
              <button 
                onClick={handleMessage}
                disabled={product.status === 'sold'}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border-2",
                  product.status === 'sold' 
                    ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" 
                    : "bg-white text-green-600 border-green-100 hover:bg-green-50"
                )}
              >
                <MessageCircle className="w-5 h-5" />
                Chat no App
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-50 flex items-center gap-3 text-green-600">
              <ShieldCheck className="w-5 h-5" />
              <p className="text-xs font-medium">Negocie com Segurança pela Agência Linka Mais</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Descrição</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {product.description || "Nenhuma descrição detalhada fornecida para este produto."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Verificado</p>
                <p className="text-xs font-bold text-gray-900">Qualidade Garantida</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Delivery</p>
                <p className="text-xs font-bold text-gray-900">{product.delivery || 'A combinar'}</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-yellow-600 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Vendedor</p>
                <p className="text-xs font-bold text-gray-900">MultiVendas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="pt-8 border-t border-gray-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900">Avaliações</h2>
            <p className="text-sm text-gray-500">O que outros compradores dizem sobre este produto.</p>
          </div>
          {userHasPurchased && !showReviewForm && (
            <button 
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-xl font-bold text-sm hover:bg-green-100 transition-all"
            >
              Deixar Avaliação
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReviewForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 overflow-hidden"
            >
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Sua Avaliação</h3>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1"
                      >
                        <Star className={cn(
                          "w-6 h-6 transition-all",
                          star <= newRating ? "text-yellow-500 fill-yellow-500 scale-110" : "text-gray-300"
                        )} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Conte-nos sua experiência com este produto..."
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-green-500 min-h-[100px] outline-none transition-all"
                />
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 text-gray-500 font-bold text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-100 hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingReview ? "Enviando..." : "Publicar"}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={review.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userId}`} alt="" className="w-10 h-10 rounded-xl border border-gray-100" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{review.userName}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString('pt-MZ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={cn(
                        "w-3 h-3",
                        star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200"
                      )} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">"{review.comment}"</p>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 text-center py-12 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Ainda não há avaliações para este produto.</p>
              <p className="text-sm text-gray-400">Seja o primeiro a avaliar após sua compra!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
