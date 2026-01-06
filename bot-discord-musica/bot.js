
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  NoSubscriberBehavior
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config();

// Cargar variables de entorno
require('dotenv').config();

// Configuración
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || '1454650828685054067';
const AUDIOS_FOLDER = path.join(__dirname, 'audios');

// Base de datos de usuarios y sus canciones
const userSongs = new Map();
const activeConnections = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

// Función para obtener lista de audios disponibles
function getAvailableAudios() {
  if (!fs.existsSync(AUDIOS_FOLDER)) {
    fs.mkdirSync(AUDIOS_FOLDER);
    console.log('📁 Carpeta "audios" creada. Añade archivos MP3/WAV/OGG ahí.');
    return [];
  }
  
  const files = fs.readdirSync(AUDIOS_FOLDER);
  const audioFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
  });
  
  return audioFiles;
}

// Crear opciones dinámicas para el comando (máximo 25 opciones de Discord)
function createAudioChoices() {
  const audios = getAvailableAudios();
  return audios.slice(0, 25).map(file => ({
    name: path.parse(file).name, // Nombre sin extensión
    value: file // Nombre completo del archivo
  }));
}

// Función para registrar comandos
async function registerCommands() {
  const audioChoices = createAudioChoices();
  
  if (audioChoices.length === 0) {
    console.log('⚠️  No hay audios en la carpeta. Añade archivos MP3 a la carpeta "audios"');
  }
  
  const commands = [
    new SlashCommandBuilder()
      .setName('epicentry')
      .setDescription('Configura una canción de entrada para un usuario')
      .addUserOption(option =>
        option.setName('usuario')
          .setDescription('Usuario al que asignar la canción')
          .setRequired(true))
      .addStringOption(option => {
        const opt = option
          .setName('cancion')
          .setDescription('Selecciona una canción')
          .setRequired(true);
        
        // Añadir las opciones dinámicamente
        audioChoices.forEach(choice => {
          opt.addChoices(choice);
        });
        
        return opt;
      }),
    
    new SlashCommandBuilder()
      .setName('removeentry')
      .setDescription('Elimina la canción de entrada de un usuario')
      .addUserOption(option =>
        option.setName('usuario')
          .setDescription('Usuario del que eliminar la canción')
          .setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('listentries')
      .setDescription('Lista todas las canciones de entrada configuradas'),
    
    new SlashCommandBuilder()
      .setName('listaudios')
      .setDescription('Muestra todos los audios disponibles en la carpeta'),
    
    new SlashCommandBuilder()
      .setName('testentry')
      .setDescription('Prueba tu canción de entrada actual'),
    
    new SlashCommandBuilder()
      .setName('reloadaudios')
      .setDescription('Recarga la lista de audios (usa después de añadir nuevos archivos)'),
    
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('Muestra todos los comandos disponibles')
  ].map(command => command.toJSON());

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    console.log('🔄 Registrando comandos slash...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log('✅ Comandos registrados exitosamente');
    console.log(`📊 Audios disponibles: ${audioChoices.length}`);
  } catch (error) {
    console.error('❌ Error al registrar comandos:', error);
  }
}

client.once('clientReady', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  console.log('🎵 Listo para asignar canciones de entrada!');
  
  // Mostrar audios disponibles
  const audios = getAvailableAudios();
  if (audios.length > 0) {
    console.log('📁 Audios encontrados:');
    audios.forEach((audio, index) => {
      console.log(`   ${index + 1}. ${path.parse(audio).name}`);
    });
  }
  
  await registerCommands();
});

// Manejo de comandos slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'epicentry') {
    await handleEpicEntry(interaction);
  } else if (commandName === 'removeentry') {
    await handleRemoveEntry(interaction);
  } else if (commandName === 'listentries') {
    await handleListEntries(interaction);
  } else if (commandName === 'listaudios') {
    await handleListAudios(interaction);
  } else if (commandName === 'testentry') {
    await handleTestEntry(interaction);
  } else if (commandName === 'reloadaudios') {
    await handleReloadAudios(interaction);
  } else if (commandName === 'help') {
    await handleHelp(interaction);
  }
});

