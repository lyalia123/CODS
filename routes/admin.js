const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Product = require('../models/product');

// Middleware для проверки админа
function isAdmin(req, res, next) {
    if (!req.session || !req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/login');
    }
    next();
}

// Главная страница админки: теперь сразу показывает пользователей
router.get('/', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.render('admin/admin', { users });
    } catch (error) {
        res.status(500).send('Error loading admin panel');
    }
});

// 📌 Страница товаров
router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { products });
    } catch (error) {
        res.status(500).send('Error loading products');
    }
});

module.exports = router;
