// ── Photo upload ──
const photoWrapper = document.getElementById('photoWrapper');
const photoInput   = document.getElementById('photoInput');
const profilePhoto = document.getElementById('profilePhoto');
const sidebarPhoto = document.getElementById('sidebarPhoto');
const uploadStatus = document.getElementById('uploadStatus');

const DEFAULT_PHOTO = '/images/my-photo.jpg';
const originalSrc   = profilePhoto ? (profilePhoto.src || DEFAULT_PHOTO) : DEFAULT_PHOTO;

if (photoWrapper && photoInput) {
  photoWrapper.addEventListener('click', () => photoInput.click());

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('Please select an image file.', 'error');
      return;
    }

    showStatus('Uploading...', 'loading');
    const base64 = await toBase64(file);

    if (profilePhoto) profilePhoto.src = base64;
    if (sidebarPhoto) sidebarPhoto.src = base64;

    try {
      const res = await fetch('/client-profile/update-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: base64 })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.success) {
        showStatus('Photo updated ✓', 'success');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showStatus(err.message || 'Upload failed. Try again.', 'error');
      if (profilePhoto) profilePhoto.src = originalSrc;
      if (sidebarPhoto) sidebarPhoto.src = originalSrc;
    }

    photoInput.value = '';
  });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else        { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
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
  if (!uploadStatus) return;
  uploadStatus.textContent = msg;
  uploadStatus.className = type;
  if (type === 'success') {
    setTimeout(() => { uploadStatus.textContent = ''; uploadStatus.className = ''; }, 3000);
  }
}

// ── Numbers only on phone input ──
const inputPhone = document.getElementById('inputPhone');
if (inputPhone) {
  inputPhone.addEventListener('input',    () => { inputPhone.value = inputPhone.value.replace(/[^0-9]/g, ''); });
  inputPhone.addEventListener('keypress', (e) => { if (e.which < 48 || e.which > 57) e.preventDefault(); });
}

// ── Inline profile edit (name + phone) ──
const profileEditBtn    = document.getElementById('profileEditBtn');
const profileSaveBtn    = document.getElementById('profileSaveBtn');
const profileCancelBtn  = document.getElementById('profileCancelBtn');
const profileEditStatus = document.getElementById('profileEditStatus');
const displayName       = document.getElementById('displayName');
const displayPhone      = document.getElementById('displayPhone');
const inputName         = document.getElementById('inputName');

let originalName, originalPhone;

if (profileEditBtn) {
  profileEditBtn.addEventListener('click', () => {
    originalName  = displayName.textContent.trim();
    originalPhone = displayPhone.textContent.trim();

    displayName.style.display   = 'none';
    displayPhone.style.display  = 'none';
    inputName.style.display     = 'inline-block';
    inputPhone.style.display    = 'inline-block';

    profileEditBtn.style.display   = 'none';
    profileSaveBtn.style.display   = 'inline-block';
    profileCancelBtn.style.display = 'inline-block';

    inputName.focus();
    profileEditStatus.textContent = '';
    profileEditStatus.className   = '';
  });
}

if (profileCancelBtn) {
  profileCancelBtn.addEventListener('click', () => {
    displayName.textContent  = originalName;
    displayPhone.textContent = originalPhone;
    inputName.value  = originalName;
    inputPhone.value = originalPhone;
    exitEditMode();
  });
}

if (profileSaveBtn) {
  profileSaveBtn.addEventListener('click', async () => {
    const newName  = inputName.value.trim();
    const newPhone = inputPhone.value.trim();

    if (!newName || newName.length < 9) {
      showEditStatus('Name must be at least 9 characters.', 'error'); return;
    }
    if (!newPhone || !/^\d{11}$/.test(newPhone)) {
      showEditStatus('Phone must be exactly 11 digits.', 'error'); return;
    }

    profileSaveBtn.disabled = true;
    showEditStatus('Saving...', '');

    try {
      const res  = await fetch('/client-profile/update-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, phone: newPhone })
      });
      const data = await res.json();

      if (data.success) {
        displayName.textContent  = newName;
        displayPhone.textContent = newPhone;
        const sidebarName = document.querySelector('.sidebar-profile h3');
        if (sidebarName) sidebarName.textContent = newName;
        showEditStatus('Saved ✓', 'success');
        setTimeout(() => exitEditMode(), 1000);
      } else {
        showEditStatus(data.error || 'Save failed.', 'error');
      }
    } catch (err) {
      showEditStatus('Connection error. Try again.', 'error');
    } finally {
      profileSaveBtn.disabled = false;
    }
  });
}