async function handleEpicEntry(interaction) {
  const targetUser = interaction.options.getUser('usuario');
  const audioFile = interaction.options.getString('cancion');
  
  const audioPath = path.join(AUDIOS_FOLDER, audioFile);
  
  // Verificar que el archivo existe
  if (!fs.existsSync(audioPath)) {
    return interaction.reply('❌ El archivo de audio no existe. Usa `/listaudios` para ver los disponibles.');
  }
  
  // Guardar la configuración
  userSongs.set(targetUser.id, {
    file: audioFile,
    name: path.parse(audioFile).name,
    setBy: interaction.user.tag
  });
  
  console.log(`✅ Canción asignada a ${targetUser.tag}: ${audioFile}`);
  
  await interaction.reply(
    `✅ Canción configurada para ${targetUser.tag}\n` +
    `🎵 **Canción:** ${path.parse(audioFile).name}\n` +
    `📁 **Archivo:** ${audioFile}\n\n` +
    `La canción sonará cuando ${targetUser.tag} entre a un canal de voz.`
  );
}

async function handleRemoveEntry(interaction) {
  const targetUser = interaction.options.getUser('usuario');
  
  if (userSongs.has(targetUser.id)) {
    userSongs.delete(targetUser.id);
    await interaction.reply(`✅ Canción de entrada eliminada para ${targetUser.tag}`);
  } else {
    await interaction.reply(`❌ ${targetUser.tag} no tiene una canción de entrada configurada`);
  }
}

async function handleListEntries(interaction) {
  if (userSongs.size === 0) {
    return interaction.reply('📝 No hay canciones de entrada configuradas');
  }
  
  let message = '📋 **Canciones de Entrada Configuradas:**\n\n';
  
  for (const [userId, data] of userSongs.entries()) {
    const user = await client.users.fetch(userId).catch(() => null);
    const userName = user ? user.tag : `Usuario ID: ${userId}`;
    message += `👤 **${userName}**\n🎵 ${data.name}\n⚙️ Configurado por: ${data.setBy}\n\n`;
  }
  
  await interaction.reply(message);
}

async function handleListAudios(interaction) {
  const audios = getAvailableAudios();
  
  if (audios.length === 0) {
    return interaction.reply(
      '📁 **No hay audios disponibles**\n\n' +
      `Añade archivos MP3, WAV u OGG a la carpeta:\n\`${AUDIOS_FOLDER}\``
    );
  }
  
  let message = '🎵 **Audios Disponibles:**\n\n';
  audios.forEach((audio, index) => {
    const name = path.parse(audio).name;
    const size = (fs.statSync(path.join(AUDIOS_FOLDER, audio)).size / 1024 / 1024).toFixed(2);
    message += `${index + 1}. **${name}**\n   📁 ${audio} (${size} MB)\n`;
  });
  
  message += `\n📊 **Total:** ${audios.length} audio(s)`;
  
  if (audios.length > 25) {
    message += `\n⚠️ Solo se muestran los primeros 25 en el comando /epicentry`;
  }
  
  await interaction.reply(message);
}

async function handleTestEntry(interaction) {
  const userId = interaction.user.id;
  
  if (!userSongs.has(userId)) {
    return interaction.reply('❌ No tienes una canción de entrada configurada. Usa `/epicentry @tu_usuario cancion` para configurar una.');
  }
  
  const member = interaction.member;
  const voiceChannel = member.voice.channel;
  
  if (!voiceChannel) {
    return interaction.reply('❌ Debes estar en un canal de voz para probar tu canción');
  }
  
  await interaction.reply('🎵 Reproduciendo tu canción de entrada...');
  await playMusicForUser(userId, voiceChannel);
}

async function handleReloadAudios(interaction) {
  await interaction.deferReply();
  
  try {
    await registerCommands();
    const audios = getAvailableAudios();
    
    await interaction.editReply(
      `✅ Lista de audios recargada\n` +
      `📊 Audios disponibles: ${audios.length}\n\n` +
      `Ahora puedes usar los nuevos audios con \`/epicentry\``
    );
  } catch (error) {
    console.error('Error al recargar audios:', error);
    await interaction.editReply('❌ Error al recargar la lista de audios');
  }
}

