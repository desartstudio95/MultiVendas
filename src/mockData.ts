import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Toyota Corolla 2022',
    description: 'Carro em excelente estado, pouco uso.',
    price: 1200000,
    category: 'Carros',
    location: 'Maputo',
    delivery: 'Disponível',
    images: ['https://images.unsplash.com/photo-1623859627398-28f1b9cb98aa?auto=format&fit=crop&q=80&w=800'],
    sellerContacts: ['+258840000000'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max',
    description: 'Novo, na caixa, 256GB.',
    price: 95000,
    category: 'Eletrónicos',
    location: 'Matola',
    delivery: 'Disponível',
    images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800'],
    sellerContacts: ['+258840000000'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Vestido de Verão',
    description: 'Tamanho M, várias cores disponíveis.',
    price: 1500,
    category: 'Moda',
    location: 'Beira',
    delivery: 'A combinar',
    images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=800'],
    sellerContacts: ['+258840000000'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Relógio Luxo Quartz',
    description: 'Relógio elegante para ocasiões especiais. Resistente à água.',
    price: 3500,
    category: 'Relógios',
    location: 'Maputo',
    delivery: 'Disponível',
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800'],
    sellerContacts: ['+258840000000'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Ténis Desportivo Pro',
    description: 'Confortável e leve, ideal para corridas e caminhadas.',
    price: 4500,
    category: 'Sapatos',
    location: 'Matola',
    delivery: 'Disponível',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'],
    sellerContacts: ['+258840000000'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Conjunto Bebé Algodão',
    description: 'Roupa macia e confortável para bebés de 0 a 6 meses.',
    price: 1200,
    category: 'Roupa Infantil',
    location: 'Xai-Xai',
    delivery: 'A combinar',
    images: ['https://images.unsplash.com/photo-1519705380843-04800064c392?auto=format&fit=crop&q=80&w=800'],
    sellerContacts: ['+258840000000'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const MOCK_PAGES = {
  home: {
    title: 'O que você está <br /> <span className="text-orange-500">procurando hoje?</span>',
    subtitle: 'Tudo o que procuras, num só lugar'
  },
  terms: {
    content: '# Termos de Uso\n\nEstes são os termos de uso do MultiVendas...'
  },
  howToBuy: {
    content: '# Como Comprar\n\nPara comprar no MultiVendas, siga estes passos...'
  },
  security: {
    content: '# Segurança\n\nSua segurança é nossa prioridade...'
  }
};
