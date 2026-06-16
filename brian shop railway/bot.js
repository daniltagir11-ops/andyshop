const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const TOKEN = '8886148730:AAHO2oHpBT4g0RpLUXYCu1oSK_m_nyiTnK4';
const ADMIN_ID = '2105323375';

const bot = new TelegramBot(TOKEN, { polling: true });

// Файл для хранения ссылки
const CONFIG_FILE = './config.json';

function loadConfig() {
    try {
        const data = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return { siteUrl: 'https://brian-shop.netlify.app' };
    }
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

let config = loadConfig();

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
    );
});

// ===== Выбор языка =====
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    if (data === 'lang_ru') {
        const url = config.siteUrl;
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
        );
        bot.answerCallbackQuery(callbackQuery.id, { text: '🇷🇺 Русский выбран' });
        
    } else if (data === 'lang_en') {
        const url = config.siteUrl;
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
        );
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
    
    // Простая валидация URL
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        bot.sendMessage(chatId, '❌ URL должен начинаться с http:// или https://');
        return;
    }
    
    config.siteUrl = newUrl;
    saveConfig(config);
    
    bot.sendMessage(chatId, `✅ Ссылка обновлена!\nНовая ссылка: ${newUrl}`);
});

// ===== Команда /url (показать текущую ссылку) =====
bot.onText(/\/url/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    if (userId !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ У вас нет прав.');
        return;
    }
    
    bot.sendMessage(chatId, `🔗 Текущая ссылка: ${config.siteUrl}`);
});

// ===== Обработка неизвестных команд =====
bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/')) {
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

console.log('🤖 Бот запущен!');
console.log(`👤 Админ: ${ADMIN_ID}`);
console.log(`🔗 Текущая ссылка: ${config.siteUrl}`);