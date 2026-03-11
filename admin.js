document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const statusMsg = document.getElementById('status-message');

    const showMessage = (msg, isError = false) => {
        statusMsg.textContent = msg;
        statusMsg.style.display = 'block';
        statusMsg.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
        statusMsg.style.color = isError ? '#fca5a5' : '#86efac';
        statusMsg.style.border = `1px solid ${isError ? '#ef4444' : '#22c55e'}`;
    };

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset message
        statusMsg.style.display = 'none';

        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Uploading...';
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append('title', uploadForm.querySelector('#title').value);
        formData.append('price', uploadForm.querySelector('#price').value);
        formData.append('category', uploadForm.querySelector('#category').value);
        formData.append('description', uploadForm.querySelector('#description').value);
        
        const fileInput = uploadForm.querySelector('#images');
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('images', fileInput.files[i]);
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showMessage('Product successfully added to the catalog!');
                uploadForm.reset(); // clear form
            } else {
                showMessage(result.error || 'Server error occurred during upload', true);
            }
        } catch (error) {
            console.error('Upload Error:', error);
            showMessage('Network error. Failed to connect to server.', true);
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
