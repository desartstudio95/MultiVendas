import { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Markdown from 'react-markdown';

export default function HowToBuyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'pages', 'how-to-buy');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content);
        } else {
          setContent(`
### 1. Encontre o Produto
Use a barra de pesquisa ou navegue pelas categorias para encontrar o que você precisa. Filtre por localização e preço para melhores resultados.

### 2. Fale Conosco
Use nosso chat integrado ou WhatsApp para tirar dúvidas, negociar o preço e combinar os detalhes da entrega.

### 3. Combine a Entrega
Clique em 'WhatsApp' ou 'Chat no App' para iniciar a conversa com nossa equipe. Combine os detalhes da entrega.

### 4. Compre com Segurança
Todos os produtos são vendidos diretamente pela MultiVendas, garantindo a sua segurança e a qualidade do produto.

### 5. Receba e Avalie
Após receber o produto, confirme a entrega e deixe sua avaliação. Sua opinião é muito importante para nós.
          `);
        }
      } catch (error) {
        console.error("Error fetching how to buy:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Como Comprar</h1>
        <p className="text-gray-500 mt-2 font-medium">Siga este guia simples para realizar suas compras com segurança.</p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-8 md:p-12 shadow-sm space-y-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : (
          <div className="markdown-body prose prose-green max-w-none">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
