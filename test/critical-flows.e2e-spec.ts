import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { CheckoutController } from '../src/modules/checkout/checkout.controller';
import { CheckoutService } from '../src/modules/checkout/checkout.service';
import { OrdersController } from '../src/modules/orders/orders.controller';
import { OrdersService } from '../src/modules/orders/orders.service';

describe('Critical HTTP flows (e2e)', () => {
  let app: INestApplication;

  const authService = {
    login: jest.fn().mockResolvedValue({ user: { id: 'user-1' }, tokens: { accessToken: 'token' } }),
  };
  const checkoutService = {
    confirmOrder: jest.fn().mockResolvedValue({ id: 'AG-2026-100001', status: 'PENDENTE' }),
  };
  const ordersService = {
    cancelOrder: jest.fn().mockResolvedValue({ id: 'AG-2026-100001', status: 'CANCELADO' }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, CheckoutController, OrdersController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CheckoutService, useValue: checkoutService },
        { provide: OrdersService, useValue: ordersService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('logs in through the public API contract', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'cliente@agroshop.com.br', password: 'senha-segura' })
      .expect(201)
      .expect(({ body }) => expect(body.user.id).toBe('user-1'));
  });

  it('creates an order through the checkout API contract', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/checkout/orders')
      .send({ paymentMethod: 'pix', shippingMethod: 'pac', deliveryCep: '14000000' })
      .expect(201)
      .expect(({ body }) => expect(body.status).toBe('PENDENTE'));
  });

  it('cancels an eligible order through the orders API contract', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/orders/AG-2026-100001/cancel')
      .expect(201)
      .expect(({ body }) => expect(body.status).toBe('CANCELADO'));
  });
});
