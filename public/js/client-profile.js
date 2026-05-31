const photoWrapper = document.getElementById('photoWrapper');
const photoInput   = document.getElementById('photoInput');
const profilePhoto = document.getElementById('profilePhoto');
const sidebarPhoto = document.getElementById('sidebarPhoto');
const uploadStatus = document.getElementById('uploadStatus');

const DEFAULT_PHOTO = '/images/my-photo.jpg';
const originalSrc = profilePhoto.src || DEFAULT_PHOTO;

// Click on photo opens file picker
photoWrapper.addEventListener('click', () => photoInput.click());

// File selected
photoInput.addEventListener('change', async () => {
  const file = photoInput.files[0];
  if (!file) return;

  // Validate type
  if (!file.type.startsWith('image/')) {
    showStatus('Please select an image file.', 'error');
    return;
  }

  showStatus('Uploading...', 'loading');

  // Compress + convert to base64
  const base64 = await toBase64(file);

  // Preview immediately
  profilePhoto.src = base64;
  sidebarPhoto.src = base64;

  try {
    const res = await fetch('/client-profile/update-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo: base64 })
    });

    // Catch non-JSON responses (e.g. 413)
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();

    if (data.success) {
      showStatus('Photo updated ✓', 'success');
    } else {
      throw new Error(data.error || 'Upload failed');
    }

  } catch (err) {
    console.error('Upload error:', err);
    showStatus(err.message || 'Upload failed. Try again.', 'error');
    // Revert preview
    profilePhoto.src = originalSrc;
    sidebarPhoto.src = originalSrc;
  }

  // Reset so same file can be re-selected
  photoInput.value = '';
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 400x400 and compress to keep payload small
        const MAX = 400;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        } else {
          if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        }

        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        // JPEG at 70% quality — typically 30–80kb
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function showStatus(msg, type) {
  uploadStatus.textContent = msg;
  uploadStatus.className = type;
  if (type === 'success') {
    setTimeout(() => {
      uploadStatus.textContent = '';
      uploadStatus.className = '';
    }, 3000);
  }
}
