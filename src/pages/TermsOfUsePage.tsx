import { ShieldCheck, FileText, HelpCircle } from 'lucide-react';

export default function TermsOfUsePage() {
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
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">1. Aceitação dos Termos</h2>
          <p className="text-gray-600 leading-relaxed">
            Ao acessar e usar o MultiVendas, você concorda em cumprir e ser regido por estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">2. Cadastro de Usuário</h2>
          <p className="text-gray-600 leading-relaxed">
            Para utilizar certas funcionalidades, como enviar mensagens ou realizar compras, é necessário criar uma conta. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">3. Nossos Produtos</h2>
          <p className="text-gray-600 leading-relaxed">
            A MultiVendas é a única vendedora autorizada na plataforma. Garantimos a veracidade das informações em nossos anúncios e a qualidade de todos os produtos oferecidos.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">4. Transações e Pagamentos</h2>
          <p className="text-gray-600 leading-relaxed">
            O MultiVendas atua como uma loja virtual direta. Todas as transações financeiras devem ser realizadas através dos nossos canais oficiais de pagamento ou no ato da entrega, conforme combinado com nossa equipe.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">5. Modificações</h2>
          <p className="text-gray-600 leading-relaxed">
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações entrarão em vigor imediatamente após sua publicação no site.
          </p>
        </section>
      </div>
    </div>
  );
}
