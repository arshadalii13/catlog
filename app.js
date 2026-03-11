document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Fetch Products Function
    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('API Error');
            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error fetching data:', error);
            productGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column: 1/-1; text-align:center;">Failed to load products. Please ensure the PHP server is running.</p>';
            return [];
        }
    };

    // Display Products Function
    const displayProducts = (items) => {
        productGrid.innerHTML = '';
        
        if(items.length === 0){
            productGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column: 1/-1; text-align:center;">No products found.</p>';
            return;
        }

        items.forEach(product => {
            // Function to format category string for display
            const formatCategory = (cat) => cat.replace('-', ' ');

            // SVG Icon for Download button
            const downloadIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`;

            const card = document.createElement('div');
            card.className = 'product-card';
            let imagesHtml = '';
            let dotsHtml = '';
            const hasMultipleImages = product.images && product.images.length > 1;

            if (product.images && product.images.length > 0) {
                product.images.forEach((img, i) => {
                    const activeClass = i === 0 ? 'active' : '';
                    imagesHtml += `<img src="${img}" alt="${product.title}" class="slider-image ${activeClass}" loading="lazy">`;
                    if (hasMultipleImages) {
                        dotsHtml += `<div class="dot ${activeClass}" data-index="${i}"></div>`;
                    }
                });
            } else {
                imagesHtml = `<img src="${product.image || ''}" alt="${product.title}" class="slider-image active" loading="lazy">`;
            }

            let navHtml = '';
            if (hasMultipleImages) {
                navHtml = `
                    <button class="slider-nav slider-prev">&#10094;</button>
                    <button class="slider-nav slider-next">&#10095;</button>
                    <div class="slider-dots">${dotsHtml}</div>
                `;
            }

            card.innerHTML = `
                <div class="card-img-wrapper">
                    <div class="slider-container">
                        ${imagesHtml}
                        ${navHtml}
                    </div>
                    <span class="card-category-badge">${formatCategory(product.category)}</span>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3 class="card-title">${product.title}</h3>
                        <span class="card-price">₹${product.price}</span>
                    </div>
                    <p class="card-desc">${product.description}</p>
                    <div class="card-actions">
                        <button class="save-btn" title="Download Current Image" style="border: none;">
                            ${downloadIcon} Save Image
                        </button>
                    </div>
                </div>
            `;

            // Slider Logic
            if (hasMultipleImages) {
                let currentIndex = 0;
                const imagesNodes = card.querySelectorAll('.slider-image');
                const dotsNodes = card.querySelectorAll('.dot');
                const prevBtn = card.querySelector('.slider-prev');
                const nextBtn = card.querySelector('.slider-next');

                const showSlide = (index) => {
                    imagesNodes[currentIndex].classList.remove('active');
                    dotsNodes[currentIndex].classList.remove('active');
                    currentIndex = index;
                    if (currentIndex >= imagesNodes.length) currentIndex = 0;
                    if (currentIndex < 0) currentIndex = imagesNodes.length - 1;
                    imagesNodes[currentIndex].classList.add('active');
                    dotsNodes[currentIndex].classList.add('active');
                };

                prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
                nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));
                dotsNodes.forEach(dot => {
                    dot.addEventListener('click', (e) => {
                        showSlide(parseInt(e.target.dataset.index));
                    });
                });
            }

            // Save Image Logic
            const saveBtn = card.querySelector('.save-btn');
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = 'Downloading...';
                saveBtn.disabled = true;

                try {
                    const activeImage = card.querySelector('.slider-image.active');
                    if (!activeImage) throw new Error("No image found");
                    const imgPath = activeImage.src;
                    
                    // Load image into a canvas to convert format to JPEG
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = imgPath;
                    
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = () => reject(new Error("Image load failed"));
                    });
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    // Fill white background in case of transparent PNGs
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
                    if (!blob) throw new Error("Failed to create JPEG blob");
                    
                    const activeIndex = hasMultipleImages ? Array.from(card.querySelectorAll('.slider-image')).indexOf(activeImage) : 0;
                    const filename = `${product.title.replace(/ /g, '_').toLowerCase()}_${activeIndex + 1}.jpg`;
                    
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                } catch (error) {
                    console.error("Failed to download image", error);
                    alert("Error downloading image.");
                } finally {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            });

            productGrid.appendChild(card);
            
            // Subtle entrance animation based on index
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50 * items.indexOf(product));
        });
    };

    // Initialize App
    const initApp = async () => {
        const products = await fetchProducts();
        
        // Filter Logic
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');

                const filterValue = e.target.getAttribute('data-filter');

                if (filterValue === 'all') {
                    displayProducts(products);
                } else {
                    const filteredProducts = products.filter(product => product.category === filterValue);
                    displayProducts(filteredProducts);
                }
            });
        });

        // Initial Load
        displayProducts(products);
    };

    initApp();
});
