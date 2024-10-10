
const request = require('supertest');
const fs = require('fs-extra');
const app = require('./src/app'); // Importa tu aplicación

const filePath = 'users.json';

beforeAll(async () => {
  // Asegúrate de que el archivo de usuarios esté vacío antes de cada prueba
  await fs.writeJson(filePath, []);
});

describe('API de Usuarios', () => {
  test('GET /usuarios - debería devolver una lista vacía inicialmente', async () => {
    const response = await request(app).get('/usuarios');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('POST /usuarios - debería crear un nuevo usuario válido', async () => {
    const newUser = {
      nombre: 'Juan Pérez',
      correo: 'juan.perez@example.com',
      contraseña: 'Password1!',
      edad: 30,
      pais: 'Chile',
      telefono: '+56-123-456-7890'
    };

    const response = await request(app).post('/usuarios').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(newUser);
  });

  test('POST /usuarios - debería devolver error si faltan campos obligatorios', async () => {
    const newUser = {
      correo: 'incompleto@example.com',
      contraseña: 'Password1!',
      pais: 'Chile'
    };

    const response = await request(app).post('/usuarios').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Campos obligatorios incompletos');
  });

  test('PUT /usuarios/:id - debería actualizar un usuario existente', async () => {
    const newUser = {
      nombre: 'Ana López',
      correo: 'ana.lopez@example.com',
      contraseña: 'Password1!',
      edad: 25,
      pais: 'Argentina'
    };

    const postResponse = await request(app).post('/usuarios').send(newUser);
    const userId = postResponse.body.id;

    const updatedUser = { nombre: 'Ana María López' };
    const putResponse = await request(app).put(`/usuarios/${userId}`).send(updatedUser);

    expect(putResponse.status).toBe(200);
    expect(putResponse.body).toHaveProperty('nombre', 'Ana María López');
  });

  test('DELETE /usuarios/:id - debería eliminar un usuario existente', async () => {
    const newUser = {
      nombre: 'Carlos Mendoza',
      correo: 'carlos.mendoza@example.com',
      contraseña: 'Password1!',
      edad: 35,
      pais: 'México'
    };

    const postResponse = await request(app).post('/usuarios').send(newUser);
    const userId = postResponse.body.id;

    const deleteResponse = await request(app).delete(`/usuarios/${userId}`);

    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get('/usuarios');
    expect(getResponse.body.find(user => user.id === userId)).toBeUndefined();
  });

  test('POST /usuarios - debería devolver error si el correo ya está registrado', async () => {
    const user1 = {
      nombre: 'Luis García',
      correo: 'luis.garcia@example.com',
      contraseña: 'Password1!',
      pais: 'España'
    };

    const user2 = {
      nombre: 'Pedro Sánchez',
      correo: 'luis.garcia@example.com',
      contraseña: 'Password1!',
      pais: 'España'
    };

    await request(app).post('/usuarios').send(user1);
    const response = await request(app).post('/usuarios').send(user2);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'El correo ya está registrado');
  });
});
