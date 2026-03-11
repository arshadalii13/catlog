<?php
header('Content-Type: application/json');

$dataFile = 'data.json';
$uploadDir = 'images/';

// Ensure images directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $category = $_POST['category'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? '';
    
    if (empty($title) || empty($category) || empty($price) || !isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields or image']);
        exit;
    }

    $image = $_FILES['image'];
    
    // Basic validation
    if ($image['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Image upload failed']);
        exit;
    }

    // Generate safe filename
    $extension = pathinfo($image['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($image['tmp_name'], $targetPath)) {
        // Read existing data
        $products = [];
        if (file_exists($dataFile)) {
            $products = json_decode(file_get_contents($dataFile), true);
        }

        // Create new product entry
        $newProduct = [
            'id' => uniqid(),
            'title' => $title,
            'category' => $category,
            'description' => $description,
            'price' => $price,
            'image' => $targetPath
        ];

        // Append and save
        array_unshift($products, $newProduct); // Add to beginning
        file_put_contents($dataFile, json_encode($products, JSON_PRETTY_PRINT));

        echo json_encode(['success' => true, 'product' => $newProduct]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save image file']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
}
?>
