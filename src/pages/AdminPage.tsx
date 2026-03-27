import { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Product, Category } from '../types';
import { formatCurrency, cn } from '../lib/utils';
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
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const CATEGORIES = [
  { name: 'Carros', icon: 'Car' },
  { name: 'Moda', icon: 'Shirt' },
  { name: 'Eletrónicos', icon: 'Smartphone' },
  { name: 'Imóveis', icon: 'Home' },
  { name: 'Serviços', icon: 'Wrench' },
  { name: 'Alimentos', icon: 'Apple' },
  { name: 'Construção', icon: 'Construction' },
  { name: 'Escritório', icon: 'Briefcase' },
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
        const docRef = doc(db, 'pages', activePage);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          if (activePage === 'home') {
            setHomeData(docSnap.data() as any);
          } else {
            setContent(docSnap.data().content);
          }
        } else {
          if (activePage === 'home') {
            setHomeData({
              title: 'O que você está <br /> <span className="text-orange-500">procurando hoje?</span>',
              subtitle: 'Tudo o que procuras, num só lugar'
            });
          } else {
            setContent('');
          }
        }
      } catch (error) {
        console.error("Error fetching page:", error);
        toast.error("Erro ao carregar página");
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [activePage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = activePage === 'home' 
        ? { ...homeData, updatedAt: new Date().toISOString() }
        : { content, updatedAt: new Date().toISOString() };
        
      await setDoc(doc(db, 'pages', activePage), dataToSave, { merge: true });
      toast.success("Página salva com sucesso!");
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error("Erro ao salvar página");
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
  const [activeTab, setActiveTab] = useState<'products' | 'pages'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Outros',
    location: 'Maputo',
    delivery: 'Não disponível',
    imageUrl: '',
    sellerContacts: ['+258840000000'],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.imageUrl) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const validContacts = formData.sellerContacts.filter(c => c.trim() !== '');
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          location: formData.location,
          delivery: formData.delivery,
          sellerContacts: validContacts,
          images: [formData.imageUrl],
          updatedAt: new Date().toISOString(),
        });
        toast.success("Produto atualizado com sucesso!");
      } else {
        await addDoc(collection(db, 'products'), {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          location: formData.location,
          delivery: formData.delivery,
          sellerContacts: validContacts,
          images: [formData.imageUrl],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        toast.success("Produto publicado com sucesso!");
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'Outros',
        location: 'Maputo',
        delivery: 'Não disponível',
        imageUrl: '',
        sellerContacts: ['+258840000000'],
      });
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    }
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      location: product.location,
      delivery: product.delivery || 'Não disponível',
      imageUrl: product.images[0] || '',
      sellerContacts: product.sellerContacts?.length ? product.sellerContacts : (product.sellerPhone ? [product.sellerPhone] : ['+258840000000']),
    });
    setEditingId(product.id);
    setIsAdding(true);
  };

  const handleDeleteProduct = async (id: string) => {
    toast("Tem certeza que deseja excluir este produto?", {
      action: {
        label: "Excluir",
        onClick: async () => {
          try {
            await deleteDoc(doc(db, 'products', id));
            toast.success("Produto excluído");
            fetchProducts();
          } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Erro ao excluir produto");
          }
        }
      }
    });
  };

  const seedDatabase = async () => {
    toast("Isso irá adicionar 27 produtos de exemplo ao banco de dados. Continuar?", {
      action: {
        label: "Popular",
        onClick: async () => {
          setIsSeeding(true);
          const seedProducts = [
            // Carros
            { title: "Toyota Hilux 2022", price: 2500000, category: "Carros", location: "Maputo", description: "Excelente estado, baixa quilometragem.", imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800" },
            { title: "Ford Ranger 2021", price: 1800000, category: "Carros", location: "Matola", description: "4x4, diesel, manutenção em dia.", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800" },
            { title: "Nissan NP300", price: 950000, category: "Carros", location: "Beira", description: "Ideal para trabalho, motor robusto.", imageUrl: "https://images.unsplash.com/photo-1591860454448-58183f0f042f?auto=format&fit=crop&q=80&w=800" },
            
            // Moda
            { title: "Ténis Nike Air Max", price: 7500, category: "Moda", location: "Maputo", description: "Original, vários tamanhos disponíveis.", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
            { title: "Relógio Casio G-Shock", price: 4500, category: "Moda", location: "Matola", description: "Resistente à água, original.", imageUrl: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=800" },
            { title: "Vestido de Verão", price: 1500, category: "Moda", location: "Nampula", description: "Tecido leve, várias cores.", imageUrl: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800" },
            
            // Eletrónicos
            { title: "iPhone 13 Pro Max", price: 85000, category: "Eletrónicos", location: "Maputo", description: "128GB, Saúde da bateria 95%.", imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800" },
            { title: "MacBook Air M1", price: 65000, category: "Eletrónicos", location: "Maputo", description: "8GB RAM, 256GB SSD, como novo.", imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ec696e5237?auto=format&fit=crop&q=80&w=800" },
            { title: "Smart TV Samsung 55\"", price: 42000, category: "Eletrónicos", location: "Matola", description: "4K UHD, Smart Hub.", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800" },
            
            // Imóveis
            { title: "Apartamento T3 Polana", price: 12000000, category: "Imóveis", location: "Maputo", description: "Vista ao mar, segurança 24h.", imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800" },
            { title: "Vivenda T4 Sommerschield", price: 25000000, category: "Imóveis", location: "Maputo", description: "Com piscina e jardim amplo.", imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800" },
            { title: "Terreno 20x40 Matola", price: 850000, category: "Imóveis", location: "Matola", description: "Documentação em dia, vedado.", imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800" },
            
            // Serviços
            { title: "Manutenção de AC", price: 1500, category: "Serviços", location: "Maputo", description: "Limpeza e carregamento de gás.", imageUrl: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=800" },
            { title: "Pintura Residencial", price: 5000, category: "Serviços", location: "Matola", description: "Mão de obra qualificada.", imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800" },
            { title: "Consultoria de TI", price: 2500, category: "Serviços", location: "Maputo", description: "Suporte e redes.", imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" },
            
            // Alimentos
            { title: "Cesto de Frutas Tropicais", price: 1200, category: "Alimentos", location: "Maputo", description: "Frutas frescas da época.", imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800" },
            { title: "Saco de Arroz 25kg", price: 1450, category: "Alimentos", location: "Matola", description: "Arroz de primeira qualidade.", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800" },
            { title: "Óleo de Cozinha 5L", price: 650, category: "Alimentos", location: "Beira", description: "Óleo vegetal puro.", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800" },
            
            // Construção
            { title: "Cimento Portland 50kg", price: 650, category: "Construção", location: "Matola", description: "Alta resistência.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800" },
            { title: "Barra de Ferro 12mm", price: 450, category: "Construção", location: "Maputo", description: "Ferro de construção civil.", imageUrl: "https://images.unsplash.com/photo-1533035353720-f1c6a75cd8ab?auto=format&fit=crop&q=80&w=800" },
            { title: "Areia de Construção (m3)", price: 1200, category: "Construção", location: "Matola", description: "Areia lavada.", imageUrl: "https://images.unsplash.com/photo-1530124560677-bdaea024f061?auto=format&fit=crop&q=80&w=800" },
            
            // Escritório
            { title: "Cadeira Ergonómica", price: 12500, category: "Escritório", location: "Maputo", description: "Ideal para home office.", imageUrl: "https://images.unsplash.com/photo-1505797149-43b007664973?auto=format&fit=crop&q=80&w=800" },
            { title: "Secretária de Madeira", price: 8500, category: "Escritório", location: "Matola", description: "Design moderno, 120x60cm.", imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800" },
            { title: "Impressora HP Laserjet", price: 14000, category: "Escritório", location: "Maputo", description: "Impressão rápida, Wi-Fi.", imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800" },
            
            // Outros
            { title: "Bicicleta de Montanha", price: 12000, category: "Outros", location: "Maputo", description: "21 velocidades, suspensão frontal.", imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800" },
            { title: "Guitarra Acústica", price: 6500, category: "Outros", location: "Matola", description: "Cordas de aço, excelente som.", imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800" },
            { title: "Kit de Ferramentas 100pcs", price: 3500, category: "Outros", location: "Beira", description: "Completo para casa.", imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=800" }
          ];
      
          try {
            for (const p of seedProducts) {
              await addDoc(collection(db, 'products'), {
                ...p,
                delivery: 'Disponível',
                images: [p.imageUrl],
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
            toast.success("Banco de dados populado com sucesso!");
            fetchProducts();
          } catch (error) {
            console.error("Error seeding database:", error);
            toast.error("Erro ao popular banco de dados");
          } finally {
            setIsSeeding(false);
          }
        }
      }
    });
  };

  const handleMarkAsSold = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
      await updateDoc(doc(db, 'products', id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(newStatus === 'sold' ? "Produto marcado como vendido" : "Produto marcado como ativo");
      fetchProducts();
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Erro ao atualizar status do produto");
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-green-600" />
            Painel Administrativo
          </h1>
          <p className="text-sm text-gray-500">Gerencie os produtos, serviços e páginas do MultiVendas</p>
        </div>
        {activeTab === 'products' && (
          <div className="flex gap-2">
            <button 
              onClick={seedDatabase}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-yellow-500" />}
              Popular Dados
            </button>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
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
      </div>

      {activeTab === 'pages' ? (
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
                        product.status === 'active' ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                      )}>
                        {product.status === 'active' ? 'Ativo' : 'Vendido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      imageUrl: '',
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
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Imagem do Produto</label>
                      <div className="relative group aspect-video bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                        {formData.imageUrl ? (
                          <>
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, imageUrl: ''})}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-4">
                            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Nenhuma imagem selecionada</p>
                          </div>
                        )}
                      </div>
                      <input 
                        type="url" 
                        placeholder="Cole a URL da imagem aqui..."
                        className="w-full px-4 py-2 mt-2 bg-gray-50 border-none rounded-xl text-xs"
                        value={formData.imageUrl}
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      />
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
                        imageUrl: '',
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
