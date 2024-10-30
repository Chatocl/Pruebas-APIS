# API de Usuarios - Pruebas Unitarias

Esta API permite la gestión de usuarios con operaciones CRUD usando un archivo JSON como base de datos. Las pruebas unitarias están implementadas con `Jest` y `Supertest`.

## Estructura del Proyecto

- `app.js`: Código principal de la API.
- `userService.js`: Servicio simulado para enviar correos.
- `app.test.js`: Pruebas unitarias de la API.

## Instalación y Ejecución

1. Instalar dependencias:
   ```bash
   npm install

2. Ejecutar las pruebas:

   ```bash
    npm test

3. Pruebas Unitarias
Las pruebas cubren:

- Crear un usuario y simular el envío de correo.(Se usa jest.mock() para simular el envío de correos en las pruebas.)
- Lista vacía al inicio.
- Crear usuario con datos válidos.
- Verificar campos faltantes.
- Error si el correo ya existe.
- Actualizar usuario existente.
- Error al actualizar usuario inexistente.
- Eliminar usuario existente.
- Error al eliminar usuario inexistente.
- Edad menor a 18 años.


Integrantes 
* Sergio Cardona - 1222419
* Fernanda Caneses - 1187820
* Carlos Coronado - 1236020
* Daniel Molina - 1007420
* Karla Palacios - 1173219
* Benjamin Izquierdo - 1321220
