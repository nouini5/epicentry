# Bot de Música para Discord

Bot que reproduce audios locales cuando usuarios entran a canales de voz.

## Configuración

1. Instalar dependencias: `npm install`
2. Crear archivo `.env` con:
   - DISCORD_TOKEN=tu_token
   - CLIENT_ID=tu_client_id
3. Añadir archivos MP3 a la carpeta `audios/`
4. Ejecutar: `npm start`

## Comandos

- `/epicentry @usuario cancion` - Asignar canción
- `/listaudios` - Ver audios disponibles
- `/reloadaudios` - Actualizar lista
- `/testentry` - Probar tu canción