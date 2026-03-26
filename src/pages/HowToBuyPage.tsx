import { ShoppingCart, Search, MessageCircle, ShieldCheck, CheckCircle2, Package } from 'lucide-react';

export default function HowToBuyPage() {
  const steps = [
    {
      icon: Search,
      title: "Encontre o Produto",
      description: "Use a barra de pesquisa ou navegue pelas categorias para encontrar o que você precisa. Filtre por localização e preço para melhores resultados."
    },
    {
      icon: MessageCircle,
      title: "Fale Conosco",
      description: "Use nosso chat integrado ou WhatsApp para tirar dúvidas, negociar o preço e combinar os detalhes da entrega."
    },
    {
      icon: MessageCircle,
      title: "Combine a Entrega",
      description: "Clique em 'WhatsApp' ou 'Chat no App' para iniciar a conversa com nossa equipe. Combine os detalhes da entrega."
    },
    {
      icon: ShieldCheck,
      title: "Compre com Segurança",
      description: "Todos os produtos são vendidos diretamente pela MultiVendas, garantindo a sua segurança e a qualidade do produto."
    },
    {
      icon: CheckCircle2,
      title: "Receba e Avalie",
      description: "Após receber o produto, confirme a entrega e deixe sua avaliação. Sua opinião é muito importante para nós."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Como Comprar</h1>
        <p className="text-gray-500 mt-2 font-medium">Siga este guia simples para realizar suas compras com segurança.</p>
      </div>

      <div className="space-y-12">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center text-green-600 font-bold text-xl">
              <step.icon className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-green-600 rounded-[40px] text-white text-center space-y-4">
        <h2 className="text-2xl font-bold">Pronto para começar?</h2>
        <p className="opacity-90">Milhares de produtos esperam por você no MultiVendas.</p>
        <button className="px-8 py-3 bg-white text-green-600 rounded-2xl font-bold hover:bg-gray-100 transition-all">
          Explorar Produtos
        </button>
      </div>
    </div>
  );
}