function exitEditMode() {
  if (!displayName) return;
  displayName.style.display   = 'inline';
  displayPhone.style.display  = 'inline';
  inputName.style.display     = 'none';
  inputPhone.style.display    = 'none';
  profileEditBtn.style.display   = 'inline-block';
  profileSaveBtn.style.display   = 'none';
  profileCancelBtn.style.display = 'none';
  setTimeout(() => { profileEditStatus.textContent = ''; profileEditStatus.className = ''; }, 2000);
}

function showEditStatus(msg, type) {
  if (!profileEditStatus) return;
  profileEditStatus.textContent = msg;
  profileEditStatus.className   = type;
}

// ── Delete Account ──
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const deleteModal      = document.getElementById('deleteModal');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
const deleteCancelBtn  = document.getElementById('deleteCancelBtn');
const accountStatus    = document.getElementById('accountStatus');
const deletePasswordInput = document.getElementById('deletePassword');
const deletePasswordError = document.getElementById('deletePasswordError');
const role = document.body && document.body.dataset && document.body.dataset.role ? document.body.dataset.role : 'client';

if (deleteAccountBtn && deleteModal) {
  deleteAccountBtn.addEventListener('click', () => { deleteModal.style.display = 'flex'; });
}
if (deleteModal) {
  deleteModal.addEventListener('show', () => {
    if (deletePasswordError) deletePasswordError.textContent = '';
    if (accountStatus) accountStatus.textContent = '';
  });
}
if (deleteCancelBtn) {
  deleteCancelBtn.addEventListener('click', () => { deleteModal.style.display = 'none'; });
}
if (deleteModal) {
  deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) deleteModal.style.display = 'none'; });
}
if (deleteConfirmBtn) {
  deleteConfirmBtn.addEventListener('click', async () => {
    const current = deletePasswordInput ? deletePasswordInput.value.trim() : '';
    if (!current) {
      if (deletePasswordError) { deletePasswordError.textContent = 'Please enter your current password.'; }
      return;
    }

    deleteConfirmBtn.disabled    = true;
    deleteConfirmBtn.textContent = 'Deleting...';
    try {
      const res  = await fetch('/profile/delete-account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/';
      } else {
        if (data && data.error) {
          if (data.error === 'Incorrect current password') {
            if (deletePasswordError) deletePasswordError.textContent = data.error;
          } else {
            deleteModal.style.display = 'none';
            if (accountStatus) { accountStatus.textContent = data.error; accountStatus.className = 'error'; }
          }
        } else {
          deleteModal.style.display = 'none';
          if (accountStatus) { accountStatus.textContent = 'Delete failed.'; accountStatus.className = 'error'; }
        }
      }
    } catch (err) {
      if (accountStatus) { accountStatus.textContent = 'Connection error. Try again.'; accountStatus.className = 'error'; }
    } finally {
      deleteConfirmBtn.disabled    = false;
      deleteConfirmBtn.textContent = 'Yes, Delete My Account';
    }
  });
}

// ── Change Password ──
const changePasswordForm = document.getElementById('changePasswordForm');
const changePasswordStatus = document.getElementById('changePasswordStatus');
if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = document.getElementById('cpCurrent').value.trim();
    const next = document.getElementById('cpNew').value.trim();
    const confirm = document.getElementById('cpConfirm').value.trim();
    if (!current || !next || !confirm) {
      changePasswordStatus.textContent = 'All fields are required.'; changePasswordStatus.className = 'error'; return;
    }
    if (next.length < 6) { changePasswordStatus.textContent = 'New password must be at least 6 characters.'; changePasswordStatus.className = 'error'; return; }
    if (next !== confirm) { changePasswordStatus.textContent = 'Passwords do not match.'; changePasswordStatus.className = 'error'; return; }

    try {
      changePasswordStatus.textContent = 'Updating...'; changePasswordStatus.className = '';
      const res = await fetch('/profile/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next, confirmPassword: confirm })
      });
      const data = await res.json();
      if (data.success) {
        changePasswordStatus.textContent = 'Password updated ✓'; changePasswordStatus.className = 'success';
        changePasswordForm.reset();
      } else {
        changePasswordStatus.textContent = data.error || 'Update failed.'; changePasswordStatus.className = 'error';
      }
    } catch (err) {
      changePasswordStatus.textContent = 'Connection error. Try again.'; changePasswordStatus.className = 'error';
    }
  });
}
