# Bot de Entrada Musical para Discord

Bot de Discord que reproduce automáticamente canciones personalizadas cuando usuarios específicos entran a canales de voz. Cada usuario puede tener su propia canción de entrada, como en los eventos de lucha libre o deportivos.

![Discord](https://img.shields.io/badge/Discord-Bot-7289da?style=for-the-badge&logo=discord&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

---

#📖 ¿Qué hace este bot?

Este bot permite asignar una **canción de entrada personalizada** a cada usuario de tu servidor de Discord. Cuando ese usuario entra a un canal de voz, su canción se reproduce automáticamente.

# Características principales

- 🎵 **Canciones personalizadas por usuario** - Cada persona puede tener su propia música de entrada
- 📁 **Audios locales** - Usa archivos MP3/WAV/OGG almacenados en el servidor
- 🔄 **Recarga dinámica** - Añade nuevos audios sin reiniciar el bot
- 🎮 **Comandos slash** - Interfaz moderna con comandos `/` de Discord
- ⚡ **Reproducción automática** - Detecta cuando un usuario entra al canal
- 🛠️ **Fácil de gestionar** - No requiere editar código para añadir canciones

---

## 🎮 Comandos disponibles

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `/epicentry @usuario cancion` | Asigna una canción de entrada a un usuario | `/epicentry @Noui5n epic-song` |
| `/removeentry @usuario` | Elimina la canción de entrada de un usuario | `/removeentry @Noui5n` |
| `/listentries` | Muestra todas las canciones configuradas | `/listentries` |
| `/listaudios` | Lista todos los audios disponibles | `/listaudios` |
| `/testentry` | Prueba tu canción (debes estar en canal de voz) | `/testentry` |
| `/reloadaudios` | Recarga la lista después de añadir archivos | `/reloadaudios` |
| `/help` | Muestra la ayuda completa | `/help` |

---

## 📋 Requisitos

- **Node.js** 18 o superior
- **FFmpeg** instalado en el sistema
- **Bot de Discord** con permisos de:
  - Conectar a canales de voz
  - Hablar en canales de voz
  - Usar comandos de aplicación

---

## 🔧 Instalación Local

### 1. Clonar el repositorio

```bash[
git clone https://github.com/nouini5/epicentry
cd epicentry
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DISCORD_TOKEN= 
CLIENT_ID= 
```

4. Añadir archivos de audio
Crea una carpeta audios/ y añade tus archivos MP3, WAV u OGG:
bashmkdir audios
# Copia tus archivos de audio a esta carpeta
Formatos soportados:

MP3
WAV
OGG
M4A



5. Iniciar el bot
bashnpm start
Deberías ver:
✅ Bot conectado
🎵 Listo para asignar canciones de entrada!
📁 Audios encontrados:
   1. x
   2. y
✅ Comandos registrados exitosamente

🌐 Instalación en Servidor (24/7)


📝 Uso básico
1. Asignar una canción a un usuario
/epicentry @Juan epic-song
El bot mostrará las opciones disponibles basadas en los archivos en la carpeta audios/.
2. El usuario entra al canal
Cuando Juan entre a cualquier canal de voz, su canción se reproducirá automáticamente.
3. Añadir más canciones

Añade nuevos archivos MP3 a la carpeta audios/
En Discord, usa /reloadaudios
Las nuevas canciones estarán disponibles en /epicentry

4. Ver configuración actual
/listentries
Muestra todos los usuarios con canciones asignadas.

🏗️ Estructura del proyecto
bot-discord-musica/
├── bot.js              # Código principal del bot
├── package.json        # Dependencias y scripts
├── .env               # Variables de entorno (NO subir a Git)
├── .gitignore         # Archivos a ignorar
├── README.md          # Este archivo
└── audios/            # Carpeta de archivos de audio
    ├── song1.mp3
    ├── song2.mp3
    └── ...

🔒 Seguridad
Variables de entorno
NUNCA subas tu token a GitHub. Siempre usa el archivo .env y asegúrate de que esté en .gitignore.
El archivo .gitignore debe contener:
node_modules/
.env
*.log
audios/*.mp3
audios/*.wav
audios/*.ogg
Permisos del bot
Al invitar el bot, asegúrate de darle estos permisos:

✅ Ver canales
✅ Conectar (canales de voz)
✅ Hablar (canales de voz)
✅ Usar comandos de aplicación
