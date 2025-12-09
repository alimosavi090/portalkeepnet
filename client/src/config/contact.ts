// Contact information configuration
// Update these values to change contact information across the entire site

export const contactConfig = {
    email: "support@keepnet.com", // ایمیل پشتیبانی
    telegram: {
        channel: "@keepnetvpn", // کانال تلگرام
        support: "@KeepNetsupport", // پشتیبانی تلگرام
        bot: "@keep_net_bot", // ربات تلگرام
    },
    social: {
        // می‌توانید سایر شبکه‌های اجتماعی را اینجا اضافه کنید
        // twitter: "@keepnet",
        // instagram: "@keepnet",
    },
};

// Helper functions to get URLs
export const getContactUrls = () => ({
    email: `mailto:${contactConfig.email}`,
    telegramChannel: `https://t.me/${contactConfig.telegram.channel.replace('@', '')}`,
    telegramSupport: `https://t.me/${contactConfig.telegram.support.replace('@', '')}`,
    telegramBot: `https://t.me/${contactConfig.telegram.bot.replace('@', '')}`,
});
