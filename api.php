<?php
header('Content-Type: application/json');

$dataFile = 'data.json';

// Initialize data.json if it doesn't exist
if (!file_exists($dataFile)) {
    $initialData = [
        [
            "id" => uniqid(),
            "title" => "Royal Zardosi",
            "category" => "embroidery",
            "description" => "Exquisite hand-stitched floral embroidery with metallic threads on premium velvet.",
            "price" => "150",
            "image" => "images/embroidery.png"
        ],
        [
            "id" => uniqid(),
            "title" => "Heritage Indigo",
            "category" => "block-print",
            "description" => "Traditional geometric and botanical block print in deep indigo on organic cotton.",
            "price" => "85",
            "image" => "images/block_print.png"
        ],
        [
            "id" => uniqid(),
            "title" => "Abstract Flow",
            "category" => "brush-paint",
            "description" => "Expressive sweeping strokes of pastel and neon on high-quality dark canvas.",
            "price" => "120",
            "image" => "images/brush_paint.png"
        ],
        [
            "id" => uniqid(),
            "title" => "Urban Vector",
            "category" => "screen-print",
            "description" => "Modern minimalist high-contrast screen print on a sleek dark fabric base.",
            "price" => "65",
            "image" => "images/screen_print.png"
        ]
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT));
}

// Handle GET request to fetch products
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = file_get_contents($dataFile);
    echo $data;
    exit;
}

// Handle DELETE request to remove a product
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID required']);
        exit;
    }

    $products = json_decode(file_get_contents($dataFile), true);
    $filteredProducts = array_filter($products, function($p) use ($id) {
        return $p['id'] !== $id;
    });

    // Re-index array
    $filteredProducts = array_values($filteredProducts);
    file_put_contents($dataFile, json_encode($filteredProducts, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
