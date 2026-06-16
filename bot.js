const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const TOKEN = '8886148730:AAHO2oHpBT4g0RpLUXYCu1oSK_m_nyiTnK4';
const ADMIN_ID = '2105323375';

const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {}
    return { siteUrl: 'https://brian-shop.netlify.app' };
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

let config = loadConfig();

const bot = new TelegramBot(TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: { timeout: 10 }
    }
});

console.log('🤖 Бот запущен!');
console.log('👤 Админ:', ADMIN_ID);
console.log('🔗 Ссылка:', config.siteUrl);

// ===== /start =====
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Guest';
    
    bot.sendMessage(chatId, 
        `👋 Welcome, ${firstName}!\n\n` +
        `Choose your language / Выберите язык:`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
                        { text: '🇬🇧 English', callback_data: 'lang_en' }
                    ]
                ]
            }
        }
    );
});

// ===== Выбор языка =====
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    const url = config.siteUrl;
    
    if (data === 'lang_ru') {
        bot.sendMessage(chatId,
            `✅ Язык выбран: Русский\n\n` +
            `🏪 <b>Brian Shop</b>\n` +
            `Покупайте звезды, NFT подарки, аккаунты!\n\n` +
            `Нажмите кнопку ниже, чтобы открыть магазин.`,
            { 
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🛒 Открыть магазин', url: url }],
                        [{ text: '📞 Поддержка', url: 'https://t.me/Br1anRew' }]
                    ]
                }
            }
        );
        bot.answerCallbackQuery(callbackQuery.id, { text: '🇷🇺 Русский' });
        
    } else if (data === 'lang_en') {
        bot.sendMessage(chatId,
            `✅ Language selected: English\n\n` +
            `🏪 <b>Brian Shop</b>\n` +
            `Buy Stars, NFT Gifts, accounts!\n\n` +
            `Click the button below to open the store.`,
            { 
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🛒 Open Store', url: url }],
                        [{ text: '📞 Support', url: 'https://t.me/Br1anRew' }]
                    ]
                }
            }
        );
        bot.answerCallbackQuery(callbackQuery.id, { text: '🇬🇧 English' });
    }
});

// ===== /editurl =====
bot.onText(/\/editurl (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    if (userId !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ Нет прав.');
        return;
    }
    
    const newUrl = match[1].trim();
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        bot.sendMessage(chatId, '❌ URL должен начинаться с http:// или https://');
        return;
    }
    
    config.siteUrl = newUrl;
    saveConfig(config);
    bot.sendMessage(chatId, `✅ Ссылка обновлена!\n${newUrl}`);
});

// ===== /url =====
bot.onText(/\/url/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    if (userId !== ADMIN_ID) {
        bot.sendMessage(chatId, '❌ Нет прав.');
        return;
    }
    bot.sendMessage(chatId, `🔗 Текущая ссылка: ${config.siteUrl}`);
});

// ===== Ошибки =====
bot.on('polling_error', (error) => {
    console.log('Polling error:', error.message);
});

process.on('SIGINT', () => {
    bot.stopPolling();
    process.exit(0);
});
