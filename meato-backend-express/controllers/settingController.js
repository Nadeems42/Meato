const { Setting } = require('../models');

exports.getHero = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const heroData = {
            title: settings.find(s => s.key === 'hero_title')?.value || "Freshness Delivered to Your Doorstep",
            subtitle: settings.find(s => s.key === 'hero_subtitle')?.value || "Get the finest groceries, farm-fresh vegetables, and premium daily essentials delivered in minutes.",
            badge: settings.find(s => s.key === 'hero_badge')?.value || "100% ORGANIC & FRESH",
            buttonText: settings.find(s => s.key === 'hero_button_text')?.value || "Shop Now",
            secondaryButtonText: settings.find(s => s.key === 'hero_secondary_button_text')?.value || "View Offers",
            imageUrl: settings.find(s => s.key === 'hero_image')?.value || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
            backgroundImageUrl: settings.find(s => s.key === 'hero_bg_image')?.value || "https://images.unsplash.com/photo-1506617429158-171e54c47eb2?w=1600"
        };
        res.json(heroData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const data = {};
        settings.forEach(s => data[s.key] = s.value);

        // Add defaults if missing
        if (!data.shop_name) data.shop_name = "Meato";

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { settings } = req.body; // Expects object { key: value, ... }
        if (!settings) return res.status(400).json({ error: 'No settings provided' });

        for (const [key, value] of Object.entries(settings)) {
            await Setting.upsert({ key, value: String(value) });
        }

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateHero = async (req, res) => {
    try {
        const { title, subtitle, badge, buttonText, secondaryButtonText } = req.body;
        const appUrl = process.env.APP_URL || 'http://localhost:8000';

        const updates = [
            { key: 'hero_title', value: title },
            { key: 'hero_subtitle', value: subtitle },
            { key: 'hero_badge', value: badge },
            { key: 'hero_button_text', value: buttonText },
            { key: 'hero_secondary_button_text', value: secondaryButtonText },
        ];

        // Handle uploaded files
        if (req.files) {
            if (req.files['imageFile']) {
                updates.push({
                    key: 'hero_image',
                    value: `${appUrl}/storage/products/${req.files['imageFile'][0].filename}`
                });
            }
            if (req.files['backgroundImageFile']) {
                updates.push({
                    key: 'hero_bg_image',
                    value: `${appUrl}/storage/products/${req.files['backgroundImageFile'][0].filename}`
                });
            }
        }

        for (const item of updates) {
            if (item.value !== undefined) {
                await Setting.upsert({ key: item.key, value: item.value });
            }
        }

        // Return updated data
        const settings = await Setting.findAll();
        const heroData = {
            title: settings.find(s => s.key === 'hero_title')?.value,
            subtitle: settings.find(s => s.key === 'hero_subtitle')?.value,
            badge: settings.find(s => s.key === 'hero_badge')?.value,
            buttonText: settings.find(s => s.key === 'hero_button_text')?.value,
            secondaryButtonText: settings.find(s => s.key === 'hero_secondary_button_text')?.value,
            imageUrl: settings.find(s => s.key === 'hero_image')?.value,
            backgroundImageUrl: settings.find(s => s.key === 'hero_bg_image')?.value
        };

        res.json({ message: 'Hero section updated successfully', data: heroData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
