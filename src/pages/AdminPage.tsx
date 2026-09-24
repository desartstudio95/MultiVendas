import { useState, useEffect, useRef } from 'react';
import { Product, Category } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { MOCK_PRODUCTS, MOCK_PAGES } from '../mockData';
import { db, storage } from '../lib/firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  LayoutDashboard, 
  Package, 
  DollarSign, 
  Tag, 
  MapPin,
  Sparkles,
  Loader2, 
  X,
  CheckCircle2,
  XCircle,
  Search,
  Share2,
  FileText,
  Save,
  PlusCircle,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CATEGORIES = [
  { name: 'Carros', icon: 'Car' },
  { name: 'Moda', icon: 'Shirt' },
  { name: 'Eletrónicos', icon: 'Smartphone' },
  { name: 'Relógios', icon: 'Watch' },
  { name: 'Sapatos', icon: 'Footprints' },
  { name: 'Roupa Infantil', icon: 'Baby' },
  { name: 'Imóveis', icon: 'Home' },
  { name: 'Serviços', icon: 'Wrench' },
  { name: 'Alimentos', icon: 'Apple' },
  { name: 'Construção', icon: 'Construction' },
  { name: 'Escritório', icon: 'Briefcase' },
  { name: 'Ração', icon: 'Dog' },
  { name: 'Bebidas', icon: 'Beer' },
  { name: 'Cosméticos', icon: 'Sparkles' },
  { name: 'Sabonetes', icon: 'Droplets' },
  { name: 'Perfumes', icon: 'Flower' },
  { name: 'Brinquedos', icon: 'Gamepad2' },
  { name: 'Máquinas Industriais', icon: 'Factory' },
  { name: 'Outros', icon: 'Box' }
];

const PAGES_TO_EDIT = [
  { id: 'home', title: 'Home (Banner)' },
  { id: 'terms', title: 'Termos de Uso' },
  { id: 'how-to-buy', title: 'Como Comprar' },
  { id: 'security', title: 'Segurança' }
];

