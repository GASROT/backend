import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'node:crypto';

import { featuredBanners, products } from '../src/common/data/agroshop.seed';

const prisma = new PrismaClient();

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

async function seedUsers() {
  const users = [
    {
      id: 'customer-demo',
      name: 'Cliente AgroShop',
      email: 'cliente@agroshop.com.br',
      passwordHash: hashPassword('Cliente@12345', 'agroshop-customer-demo'),
      role: 'CUSTOMER' as const,
      profileType: 'PF' as const,
      document: '52998224725',
      emailVerified: true,
    },
    {
      id: 'admin-demo',
      name: 'Administrador AgroShop',
      email: 'admin@agroshop.com.br',
      passwordHash: hashPassword('Admin@12345', 'agroshop-admin-demo'),
      role: 'ADMIN' as const,
      profileType: 'PJ' as const,
      document: '11222333000181',
      emailVerified: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }
}

const productMedia = products.flatMap((product) => [
  {
    id: `${product.id}-hero`,
    productId: product.id,
    type: 'image' as const,
    title: product.packageSize,
  },
  {
    id: `${product.id}-application`,
    productId: product.id,
    type: 'video' as const,
    title: product.application.slice(0, 60),
  },
  {
    id: `${product.id}-sheet`,
    productId: product.id,
    type: 'image' as const,
    title: 'Ficha tecnica',
  },
]);

async function seedProducts() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        manufacturer: product.manufacturer,
        sku: product.sku,
        category: product.category,
        subcategory: product.subcategory,
        npk: product.npk,
        dosage: product.dosage,
        unit: product.unit,
        packageSize: product.packageSize,
        price: product.price,
        oldPrice: product.oldPrice,
        pmf: product.pmf,
        wholesalePrice: product.wholesalePrice,
        rating: product.rating,
        reviews: product.reviews,
        stock: product.stock,
        minMultiple: product.minMultiple,
        mapa: product.mapa,
        toxicClass: product.toxicClass,
        requiresAgronomistCpf: product.requiresAgronomistCpf,
        technicalSheetUrl: product.technicalSheetUrl,
        seasonalStartsAt: product.seasonalAvailability
          ? new Date(product.seasonalAvailability.startsAt)
          : null,
        seasonalEndsAt: product.seasonalAvailability
          ? new Date(product.seasonalAvailability.endsAt)
          : null,
        description: product.description,
        application: product.application,
        marker: product.marker,
      },
      create: {
        id: product.id,
        name: product.name,
        manufacturer: product.manufacturer,
        sku: product.sku,
        category: product.category,
        subcategory: product.subcategory,
        npk: product.npk,
        dosage: product.dosage,
        unit: product.unit,
        packageSize: product.packageSize,
        price: product.price,
        oldPrice: product.oldPrice,
        pmf: product.pmf,
        wholesalePrice: product.wholesalePrice,
        rating: product.rating,
        reviews: product.reviews,
        stock: product.stock,
        minMultiple: product.minMultiple,
        mapa: product.mapa,
        toxicClass: product.toxicClass,
        requiresAgronomistCpf: product.requiresAgronomistCpf,
        technicalSheetUrl: product.technicalSheetUrl,
        seasonalStartsAt: product.seasonalAvailability
          ? new Date(product.seasonalAvailability.startsAt)
          : null,
        seasonalEndsAt: product.seasonalAvailability
          ? new Date(product.seasonalAvailability.endsAt)
          : null,
        description: product.description,
        application: product.application,
        marker: product.marker,
      },
    });
  }

  for (const media of productMedia) {
    await prisma.productMedia.upsert({
      where: { id: media.id },
      update: media,
      create: media,
    });
  }

  for (const banner of featuredBanners) {
    await prisma.featuredBanner.upsert({
      where: { id: banner.id },
      update: {
        title: banner.title,
        subtitle: banner.subtitle,
        productId: banner.productId,
        discountLabel: banner.discountLabel,
        priority: banner.priority,
      },
      create: banner,
    });
  }
}

async function seedCart() {
  const items = [
    { productId: products[0].id, quantity: 2 },
    { productId: products[1].id, quantity: 1 },
    { productId: products[3].id, quantity: 3 },
  ];

  for (const item of items) {
    await prisma.cartItem.upsert({
      where: { productId: item.productId },
      update: { quantity: item.quantity },
      create: item,
    });
  }
}

async function seedOrders() {
  const orders = [
    {
      id: 'AG-2026-0831',
      status: 'CONFIRMADO' as const,
      createdAt: new Date('2026-08-23T14:12:00.000Z'),
      subtotal: 712.4,
      discount: 71.24,
      shipping: 0,
      total: 641.16,
      paymentMethod: 'Cartao de credito',
      shippingMethod: 'PAC Rural - 7 dias uteis',
      deliveryAddress: 'Estrada Rural Principal, Zona Agricola - Ribeirao Preto/SP',
      trackingCode: null,
      carrier: null,
      items: [
        { productId: products[0].id, quantity: 2, unitPrice: products[0].price },
        { productId: products[1].id, quantity: 1, unitPrice: products[1].price },
        { productId: products[3].id, quantity: 3, unitPrice: products[3].price },
      ],
    },
    {
      id: 'AG-2026-0794',
      status: 'ENVIADO' as const,
      createdAt: new Date('2026-08-18T09:20:00.000Z'),
      subtotal: 489.9,
      discount: 24.49,
      shipping: 26.9,
      total: 492.31,
      paymentMethod: 'PIX',
      shippingMethod: 'Jadlog Cooperativas - 4 dias uteis',
      deliveryAddress: 'Rodovia dos Produtores, km 18 - Londrina/PR',
      trackingCode: 'BR-JDL-94015522',
      carrier: 'Jadlog',
      items: [{ productId: products[6].id, quantity: 1, unitPrice: products[6].price }],
    },
    {
      id: 'AG-2026-0712',
      status: 'ENTREGUE' as const,
      createdAt: new Date('2026-08-02T11:00:00.000Z'),
      subtotal: 249.9,
      discount: 0,
      shipping: 34.5,
      total: 284.4,
      paymentMethod: 'Boleto bancario',
      shippingMethod: 'SEDEX Agronegocio - 2 dias uteis',
      deliveryAddress: 'Fazenda Boa Safra - Franca/SP',
      trackingCode: 'Entregue em 07/08/2026',
      carrier: 'Correios',
      items: [{ productId: products[4].id, quantity: 1, unitPrice: products[4].price }],
    },
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: {
        status: order.status,
        createdAt: order.createdAt,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod,
        deliveryAddress: order.deliveryAddress,
        trackingCode: order.trackingCode,
        carrier: order.carrier,
        items: {
          deleteMany: {},
          create: order.items,
        },
      },
      create: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod,
        deliveryAddress: order.deliveryAddress,
        trackingCode: order.trackingCode,
        carrier: order.carrier,
        items: {
          create: order.items,
        },
      },
    });
  }
}

async function main() {
  await seedUsers();
  await seedProducts();
  await seedCart();
  await seedOrders();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
