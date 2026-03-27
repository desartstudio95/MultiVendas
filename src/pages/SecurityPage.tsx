import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Markdown from 'react-markdown';

export default function SecurityPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'pages', 'security');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content);
        } else {
          setContent(`
### Comunicação Segura
Todas as conversas com a nossa equipe são protegidas. Use nosso chat interno para garantir que sua negociação seja registrada com segurança.

### Privacidade de Dados
Sua privacidade é nossa prioridade. Não compartilhamos suas informações pessoais com terceiros sem o seu consentimento explícito.

### Venda Direta MultiVendas
Todos os produtos são vendidos e garantidos diretamente pela MultiVendas, assegurando a qualidade e procedência de cada item.

### Suporte ao Cliente
Nossa equipe de suporte está sempre disponível para ajudar em caso de dúvidas ou problemas durante suas negociações.

## Dicas de Segurança
- Sempre use o chat interno do MultiVendas ou nosso WhatsApp oficial para se comunicar com nossa equipe.
- Desconfie de ofertas enviadas por terceiros se passando pela MultiVendas.
- A entrega é feita diretamente por nossos entregadores parceiros.
- Verifique o produto cuidadosamente no ato da entrega antes de confirmar o recebimento.
          `);
        }
      } catch (error) {
        console.error("Error fetching security:", error);
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
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Segurança no MultiVendas</h1>
        <p className="text-gray-500 mt-2 font-medium">Sua segurança é o nosso compromisso número um.</p>
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
