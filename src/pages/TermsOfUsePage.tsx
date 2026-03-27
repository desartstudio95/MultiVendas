import { useState, useEffect } from 'react';
import { ShieldCheck, FileText, HelpCircle, Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Markdown from 'react-markdown';

export default function TermsOfUsePage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'pages', 'terms');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data().content);
        } else {
          setContent(`
## 1. Aceitação dos Termos
Ao acessar e usar o MultiVendas, você concorda em cumprir e ser regido por estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma.

## 2. Cadastro de Usuário
Para utilizar certas funcionalidades, como enviar mensagens ou realizar compras, é necessário criar uma conta. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.

## 3. Nossos Produtos
A MultiVendas é a única vendedora autorizada na plataforma. Garantimos a veracidade das informações em nossos anúncios e a qualidade de todos os produtos oferecidos.

## 4. Transações e Pagamentos
O MultiVendas atua como uma loja virtual direta. Todas as transações financeiras devem ser realizadas através dos nossos canais oficiais de pagamento ou no ato da entrega, conforme combinado com nossa equipe.

## 5. Modificações
Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações entrarão em vigor imediatamente após sua publicação no site.
          `);
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Termos de Uso</h1>
        <p className="text-gray-500 mt-2 font-medium">Leia atentamente as regras da nossa plataforma.</p>
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
