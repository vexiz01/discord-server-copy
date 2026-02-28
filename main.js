// server-cloner-selfbot.js
const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline');
const chalk = require('chalk');

// Renkli log fonksiyonları
const logger = {
    info: (msg) => console.log(chalk.blue('ℹ ') + chalk.white(msg)),
    success: (msg) => console.log(chalk.green('✓ ') + chalk.white(msg)),
    warn: (msg) => console.log(chalk.yellow('⚠ ') + chalk.white(msg)),
    error: (msg) => console.log(chalk.red('✗ ') + chalk.white(msg)),
    process: (msg) => console.log(chalk.cyan('⟳ ') + chalk.white(msg)),
    delete: (msg) => console.log(chalk.red('🗑 ') + chalk.white(msg)),
    create: (msg) => console.log(chalk.green('➕ ') + chalk.white(msg)),
    role: (msg) => console.log(chalk.magenta('👑 ') + chalk.white(msg)),
    emoji: (msg) => console.log(chalk.yellow('😀 ') + chalk.white(msg))
};

// Başlık gösterimi
console.clear();
console.log(chalk.cyan(`
██╗   ██╗███████╗██╗  ██╗    ██████╗ ███████╗██╗   ██╗
██║   ██║██╔════╝╚██╗██╔╝    ██╔══██╗██╔════╝╚██╗ ██╔╝
██║   ██║█████╗   ╚███╔╝     ██████╔╝█████╗   ╚████╔╝ 
╚██╗ ██╔╝██╔══╝   ██╔██╗     ██╔══██╗██╔══╝    ╚██╔╝  
 ╚████╔╝ ███████╗██╔╝ ██╗    ██████╔╝███████╗   ██║   
  ╚═══╝  ╚══════╝╚═╝  ╚═╝    ╚═════╝ ╚══════╝   ╚═╝   
`));

console.log(chalk.gray('┌────────────────────────────────────┐'));
console.log(chalk.gray('│ ') + chalk.white('Discord Sunucu Kopyalama Aracı    ') + chalk.gray(' │'));
console.log(chalk.gray('│ ') + chalk.hex('#5865F2')('Discord: vexiz0                    ') + chalk.gray(' │'));
console.log(chalk.gray('└────────────────────────────────────┘\n'));

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Soru sorma fonksiyonu
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(chalk.yellow('❓ ') + chalk.white(query), resolve);
    });
};

// Token doğrulama ve client oluşturma
async function createClient(token) {
    const client = new Client({
        checkUpdate: false,
        readyTimeout: 60000
    });

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Bağlantı zaman aşımına uğradı'));
        }, 30000);

        client.once('ready', () => {
            clearTimeout(timeout);
            logger.success('Token başarıyla doğrulandı!');
            resolve(client);
        });

        client.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        client.login(token).catch(reject);
    });
}

// Hedef sunucuyu temizleme fonksiyonu
async function cleanTargetGuild(targetGuild) {
    logger.process('\nHedef sunucu temizleniyor...\n');

    // 1. Emojileri temizle
    logger.process('Emojiler temizleniyor...');
    try {
        const emojis = await targetGuild.emojis.fetch();
        for (const emoji of emojis.values()) {
            try {
                await emoji.delete();
                logger.delete(`Emoji silindi: ${emoji.name}`);
            } catch (e) {
                logger.warn(`Emoji silinemedi (${emoji.name}): ${e.message}`);
            }
        }
        logger.success(`${emojis.size} emoji silindi`);
    } catch (e) {
        logger.warn(`Emojiler temizlenirken hata: ${e.message}`);
    }

    // 2. Kanalları temizle (önce kanallar, sonra kategoriler)
    logger.process('Kanallar temizleniyor...');
    try {
        // Önce kategori olmayan kanalları sil
        const channels = [...targetGuild.channels.cache.values()];
        for (const channel of channels) {
            try {
                await channel.delete();
                logger.delete(`Kanal silindi: ${channel.name}`);
            } catch (e) {
                logger.warn(`Kanal silinemedi (${channel.name}): ${e.message}`);
            }
        }
        logger.success(`${channels.length} kanal silindi`);
    } catch (e) {
        logger.error(`Kanallar temizlenirken hata: ${e.message}`);
    }

    // 3. Rolleri temizle (@everyone hariç)
    logger.process('Roller temizleniyor...');
    let deletedRoleCount = 0;
    try {
        const roles = targetGuild.roles.cache
            .filter(role => role.id !== targetGuild.id) // @everyone hariç
            .sort((a, b) => b.position - a.position);

        for (const role of roles.values()) {
            try {
                await role.delete();
                logger.delete(`Rol silindi: ${role.name}`);
                deletedRoleCount++;
            } catch (e) {
                logger.warn(`Rol silinemedi (${role.name}): ${e.message}`);
            }
        }
        logger.success(`${deletedRoleCount} rol silindi`);
    } catch (e) {
        logger.error(`Roller temizlenirken hata: ${e.message}`);
    }

    // 4. Sunucu ayarlarını sıfırla
    logger.process('Sunucu ayarları sıfırlanıyor...');
    try {
        await targetGuild.edit({
            name: `${targetGuild.name} (Temizlendi)`,
            icon: null,
            banner: null,
            description: null
        });
        logger.success('Sunucu ayarları sıfırlandı');
    } catch (e) {
        logger.warn(`Sunucu ayarları sıfırlanamadı: ${e.message}`);
    }

    logger.success('\n✓ Hedef sunucu başarıyla temizlendi!\n');
}

