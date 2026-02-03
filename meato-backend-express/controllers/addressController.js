const { Address } = require('../models');

exports.index = async (req, res) => {
    try {
        const addresses = await Address.findAll({ where: { user_id: req.user.id } });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.store = async (req, res) => {
    try {
        const address = await Address.create({ ...req.body, user_id: req.user.id });
        res.status(201).json(address);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.show = async (req, res) => {
    try {
        const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!address) return res.status(404).json({ message: 'Not found' });
        res.json(address);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!address) return res.status(404).json({ message: 'Not found' });
        await address.update(req.body);
        res.json(address);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.destroy = async (req, res) => {
    try {
        const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!address) return res.status(404).json({ message: 'Not found' });
        await address.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
