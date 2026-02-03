const multer = require('multer');
const path = require('path');
const fs = require('fs');

const productsDir = 'public/storage/products';
const categoriesDir = 'public/storage/categories';

[productsDir, categoriesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (req.baseUrl.includes('categories') || req.path.includes('categories')) {
            cb(null, categoriesDir);
        } else {
            cb(null, productsDir);
        }
    },
    filename: (req, file, cb) => {
        // Unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

module.exports = upload;
