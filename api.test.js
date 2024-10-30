const request = require('supertest');
const fs = require('fs-extra');
const app = require('./src/app');
const userService = require('./src/userservice'); 

const filePath = 'users.json';

jest.mock('./src/userService'); // Mock del servicio de usuario

beforeAll(async () => {
  await fs.writeJson(filePath, []);
});

describe('API de Usuarios', () => {

  // 1. Crear un usuario y simular el envío de correo electrónico
  test('POST /usuarios - debería llamar a la función de enviar correo con mock', async () => {
    userService.sendWelcomeEmail.mockResolvedValue('Correo de bienvenida enviado');

    const newUser = {
      nombre: 'Luis Ramírez',
      correo: 'luis.ramirez@example.com',
      contraseña: 'Password1!',
      edad: 29,
      pais: 'México'
    };

    const response = await request(app).post('/usuarios').send(newUser);

    expect(response.status).toBe(201);
    expect(userService.sendWelcomeEmail).toHaveBeenCalledWith(newUser.correo);
    expect(userService.sendWelcomeEmail).toHaveBeenCalledTimes(1);
  });

  // 2. Obtener una lista vacía de usuarios inicialmente
  test('GET /usuarios - debería devolver una lista vacía inicialmente', async () => {
    const response = await request(app).get('/usuarios');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  // 3. Crear un nuevo usuario válido
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

  // 4. Devolver error si faltan campos obligatorios
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

  // 5. Devolver error si el correo ya está registrado
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

  // 6. Actualizar un usuario existente
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

  // 7. Devolver error al actualizar un usuario inexistente
  test('PUT /usuarios/:id - debería devolver error al actualizar un usuario inexistente', async () => {
    const response = await request(app).put('/usuarios/999').send({ nombre: 'Nombre Inexistente' });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Usuario no encontrado');
  });

  // 8. Eliminar un usuario existente
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

  // 9. Devolver error al eliminar un usuario inexistente
  test('DELETE /usuarios/:id - debería devolver error al eliminar un usuario inexistente', async () => {
    const response = await request(app).delete('/usuarios/999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Usuario no encontrado');
  });

  // 10. Devolver error si la edad es menor que 18
  test('POST /usuarios - debería devolver error si la edad es menor que 18', async () => {
    const newUser = {
      nombre: 'Pedro Junior',
      correo: 'pedro.junior@example.com',
      contraseña: 'Password1!',
      edad: 16,
      pais: 'Chile'
    };

    const response = await request(app).post('/usuarios').send(newUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Edad fuera de rango');
  });
});
