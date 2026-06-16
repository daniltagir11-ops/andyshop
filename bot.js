const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const TOKEN = '8886148730:AAHO2oHpBT4g0RpLUXYCu1oSK_m_nyiTnK4';
const ADMIN_ID = '2105323375';

// Файл для хранения ссылки
const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.log('Config not found, creating default');
    }
    return { siteUrl: 'https://brian-shop.netlify.app' };
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

let config = loadConfig();

// Создаем бота с правильными настройками
const bot = new TelegramBot(TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

console.log('🤖 Бот запущен!');
console.log(`👤 Админ: ${ADMIN_ID}`);
console.log(`🔗 Текущая ссылка: ${config.siteUrl}`);

// ===== Команда /start =====
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Guest';
    
    const keyboard = {
        inline_keyboard: [
            [
                { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
                { text: '🇬🇧 English', callback_data: 'lang_en' }
            ]
        ]
    };
    
    bot.sendMessage(chatId, 
        `👋 Welcome, ${firstName}!\n\n` +
        `This bot is used for purchasing Telegram Stars, NFT Gifts, and more.\n` +
        `Choose your language:\n\n` +
        `👋 Привет, ${firstName}!\n\n` +
        `Этот бот используется для покупки звезд Telegram, NFT подарков и т.п.\n` +
        `Выберите язык:`,
        { reply_markup: keyboard }
    ).catch(err => console.log('Send error:', err.message));
});

// ===== Выбор языка =====
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const url = config.siteUrl;
    
    if (data === 'lang_ru') {
        const keyboard = {
            inline_keyboard: [
                [{ text: '🛒 Открыть магазин', url: url }],
                [{ text: '📞 Поддержка', url: 'https://t.me/Br1anRew' }]
            ]
        };
        
        bot.sendMessage(chatId,
            `✅ Язык выбран: Русский\n\n` +
            `🏪 <b>Brian Shop</b>\n` +
            `Покупайте звезды, NFT подарки, аккаунты и многое другое!\n\n` +
            `Нажмите кнопку ниже, чтобы открыть магазин.`,
            { 
                parse_mode: 'HTML',
                reply_markup: keyboard 
            }
        ).catch(err => console.log('Send error:', err.message));
        
        bot.answerCallbackQuery(callbackQuery.id, { text: '🇷🇺 Русский выбран' });
        
    } else if (data === 'lang_en') {
        const keyboard = {
            inline_keyboard: [
                [{ text: '🛒 Open Store', url: url }],
                [{ text: '📞 Support', url: 'https://t.me/Br1anRew' }]
            ]
        };
        
        bot.sendMessage(chatId,
            `✅ Language selected: English\n\n` +
            `🏪 <b>Brian Shop</b>\n` +
            `Buy Stars, NFT Gifts, accounts and more!\n\n` +
            `Click the button below to open the store.`,
            { 
                parse_mode: 'HTML',
                reply_markup: keyboard 
            }
        ).catch(err => console.log('Send error:', err.message));
        
        bot.answerCallbackQuery(callbackQuery.id, { text: '🇬🇧 English selected' });
    }
});

// ===== Команда /editurl (только для админа) =====
bot.onText(/\/editurl (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    if (userId !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет прав для этой команды.');
        return;
    }
    
    const newUrl = match[1].trim();
    
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        bot.sendMessage(chatId, '❌ URL должен начинаться с http:// или https://');
        return;
    }
    
    config.siteUrl = newUrl;
    saveConfig(config);
    
    bot.sendMessage(chatId, `✅ Ссылка обновлена!\nНовая ссылка: ${newUrl}`);
});

// ===== Команда /url =====
bot.onText(/\/url/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    if (userId !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет прав.');
        return;
    }
    
    bot.sendMessage(chatId, `🔗 Текущая ссылка: ${config.siteUrl}`);
});

// ===== Обработка ошибок =====
bot.on('polling_error', (error) => {
    console.log('Polling error:', error.message);
});

// ===== Обработка неизвестных команд =====
bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/') && !msg.text.startsWith('/start') && !msg.text.startsWith('/editurl') && !msg.text.startsWith('/url')) {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 
            `❓ Неизвестная команда.\n\n` +
            `Доступные команды:\n` +
            `/start — Начать\n` +
            `/editurl <ссылка> — Изменить ссылку (админ)\n` +
            `/url — Показать текущую ссылку (админ)`
        );
    }
});

// Обработка завершения процесса
process.on('SIGINT', () => {
    console.log('Bot stopping...');
    bot.stopPolling();
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err);
});