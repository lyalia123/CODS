const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name_en: { type: String, required: true },
    name_ru: { type: String, required: true },
    description_en: { type: String },
    description_ru: { type: String },
    image1: { type: String },
    image2: { type: String },
    image3: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    deletedAt: { type: Date, default: null }
});

// Проверяем, не была ли модель уже зарегистрирована
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
