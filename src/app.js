const express = require('express');
const fs = require('fs-extra');
const userService = require('./userservice'); // Importar el servicio de usuario
const app = express();
const port = 3000;

const filePath = 'users.json';

// Middleware para procesar JSON
app.use(express.json());

// Función para verificar si el archivo existe y crearlo si no
const checkOrCreateFile = async () => {
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    await fs.writeJson(filePath, []); // Crea el archivo con un arreglo vacío si no existe
  }
};

// Llamada para verificar que el archivo existe antes de hacer cualquier operación
checkOrCreateFile();

// Ruta para obtener la lista de usuarios (GET /usuarios)
app.get('/usuarios', async (req, res) => {
  try {
    const users = await fs.readJson(filePath);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
});

// Ruta para crear un usuario (POST /usuarios)
app.post('/usuarios', async (req, res) => {
  const { nombre, correo, contraseña, edad, pais, telefono } = req.body;

  // Validaciones
  if (!nombre || !correo || !contraseña || !pais) {
    return res.status(400).json({ error: 'Campos obligatorios incompletos' });
  }
  
  try {
    const users = await fs.readJson(filePath);

    // Validar que no exista el correo
    if (users.find(user => user.correo === correo)) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Crear nuevo usuario
    const newUser = { id: Date.now(), nombre, correo, contraseña, edad, pais, telefono };
    users.push(newUser);

    // Guardar en el archivo
    await fs.writeJson(filePath, users, { spaces: 2 });

    // Llamada al servicio para enviar un correo de bienvenida
    await userService.sendWelcomeEmail(correo);

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});

// Ruta para actualizar un usuario (PUT /usuarios/:id)
app.put('/usuarios/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { nombre, correo, contraseña, edad, pais, telefono } = req.body;

  try {
    let users = await fs.readJson(filePath);
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualización de los campos
    if (nombre) users[userIndex].nombre = nombre;
    if (correo) users[userIndex].correo = correo;
    if (contraseña) users[userIndex].contraseña = contraseña;
    if (edad) users[userIndex].edad = edad;
    if (pais) users[userIndex].pais = pais;
    if (telefono) users[userIndex].telefono = telefono;

    // Guardar el archivo actualizado
    await fs.writeJson(filePath, users, { spaces: 2 });
    res.json(users[userIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});

// Ruta para eliminar un usuario (DELETE /usuarios/:id)
app.delete('/usuarios/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    let users = await fs.readJson(filePath);
    const userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Eliminar usuario
    users.splice(userIndex, 1);

    // Guardar el archivo actualizado
    await fs.writeJson(filePath, users, { spaces: 2 });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});

// Exporta la aplicación para que se pueda usar en las pruebas
module.exports = app;

// Solo inicia el servidor si se ejecuta directamente
if (require.main === module) {
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
  });
}
