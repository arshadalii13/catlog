const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOAD_DIR = path.join(__dirname, 'images');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS, images)

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Initialize data.json if missing
if (!fs.existsSync(DATA_FILE)) {
    const initialData = [
        {
            id: '1', title: "Royal Zardosi", category: "embroidery", 
            description: "Exquisite hand-stitched floral embroidery with metallic threads on premium velvet.", price: "150", images: ["images/embroidery.png"]
        },
        {
            id: '2', title: "Heritage Indigo", category: "block-print", 
            description: "Traditional geometric and botanical block print in deep indigo on organic cotton.", price: "85", images: ["images/block_print.png"]
        },
        {
            id: '3', title: "Abstract Flow", category: "brush-paint", 
            description: "Expressive sweeping strokes of pastel and neon on high-quality dark canvas.", price: "120", images: ["images/brush_paint.png"]
        },
        {
            id: '4', title: "Urban Vector", category: "screen-print", 
            description: "Modern minimalist high-contrast screen print on a sleek dark fabric base.", price: "65", images: ["images/screen_print.png"]
        }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Routes
app.get('/api/products', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/upload', upload.array('images', 10), (req, res) => {
    try {
        const { title, category, description, price } = req.body;
        
        if (!title || !category || !price || !req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'Missing required fields or images' });
        }

        const newProduct = {
            id: Date.now().toString(),
            title,
            category,
            description,
            price,
            images: req.files.map(file => `images/${file.filename}`)
        };

        const products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        products.unshift(newProduct);
        fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));

        res.json({ success: true, product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error during upload.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
