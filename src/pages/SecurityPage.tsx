import { ShieldCheck, Lock, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Comunicação Segura",
      description: "Todas as conversas com a nossa equipe são protegidas. Use nosso chat interno para garantir que sua negociação seja registrada com segurança."
    },
    {
      icon: Eye,
      title: "Privacidade de Dados",
      description: "Sua privacidade é nossa prioridade. Não compartilhamos suas informações pessoais com terceiros sem o seu consentimento explícito."
    },
    {
      icon: CheckCircle2,
      title: "Venda Direta MultiVendas",
      description: "Todos os produtos são vendidos e garantidos diretamente pela MultiVendas, assegurando a qualidade e procedência de cada item."
    },
    {
      icon: AlertCircle,
      title: "Suporte ao Cliente",
      description: "Nossa equipe de suporte está sempre disponível para ajudar em caso de dúvidas ou problemas durante suas negociações."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Segurança no MultiVendas</h1>
        <p className="text-gray-500 mt-2 font-medium">Sua segurança é o nosso compromisso número um.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gray-50 p-8 rounded-[40px] border border-gray-100 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center">Dicas de Segurança</h2>
        <ul className="space-y-4 text-gray-600">
          <li className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>Sempre use o chat interno do MultiVendas ou nosso WhatsApp oficial para se comunicar com nossa equipe.</span>
          </li>
          <li className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>Desconfie de ofertas enviadas por terceiros se passando pela MultiVendas.</span>
          </li>
          <li className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>A entrega é feita diretamente por nossos entregadores parceiros.</span>
          </li>
          <li className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0 mt-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span>Verifique o produto cuidadosamente no ato da entrega antes de confirmar o recebimento.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
