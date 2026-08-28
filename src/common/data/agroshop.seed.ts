export type ProductCategory =
  | 'fertilizante'
  | 'defensivo'
  | 'semente'
  | 'irrigacao'
  | 'maquinario'
  | 'nutricao';

export type Product = {
  id: string;
  name: string;
  manufacturer: string;
  sku: string;
  category: ProductCategory;
  subcategory: string;
  npk?: string;
  dosage: string;
  unit: 'kg' | 'L' | 'sc' | 'un';
  packageSize: string;
  price: number;
  oldPrice?: number;
  pmf?: number;
  wholesalePrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  minMultiple: number;
  mapa?: string;
  toxicClass?: 'I' | 'II' | 'III' | 'IV';
  requiresAgronomistCpf: boolean;
  technicalSheetUrl: string;
  seasonalAvailability?: {
    startsAt: string;
    endsAt: string;
  };
  description: string;
  application: string;
  marker: string;
};

export const products: Product[] = [
  {
    id: 'ureia-46-50kg',
    name: 'Ureia Granulada 46% N',
    manufacturer: 'Yara Brasil',
    sku: 'AGR-FER-URE-50',
    category: 'fertilizante',
    subcategory: 'Nitrogenado',
    npk: '46-0-0',
    dosage: '80 a 250 kg/ha conforme cultura e analise de solo',
    unit: 'sc',
    packageSize: 'Saco 50kg',
    price: 138.9,
    oldPrice: 178,
    pmf: 119.9,
    wholesalePrice: 129.9,
    rating: 4.3,
    reviews: 218,
    stock: 847,
    minMultiple: 1,
    requiresAgronomistCpf: false,
    technicalSheetUrl: 'https://cdn.agroshop.local/fichas/ureia-46.pdf',
    description: 'Fonte concentrada de nitrogenio para cobertura e arranque vegetativo.',
    application: 'Aplicar em solo com umidade adequada e incorporar quando recomendado.',
    marker: 'N',
  },
  {
    id: 'superfosfato-50kg',
    name: 'Superfosfato Simples',
    manufacturer: 'Mosaic',
    sku: 'AGR-FER-SFS-50',
    category: 'fertilizante',
    subcategory: 'Fosfatado',
    npk: '0-18-0',
    dosage: '150 a 450 kg/ha conforme extracao da cultura',
    unit: 'sc',
    packageSize: 'Saco 50kg',
    price: 74.9,
    oldPrice: 88,
    pmf: 69.9,
    wholesalePrice: 70.9,
    rating: 4.6,
    reviews: 132,
    stock: 41,
    minMultiple: 1,
    requiresAgronomistCpf: false,
    technicalSheetUrl: 'https://cdn.agroshop.local/fichas/superfosfato-simples.pdf',
    description: 'Fertilizante fosfatado com calcio e enxofre para correcao nutricional.',
    application: 'Usar preferencialmente no sulco de plantio ou em pre-plantio.',
    marker: 'P',
  },
  {
    id: 'map-25kg',
    name: 'MAP Fosfato Monoamonico',
    manufacturer: 'Heringer',
    sku: 'AGR-FER-MAP-25',
    category: 'fertilizante',
    subcategory: 'Fosfatado',
    npk: '11-52-0',
    dosage: '70 a 220 kg/ha no plantio',
    unit: 'sc',
    packageSize: 'Saco 25kg',
    price: 129,
    pmf: 118,
    wholesalePrice: 121,
    rating: 4.8,
    reviews: 96,
    stock: 12,
    minMultiple: 1,
    requiresAgronomistCpf: false,
    technicalSheetUrl: 'https://cdn.agroshop.local/fichas/map-11-52.pdf',
    description: 'Alta concentracao de fosforo com nitrogenio amoniacal.',
    application: 'Indicado para plantio de graos e culturas de alta demanda inicial.',
    marker: 'MAP',
  },
  {
    id: 'kcl-50kg',
    name: 'KCL Cloreto de Potassio',
    manufacturer: 'Vale Fertilizantes',
    sku: 'AGR-FER-KCL-50',
    category: 'fertilizante',
    subcategory: 'Potassico',
    npk: '0-0-60',
    dosage: '60 a 180 kg/ha conforme potassio disponivel',
    unit: 'sc',
    packageSize: 'Saco 50kg',
    price: 119.9,
    pmf: 108,
    wholesalePrice: 112,
    rating: 4.1,
    reviews: 74,
    stock: 0,
    minMultiple: 1,
    requiresAgronomistCpf: false,
    technicalSheetUrl: 'https://cdn.agroshop.local/fichas/kcl-60.pdf',
    description: 'Fonte padrao de potassio para manutencao e reposicao de nutrientes.',
    application: 'Aplicar em cobertura ou pre-plantio conforme recomendacao tecnica.',
    marker: 'K',
  },
  {
    id: 'fungicida-iv-5l',
    name: 'Fungicida Foliar Classe IV',
    manufacturer: 'CropShield',
    sku: 'AGR-DEF-FUN-05',
    category: 'defensivo',
    subcategory: 'Fungicida',
    dosage: '0,4 a 0,8 L/ha',
    unit: 'L',
    packageSize: 'Galao 5L',
    price: 249.9,
    pmf: 230,
    rating: 4.2,
    reviews: 51,
    stock: 8,
    minMultiple: 1,
    mapa: 'SP-004581/2026',
    toxicClass: 'IV',
    requiresAgronomistCpf: false,
    technicalSheetUrl: 'https://cdn.agroshop.local/fichas/fungicida-iv.pdf',
    description: 'Defensivo registrado no MAPA para manejo preventivo de doencas foliares.',
    application: 'Aplicar com EPI completo e seguir receituario agronomico.',
    marker: 'IV',
  },
  {
    id: 'inseticida-classe-ii',
    name: 'Inseticida Sistemico Classe II',
    manufacturer: 'BioCrop',
    sku: 'AGR-DEF-INS-01',
    category: 'defensivo',
    subcategory: 'Inseticida',
    dosage: '0,2 a 0,6 L/ha',
    unit: 'L',
    packageSize: 'Frasco 1L',
    price: 189.9,
    pmf: 175,
    rating: 4.0,
    reviews: 27,
    stock: 19,
    minMultiple: 1,
    mapa: 'BR-009812/2026',
    toxicClass: 'II',
    requiresAgronomistCpf: true,
    technicalSheetUrl: 'https://cdn.agroshop.local/fichas/inseticida-classe-ii.pdf',
    description: 'Produto de uso controlado, condicionado a responsavel tecnico validado.',
    application: 'Venda bloqueada sem CPF/CREA de engenheiro agronomo responsavel.',
    marker: 'II',
  },
  {
    id: 'milho-hibrido',
    name: 'Semente Milho Hibrido AGX',
    manufacturer: 'AgroGen',
    sku: 'AGR-SEM-MIL-60K',
    category: 'semente',
    subcategory: 'Graos',
    dosage: '55 a 65 mil sementes/ha',
    unit: 'sc',
    packageSize: '60 mil sementes',
    price: 489.9,
    oldPrice: 529.9,
    pmf: 450,
    wholesalePrice: 465,
    rating: 4.9,
    reviews: 303,
    stock: 64,
    minMultiple: 1,
    requiresAgronomistCpf: false,
    technicalSheetUrl: 'https://cdn.agroshop.local/fichas/milho-hibrido-agx.pdf',
    seasonalAvailability: {
      startsAt: '2026-07-01',
      endsAt: '2026-11-30',
    },
    description: 'Hibrido de alto teto produtivo para safra e safrinha.',
    application: 'Regular populacao conforme altitude, fertilidade e regime hidrico.',
    marker: 'S',
  },
];

export const featuredBanners = [
  {
    id: 'banner-ureia',
    title: 'Ureia 46% N',
    subtitle: 'Saco 50kg - Yara Brasil - frete gratis acima de R$ 500',
    productId: 'ureia-46-50kg',
    discountLabel: '-22%',
    priority: 1,
  },
  {
    id: 'banner-milho',
    title: 'Sementes para safra 2026',
    subtitle: 'Hibridos AGX com disponibilidade sazonal controlada',
    productId: 'milho-hibrido',
    discountLabel: '-8%',
    priority: 2,
  },
  {
    id: 'banner-defensivos',
    title: 'Defensivos com registro MAPA',
    subtitle: 'Filtros por classe toxicologica e compra com regra tecnica',
    productId: 'fungicida-iv-5l',
    discountLabel: 'MAPA',
    priority: 3,
  },
];