async function handleHelp(interaction) {
  const helpMessage = `
🎵 **Bot de Música - Comandos Disponibles**

**📌 Configuración:**

\`/epicentry @usuario cancion\`
• Asigna una canción de entrada para un usuario
• Selecciona de los audios disponibles en la carpeta
• La canción sonará cuando ese usuario entre a un canal de voz

\`/removeentry @usuario\`
• Elimina la canción de entrada de un usuario

**📊 Información:**

\`/listentries\`
• Muestra todas las canciones configuradas

\`/listaudios\`
• Lista todos los audios disponibles en la carpeta

\`/testentry\`
• Prueba tu canción (debes estar en un canal de voz)

\`/reloadaudios\`
• Recarga la lista después de añadir nuevos archivos
• Usa esto cuando añadas nuevos MP3 a la carpeta

\`/help\`
• Muestra este mensaje

**📁 Gestión de Audios:**

1. Añade archivos MP3/WAV/OGG a la carpeta \`audios/\`
2. Usa \`/reloadaudios\` para actualizar la lista
3. Usa \`/listaudios\` para ver los disponibles
4. Configura con \`/epicentry\`

**💡 Formatos soportados:** MP3, WAV, OGG, M4A
  `;
  
  await interaction.reply(helpMessage);
}

// Detectar cuando un usuario entra a un canal de voz
client.on('voiceStateUpdate', async (oldState, newState) => {
  const userId = newState.id;
  
  // Ignorar bots
  if (newState.member.user.bot) return;
  
  // Verifica si el usuario tiene una canción configurada
  if (!userSongs.has(userId)) return;
  
  // Verifica si el usuario se unió a un canal de voz
  const joinedChannel = !oldState.channelId && newState.channelId;
  
  if (joinedChannel) {
    console.log(`🎵 ${newState.member.user.tag} entró a un canal de voz`);
    await playMusicForUser(userId, newState.channel);
  }
});

async function playMusicForUser(userId, channel) {
  const guildId = channel.guild.id;
  
  try {
    const songData = userSongs.get(userId);
    if (!songData || !songData.file) {
      console.error('❌ No se encontró la configuración de audio');
      return;
    }
    
    const audioPath = path.join(AUDIOS_FOLDER, songData.file);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(audioPath)) {
      console.error('❌ El archivo de audio no existe:', audioPath);
      return;
    }
    
    console.log(`🔍 Reproduciendo: ${songData.name}`);
    
    // Si ya hay una conexión activa, destruirla
    if (activeConnections.has(guildId)) {
      const oldConnection = activeConnections.get(guildId);
      oldConnection.destroy();
      activeConnections.delete(guildId);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Conectar al canal de voz
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guildId,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    
    activeConnections.set(guildId, connection);
    
    // Crear el reproductor
    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });
    
    connection.subscribe(player);
    
    // Crear recurso de audio desde archivo local
    const resource = createAudioResource(audioPath);
    
    // Eventos del reproductor
    player.on(AudioPlayerStatus.Playing, () => {
      console.log('▶️  Reproduciendo audio...');
    });
    
    player.on(AudioPlayerStatus.Idle, () => {
      console.log('⏹️  Audio terminado');
      setTimeout(() => {
        if (activeConnections.has(guildId)) {
          connection.destroy();
          activeConnections.delete(guildId);
        }
      }, 1000);
    });
    
    player.on('error', error => {
      console.error('❌ Error en el reproductor:', error.message);
      if (activeConnections.has(guildId)) {
        connection.destroy();
        activeConnections.delete(guildId);
      }
    });
    
    // Eventos de la conexión
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log('✅ Conexión de voz lista');
    });
    
    connection.on(VoiceConnectionStatus.Disconnected, () => {
      console.log('📡 Desconectado del canal de voz');
      if (activeConnections.has(guildId)) {
        activeConnections.delete(guildId);
      }
    });
    
    // Reproducir
    player.play(resource);
    
  } catch (error) {
    console.error('❌ Error al reproducir audio:', error.message);
    if (activeConnections.has(guildId)) {
      const connection = activeConnections.get(guildId);
      connection.destroy();
      activeConnections.delete(guildId);
    }
  }
}

// Manejo de errores
process.on('unhandledRejection', error => {
  console.error('Error no manejado:', error);
});

client.login(TOKEN);