// Sunucu kopyalama ana fonksiyonu
async function cloneServer(sourceGuild, targetGuild) {
    logger.info(`\n📋 Kopyalama başlatılıyor: ${sourceGuild.name} → ${targetGuild.name}\n`);

    // 1. Sunucu ayarlarını kopyala
    logger.process('Sunucu ayarları kopyalanıyor...');
    try {
        await targetGuild.edit({
            name: sourceGuild.name,
            icon: sourceGuild.iconURL({ size: 1024, format: 'png' }),
            banner: sourceGuild.bannerURL({ size: 1024, format: 'png' }),
            splash: sourceGuild.splashURL({ size: 1024, format: 'png' }),
            description: sourceGuild.description,
            verificationLevel: sourceGuild.verificationLevel,
            defaultMessageNotifications: sourceGuild.defaultMessageNotifications,
            explicitContentFilter: sourceGuild.explicitContentFilter
        });
        logger.success('Sunucu ayarları kopyalandı');
    } catch (e) {
        logger.warn(`Sunucu ayarları kopyalanamadı: ${e.message}`);
    }

    // 2. Rolleri kopyala
    logger.process('Roller kopyalanıyor...');
    const roleMapping = new Map();
    
    try {
        // @everyone rolünü güncelle
        const everyoneRole = targetGuild.roles.everyone;
        const sourceEveryoneRole = sourceGuild.roles.everyone;
        
        try {
            await everyoneRole.setPermissions(sourceEveryoneRole.permissions);
            roleMapping.set(sourceEveryoneRole.id, everyoneRole.id);
        } catch (e) {
            logger.warn(`@everyone rolü güncellenemedi: ${e.message}`);
        }

        // Diğer rolleri kopyala
        const rolesToCreate = sourceGuild.roles.cache
            .filter(role => role.id !== sourceGuild.id)
            .sort((a, b) => b.position - a.position);

        for (const role of rolesToCreate.values()) {
            try {
                const newRole = await targetGuild.roles.create({
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    permissions: role.permissions,
                    mentionable: role.mentionable,
                    position: role.position,
                    icon: role.iconURL({ size: 128, format: 'png' }),
                    unicodeEmoji: role.unicodeEmoji
                });
                roleMapping.set(role.id, newRole.id);
                logger.role(`Rol oluşturuldu: ${role.name}`);
            } catch (e) {
                logger.warn(`Rol oluşturulamadı (${role.name}): ${e.message}`);
            }
        }
        logger.success(`${rolesToCreate.size} rol kopyalandı`);
    } catch (e) {
        logger.error(`Roller kopyalanırken hata: ${e.message}`);
    }

    // 3. Kategorileri oluştur
    logger.process('Kategoriler oluşturuluyor...');
    const categoryMapping = new Map();
    
    try {
        const categories = sourceGuild.channels.cache
            .filter(c => c.type === 'GUILD_CATEGORY')
            .sort((a, b) => a.position - b.position);

        for (const category of categories.values()) {
            try {
                const permissionOverwrites = category.permissionOverwrites.cache.map(overwrite => ({
                    id: roleMapping.get(overwrite.id) || overwrite.id,
                    allow: overwrite.allow.bitfield,
                    deny: overwrite.deny.bitfield
                }));

                const newCategory = await targetGuild.channels.create(category.name, {
                    type: 'GUILD_CATEGORY',
                    position: category.position,
                    permissionOverwrites: permissionOverwrites
                });
                categoryMapping.set(category.id, newCategory.id);
                logger.create(`Kategori oluşturuldu: ${category.name}`);
            } catch (e) {
                logger.warn(`Kategori oluşturulamadı (${category.name}): ${e.message}`);
            }
        }
        logger.success(`${categories.size} kategori oluşturuldu`);
    } catch (e) {
        logger.error(`Kategoriler oluşturulurken hata: ${e.message}`);
    }

    // 4. Kanalları kopyala
    logger.process('Kanallar oluşturuluyor...');
    
    try {
        const textChannels = sourceGuild.channels.cache
            .filter(c => c.type === 'GUILD_TEXT')
            .sort((a, b) => a.position - b.position);
        
        const voiceChannels = sourceGuild.channels.cache
            .filter(c => c.type === 'GUILD_VOICE')
            .sort((a, b) => a.position - b.position);
        
        const announcementChannels = sourceGuild.channels.cache
            .filter(c => c.type === 'GUILD_NEWS')
            .sort((a, b) => a.position - b.position);

        const stageChannels = sourceGuild.channels.cache
            .filter(c => c.type === 'GUILD_STAGE_VOICE')
            .sort((a, b) => a.position - b.position);

        const forumChannels = sourceGuild.channels.cache
            .filter(c => c.type === 'GUILD_FORUM')
            .sort((a, b) => a.position - b.position);

        // Tüm kanalları oluştur
        const allChannels = [
            ...textChannels.values(), 
            ...voiceChannels.values(), 
            ...announcementChannels.values(),
            ...stageChannels.values(),
            ...forumChannels.values()
        ];
        
        for (const channel of allChannels) {
            try {
                const permissionOverwrites = channel.permissionOverwrites.cache.map(overwrite => ({
                    id: roleMapping.get(overwrite.id) || overwrite.id,
                    allow: overwrite.allow.bitfield,
                    deny: overwrite.deny.bitfield
                }));

                const channelData = {
                    name: channel.name,
                    type: channel.type,
                    position: channel.position,
                    parent: categoryMapping.get(channel.parentId),
                    permissionOverwrites: permissionOverwrites
                };

                // Text kanalı için ek özellikler
                if (channel.type === 'GUILD_TEXT') {
                    channelData.topic = channel.topic;
                    channelData.nsfw = channel.nsfw;
                    channelData.rateLimitPerUser = channel.rateLimitPerUser;
                    channelData.defaultAutoArchiveDuration = channel.defaultAutoArchiveDuration;
                }
                
                // Voice kanalı için ek özellikler
                if (channel.type === 'GUILD_VOICE') {
                    channelData.bitrate = channel.bitrate;
                    channelData.userLimit = channel.userLimit;
                    channelData.rtcRegion = channel.rtcRegion;
                    channelData.videoQualityMode = channel.videoQualityMode;
                }
                
                // Duyuru kanalı için
                if (channel.type === 'GUILD_NEWS') {
                    channelData.topic = channel.topic;
                    channelData.nsfw = channel.nsfw;
                }

                // Stage kanalı için
                if (channel.type === 'GUILD_STAGE_VOICE') {
                    channelData.bitrate = channel.bitrate;
                    channelData.userLimit = channel.userLimit;
                    channelData.rtcRegion = channel.rtcRegion;
                }

                await targetGuild.channels.create(channel.name, channelData);
                
                let channelType = 'Kanal';
                if (channel.type === 'GUILD_VOICE') channelType = 'Ses kanalı';
                if (channel.type === 'GUILD_NEWS') channelType = 'Duyuru kanalı';
                if (channel.type === 'GUILD_STAGE_VOICE') channelType = 'Stage kanalı';
                if (channel.type === 'GUILD_FORUM') channelType = 'Forum kanalı';
                
                logger.create(`${channelType} oluşturuldu: ${channel.name}`);
            } catch (e) {
                logger.warn(`Kanal oluşturulamadı (${channel.name}): ${e.message}`);
            }
        }
        logger.success(`${allChannels.length} kanal kopyalandı`);
    } catch (e) {
        logger.error(`Kanallar kopyalanırken hata: ${e.message}`);
    }

    // 5. Emojileri kopyala
    logger.process('Emojiler kopyalanıyor...');
    try {
        const emojis = await sourceGuild.emojis.fetch();
        for (const emoji of emojis.values()) {
            try {
                await targetGuild.emojis.create({
                    attachment: emoji.url,
                    name: emoji.name
                });
                logger.emoji(`Emoji eklendi: ${emoji.name}`);
            } catch (e) {
                logger.warn(`Emoji eklenemedi (${emoji.name}): ${e.message}`);
            }
        }
        logger.success(`${emojis.size} emoji kopyalandı`);
    } catch (e) {
        logger.warn(`Emojiler kopyalanamadı: ${e.message}`);
    }

    // 6. Stickerları kopyala
    logger.process('Stickerlar kopyalanıyor...');
    try {
        const stickers = await sourceGuild.stickers.fetch();
        for (const sticker of stickers.values()) {
            try {
                await targetGuild.stickers.create({
                    file: sticker.url,
                    name: sticker.name,
                    tags: sticker.tags,
                    description: sticker.description || ''
                });
                logger.create(`Sticker eklendi: ${sticker.name}`);
            } catch (e) {
                logger.warn(`Sticker eklenemedi (${sticker.name}): ${e.message}`);
            }
        }
        logger.success(`${stickers.size} sticker kopyalandı`);
    } catch (e) {
        logger.warn(`Stickerlar kopyalanamadı: ${e.message}`);
    }

    return true;
}