function PagesEditor() {
  const [activePage, setActivePage] = useState(PAGES_TO_EDIT[0].id);
  const [content, setContent] = useState('');
  const [homeData, setHomeData] = useState({ title: '', subtitle: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const pageDoc = await getDoc(doc(db, 'pages', activePage));
        if (pageDoc.exists()) {
          const data = pageDoc.data();
          if (activePage === 'home') {
            setHomeData({ title: data.title || '', subtitle: data.subtitle || '' });
          } else {
            setContent(data.content || '');
          }
        } else {
          // Fallback to empty if not found
          if (activePage === 'home') {
            setHomeData({ title: '', subtitle: '' });
          } else {
            setContent('');
          }
        }
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [activePage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = activePage === 'home' ? homeData : { content };
      await setDoc(doc(db, 'pages', activePage), {
        ...dataToSave,
        updatedAt: serverTimestamp()
      });
      toast.success("Página salva com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar a página: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {PAGES_TO_EDIT.map(page => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={cn(
              "px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors",
              activePage === page.id 
                ? "border-b-2 border-green-600 text-green-600" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            {page.title}
          </button>
        ))}
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {activePage === 'home' ? 'Editar Banner da Home' : 'Editar Conteúdo (Markdown)'}
              </h3>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Alterações
              </button>
            </div>
            
            {activePage === 'home' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Título (suporta HTML)</label>
                  <input
                    type="text"
                    value={homeData.title}
                    onChange={(e) => setHomeData({ ...homeData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subtítulo</label>
                  <input
                    type="text"
                    value={homeData.subtitle}
                    onChange={(e) => setHomeData({ ...homeData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo em Markdown..."
                className="w-full h-[500px] p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none font-mono text-sm"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'pages' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Outros',
    location: 'Maputo',
    delivery: 'Não disponível',
    imageUrls: [] as string[],
    sellerContacts: ['+258840000000'],
  });

  useEffect(() => {
    fetchProducts();
    fetchAppSettings();
  }, []);

  const fetchAppSettings = async () => {
    try {
      const configDoc = await getDoc(doc(db, 'config', 'app'));
      if (configDoc.exists()) {
        setIsMaintenance(configDoc.data().maintenance || false);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const toggleMaintenance = async () => {
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'config', 'app'), { 
        maintenance: !isMaintenance,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsMaintenance(!isMaintenance);
      toast.success(isMaintenance ? "Modo de manutenção desativado!" : "Modo de manutenção ativado!");
    } catch (error: any) {
      toast.error("Erro ao alterar configurações: " + error.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const firestoreProducts = querySnapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      })) as Product[];

      setProducts(firestoreProducts);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Erro ao carregar produtos do Firebase.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        location: formData.location,
        delivery: formData.delivery,
        images: formData.imageUrls.length > 0 ? formData.imageUrls : ['https://picsum.photos/seed/product/800/800'],
        sellerContacts: formData.sellerContacts,
        status: 'active',
        updatedAt: new Date().toISOString(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast.success("Produto atualizado no Firebase!");
      } else {
        const newDoc = {
          ...productData,
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'products'), newDoc);
        toast.success("Produto publicado no Firebase!");
      }

      await fetchProducts();
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'Outros',
        location: 'Maputo',
        delivery: 'Não disponível',
        imageUrls: [],
        sellerContacts: ['+258840000000'],
      });
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      location: product.location,
      delivery: product.delivery,
      imageUrls: product.images || [],
      sellerContacts: product.sellerContacts || ['+258840000000'],
    });
    setIsAdding(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success("Produto excluído do Firebase!");
      await fetchProducts();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const seedDatabase = async () => {
    if (!window.confirm("Isso irá enviar todos os produtos mockados para o Firebase. Continuar?")) return;
    setIsSeeding(true);
    try {
      for (const product of MOCK_PRODUCTS) {
        const { id, ...data } = product;
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Seed MOCK_PAGES
      for (const [key, value] of Object.entries(MOCK_PAGES)) {
        await setDoc(doc(db, 'pages', key), {
          ...value,
          updatedAt: serverTimestamp()
        });
      }

      toast.success("Firebase populado com sucesso!");
      await fetchProducts();
    } catch (error: any) {
      toast.error("Erro ao popular: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleMarkAsSold = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
    try {
      await updateDoc(doc(db, 'products', id), { status: newStatus });
      toast.success(`Status alterado para ${newStatus === 'sold' ? 'Vendido' : 'Ativo'}`);
      await fetchProducts();
    } catch (error: any) {
      toast.error("Erro ao alterar status: " + error.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    try {
      await updateDoc(doc(db, 'products', id), { status: newStatus });
      toast.success(`Produto ${newStatus === 'disabled' ? 'desativado' : 'ativado'}`);
      await fetchProducts();
    } catch (error: any) {
      toast.error("Erro ao alterar status: " + error.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.imageUrls.length + files.length > 10) {
      toast.error("Máximo de 10 imagens por produto");
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
      toast.success(`${urls.length} imagens carregadas com sucesso!`);
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, imageUrls: newImages });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-green-600" />
            Painel Administrativo
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-gray-500">Gerencie os produtos, serviços e páginas do MultiVendas</p>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={seedDatabase}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 text-sm"
            >
              {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-yellow-500" />}
              Popular Dados
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 text-sm"
            >
              <Plus className="w-5 h-5" />
              Adicionar Produto
            </button>
          </div>
        )}
      </header>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={cn(
            "pb-4 px-2 font-bold transition-colors border-b-2",
            activeTab === 'products' 
              ? "border-green-600 text-green-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
          )}
        >
          Produtos
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={cn(
            "pb-4 px-2 font-bold transition-colors border-b-2",
            activeTab === 'pages' 
              ? "border-green-600 text-green-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
          )}
        >
          Páginas
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            "pb-4 px-2 font-bold transition-colors border-b-2",
            activeTab === 'settings' 
              ? "border-green-600 text-green-600" 
              : "border-transparent text-gray-500 hover:text-gray-900"
          )}
        >
          Manutenção
        </button>
      </div>

      {activeTab === 'settings' ? (
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" />
                Configurações da Aplicação
              </h3>
              <p className="text-sm text-gray-500">Gerencie o status global do MultiVendas</p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold text-gray-900">Modo de Manutenção</p>
              <p className="text-xs text-gray-500">Quando ativado, os usuários verão uma tela de aviso e não poderão usar o app.</p>
            </div>
            <button
              onClick={toggleMaintenance}
              disabled={savingSettings}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50",
                isMaintenance ? "bg-green-600" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  isMaintenance ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          <div className="flex items-center gap-3 p-4 bg-orange-50 text-orange-700 rounded-2xl text-xs font-medium border border-orange-100">
            <AlertCircle className="w-5 h-5" />
            Atenção: Ativar o modo de manutenção desconectará todos os usuários das funcionalidades principais.
          </div>
        </div>
      ) : activeTab === 'pages' ? (
        <PagesEditor />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Produtos</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Valor em Estoque</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(products.reduce((acc, p) => acc + p.price, 0))}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Vendas Realizadas</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Produtos Publicados</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Filtrar..." className="pl-9 pr-4 py-1.5 bg-gray-50 border-none rounded-full text-xs" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{product.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {product.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                        product.status === 'active' ? "bg-green-100 text-green-600" : 
                        product.status === 'sold' ? "bg-yellow-100 text-yellow-600" :
                        "bg-gray-100 text-gray-500"
                      )}>
                        {product.status === 'active' ? 'Ativo' : 
                         product.status === 'sold' ? 'Vendido' : 'Desativado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleToggleStatus(product.id, product.status)}
                          className={cn(
                            "p-2 transition-colors",
                            product.status === 'disabled' ? "text-orange-600 hover:text-orange-700" : "text-gray-400 hover:text-orange-600"
                          )}
                          title={product.status === 'disabled' ? "Ativar Produto" : "Desativar Produto"}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Apagar Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            const url = `${window.location.origin}/product/${product.id}`;
                            const text = `Confira este produto na MultiVendas: ${product.title} por ${formatCurrency(product.price)}! ${url}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Partilhar no WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMarkAsSold(product.id, product.status)}
                          className={cn(
                            "p-2 transition-colors",
                            product.status === 'sold' ? "text-green-600 hover:text-green-700" : "text-gray-400 hover:text-green-600"
                          )}
                          title={product.status === 'sold' ? "Marcar como Ativo" : "Marcar como Vendido"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{editingId ? 'Editar Produto' : 'Adicionar Produto'}</h2>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setFormData({
                      title: '',
                      description: '',
                      price: '',
                      category: 'Outros',
                      location: 'Maputo',
                      delivery: 'Não disponível',
                      imageUrls: [],
                      sellerContacts: ['+258840000000'],
                    });
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitProduct} className="flex flex-col max-h-[80vh]">
                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Título do Produto</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: Toyota Hilux 2022"
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preço (MZN)</label>
                      <input 
                        required
                        type="number" 
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoria</label>
                        <select 
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Localização</label>
                        <input 
                          type="text" 
                          placeholder="Maputo"
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
                          value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery / Entrega</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
                        value={formData.delivery}
                        onChange={e => setFormData({...formData, delivery: e.target.value})}
                      >
                        <option value="Disponível">Disponível</option>
                        <option value="Não disponível">Não disponível</option>
                        <option value="A combinar">A combinar</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">WhatsApp de Contato (MultiVendas)</label>
                      {formData.sellerContacts.map((contact, index) => (
                        <div key={index} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="+258 84 000 0000"
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
                            value={contact}
                            onChange={e => {
                              const newContacts = [...formData.sellerContacts];
                              newContacts[index] = e.target.value;
                              setFormData({...formData, sellerContacts: newContacts});
                            }}
                          />
                          {formData.sellerContacts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newContacts = formData.sellerContacts.filter((_, i) => i !== index);
                                setFormData({...formData, sellerContacts: newContacts});
                              }}
                              className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {formData.sellerContacts.length < 4 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({...formData, sellerContacts: [...formData.sellerContacts, '']});
                          }}
                          className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                        >
                          <PlusCircle className="w-4 h-4" /> Adicionar outro contato
                        </button>
                      )}
                    </div>
                  </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Imagens do Produto</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <AnimatePresence>
                            {formData.imageUrls.map((url, index) => (
                              <motion.div 
                                key={url}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group"
                              >
                                <img src={url} alt={`Produto ${index + 1}`} className="w-full h-full object-cover" />
                                <button 
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                                {index === 0 && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-green-600/90 text-white text-[8px] font-bold py-1 text-center uppercase tracking-widest">
                                    Principal
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          {formData.imageUrls.length < 10 && (
                            <button 
                              type="button"
                              onClick={() => !isUploading && fileInputRef.current?.click()}
                              disabled={isUploading}
                              className={cn(
                                "aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-green-400 hover:bg-green-50/30 transition-all group disabled:opacity-50",
                                isUploading && "cursor-not-allowed"
                              )}
                            >
                              {isUploading ? (
                                <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-gray-300 group-hover:text-green-500" />
                                  <span className="text-[8px] font-bold text-gray-400 uppercase group-hover:text-green-600">Adicionar</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                        />
                        <p className="text-[8px] text-gray-400 mt-2 uppercase tracking-widest text-center">Arraste para reordenar (Em breve) | Máximo 10 imagens</p>
                      </div>
                    </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição Detalhada</label>
                  <textarea 
                    rows={4}
                    placeholder="Descreva as condições, especificações e diferenciais do produto..."
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition-all"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                </div>

                <div className="p-8 pt-4 border-t border-gray-100 flex gap-4 bg-white shrink-0">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      setFormData({
                        title: '',
                        description: '',
                        price: '',
                        category: 'Outros',
                        location: 'Maputo',
                        delivery: 'Não disponível',
                        imageUrls: [],
                        sellerContacts: ['+258840000000'],
                      });
                    }}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-xl shadow-green-100"
                  >
                    {editingId ? 'Salvar Alterações' : 'Adicionar Produto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}
