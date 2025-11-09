import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';

import app from '../../app.js';
import { db } from '../../infra/db.js';

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('tasks').del();
});

afterAll(async () => {
  await db.destroy();
});

describe('Tasks API', () => {
  it('creates and lists tasks', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Primera tarea', description: 'Detalle' })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      title: 'Primera tarea',
      description: 'Detalle',
      status: 'pending',
    });

    const listResponse = await request(app).get('/api/tasks').expect(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      title: 'Primera tarea',
      status: 'pending',
    });
  });

  it('updates task status with valid transition', async () => {
    const { body: created } = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task', status: 'pending' })
      .expect(201);

    const { body: updated } = await request(app)
      .put(`/api/tasks/${created.id}/status`)
      .send({ status: 'in_progress' })
      .expect(200);

    expect(updated.status).toBe('in_progress');
  });

  it('returns 409 on invalid transition', async () => {
    const { body: created } = await request(app)
      .post('/api/tasks')
      .send({ title: 'Task' })
      .expect(201);

    await request(app).put(`/api/tasks/${created.id}/status`).send({ status: 'done' }).expect(200);

    const response = await request(app)
      .put(`/api/tasks/${created.id}/status`)
      .send({ status: 'pending' })
      .expect(409);

    expect(response.body.code).toBe('INVALID_TRANSITION');
  });
});