// Ana program
async function main() {
    try {
        console.log(chalk.yellow('🔧 Gerekli modüller kontrol ediliyor...\n'));
        
        // Token al
        const token = await question('Discord tokeninizi girin: ');
        const cleanToken = token.trim();
        
        if (!cleanToken || cleanToken.length < 50) {
            logger.error('Geçersiz token formatı! Token çok kısa.');
            rl.close();
            return;
        }
        
        logger.process('Token doğrulanıyor...');
        
        // Client oluştur ve bağlan
        const client = await createClient(cleanToken);
        
        // Kullanıcı bilgilerini göster
        logger.success(`${client.user.tag} (${client.user.id}) olarak giriş yapıldı!\n`);
        
        // Kullanıcının sunucularını listele
        const guilds = client.guilds.cache;
        
        if (guilds.size === 0) {
            logger.warn('Hiçbir sunucuda bulunmuyorsunuz!');
            rl.close();
            return;
        }
        
        logger.info('Sunucularınız:');
        let index = 1;
        guilds.forEach((guild) => {
            console.log(chalk.white(`  ${index}. `) + chalk.cyan(guild.name) + chalk.gray(` (${guild.id})`));
            index++;
        });
        console.log('');

        // Kaynak sunucu ID'si al
        const sourceId = await question('Kopyalanacak sunucunun ID\'sini girin: ');
        const sourceGuild = client.guilds.cache.get(sourceId);
        
        if (!sourceGuild) {
            logger.error('Kaynak sunucu bulunamadı! ID\'yi kontrol edin.');
            rl.close();
            return;
        }

        logger.success(`Kaynak sunucu: ${sourceGuild.name}\n`);

        // Hedef sunucu ID'si al
        const targetId = await question('Hedef sunucunun ID\'sini girin: ');
        const targetGuild = client.guilds.cache.get(targetId);
        
        if (!targetGuild) {
            logger.error('Hedef sunucu bulunamadı!');
            rl.close();
            return;
        }

        logger.success(`Hedef sunucu: ${targetGuild.name}\n`);

        // Uyarı ve onay
        console.log(chalk.red('╔══════════════════════════════════════════════════════════╗'));
        console.log(chalk.red('║                     ⚠  UYARI  ⚠                          ║'));
        console.log(chalk.red('╠══════════════════════════════════════════════════════════╣'));
        console.log(chalk.red('║ Bu işlem sırasıyla:                                      ║'));
        console.log(chalk.red('║ 1. Hedef sunucudaki TÜM emojileri silecek                ║'));
        console.log(chalk.red('║ 2. Hedef sunucudaki TÜM kanalları silecek                ║'));
        console.log(chalk.red('║ 3. Hedef sunucudaki TÜM rolleri (@everyone hariç) silecek║'));
        console.log(chalk.red('║ 4. Sonra kaynak sunucuyu hedefe kopyalayacak             ║'));
        console.log(chalk.red('╚══════════════════════════════════════════════════════════╝\n'));

        const confirm = await question(chalk.red('⚠ Devam etmek istiyor musunuz? (e/E): '));
        
        if (confirm.toLowerCase() !== 'e') {
            logger.warn('İşlem iptal edildi.');
            rl.close();
            return;
        }

        // Önce hedef sunucuyu temizle
        await cleanTargetGuild(targetGuild);
        
        // Sonra kopyalama işlemini başlat
        await cloneServer(sourceGuild, targetGuild);
        
        // Tamamlandı mesajı
        console.log('');
        logger.success('═══════════════════════════════════════');
        logger.success('    SUNUCU KOPYALAMA TAMAMLANDI!      ');
        logger.success('═══════════════════════════════════════');
        console.log('');
        logger.info('Discord: vexiz0');
        console.log('');

        rl.close();
        process.exit(0);
        
    } catch (error) {
        logger.error(`Hata: ${error.message}`);
        console.log(error);
        rl.close();
    }
}

// Programı başlat
main();