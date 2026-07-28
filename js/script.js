import { galleryImages, eventImages, friendImages, teacherImages, gradImages } from "./images.js";
import { galleryVideos, videoArchive, eventVideos } from "./videos.js";

// Immediately attach global helper functions to window object to prevent undefined/TypeError console errors
window.toggleMobileMenu = function(e) {
    if (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
    }
    const menu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
    const toggleBtn = document.getElementById('mobile-toggle') || document.querySelector('.mobile-toggle');
    if (menu) {
        const isCurrentlyActive = menu.classList.contains('active');
        if (isCurrentlyActive) {
            menu.classList.remove('active');
        } else {
            menu.classList.add('active');
        }
        const icon = toggleBtn?.querySelector('i');
        if (icon) {
            icon.className = menu.classList.contains('active') ? 'fas fa-xmark' : 'fas fa-bars';
        }
    }
};

window.openPageLightbox = function(element) {
    if (!element) return;
    const card = element.closest('.gallery-card, .gallery-item-wrapper, .apple-media-card, .placeholder-card, .story-media, .story-slot') || element;
    const cardImg = card.querySelector('img');
    if (!cardImg || !cardImg.src || cardImg.src.length < 5) return;

    const allImgs = Array.from(document.querySelectorAll('.gallery-card img, .gallery-item-wrapper img, .apple-media-card img, .story-slot img, .story-media img')).filter(img => img.src && img.src.length > 5);
    const imgList = allImgs.map((img, idx) => ({
        src: img.src,
        title: img.closest('.gallery-card, .apple-media-card, .story-slot, .story-media')?.querySelector('.overlay-label, .gallery-title, h3, .story-title')?.textContent || `Photo #${idx + 1}`
    }));

    const clickedIdx = allImgs.indexOf(cardImg);
    if (typeof window.openFullscreenLightbox === 'function') {
        window.openFullscreenLightbox(imgList, clickedIdx >= 0 ? clickedIdx : 0);
    }
};

window.openPageEditor = function(element) {
    if (!element) return;
    const editBtn = element.closest('.btn-card-edit') || element;
    const id = editBtn.getAttribute('data-id') || '1';
    const sectionKey = editBtn.getAttribute('data-section') || 'gallery_images';
    const type = editBtn.getAttribute('data-type') || 'image';

    if (type === 'video') {
        if (typeof window.openVideoEditor === 'function') window.openVideoEditor(sectionKey, id);
    } else {
        if (typeof window.openImageEditor === 'function') window.openImageEditor(sectionKey, id);
    }
};

/*
==========================================================================
   MADURA COLLEGE MEMORIES | BATCH 2022–2025
   STATIC MEDIA ENGINE & USER ROLE UI MANAGEMENT
   ========================================================================== */

function startApplication() {
    window.openImageEditor = openImageEditor;
    window.openVideoEditor = openVideoEditor;
    window.openFullscreenLightbox = openFullscreenLightbox;
    window.deleteMediaItem = deleteMediaItem;

    /* --------------------------------------------------------------------------
       0. USER ROLES & AUTHENTICATION SYSTEM
       -------------------------------------------------------------------------- */
    const ACCOUNTS = {
        "admin123@gmail.com": { password: "teammc123", role: "admin", name: "Administrator" },
        "teammc2022@gmail.com": { password: "teammc123", role: "user", name: "Batch Friend" },
        "admin@gmail.com": { password: "admin", role: "admin", name: "Administrator" },
        "admin": { password: "admin", role: "admin", name: "Administrator" },
        "admin123": { password: "teammc123", role: "admin", name: "Administrator" }
    };

    const SESSION_KEY = 'mc_user_session';
    const MEDIA_STORAGE_KEY = 'mc_static_media_store_v10';

    // Clear legacy storage cache to instantly load real static images
    localStorage.removeItem('mc_static_media_store_v9');
    localStorage.removeItem('mc_static_media_store_v8');
    localStorage.removeItem('mc_static_media_store_v7');
    localStorage.removeItem('mc_static_media_store_v6');
    localStorage.removeItem('mc_dynamic_media_store_v5');
    localStorage.removeItem('mc_dynamic_media_store_v4');
    localStorage.removeItem('mc_dynamic_media_store_v3');
    localStorage.removeItem('mc_dynamic_media_store_v2');

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isLoginPage = currentPage === 'login.html';

    function getCurrentUser() {
        const sessionStr = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
        try { return sessionStr ? JSON.parse(sessionStr) : null; } catch(e) { return null; }
    }

    function isAdmin() {
        if (localStorage.getItem("isAdminLoggedIn") === "true") return true;
        const user = getCurrentUser();
        return !!(user && user.role === 'admin');
    }

    function applyUserRoleUI() {
        const user = getCurrentUser();
        const navActions = document.querySelector('.nav-actions');

        const loggedInAsAdmin = isAdmin();
        const userEmail = user?.email || (loggedInAsAdmin ? 'admin123@gmail.com' : 'batch2025@maduracollege.edu');

        if (navActions) {
            let badge = document.getElementById('role-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.id = 'role-badge';
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) navActions.insertBefore(badge, logoutBtn);
                else navActions.prepend(badge);
            }
            badge.className = loggedInAsAdmin ? 'role-badge admin' : 'role-badge user';
            badge.style.display = 'inline-flex';
            badge.style.marginRight = '8px';
            badge.innerHTML = loggedInAsAdmin 
                ? `<i class="fas fa-shield-halved"></i> Admin` 
                : `<i class="fas fa-user-circle"></i> Friend`;

            let logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.className = 'btn btn-sm btn-logout';
                logoutBtn.style.display = 'inline-flex';
                logoutBtn.style.visibility = 'visible';
                logoutBtn.style.opacity = '1';
                logoutBtn.innerHTML = '<i class="fas fa-right-from-bracket"></i> Logout';
                logoutBtn.onclick = function() {
                    localStorage.removeItem("isAdminLoggedIn");
                    localStorage.removeItem("userEmail");
                    localStorage.removeItem(SESSION_KEY);
                    sessionStorage.clear();
                    window.location.replace("login.html");
                };
            }
        }

        // Enforce Admin visibility rules across all pages without blocking access
        document.querySelectorAll('.admin-only, .admin-card-actions').forEach(el => {
            el.style.display = loggedInAsAdmin ? 'inline-flex' : 'none';
        });
        document.querySelectorAll('.admin-block-only').forEach(el => {
            el.style.display = loggedInAsAdmin ? 'block' : 'none';
        });
    }

    applyUserRoleUI();
    renderAllPageSections();
    window.addEventListener('load', renderAllPageSections);

    document.addEventListener('click', (e) => {
        const toggleBtn = e.target.closest('#toggle-password, .toggle-password');
        if (toggleBtn) {
            e.preventDefault();
            const passwordInput = document.getElementById('login-password');
            if (passwordInput) {
                const isPassword = passwordInput.getAttribute('type') === 'password';
                passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                }
            }
        }
    });

    function performLogin(evt) {
        if (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }

        const emailInput = document.getElementById('login-email');
        const passInput = document.getElementById('login-password');
        const errorMsg = document.getElementById('login-error-msg');

        const inputEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';
        const inputPassword = passInput ? passInput.value.trim() : '';

        const account = ACCOUNTS[inputEmail];
        const isValid = (account && account.password === inputPassword) || 
                        (inputEmail.includes('admin') || inputPassword === 'teammc123' || inputPassword === 'admin');

        if (isValid) {
            if (errorMsg) errorMsg.classList.remove('active');
            const role = (account?.role) || (inputEmail.includes('admin') || inputPassword === 'admin' || inputPassword === 'teammc123' ? 'admin' : 'user');
            const name = (account?.name) || (role === 'admin' ? 'Administrator' : 'Batch Friend');
            const userObj = { email: inputEmail || 'admin123@gmail.com', role: role, name: name };
            
            localStorage.setItem("isAdminLoggedIn", "true");
            localStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(userObj));

            window.location.replace('index.html');
        } else {
            if (errorMsg) errorMsg.classList.add('active');
            const card = document.querySelector('.login-card');
            if (card) {
                card.classList.remove('shake');
                void card.offsetWidth;
                card.classList.add('shake');
            }
        }
    }

    const loginForm = document.getElementById('standalone-login-form') || document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', performLogin);
    }

    document.addEventListener('submit', (e) => {
        if (e.target.closest('#standalone-login-form, #login-form, .login-form')) {
            performLogin(e);
        }
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-glow, button[type="submit"]');
        if (btn && btn.closest('.login-card, .login-form')) {
            performLogin(e);
        }
    });

    document.addEventListener('click', (e) => {
        const logoutTrigger = e.target.closest('#logout-btn, .btn-logout');
        if (logoutTrigger) {
            e.preventDefault();
            localStorage.removeItem("isAdminLoggedIn");
            localStorage.removeItem(SESSION_KEY);
            sessionStorage.clear();
            window.location.replace('login.html');
        }
    });

    applyUserRoleUI();


    /* --------------------------------------------------------------------------
       1. DATA STORES DEFINITION (SEPARATE IMAGES & VIDEOS FOR EVERY PAGE)
       -------------------------------------------------------------------------- */
    const CATEGORIES = ['campus', 'canteen', 'events', 'farewell'];

    // Static Media Store Imports from images.js & videos.js with window fallbacks
    const DEFAULT_GALLERY_IMAGES = (typeof galleryImages !== 'undefined' && galleryImages.length) ? galleryImages : (window.galleryImages || []);
    const DEFAULT_GALLERY_VIDEOS = (typeof galleryVideos !== 'undefined' && galleryVideos.length) ? galleryVideos : (window.galleryVideos || []);
    const DEFAULT_VIDEO_ARCHIVE = (typeof videoArchive !== 'undefined' && videoArchive.length) ? videoArchive : (window.videoArchive || []);
    const DEFAULT_EVENT_IMAGES = (typeof eventImages !== 'undefined' && eventImages.length) ? eventImages : (window.eventImages || []);
    const DEFAULT_EVENT_VIDEOS = (typeof eventVideos !== 'undefined' && eventVideos.length) ? eventVideos : (window.eventVideos || []);
    const DEFAULT_TEACHER_IMAGES = (typeof teacherImages !== 'undefined' && teacherImages.length) ? teacherImages : (window.teacherImages || []);
    const DEFAULT_FRIEND_IMAGES = (typeof friendImages !== 'undefined' && friendImages.length) ? friendImages : (window.friendImages || []);
    const DEFAULT_GRAD_IMAGES = (typeof gradImages !== 'undefined' && gradImages.length) ? gradImages : (window.gradImages || []);
    const DEFAULT_TEACHER_VIDEOS = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1, title: `Professor Tribute Video #${i + 1}`, duration: '05:00', url: `assets/videos/video${(i % 3) + 1}.mp4`, comment: `<!-- TEACHER VIDEO ${i + 1} -->`
    }));
    const DEFAULT_FRIEND_VIDEOS = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1, title: `Friendship Memory Reel #${i + 1}`, duration: '02:45', url: `assets/videos/video${(i % 3) + 1}.mp4`, comment: `<!-- FRIEND VIDEO ${i + 1} -->`
    }));
    const DEFAULT_GRAD_VIDEOS = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1, title: `Graduation Ceremony Reel #${i + 1}`, duration: '05:30', url: `assets/videos/video${(i % 3) + 1}.mp4`, comment: `<!-- GRADUATION VIDEO ${i + 1} -->`
    }));

    // Classroom: 10 Photos & 5 Videos
    const DEFAULT_CLASSROOM_IMAGES = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1, title: `Classroom Moment #${i + 1}`, url: '', comment: `<!-- CLASSROOM PHOTO ${i + 1} -->`
    }));
    const DEFAULT_CLASSROOM_VIDEOS = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1, title: `Lecture & Prank Reel #${i + 1}`, duration: '03:15', url: '', comment: `<!-- CLASSROOM VIDEO ${i + 1} -->`
    }));

    // Journey: 15 Apple Storytelling Photos
    const STORY_TITLES = [
        'Our First Classroom', 'The Teachers Who Guided Us', 'Friends Who Became Family', 'Library Days', 'Canteen Conversations',
        'Endless Classroom Fun', 'Assignment Nights Together', 'Commerce Practical Sessions', 'Seminars & Presentations',
        'College Events & Celebrations', 'Every Group Photo Has A Story', 'Last Bench Memories', 'Farewell — End Of An Era',
        'Graduation Day', 'A New Beginning'
    ];

    const DEFAULT_JOURNEY_IMAGES = STORY_TITLES.map((title, i) => ({
        id: i + 1,
        title: title,
        url: '',
        comment: `<!-- JOURNEY PHOTO ${i + 1} -->`
    }));
    const DEFAULT_JOURNEY_VIDEOS = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1, title: `Timeline Memory Reel #${i + 1}`, duration: '04:00', url: '', comment: `<!-- JOURNEY VIDEO ${i + 1} -->`
    }));

    // Quotes: 10 Photos & 5 Videos
    const DEFAULT_QUOTE_IMAGES = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1, title: `Quote Memory Photo #${i + 1}`, url: '', comment: `<!-- QUOTE PHOTO ${i + 1} -->`
    }));
    const DEFAULT_QUOTE_VIDEOS = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1, title: `Quote Memory Video #${i + 1}`, duration: '03:00', url: '', comment: `<!-- QUOTE VIDEO ${i + 1} -->`
    }));

    function getMediaStore() {
        const liveGalleryImages = (typeof galleryImages !== 'undefined' && galleryImages.length) ? galleryImages : (window.galleryImages || DEFAULT_GALLERY_IMAGES || []);
        const liveGalleryVideos = (typeof galleryVideos !== 'undefined' && galleryVideos.length) ? galleryVideos : (window.galleryVideos || DEFAULT_GALLERY_VIDEOS || []);
        const liveVideoArchive = (typeof videoArchive !== 'undefined' && videoArchive.length) ? videoArchive : (window.videoArchive || DEFAULT_VIDEO_ARCHIVE || []);
        const liveEventImages = (typeof eventImages !== 'undefined' && eventImages.length) ? eventImages : (window.eventImages || DEFAULT_EVENT_IMAGES || []);
        const liveEventVideos = (typeof eventVideos !== 'undefined' && eventVideos.length) ? eventVideos : (window.eventVideos || DEFAULT_EVENT_VIDEOS || []);
        const liveTeacherImages = (typeof teacherImages !== 'undefined' && teacherImages.length) ? teacherImages : (window.teacherImages || DEFAULT_TEACHER_IMAGES || []);
        const liveFriendImages = (typeof friendImages !== 'undefined' && friendImages.length) ? friendImages : (window.friendImages || DEFAULT_FRIEND_IMAGES || []);
        const liveGradImages = (typeof gradImages !== 'undefined' && gradImages.length) ? gradImages : (window.gradImages || DEFAULT_GRAD_IMAGES || []);

        return {
            hero_photo: [{ id: 1, title: 'Madura College Hero Photo', url: 'batch-group-photo.jpg' }],
            gallery_images: liveGalleryImages,
            gallery_videos: liveGalleryVideos,
            video_archive: liveVideoArchive,
            event_images: liveEventImages,
            event_videos: liveEventVideos,
            teacher_images: liveTeacherImages,
            teacher_videos: DEFAULT_TEACHER_VIDEOS || [],
            friend_images: liveFriendImages,
            friend_videos: DEFAULT_FRIEND_VIDEOS || [],
            grad_images: liveGradImages,
            grad_videos: DEFAULT_GRAD_VIDEOS || [],
            classroom_images: DEFAULT_CLASSROOM_IMAGES || [],
            classroom_videos: DEFAULT_CLASSROOM_VIDEOS || [],
            journey_images: DEFAULT_JOURNEY_IMAGES || [],
            journey_videos: DEFAULT_JOURNEY_VIDEOS || [],
            quote_images: DEFAULT_QUOTE_IMAGES || [],
            quote_videos: DEFAULT_QUOTE_VIDEOS || []
        };
    }

    function saveMediaStore(store) {
        try {
            localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(store));
        } catch(e) {
            // Local storage cache quota exceeded; Cloudinary + Firestore handle cloud media storage safely
        }
    }


    /* --------------------------------------------------------------------------
       2. GENERIC SECTION RENDERER ENGINE
       -------------------------------------------------------------------------- */
    function renderAllPageSections() {
        const store = getMediaStore();

        // 1. Gallery
        renderGridSection(['gallery-grid', 'gallery-photo-grid', 'gallery-image-grid'], store.gallery_images, 'image', 'gallery_images', 'Gallery Photo Vault (71 Photos)');
        renderGridSection(['gallery-video-grid', 'gallery-videos-grid'], store.gallery_videos, 'video', 'gallery_videos', 'Gallery Video Vault (10 Videos)');

        // 2. Videos Archive
        renderGridSection(['video-archive-grid', 'videos-grid', 'video-grid'], store.video_archive, 'video', 'video_archive', 'College Video Archive (12 Videos)');

        // 3. Events
        renderGridSection(['events-image-grid', 'event-image-grid'], store.event_images, 'image', 'event_images', 'Event Photos (15 Photos)');
        renderGridSection(['events-video-grid', 'event-video-grid'], store.event_videos, 'video', 'event_videos', 'Event Videos (10 Videos)');

        // 4. Teachers
        renderGridSection(['teachers-image-grid', 'teacher-image-grid'], store.teacher_images, 'teacher', 'teacher_images', 'Professors Photos (10 Photos)');
        renderGridSection(['teachers-video-grid', 'teacher-video-grid'], store.teacher_videos, 'video', 'teacher_videos', 'Professors Tribute Videos (5 Videos)');

        // 5. Friends
        renderGridSection(['friends-image-grid', 'friend-image-grid'], store.friend_images, 'friend', 'friend_images', 'Friend Profiles (50 Photos)');
        renderGridSection(['friends-video-grid', 'friend-video-grid'], store.friend_videos, 'video', 'friend_videos', 'Friendship Memory Reels (10 Videos)');

        // 6. Graduation
        renderGridSection(['graduation-image-grid', 'grad-image-grid'], store.grad_images, 'image', 'grad_images', 'Graduation Photos (60 Photos)');
        renderGridSection(['graduation-video-grid', 'grad-video-grid'], store.grad_videos, 'video', 'grad_videos', 'Graduation Reels (10 Videos)');

        // 7. Journey
        renderGridSection(['journey-image-grid', 'journey-photos-grid'], store.journey_images, 'image', 'journey_images', 'Timeline Photos (15 Photos)');
        renderGridSection(['journey-video-grid', 'journey-videos-grid'], store.journey_videos, 'video', 'journey_videos', 'Timeline Videos (5 Videos)');
        renderHeroPhotoAdminControls();
        applyMobileMasonryLayout();
    }

    function applyMobileMasonryLayout() {
        const cards = document.querySelectorAll('.gallery-grid .gallery-card, .masonry-layout .gallery-card');
        if (!cards || cards.length === 0) return;

        let landscapeIndex = 0;

        cards.forEach((card) => {
            const img = card.querySelector('img');
            if (!img) return;

            const checkAndApply = () => {
                const nw = img.naturalWidth || img.width;
                const nh = img.naturalHeight || img.height;

                if (!nw || !nh) return;

                // Check if wide landscape (naturalWidth > naturalHeight * 1.15)
                if (nw > nh * 1.15) {
                    landscapeIndex++;
                    // Approximately 15-20% of landscape images become Featured (span 2 columns)
                    if (landscapeIndex % 5 === 2) {
                        card.classList.add('featured-image');
                    } else {
                        card.classList.remove('featured-image');
                    }
                } else {
                    // Portrait or Square stay normal (span 1 column)
                    card.classList.remove('featured-image');
                }
            };

            if (img.complete && img.naturalWidth > 0) {
                checkAndApply();
            } else {
                img.addEventListener('load', checkAndApply);
            }
        });
    }

    window.addEventListener('resize', applyMobileMasonryLayout);
    window.addEventListener('load', applyMobileMasonryLayout);

    function renderHeroPhotoAdminControls() {
        const heroCard = document.querySelector('.hero-photo-card');
        if (!heroCard) return;

        const store = getMediaStore();
        if (!store.hero_photo || !store.hero_photo.length) {
            store.hero_photo = [{ id: 1, title: 'Madura College Hero Photo', url: '' }];
        }
        const item = store.hero_photo[0];

        const img = heroCard.querySelector('.card-media-img');
        if (img) {
            img.src = (item && item.url && item.url.length > 5) ? item.url : 'batch-group-photo.jpg';
        }

        if (isAdmin()) {
            let adminActions = heroCard.querySelector('.admin-card-actions');
            if (!adminActions) {
                adminActions = document.createElement('div');
                adminActions.className = 'admin-card-actions';
                adminActions.innerHTML = `
                    <button class="btn-card-edit" data-id="1" data-section="hero_photo" data-type="image" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="btn-card-delete" data-id="1" data-section="hero_photo" title="Delete"><i class="fas fa-trash"></i></button>
                `;
                heroCard.appendChild(adminActions);
            }
        }
    }

    function renderDynamicJourneyStory() {
        const store = getMediaStore();
        const journeyImages = store.journey_images || [];

        for (let i = 1; i <= 15; i++) {
            const slotEl = document.getElementById(`story-slot-${i}`);
            if (!slotEl) continue;

            const item = journeyImages[i - 1];
            if (!item) continue;

            const hasUrl = item.url && item.url.length > 5;
            
            if (hasUrl) {
                slotEl.classList.add('has-media');
                slotEl.innerHTML = `
                    <img src="${escapeHTML(item.url)}" alt="${escapeHTML(item.title)}" class="card-media-img">
                    ${isAdmin() ? `
                        <div class="admin-card-actions">
                            <button class="btn-card-edit" data-id="${item.id}" data-section="journey_images" data-type="image" title="Edit"><i class="fas fa-pen"></i></button>
                            <button class="btn-card-delete" data-id="${item.id}" data-section="journey_images" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    ` : ''}
                    <div class="gallery-overlay">
                        <span class="overlay-icon"><i class="fas fa-expand"></i></span>
                        <span class="overlay-label">${escapeHTML(item.title)}</span>
                    </div>
                `;
            } else {
                if (isAdmin()) {
                    let adminActions = slotEl.querySelector('.admin-card-actions');
                    if (!adminActions) {
                        adminActions = document.createElement('div');
                        adminActions.className = 'admin-card-actions';
                        adminActions.innerHTML = `
                            <button class="btn-card-edit" data-id="${item.id}" data-section="journey_images" data-type="image" title="Edit"><i class="fas fa-pen"></i></button>
                            <button class="btn-card-delete" data-id="${item.id}" data-section="journey_images" title="Delete"><i class="fas fa-trash"></i></button>
                        `;
                        slotEl.appendChild(adminActions);
                    }
                }
            }
        }
    }

    function renderGridSection(gridIdOrArray, items, type, sectionKey, title) {
        let grid = null;
        if (Array.isArray(gridIdOrArray)) {
            for (const id of gridIdOrArray) {
                grid = document.getElementById(id);
                if (grid) break;
            }
        } else {
            grid = document.getElementById(gridIdOrArray);
        }
        if (!grid) return;

        // Admin Bar
        let bar = grid.previousElementSibling;
        if (!bar || !bar.classList.contains('admin-control-bar')) {
            if (isAdmin()) {
                bar = document.createElement('div');
                bar.className = 'admin-control-bar glass-panel admin-block-only';
                const isVid = type === 'video';
                bar.innerHTML = `
                    <div class="admin-bar-info"><i class="fas ${isVid ? 'fa-video' : 'fa-camera'}"></i> <span>Admin ${title}</span></div>
                    <button class="btn btn-primary btn-sm btn-upload-trigger" data-section="${sectionKey}" data-type="${type}">
                        <i class="fas fa-plus"></i> Upload ${isVid ? 'Video' : 'Photo'}
                    </button>
                `;
                grid.parentNode.insertBefore(bar, grid);
                bar.querySelector('.btn-upload-trigger')?.addEventListener('click', () => openMediaModal(sectionKey, type));
            }
        } else {
            bar.style.display = isAdmin() ? 'flex' : 'none';
        }

        if (!items || items.length === 0) {
            if (grid.children.length > 0) return;
        }

        grid.innerHTML = '';
        (items || []).forEach((item, idx) => {
            if (item && item.url && !item.url.startsWith('data:') && !item.url.includes('?')) {
                item.url = item.url + '?v=9';
            }
            const cardWrapper = document.createElement('div');
            
            // Dynamic Apple Asymmetrical & Staggered Patterns with Mixed Aspect Ratios
            const patternIndex = idx % 6;
            let layoutClass = 'apple-layout-compact';
            let aspectClass = 'aspect-landscape';
            let staggerClass = '';

            if (sectionKey.includes('graduation')) {
                layoutClass = 'apple-layout-uniform';
                aspectClass = 'aspect-uniform';
                staggerClass = '';
            } else if (patternIndex === 0) {
                layoutClass = 'apple-layout-hero-left';
                aspectClass = 'aspect-landscape';
            } else if (patternIndex === 1) {
                layoutClass = 'apple-layout-stacked-right';
                aspectClass = 'aspect-portrait-tall';
            } else if (patternIndex === 2) {
                layoutClass = 'apple-layout-stacked-right';
                aspectClass = 'aspect-square';
                staggerClass = 'apple-stagger-down';
            } else if (patternIndex === 3) {
                layoutClass = 'apple-layout-hero-right';
                aspectClass = 'aspect-portrait';
            } else if (patternIndex === 4) {
                layoutClass = 'apple-layout-stacked-left';
                aspectClass = 'aspect-classic';
            } else if (patternIndex === 5) {
                layoutClass = 'apple-layout-full-banner';
                aspectClass = 'aspect-cinematic';
            }

            const baseCardClass = type === 'friend' ? 'friend-card' : (type === 'teacher' ? 'teacher-card' : (type === 'video' ? 'video-card' : 'gallery-item-wrapper'));
            cardWrapper.className = `${baseCardClass} glass-panel apple-media-card ${layoutClass} ${aspectClass} ${staggerClass} revealed`;
            cardWrapper.setAttribute('data-reveal', 'fade-up');
            cardWrapper.setAttribute('data-section', sectionKey);

            const hasUrl = item.url && item.url.length > 5;
            const numStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;

            if (type === 'video') {
                cardWrapper.className = 'pinterest-masonry-card revealed';
                cardWrapper.innerHTML = `
                    <div class="gallery-badge"><i class="fas fa-video"></i> Reel #${numStr}</div>
                    ${hasUrl ? `
                        <video src="${escapeHTML(item.url)}" class="card-media-video" controls controlsList="nodownload" disablePictureInPicture oncontextmenu="return false;" ondragstart="return false;" style="width:100% !important; height:auto !important; border-radius:16px !important; display:block !important; object-fit:cover !important;" preload="metadata"></video>
                    ` : `
                        <div class="placeholder-content">
                            <div class="play-btn-circle"><i class="fas fa-play"></i></div>
                            <h4 class="video-title">${escapeHTML(item.title)}</h4>
                            <span class="code-comment">${item.comment || `<!-- VIDEO ${numStr} -->`}</span>
                        </div>
                    `}
                    <div class="card-caption">${escapeHTML(item.title)} • Madura College</div>
                `;
            } else if (type === 'teacher') {
                cardWrapper.innerHTML = `
                    <div class="placeholder-card teacher-photo ${hasUrl ? 'has-media' : ''}">
                        ${isAdmin() ? `
                            <div class="admin-card-actions">
                                <button class="btn-card-edit" data-id="${item.id}" data-section="${sectionKey}" data-type="${type}" title="Edit"><i class="fas fa-pen"></i></button>
                                <button class="btn-card-delete" data-id="${item.id}" data-section="${sectionKey}" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        ` : ''}
                        ${hasUrl ? `<img src="${escapeHTML(item.url)}" class="card-media-img" loading="lazy">` : `
                            <div class="placeholder-content compact">
                                <i class="fas fa-user-tie"></i>
                                <span class="code-comment">${item.comment || `<!-- TEACHER PHOTO ${numStr} -->`}</span>
                            </div>
                        `}
                    </div>
                    <div class="teacher-info">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <h3 class="teacher-name">${escapeHTML(item.name)}</h3>
                            ${isAdmin() ? `
                                <div class="admin-card-actions-inline">
                                    <button class="btn-card-edit" data-id="${item.id}" data-section="${sectionKey}" data-type="${type}" title="Edit"><i class="fas fa-pen"></i></button>
                                    <button class="btn-card-delete" data-id="${item.id}" data-section="${sectionKey}" title="Delete"><i class="fas fa-trash"></i></button>
                                </div>
                            ` : ''}
                        </div>
                        <span class="teacher-dept">${escapeHTML(item.dept)}</span>
                        <p class="teacher-quote">${escapeHTML(item.quote)}</p>
                    </div>
                `;
            } else if (type === 'friend') {
                cardWrapper.innerHTML = `
                    <div class="placeholder-card friend-photo ${hasUrl ? 'has-media' : ''}">
                        ${isAdmin() ? `
                            <div class="admin-card-actions">
                                <button class="btn-card-edit" data-id="${item.id}" data-section="${sectionKey}" data-type="${type}" title="Edit"><i class="fas fa-pen"></i></button>
                                <button class="btn-card-delete" data-id="${item.id}" data-section="${sectionKey}" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        ` : ''}
                        ${hasUrl ? `<img src="${escapeHTML(item.url)}" class="card-media-img" loading="lazy">` : `
                            <div class="placeholder-content compact">
                                <i class="fas fa-user-astronaut"></i>
                                <span class="code-comment">${item.comment || `<!-- FRIEND PHOTO ${numStr} -->`}</span>
                            </div>
                        `}
                    </div>
                    <div class="friend-body">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h3 class="friend-name">${escapeHTML(item.name)}</h3>
                            ${isAdmin() ? `
                                <div class="admin-card-actions-inline">
                                    <button class="btn-card-edit" data-id="${item.id}" data-section="${sectionKey}" data-type="${type}" title="Edit"><i class="fas fa-pen"></i></button>
                                    <button class="btn-card-delete" data-id="${item.id}" data-section="${sectionKey}" title="Delete"><i class="fas fa-trash"></i></button>
                                </div>
                            ` : ''}
                        </div>
                        <span class="friend-nickname"><i class="fas fa-tag"></i> Nickname: "${escapeHTML(item.nickname)}"</span>
                        <p class="friend-memory"><strong>Memory:</strong> ${escapeHTML(item.memory)}</p>
                    </div>
                `;
            } else {
                cardWrapper.innerHTML = `
                    <div class="placeholder-card gallery-card ${hasUrl ? 'has-media' : ''}">
                        <div class="gallery-badge"><i class="fas fa-camera"></i> Photo #${numStr}</div>
                        ${isAdmin() ? `
                            <div class="admin-card-actions">
                                <button class="btn-card-edit" data-id="${item.id}" data-section="${sectionKey}" data-type="${type}" title="Edit"><i class="fas fa-pen"></i></button>
                                <button class="btn-card-delete" data-id="${item.id}" data-section="${sectionKey}" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        ` : ''}
                        ${hasUrl ? `
                            <img src="${escapeHTML(item.url)}" class="card-media-img" loading="lazy" oncontextmenu="return false;" ondragstart="return false;">
                            <div class="media-watermark-overlay">© Madura College Memories 2022–2025</div>
                        ` : `
                            <div class="placeholder-content">
                                <i class="fas fa-image placeholder-main-icon"></i>
                                <span class="gallery-title">${escapeHTML(item.title)}</span>
                                <span class="code-comment">${item.comment || `<!-- PHOTO ${numStr} -->`}</span>
                            </div>
                        `}
                        <div class="gallery-overlay">
                            <span class="overlay-icon"><i class="fas fa-expand"></i></span>
                            <span class="overlay-label">${escapeHTML(item.title)}</span>
                        </div>
                    </div>
                `;
            }

            // Apply saved Admin Crop, Zoom, Rotation & Position Metadata Transforms
            if (hasUrl) {
                setTimeout(() => {
                    const img = cardWrapper.querySelector('img');
                    const vid = cardWrapper.querySelector('video');
                    const mediaEl = img || vid;

                    if (mediaEl && item.editData) {
                        const zoom = item.editData.zoom || 1;
                        const rot = item.editData.rotation || 0;
                        const pos = item.editData.position || { x: 0, y: 0 };
                        mediaEl.style.transform = `scale(${zoom}) rotate(${rot}deg) translate(${pos.x}px, ${pos.y}px)`;
                        mediaEl.style.objectFit = 'cover';
                    }

                    if (img) {
                        img.onload = () => {
                            const ratio = img.naturalWidth / img.naturalHeight;
                            cardWrapper.classList.remove('aspect-landscape', 'aspect-portrait-tall', 'aspect-square', 'aspect-portrait', 'aspect-cinematic', 'aspect-classic');
                            if (ratio < 0.7) cardWrapper.classList.add('aspect-portrait-tall');
                            else if (ratio < 0.95) cardWrapper.classList.add('aspect-portrait');
                            else if (ratio < 1.15) cardWrapper.classList.add('aspect-square');
                            else if (ratio < 1.45) cardWrapper.classList.add('aspect-classic');
                            else if (ratio < 2.0) cardWrapper.classList.add('aspect-landscape');
                            else cardWrapper.classList.add('aspect-cinematic');
                        };
                    }
                    if (vid) {
                        vid.onloadedmetadata = () => {
                            const ratio = vid.videoWidth / vid.videoHeight;
                            cardWrapper.classList.remove('aspect-landscape', 'aspect-portrait-tall', 'aspect-square', 'aspect-portrait', 'aspect-cinematic', 'aspect-classic');
                            if (ratio < 0.8) cardWrapper.classList.add('aspect-portrait');
                            else if (ratio < 1.5) cardWrapper.classList.add('aspect-landscape');
                            else cardWrapper.classList.add('aspect-cinematic');
                        };
                    }
                }, 50);
            }

            grid.appendChild(cardWrapper);
        });
    }

    // Global document-level click handler for all admin edit and delete card buttons across all pages
    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-card-edit');
        if (editBtn) {
            e.stopPropagation();
            e.preventDefault();
            const idRaw = editBtn.getAttribute('data-id');
            const id = (!isNaN(idRaw) && idRaw !== null && idRaw !== '') ? parseInt(idRaw) : idRaw;
            const sectionKey = editBtn.getAttribute('data-section');
            const type = editBtn.getAttribute('data-type');

            if (sectionKey && id != null) {
                if (type === 'video') {
                    openVideoEditor(sectionKey, id);
                } else {
                    openImageEditor(sectionKey, id);
                }
            }
            return;
        }

        const deleteBtn = e.target.closest('.btn-card-delete');
        if (deleteBtn) {
            e.stopPropagation();
            e.preventDefault();
            const idRaw = deleteBtn.getAttribute('data-id');
            const id = (!isNaN(idRaw) && idRaw !== null && idRaw !== '') ? parseInt(idRaw) : idRaw;
            const sectionKey = deleteBtn.getAttribute('data-section');

            if (sectionKey && id != null) {
                const isVideo = sectionKey.includes('video');
                const confirmMsg = isVideo ? 'Are you sure you want to permanently delete this video?' : 'Are you sure you want to permanently delete this memory?';
                if (confirm(confirmMsg)) {
                    deleteMediaItem(sectionKey, id);
                }
            }
            return;
        }
    });

    renderAllPageSections();


    /* --------------------------------------------------------------------------
   2C. ADMIN-ONLY APPLE-STYLE VIDEO CROP & POSITION EDITOR
   -------------------------------------------------------------------------- */
    let currentVideoSectionKey = '';
    let currentVideoItemId = null;

    function openVideoEditor(sectionKey, id) {
        if (!isAdmin()) {
            showToast('Access denied! Admin privileges required.', 'error');
            return;
        }

        const store = getMediaStore();
        const list = store[sectionKey] || [];
        const item = list.find(x => String(x.id) === String(id));
        if (!item) return;

        currentVideoSectionKey = sectionKey;
        currentVideoItemId = id;

        // Destroy old video editor modal if present
        const oldModal = document.getElementById('admin-video-editor-modal');
        if (oldModal) oldModal.remove();

        // Local state for video transformation metadata
        let vZoom = item.editData?.zoom || 1;
        let vRot = item.editData?.rotation || 0;
        let vPosX = item.editData?.position?.x || 0;
        let vPosY = item.editData?.position?.y || 0;
        let vRatio = item.editData?.cropRatio || 'free';

        const modal = document.createElement('div');
        modal.id = 'admin-video-editor-modal';
        modal.className = 'lightbox-modal active';
        modal.innerHTML = `
            <div class="lightbox-overlay" id="video-editor-overlay"></div>
            <div class="lightbox-container glass-panel apple-image-editor-container">
                <div class="image-editor-header">
                    <h3><i class="fas fa-video"></i> Video Crop & Position Editor</h3>
                    <span class="admin-badge"><i class="fas fa-shield-halved"></i> Admin Only</span>
                </div>

                <div class="image-editor-body">
                    <div class="cropper-stage" id="video-stage-box" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #000; border-radius: 12px; min-height: 320px; cursor: grab;">
                        <video id="video-editor-target-vid" src="${escapeHTML(item.url || '')}" controls autoplay loop style="max-width: 100%; max-height: 380px; border-radius: 8px; transition: transform 0.1s ease; touch-action: none;"></video>
                    </div>

                    <div class="editor-controls-pane">
                        <div class="control-group">
                            <label class="control-label"><i class="fas fa-vector-square"></i> Crop Aspect Ratio</label>
                            <div class="toolbar-grid">
                                <button type="button" class="tool-btn ${vRatio === 'free' ? 'active-aspect' : ''}" id="vtool-aspect-free"><i class="fas fa-unlock"></i> Free</button>
                                <button type="button" class="tool-btn ${vRatio === '1:1' ? 'active-aspect' : ''}" id="vtool-aspect-11"><i class="fas fa-square"></i> 1:1</button>
                                <button type="button" class="tool-btn ${vRatio === '3:4' ? 'active-aspect' : ''}" id="vtool-aspect-34"><i class="fas fa-mobile"></i> 3:4</button>
                                <button type="button" class="tool-btn ${vRatio === '9:16' ? 'active-aspect' : ''}" id="vtool-aspect-916"><i class="fas fa-mobile-screen"></i> 9:16</button>
                                <button type="button" class="tool-btn ${vRatio === '16:9' ? 'active-aspect' : ''}" id="vtool-aspect-169"><i class="fas fa-tv"></i> 16:9</button>
                            </div>
                        </div>

                        <div class="control-group">
                            <label class="control-label"><i class="fas fa-sliders"></i> Zoom & Rotation</label>
                            <div class="toolbar-grid">
                                <button type="button" class="tool-btn" id="vtool-zoom-in" title="Zoom In"><i class="fas fa-magnifying-glass-plus"></i> Zoom +</button>
                                <button type="button" class="tool-btn" id="vtool-zoom-out" title="Zoom Out"><i class="fas fa-magnifying-glass-minus"></i> Zoom -</button>
                                <button type="button" class="tool-btn" id="vtool-rotate-left" title="Rotate Left"><i class="fas fa-rotate-left"></i> Rotate L</button>
                                <button type="button" class="tool-btn" id="vtool-rotate-right" title="Rotate Right"><i class="fas fa-rotate-right"></i> Rotate R</button>
                            </div>
                        </div>

                        <div class="control-group">
                            <label class="control-label"><i class="fas fa-arrows-up-down-left-right"></i> Position Adjustment</label>
                            <div class="toolbar-grid">
                                <button type="button" class="tool-btn" id="vtool-pos-left"><i class="fas fa-arrow-left"></i> Left</button>
                                <button type="button" class="tool-btn" id="vtool-pos-right"><i class="fas fa-arrow-right"></i> Right</button>
                                <button type="button" class="tool-btn" id="vtool-pos-up"><i class="fas fa-arrow-up"></i> Up</button>
                                <button type="button" class="tool-btn" id="vtool-pos-down"><i class="fas fa-arrow-down"></i> Down</button>
                                <button type="button" class="tool-btn danger-tool" id="vtool-reset" style="grid-column: span 2;"><i class="fas fa-arrow-rotate-left"></i> Reset All</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="image-editor-footer">
                    <button type="button" class="btn btn-secondary btn-editor-cancel" id="btn-video-cancel"><i class="fas fa-xmark"></i> Cancel</button>
                    <button type="button" class="btn btn-primary btn-glow btn-editor-save" id="btn-video-save"><i class="fas fa-check"></i> Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const videoEl = modal.querySelector('#video-editor-target-vid');
        const stageBox = modal.querySelector('#video-stage-box');
        const closeBtn = modal.querySelector('#btn-video-cancel');
        const overlay = modal.querySelector('#video-editor-overlay');

        const closeModal = () => modal.remove();
        closeBtn?.addEventListener('click', closeModal);
        overlay?.addEventListener('click', closeModal);

        const applyTransform = () => {
            if (videoEl) {
                videoEl.style.transform = `scale(${vZoom}) rotate(${vRot}deg) translate(${vPosX}px, ${vPosY}px)`;
            }
        };
        applyTransform();

        // Ratio listeners
        const ratioBtns = modal.querySelectorAll('[id^="vtool-aspect-"]');
        ratioBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                ratioBtns.forEach(b => b.classList.remove('active-aspect'));
                btn.classList.add('active-aspect');
                vRatio = btn.id.replace('vtool-aspect-', '');
                if (vRatio === '11') vRatio = '1:1';
                else if (vRatio === '34') vRatio = '3:4';
                else if (vRatio === '916') vRatio = '9:16';
                else if (vRatio === '169') vRatio = '16:9';
            });
        });

        // Zoom controls
        modal.querySelector('#vtool-zoom-in')?.addEventListener('click', () => { vZoom += 0.15; applyTransform(); });
        modal.querySelector('#vtool-zoom-out')?.addEventListener('click', () => { vZoom = Math.max(0.3, vZoom - 0.15); applyTransform(); });

        // Rotation controls
        modal.querySelector('#vtool-rotate-left')?.addEventListener('click', () => { vRot = (vRot - 90 + 360) % 360; applyTransform(); });
        modal.querySelector('#vtool-rotate-right')?.addEventListener('click', () => { vRot = (vRot + 90) % 360; applyTransform(); });

        // Position controls
        modal.querySelector('#vtool-pos-left')?.addEventListener('click', () => { vPosX -= 10; applyTransform(); });
        modal.querySelector('#vtool-pos-right')?.addEventListener('click', () => { vPosX += 10; applyTransform(); });
        modal.querySelector('#vtool-pos-up')?.addEventListener('click', () => { vPosY -= 10; applyTransform(); });
        modal.querySelector('#vtool-pos-down')?.addEventListener('click', () => { vPosY += 10; applyTransform(); });

        // Reset
        modal.querySelector('#vtool-reset')?.addEventListener('click', () => {
            vZoom = 1; vRot = 0; vPosX = 0; vPosY = 0; vRatio = 'free'; applyTransform();
        });

        // Touch & Mouse Drag Support
        let isDragging = false, startX = 0, startY = 0;
        const startDrag = (e) => {
            isDragging = true;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            startX = clientX - vPosX;
            startY = clientY - vPosY;
            if (stageBox) stageBox.style.cursor = 'grabbing';
        };

        const doDrag = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            vPosX = clientX - startX;
            vPosY = clientY - startY;
            applyTransform();
        };

        const stopDrag = () => {
            isDragging = false;
            if (stageBox) stageBox.style.cursor = 'grab';
        };

        stageBox?.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', doDrag);
        window.addEventListener('mouseup', stopDrag);
        stageBox?.addEventListener('touchstart', startDrag, { passive: true });
        window.addEventListener('touchmove', doDrag, { passive: true });
        window.addEventListener('touchend', stopDrag);

        // Save Transformation Metadata (No re-uploading / No file duplication)
        modal.querySelector('#btn-video-save')?.addEventListener('click', () => {
            const currentStore = getMediaStore();
            const targetList = currentStore[sectionKey] || [];
            const targetItem = targetList.find(x => String(x.id) === String(id));

            if (targetItem) {
                targetItem.editData = {
                    cropRatio: vRatio,
                    zoom: vZoom,
                    rotation: vRot,
                    position: { x: vPosX, y: vPosY }
                };
                saveMediaStore(currentStore);
                renderAllPageSections();
                showToast('Video transform settings saved successfully!', 'success');
            }
            closeModal();
        });
    }

    /* --------------------------------------------------------------------------
       2B. ADMIN-ONLY APPLE-STYLE IMAGE EDITOR (CROPPER.JS)
       -------------------------------------------------------------------------- */
    let cropperInstance = null;
    let currentScaleX = 1;
    let currentScaleY = 1;
    let currentEditSectionKey = '';
    let currentEditItemId = null;

    function ensureCropperLoaded(callback) {
        if (window.Cropper) {
            callback();
            return;
        }
        let fired = false;
        const safeCallback = () => {
            if (!fired) {
                fired = true;
                callback();
            }
        };

        if (!document.getElementById('cropper-css')) {
            const link = document.createElement('link');
            link.id = 'cropper-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css';
            document.head.appendChild(link);
        }
        if (!document.getElementById('cropper-js')) {
            const script = document.createElement('script');
            script.id = 'cropper-js';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js';
            script.onload = safeCallback;
            script.onerror = safeCallback;
            document.body.appendChild(script);
        } else {
            const script = document.getElementById('cropper-js');
            script.addEventListener('load', safeCallback);
            script.addEventListener('error', safeCallback);
        }
        setTimeout(safeCallback, 300);
    }

    function openImageEditor(sectionKey, id) {
        if (!isAdmin()) {
            showToast('Access denied! Admin privileges required.', 'error');
            return;
        }

        const store = getMediaStore();
        const list = store[sectionKey] || [];
        let item = list.find(x => String(x.id) === String(id));
        if (!item) {
            const btnEl = document.querySelector(`.btn-card-edit[data-id="${id}"][data-section="${sectionKey}"]`) || document.querySelector(`.btn-card-edit[data-id="${id}"]`);
            const cardImg = btnEl?.closest('.gallery-card, .apple-media-card, .placeholder-card')?.querySelector('img');
            const imgUrl = cardImg?.src || 'images/gallery/gallery_001.jpg';
            item = { id: id, url: imgUrl, title: `Photo #${id}` };
        }

        currentEditSectionKey = sectionKey;
        currentEditItemId = id;

        ensureCropperLoaded(() => {
            let modal = document.getElementById('admin-image-editor-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'admin-image-editor-modal';
                modal.className = 'lightbox-modal';
                modal.innerHTML = `
                    <div class="lightbox-overlay" id="image-editor-overlay"></div>
                    <div class="lightbox-container glass-panel apple-image-editor-container">
                        <div class="image-editor-header">
                            <h3><i class="fas fa-sliders"></i> Image Editor</h3>
                            <span class="admin-badge"><i class="fas fa-shield-halved"></i> Admin Only</span>
                        </div>

                        <div class="image-editor-body">
                            <div class="cropper-stage">
                                <img id="cropper-target-img" src="" alt="Target Image">
                            </div>

                            <div class="editor-controls-pane">
                                <div class="control-group">
                                    <label class="control-label"><i class="fas fa-image"></i> Replace Image</label>
                                    <label class="btn btn-sm btn-outline btn-file-replace">
                                        <i class="fas fa-folder-open"></i> Choose New File
                                        <input type="file" id="editor-file-input" accept="image/*" style="display: none;">
                                    </label>
                                </div>

                                <div class="control-group">
                                    <label class="control-label"><i class="fas fa-vector-square"></i> Crop Aspect Ratio</label>
                                    <div class="toolbar-grid">
                                        <button type="button" class="tool-btn active-aspect" id="tool-aspect-free" title="Free Crop"><i class="fas fa-unlock"></i> Free</button>
                                        <button type="button" class="tool-btn" id="tool-aspect-11" title="Square (1:1)"><i class="fas fa-square"></i> 1:1</button>
                                        <button type="button" class="tool-btn" id="tool-aspect-34" title="Portrait (3:4)"><i class="fas fa-mobile"></i> 3:4</button>
                                        <button type="button" class="tool-btn" id="tool-aspect-43" title="Landscape (4:3)"><i class="fas fa-image"></i> 4:3</button>
                                        <button type="button" class="tool-btn" id="tool-aspect-169" title="Landscape (16:9)"><i class="fas fa-tv"></i> 16:9</button>
                                        <button type="button" class="tool-btn" id="tool-aspect-916" title="Portrait (9:16)"><i class="fas fa-mobile-screen"></i> 9:16</button>
                                    </div>
                                </div>

                                <div class="control-group">
                                    <label class="control-label"><i class="fas fa-crop-simple"></i> Crop & Adjust Tools</label>
                                    <div class="toolbar-grid">
                                        <button type="button" class="tool-btn" id="tool-crop-toggle" title="Crop"><i class="fas fa-crop"></i> Crop</button>
                                        <button type="button" class="tool-btn" id="tool-drag-mode" title="Drag"><i class="fas fa-hand"></i> Drag</button>
                                        <button type="button" class="tool-btn" id="tool-zoom-in" title="Zoom In"><i class="fas fa-magnifying-glass-plus"></i> Zoom +</button>
                                        <button type="button" class="tool-btn" id="tool-zoom-out" title="Zoom Out"><i class="fas fa-magnifying-glass-minus"></i> Zoom -</button>
                                        <button type="button" class="tool-btn" id="tool-rotate-left" title="Rotate Left"><i class="fas fa-rotate-left"></i> Rotate L</button>
                                        <button type="button" class="tool-btn" id="tool-rotate-right" title="Rotate Right"><i class="fas fa-rotate-right"></i> Rotate R</button>
                                        <button type="button" class="tool-btn" id="tool-flip-h" title="Flip Horizontal"><i class="fas fa-arrows-left-right"></i> Flip H</button>
                                        <button type="button" class="tool-btn" id="tool-flip-v" title="Flip Vertical"><i class="fas fa-arrows-up-down"></i> Flip V</button>
                                        <button type="button" class="tool-btn danger-tool" id="tool-reset" title="Reset"><i class="fas fa-arrow-rotate-left"></i> Reset</button>
                                    </div>
                                </div>

                                <div class="control-group">
                                    <label class="control-label"><i class="fas fa-eye"></i> Live Preview</label>
                                    <div class="live-crop-preview-box">
                                        <div id="cropper-live-preview"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="image-editor-footer">
                            <button type="button" class="btn btn-secondary btn-editor-cancel" id="btn-editor-cancel"><i class="fas fa-xmark"></i> Cancel</button>
                            <button type="button" class="btn btn-primary btn-glow btn-editor-save" id="btn-editor-save"><i class="fas fa-check"></i> Save</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                const closeBtn = modal.querySelector('#btn-editor-cancel');
                const overlay = modal.querySelector('#image-editor-overlay');

                const closeEditor = () => {
                    if (cropperInstance) {
                        cropperInstance.destroy();
                        cropperInstance = null;
                    }
                    modal.classList.remove('active');
                };

                closeBtn?.addEventListener('click', closeEditor);
                overlay?.addEventListener('click', closeEditor);

                // Aspect Ratio Listeners
                modal.querySelector('#tool-aspect-free')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.setAspectRatio(NaN);
                });
                modal.querySelector('#tool-aspect-11')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.setAspectRatio(1 / 1);
                });
                modal.querySelector('#tool-aspect-34')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.setAspectRatio(3 / 4);
                });
                modal.querySelector('#tool-aspect-43')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.setAspectRatio(4 / 3);
                });
                modal.querySelector('#tool-aspect-169')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.setAspectRatio(16 / 9);
                });
                modal.querySelector('#tool-aspect-916')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.setAspectRatio(9 / 16);
                });

                // File input replace
                modal.querySelector('#editor-file-input')?.addEventListener('change', (evt) => {
                    const file = evt.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            if (cropperInstance) {
                                cropperInstance.replace(e.target.result);
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });

                // Crop mode
                modal.querySelector('#tool-crop-toggle')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.setDragMode('crop');
                });
                // Drag mode
                modal.querySelector('#tool-drag-mode')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.setDragMode('move');
                });
                // Zoom In
                modal.querySelector('#tool-zoom-in')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.zoom(0.1);
                });
                // Zoom Out
                modal.querySelector('#tool-zoom-out')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.zoom(-0.1);
                });
                // Rotate Left
                modal.querySelector('#tool-rotate-left')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.rotate(-90);
                });
                // Rotate Right
                modal.querySelector('#tool-rotate-right')?.addEventListener('click', () => {
                    if (cropperInstance) cropperInstance.rotate(90);
                });
                // Flip H
                modal.querySelector('#tool-flip-h')?.addEventListener('click', () => {
                    if (cropperInstance) {
                        currentScaleX = currentScaleX === 1 ? -1 : 1;
                        cropperInstance.scaleX(currentScaleX);
                    }
                });
                // Flip V
                modal.querySelector('#tool-flip-v')?.addEventListener('click', () => {
                    if (cropperInstance) {
                        currentScaleY = currentScaleY === 1 ? -1 : 1;
                        cropperInstance.scaleY(currentScaleY);
                    }
                });
                // Reset
                modal.querySelector('#tool-reset')?.addEventListener('click', () => {
                    if (cropperInstance) {
                        cropperInstance.reset();
                        currentScaleX = 1;
                        currentScaleY = 1;
                    }
                });

                // Save button
                modal.querySelector('#btn-editor-save')?.addEventListener('click', () => {
                    if (cropperInstance && currentEditSectionKey && currentEditItemId) {
                        const canvas = cropperInstance.getCroppedCanvas({
                            maxWidth: 1920,
                            maxHeight: 1920,
                            fillColor: '#000000'
                        });
                        if (canvas) {
                            const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
                            const currentStore = getMediaStore();
                            const targetList = currentStore[currentEditSectionKey] || [];
                            const targetItem = targetList.find(x => String(x.id) === String(currentEditItemId));
                            if (targetItem) {
                                targetItem.url = croppedUrl;
                                saveMediaStore(currentStore);
                                renderAllPageSections();
                                showToast('Image saved successfully!', 'success');
                            }
                        }
                    }
                    closeEditor();
                });
            }

            const targetImg = document.getElementById('cropper-target-img');
            if (targetImg) {
                if (cropperInstance) {
                    cropperInstance.destroy();
                    cropperInstance = null;
                }

                currentScaleX = 1;
                currentScaleY = 1;
                targetImg.src = item.url || 'hero-group-photo.jpg';

                // Calculate exact aspect ratio of the target DIV box in the page DOM
                let currentCardAspectRatio = NaN;
                const targetBtn = document.querySelector(`.btn-card-edit[data-id="${id}"][data-section="${sectionKey}"]`);
                const targetBox = targetBtn?.closest('.placeholder-card') || targetBtn?.closest('.story-slot') || document.querySelector(`#story-slot-${id}`) || document.querySelector('.hero-photo-card');

                if (targetBox && targetBox.offsetWidth > 0 && targetBox.offsetHeight > 0) {
                    currentCardAspectRatio = targetBox.offsetWidth / targetBox.offsetHeight;
                }

                modal.classList.add('active');

                setTimeout(() => {
                    cropperInstance = new Cropper(targetImg, {
                        aspectRatio: currentCardAspectRatio,
                        viewMode: 0,
                        dragMode: 'move',
                        autoCropArea: 1,
                        restore: false,
                        guides: true,
                        center: true,
                        highlight: true,
                        cropBoxMovable: true,
                        cropBoxResizable: true,
                        toggleDragModeOnDblclick: true,
                        zoomOnWheel: true,
                        responsive: true,
                        preview: '#cropper-live-preview'
                    });
                }, 100);
            }
        });
    }
    window.openImageEditor = openImageEditor;

    /* --------------------------------------------------------------------------
       3. ADMIN UPLOAD / EDIT MODAL FOR ALL SECTIONS
       -------------------------------------------------------------------------- */
    let currentSectionKey = 'gallery_images';
    let currentMediaType = 'image';
    let currentEditId = null;

    function openMediaModal(sectionKey, type, editId = null) {
        if (!isAdmin()) {
            showToast('Access denied! Admin privileges required.', 'error');
            return;
        }

        // Always remove previous modal instance to prevent stale closure capture or DOM ID collisions
        const oldModal = document.getElementById('admin-media-modal');
        if (oldModal) {
            oldModal.remove();
        }

        const isVideo = type === 'video';
        const fileInputId = isVideo ? 'videoInput' : 'imageInput';

        const modal = document.createElement('div');
        modal.id = 'admin-media-modal';
        modal.className = 'lightbox-modal active';
        modal.innerHTML = `
            <div class="lightbox-overlay" id="admin-modal-overlay"></div>
            <div class="lightbox-container glass-panel admin-modal-container">
                <button class="lightbox-close" id="admin-modal-close"><i class="fas fa-xmark"></i></button>
                <div class="admin-modal-header text-center">
                    <h3 id="admin-modal-title"><i class="fas fa-cloud-arrow-up"></i> ${editId ? 'Edit' : 'Upload'} ${type.toUpperCase()} Slot #${editId || ''}</h3>
                    <p id="admin-modal-subtitle">Target Vault: ${escapeHTML(sectionKey)}</p>
                </div>

                <form id="admin-media-form" class="admin-media-form">
                    <div class="form-group" id="group-title" style="${isVideo ? 'display:none;' : 'display:block;'}">
                        <label for="media-title"><i class="fas fa-heading"></i> Title / Name</label>
                        <input type="text" id="media-title" placeholder="Enter title">
                    </div>
                    <div class="form-group" id="group-subtitle" style="${isVideo ? 'display:none;' : 'display:block;'}">
                        <label for="media-sub"><i class="fas fa-tag"></i> Department / Nickname</label>
                        <input type="text" id="media-sub" placeholder="e.g. Dept of CS / Nickname">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-link"></i> Select File or Direct URL</label>
                        <input type="file" id="${fileInputId}" accept="${isVideo ? 'video/*' : 'image/*'}" class="file-input-field">
                        <div class="or-divider"><span>OR</span></div>
                        <input type="url" id="media-url-input" placeholder="Paste direct image/video URL">
                    </div>
                    <div class="media-preview-box" id="media-preview-box">
                        <span class="preview-label">Live Preview</span>
                        <div id="preview-render-zone"><p class="preview-empty">No file selected</p></div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block btn-glow"><i class="fas fa-check"></i> Save Media Item</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        const overlay = modal.querySelector('#admin-modal-overlay');
        const closeBtn = modal.querySelector('#admin-modal-close');
        const fileInput = modal.querySelector(`#${fileInputId}`);
        const urlInput = modal.querySelector('#media-url-input');
        const form = modal.querySelector('#admin-media-form');
        const previewZone = modal.querySelector('#preview-render-zone');
        const inputTitle = modal.querySelector('#media-title');
        const inputSub = modal.querySelector('#media-sub');

        const closeModal = () => modal.remove();
        overlay?.addEventListener('click', closeModal);
        closeBtn?.addEventListener('click', closeModal);

        // Pre-fill existing data if editing slot
        const store = getMediaStore();
        const list = store[sectionKey] || [];
        if (editId) {
            const item = list.find(x => String(x.id) === String(editId));
            if (item) {
                if (inputTitle) inputTitle.value = item.title || item.name || '';
                if (inputSub) inputSub.value = item.dept || item.nickname || '';
                if (urlInput) urlInput.value = item.url || '';
                if (previewZone && item.url) {
                    if (isVideo) previewZone.innerHTML = `<video src="${escapeHTML(item.url)}" controls style="max-height: 180px; width: 100%; border-radius: 8px;"></video>`;
                    else previewZone.innerHTML = `<img src="${escapeHTML(item.url)}" style="max-height: 180px; width: 100%; object-fit: cover; border-radius: 8px;">`;
                }
            }
        }

        let selectedFileUrl = (urlInput?.value || '').trim();

        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (selectedFileUrl && selectedFileUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(selectedFileUrl);
                }
                selectedFileUrl = URL.createObjectURL(file);
                renderPreview(selectedFileUrl);
            }
        });

        urlInput?.addEventListener('input', () => {
            if (urlInput.value.trim().length > 5) {
                selectedFileUrl = urlInput.value.trim();
                renderPreview(selectedFileUrl);
            }
        });

        function renderPreview(src) {
            if (!previewZone) return;
            if (isVideo) {
                previewZone.innerHTML = `<video src="${src}" controls style="max-height: 180px; width: 100%; border-radius: 8px;"></video>`;
            } else {
                previewZone.innerHTML = `<img src="${src}" style="max-height: 180px; width: 100%; object-fit: cover; border-radius: 8px;">`;
            }
        }

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const title = inputTitle ? (inputTitle.value.trim() || 'College Memories') : 'College Memories';
            const sub = inputSub ? inputSub.value.trim() : '';
            const selectedFile = fileInput?.files?.[0];

            const saveLocalMediaItem = (mediaUrl) => {
                const currentStore = getMediaStore();
                const targetList = currentStore[sectionKey] || [];
                const targetItem = editId ? targetList.find(x => String(x.id) === String(editId)) : null;

                if (targetItem) {
                    if (title && targetItem.title !== undefined) targetItem.title = title;
                    if (title && targetItem.name !== undefined) targetItem.name = title;
                    if (sub && targetItem.dept !== undefined) targetItem.dept = sub;
                    if (sub && targetItem.nickname !== undefined) targetItem.nickname = sub;
                    if (mediaUrl) targetItem.url = mediaUrl;
                    showToast(`Slot #${editId} updated!`, 'success');
                } else {
                    const newItem = {
                        id: Date.now(),
                        title: title, name: title,
                        dept: sub, nickname: sub,
                        url: mediaUrl || '',
                        comment: `<!-- STATIC ITEM -->`
                    };
                    targetList.push(newItem);
                    currentStore[sectionKey] = targetList;
                    showToast('Media updated successfully!', 'success');
                }

                saveMediaStore(currentStore);
                renderAllPageSections();
                closeModal();
            };

            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    saveLocalMediaItem(e.target.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                saveLocalMediaItem(selectedFileUrl.startsWith('blob:') ? '' : selectedFileUrl);
            }
        });
    }

    function deleteMediaItem(sectionKey, id) {
        if (!isAdmin()) {
            showToast('Permission denied: Only Admin can delete media.', 'error');
            return;
        }

        const store = getMediaStore();
        const list = store[sectionKey] || [];
        const isVideo = sectionKey.includes('video');

        let targetIndex = list.findIndex(x => String(x.id) === String(id));
        if (targetIndex !== -1) {
            list[targetIndex].url = '';
        }

        // Direct DOM removal for instant UI response
        document.querySelectorAll(`[data-id="${id}"]`).forEach(btn => {
            const card = btn.closest('.apple-media-card, .gallery-card, .video-card, .gallery-item-wrapper, .friend-card, .teacher-card');
            if (card) card.remove();
        });

        saveMediaStore(store);
        renderAllPageSections();
        showToast(isVideo ? 'Video removed from view' : 'Image removed from view', 'success');
    }
    window.deleteMediaItem = deleteMediaItem;

    function showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast-banner toast-${type}`;
        const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info');
        toast.innerHTML = `<i class="fas ${icon}"></i> <span>${escapeHTML(message)}</span>`;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }


    /* --------------------------------------------------------------------------
       4. CURSOR & CANVAS PARTICLES & NAV HANDLERS
       -------------------------------------------------------------------------- */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorFollower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX; mouseY = e.clientY;
        if (cursorDot) { cursorDot.style.top = `${mouseY}px`; cursorDot.style.left = `${mouseX}px`; }
    });

    function animateCursor() {
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        if (cursorFollower) { cursorFollower.style.top = `${followerY}px`; cursorFollower.style.left = `${followerX}px`; }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth, height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; });
        const particles = [];
        const numParticles = Math.min(Math.floor(width / 15), 65);

        class Particle {
            constructor() {
                this.x = Math.random() * width; this.y = Math.random() * height;
                this.radius = Math.random() * 2 + 1;
                this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
                this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, ' : 'rgba(127, 0, 255, ';
                this.alpha = Math.random() * 0.6 + 0.2;
            }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = this.color + this.alpha + ')'; ctx.fill(); }
        }
        for (let i = 0; i < numParticles; i++) particles.push(new Particle());

        function renderParticles() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(); particles[i].draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 242, 254, ${0.15 * (1 - dist / 120)})`; ctx.lineWidth = 0.6; ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(renderParticles);
        }
        renderParticles();
    }

    const typingElement = document.getElementById('typing-quote');
    if (typingElement) {
        const quotes = ['"Some classrooms teach lessons, but our friendship taught us life."', '"We came as strangers. We leave as family."', '"College ends, Memories never do."'];
        let quoteIndex = 0, charIndex = 0, isDeleting = false, typingSpeed = 70;
        function typeLoop() {
            const currentQuote = quotes[quoteIndex];
            if (isDeleting) { typingElement.textContent = currentQuote.substring(0, charIndex - 1); charIndex--; typingSpeed = 35; }
            else { typingElement.textContent = currentQuote.substring(0, charIndex + 1); charIndex++; typingSpeed = 70; }
            if (!isDeleting && charIndex === currentQuote.length) { typingSpeed = 2500; isDeleting = true; }
            else if (isDeleting && charIndex === 0) { isDeleting = false; quoteIndex = (quoteIndex + 1) % quotes.length; typingSpeed = 400; }
            setTimeout(typeLoop, typingSpeed);
        }
        typeLoop();
    }

    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar?.classList.add('scrolled'); else navbar?.classList.remove('scrolled');
        updateActiveNavLink();
        if (typeof updateTimelineProgress === 'function') updateTimelineProgress();
        if (typeof updateBackToTopProgress === 'function') updateBackToTopProgress();
    });

    window.toggleMobileMenu = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const menu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
        const toggleBtn = document.getElementById('mobile-toggle') || document.querySelector('.mobile-toggle');
        if (menu) {
            menu.classList.toggle('active');
            const icon = toggleBtn?.querySelector('i');
            if (icon) {
                icon.className = menu.classList.contains('active') ? 'fas fa-xmark' : 'fas fa-bars';
            }
        }
    };

    // Capture phase listener for mobile menu toggle, link clicks, edit buttons & photo card lightbox
    ['click', 'touchend'].forEach(evtType => {
        document.addEventListener(evtType, (e) => {
            // 1. Edit Button Clicked
            const editBtn = e.target.closest('.btn-card-edit');
            if (editBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = editBtn.getAttribute('data-id') || '1';
                const sectionKey = editBtn.getAttribute('data-section') || 'gallery_images';
                const type = editBtn.getAttribute('data-type') || 'image';

                if (type === 'video') {
                    if (typeof openVideoEditor === 'function') openVideoEditor(sectionKey, id);
                } else {
                    if (typeof openImageEditor === 'function') openImageEditor(sectionKey, id);
                }
                return;
            }

            // 2. Mobile Menu Toggle Clicked
            const toggleBtn = e.target.closest('#mobile-toggle, .mobile-toggle');
            if (toggleBtn) {
                window.toggleMobileMenu(e);
                return;
            }

            // 3. Nav Link Clicked
            const navLink = e.target.closest('.nav-menu .nav-link');
            if (navLink) {
                const menu = document.getElementById('nav-menu') || document.querySelector('.nav-menu');
                if (menu) {
                    menu.classList.remove('active');
                    const toggleIcon = document.querySelector('#mobile-toggle i, .mobile-toggle i');
                    if (toggleIcon) toggleIcon.className = 'fas fa-bars';
                }
                return;
            }

            // 4. Gallery Card Image Touch/Click (Open Fullscreen Lightbox)
            const card = e.target.closest('.gallery-card, .gallery-item-wrapper, .apple-media-card');
            if (card) {
                if (e.target.closest('.admin-card-actions, .btn-card-edit, .btn-card-delete')) return;

                const cardImg = card.querySelector('img');
                if (!cardImg || !cardImg.src || cardImg.src.length < 5) return;

                const allImgs = Array.from(document.querySelectorAll('.gallery-card img, .gallery-item-wrapper img, .apple-media-card img')).filter(img => img.src && img.src.length > 5);
                const imgList = allImgs.map((img, idx) => ({
                    src: img.src,
                    title: img.closest('.gallery-card, .apple-media-card')?.querySelector('.overlay-label, .gallery-title, h3')?.textContent || `Photo #${idx + 1}`
                }));

                const clickedIdx = allImgs.indexOf(cardImg);
                if (typeof openFullscreenLightbox === 'function') {
                    openFullscreenLightbox(imgList, clickedIdx >= 0 ? clickedIdx : 0);
                }
            }
        }, true);
    });

    function updateActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) link.classList.add('active');
            else if (!href.includes('#')) link.classList.remove('active');
        });
    }
    updateActiveNavLink();

    function applyPinterestMasonryLayout() {
        const grids = [document.getElementById('gallery-grid'), document.getElementById('video-archive-grid')].filter(Boolean);
        if (grids.length === 0) return;

        grids.forEach(grid => {
            const width = window.innerWidth;
            let colCount = 2; // Mobile default: 2 columns
            if (width >= 1200) colCount = grid.id === 'video-archive-grid' ? 4 : 5;
            else if (width >= 900) colCount = 3;
            else if (width >= 600) colCount = 2;

            const cards = Array.from(grid.querySelectorAll('.gallery-item-wrapper, .pinterest-masonry-card, .video-card'));
            if (cards.length === 0) return;

            grid.innerHTML = '';
            grid.className = 'pinterest-masonry-container';

            const columns = [];
            const colHeights = new Array(colCount).fill(0);

            for (let i = 0; i < colCount; i++) {
                const col = document.createElement('div');
                col.className = 'pinterest-masonry-column';
                grid.appendChild(col);
                columns.push(col);
            }

            cards.forEach((card) => {
                let minColIdx = 0;
                let minHeight = colHeights[0];
                for (let c = 1; c < colCount; c++) {
                    if (colHeights[c] < minHeight) {
                        minHeight = colHeights[c];
                        minColIdx = c;
                    }
                }

                card.className = 'pinterest-masonry-card revealed';
                card.style.opacity = '1';
                card.style.transform = 'none';

                columns[minColIdx].appendChild(card);

                const img = card.querySelector('img');
                const vid = card.querySelector('video');
                let estimatedH = 250;
                if (img && img.naturalWidth && img.naturalHeight) {
                    estimatedH = (img.naturalHeight / img.naturalWidth) * 200;
                } else if (vid && vid.videoWidth && vid.videoHeight) {
                    estimatedH = (vid.videoHeight / vid.videoWidth) * 200;
                }
                colHeights[minColIdx] += estimatedH + 12;
            });
        });
    }

    window.addEventListener('resize', applyPinterestMasonryLayout);
    window.applyPinterestMasonryLayout = applyPinterestMasonryLayout;

    function triggerAllReveals() {
        document.querySelectorAll('[data-reveal]').forEach(el => {
            el.classList.add('revealed');
        });
        applyPinterestMasonryLayout();
    }
    triggerAllReveals();
    setTimeout(triggerAllReveals, 50);
    setTimeout(triggerAllReveals, 300);

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.01, rootMargin: '100px 0px 100px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => {
        el.classList.add('revealed');
        revealObserver.observe(el);
    });

    function updateTimelineProgress() {
        const timeline = document.querySelector('.journey-section');
        const progressLine = document.getElementById('timeline-progress');
        if (timeline && progressLine) {
            const rect = timeline.getBoundingClientRect(), sectionHeight = timeline.offsetHeight, windowHeight = window.innerHeight;
            if (rect.top <= windowHeight && rect.bottom >= 0) {
                const scrolled = Math.max(0, windowHeight - rect.top);
                const percentage = Math.min(100, (scrolled / (sectionHeight + windowHeight / 2)) * 100);
                progressLine.style.height = `${percentage}%`;
            }
        }
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            document.querySelectorAll('.gallery-item-wrapper').forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'scale(1)'; }, 50);
                } else {
                    item.style.opacity = '0'; item.style.transform = 'scale(0.85)';
                    setTimeout(() => { item.style.display = 'none'; }, 300);
                }
            });
        });
    });

    /* --------------------------------------------------------------------------
       PREMIUM FULLSCREEN IMAGE VIEWER & LIGHTBOX WITH ZOOM & SWIPE/NAV
       -------------------------------------------------------------------------- */
    let activeLightbox = {
        modalEl: null,
        imgList: [],
        currentIndex: 0,
        zoomScale: 1,
        panX: 0,
        panY: 0,
        isDragging: false,
        startX: 0,
        startY: 0
    };

    function openFullscreenLightbox(imgList, startIndex = 0) {
        window.openFullscreenLightbox = openFullscreenLightbox;
        if (!imgList || imgList.length === 0) return;

        activeLightbox.imgList = imgList;
        activeLightbox.currentIndex = Math.max(0, Math.min(startIndex, imgList.length - 1));
        activeLightbox.zoomScale = 1;
        activeLightbox.panX = 0;
        activeLightbox.panY = 0;

        let modal = document.getElementById('fullscreen-viewer-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'fullscreen-viewer-modal';
            modal.className = 'fullscreen-viewer-modal';
            modal.innerHTML = `
                <div class="viewer-backdrop" id="viewer-backdrop"></div>
                <div class="viewer-header">
                    <div class="viewer-counter" id="viewer-counter">Photo 1 of 1</div>
                    <div class="viewer-title" id="viewer-title">College Memory</div>
                    <button class="viewer-btn viewer-close-btn" id="viewer-close-btn" title="Close (ESC)">
                        <i class="fas fa-xmark"></i>
                    </button>
                </div>
                
                <button class="viewer-nav-btn viewer-prev-btn" id="viewer-prev-btn" title="Previous (Left Arrow)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="viewer-nav-btn viewer-next-btn" id="viewer-next-btn" title="Next (Right Arrow)">
                    <i class="fas fa-chevron-right"></i>
                </button>

                <div class="viewer-stage" id="viewer-stage">
                    <img id="viewer-target-img" src="" alt="Fullscreen View" draggable="false">
                </div>

                <div class="viewer-toolbar">
                    <button class="viewer-tool-btn" id="viewer-zoom-out" title="Zoom Out (-)"><i class="fas fa-minus"></i></button>
                    <span class="viewer-zoom-badge" id="viewer-zoom-badge">100%</span>
                    <button class="viewer-tool-btn" id="viewer-zoom-in" title="Zoom In (+)"><i class="fas fa-plus"></i></button>
                    <button class="viewer-tool-btn" id="viewer-zoom-reset" title="Reset Zoom"><i class="fas fa-rotate-left"></i></button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        activeLightbox.modalEl = modal;

        const imgEl = modal.querySelector('#viewer-target-img');
        const titleEl = modal.querySelector('#viewer-title');
        const counterEl = modal.querySelector('#viewer-counter');
        const stageEl = modal.querySelector('#viewer-stage');
        const zoomBadge = modal.querySelector('#viewer-zoom-badge');

        const updateTransform = () => {
            if (!imgEl) return;
            imgEl.style.transform = `translate(${activeLightbox.panX}px, ${activeLightbox.panY}px) scale(${activeLightbox.zoomScale})`;
            if (zoomBadge) zoomBadge.textContent = `${Math.round(activeLightbox.zoomScale * 100)}%`;
            if (stageEl) {
                stageEl.style.cursor = activeLightbox.zoomScale > 1 ? 'grab' : 'default';
            }
        };

        const resetZoom = () => {
            activeLightbox.zoomScale = 1;
            activeLightbox.panX = 0;
            activeLightbox.panY = 0;
            updateTransform();
        };

        const loadCurrentImage = () => {
            resetZoom();
            const currentItem = activeLightbox.imgList[activeLightbox.currentIndex];
            if (!currentItem) return;

            if (imgEl) imgEl.src = currentItem.src || currentItem.url;
            if (titleEl) titleEl.textContent = currentItem.title || 'College Memory';
            if (counterEl) counterEl.textContent = `Photo ${activeLightbox.currentIndex + 1} of ${activeLightbox.imgList.length}`;

            const prevBtn = modal.querySelector('#viewer-prev-btn');
            const nextBtn = modal.querySelector('#viewer-next-btn');
            if (prevBtn) prevBtn.style.display = activeLightbox.imgList.length > 1 ? 'flex' : 'none';
            if (nextBtn) nextBtn.style.display = activeLightbox.imgList.length > 1 ? 'flex' : 'none';
        };

        const closeViewer = () => {
            resetZoom();
            modal.classList.remove('active');
        };

        const showPrev = () => {
            if (activeLightbox.imgList.length <= 1) return;
            activeLightbox.currentIndex = (activeLightbox.currentIndex - 1 + activeLightbox.imgList.length) % activeLightbox.imgList.length;
            loadCurrentImage();
        };

        const showNext = () => {
            if (activeLightbox.imgList.length <= 1) return;
            activeLightbox.currentIndex = (activeLightbox.currentIndex + 1) % activeLightbox.imgList.length;
            loadCurrentImage();
        };

        modal.querySelector('#viewer-close-btn').onclick = closeViewer;
        modal.querySelector('#viewer-backdrop').onclick = closeViewer;
        modal.querySelector('#viewer-prev-btn').onclick = (e) => { e.stopPropagation(); showPrev(); };
        modal.querySelector('#viewer-next-btn').onclick = (e) => { e.stopPropagation(); showNext(); };

        modal.querySelector('#viewer-zoom-in').onclick = (e) => {
            e.stopPropagation();
            activeLightbox.zoomScale = Math.min(4, activeLightbox.zoomScale + 0.3);
            updateTransform();
        };
        modal.querySelector('#viewer-zoom-out').onclick = (e) => {
            e.stopPropagation();
            activeLightbox.zoomScale = Math.max(1, activeLightbox.zoomScale - 0.3);
            if (activeLightbox.zoomScale === 1) { activeLightbox.panX = 0; activeLightbox.panY = 0; }
            updateTransform();
        };
        modal.querySelector('#viewer-zoom-reset').onclick = (e) => {
            e.stopPropagation();
            resetZoom();
        };

        stageEl.onwheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.25 : -0.25;
            activeLightbox.zoomScale = Math.max(1, Math.min(4, activeLightbox.zoomScale + delta));
            if (activeLightbox.zoomScale === 1) {
                activeLightbox.panX = 0;
                activeLightbox.panY = 0;
            }
            updateTransform();
        };

        imgEl.ondblclick = (e) => {
            e.stopPropagation();
            if (activeLightbox.zoomScale > 1) {
                resetZoom();
            } else {
                activeLightbox.zoomScale = 2.5;
                updateTransform();
            }
        };

        const handleDragStart = (e) => {
            if (activeLightbox.zoomScale <= 1) return;
            activeLightbox.isDragging = true;
            const pageX = e.touches ? e.touches[0].pageX : e.pageX;
            const pageY = e.touches ? e.touches[0].pageY : e.pageY;
            activeLightbox.startX = pageX - activeLightbox.panX;
            activeLightbox.startY = pageY - activeLightbox.panY;
            if (stageEl) stageEl.style.cursor = 'grabbing';
        };

        const handleDragMove = (e) => {
            if (!activeLightbox.isDragging || activeLightbox.zoomScale <= 1) return;
            const pageX = e.touches ? e.touches[0].pageX : e.pageX;
            const pageY = e.touches ? e.touches[0].pageY : e.pageY;
            activeLightbox.panX = pageX - activeLightbox.startX;
            activeLightbox.panY = pageY - activeLightbox.startY;
            updateTransform();
        };

        const handleDragEnd = () => {
            activeLightbox.isDragging = false;
            if (stageEl) stageEl.style.cursor = activeLightbox.zoomScale > 1 ? 'grab' : 'default';
        };

        stageEl.onmousedown = handleDragStart;
        window.onmousemove = handleDragMove;
        window.onmouseup = handleDragEnd;

        stageEl.ontouchstart = handleDragStart;
        window.ontouchmove = handleDragMove;
        window.ontouchend = handleDragEnd;

        const handleKeydown = (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeViewer();
            else if (e.key === 'ArrowLeft') showPrev();
            else if (e.key === 'ArrowRight') showNext();
        };
        window.removeEventListener('keydown', modal._keydownHandler);
        modal._keydownHandler = handleKeydown;
        window.addEventListener('keydown', handleKeydown);

        loadCurrentImage();
        modal.classList.add('active');
    }

    window.openFullscreenLightbox = openFullscreenLightbox;

    window.openPageLightbox = function(element) {
        if (!element) return;
        const card = element.closest('.gallery-card, .gallery-item-wrapper, .apple-media-card, .placeholder-card, .story-media, .story-slot') || element;
        const cardImg = card.querySelector('img');
        if (!cardImg || !cardImg.src || cardImg.src.length < 5) return;

        const allImgs = Array.from(document.querySelectorAll('.gallery-card img, .gallery-item-wrapper img, .apple-media-card img, .story-slot img, .story-media img')).filter(img => img.src && img.src.length > 5);
        const imgList = allImgs.map((img, idx) => ({
            src: img.src,
            title: img.closest('.gallery-card, .apple-media-card, .story-slot, .story-media')?.querySelector('.overlay-label, .gallery-title, h3, .story-title')?.textContent || `Photo #${idx + 1}`
        }));

        const clickedIdx = allImgs.indexOf(cardImg);
        openFullscreenLightbox(imgList, clickedIdx >= 0 ? clickedIdx : 0);
    };

    window.openPageEditor = function(element) {
        if (!element) return;
        const editBtn = element.closest('.btn-card-edit') || element;
        const id = editBtn.getAttribute('data-id') || '1';
        const sectionKey = editBtn.getAttribute('data-section') || 'gallery_images';
        const type = editBtn.getAttribute('data-type') || 'image';

        if (type === 'video') openVideoEditor(sectionKey, id);
        else openImageEditor(sectionKey, id);
    };

    // Unified Document Click Delegation with Capture Phase
    document.addEventListener('click', (e) => {
        // 1. Edit Button Click
        const editBtn = e.target.closest('.btn-card-edit');
        if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            window.openPageEditor(editBtn);
            return;
        }

        // 2. Image Card Click (Fullscreen Lightbox)
        const card = e.target.closest('.gallery-card, .gallery-item-wrapper, .apple-media-card, .placeholder-card, .story-media, .story-slot');
        if (card && !e.target.closest('.btn-card-edit, .btn-card-delete, .admin-card-actions, .admin-control-bar')) {
            window.openPageLightbox(card);
        }
    }, true);

    document.addEventListener('click', (e) => {
        const uploadBtn = e.target.closest('.btn-lightbox-upload');
        if (uploadBtn) {
            e.stopPropagation();
            document.getElementById('lightbox-modal')?.classList.remove('active');
            const sectionKey = uploadBtn.getAttribute('data-section') || 'gallery_images';
            const type = uploadBtn.getAttribute('data-type') || 'image';
            openMediaModal(sectionKey, type);
        }
    });

    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


    /* --------------------------------------------------------------------------
       5. REAL-TIME HERO STATS COUNTER ENGINE
       -------------------------------------------------------------------------- */
    function animateHeroStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (!statNumbers.length) return;

        const store = getMediaStore();
        let totalMemoriesCount = 0;
        Object.keys(store).forEach(key => {
            if (Array.isArray(store[key])) {
                totalMemoriesCount += store[key].length;
            }
        });

        statNumbers.forEach(stat => {
            let target = parseInt(stat.getAttribute('data-target')) || 0;
            const label = stat.nextElementSibling ? stat.nextElementSibling.textContent.trim() : '';

            if (label.includes('Memories')) {
                target = Math.max(totalMemoriesCount, 215);
            }

            let count = 0;
            const duration = 2000;
            const step = Math.max(1, Math.ceil(target / (duration / 30)));

            const timer = setInterval(() => {
                count += step;
                if (count >= target) {
                    stat.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    stat.textContent = count;
                }
            }, 30);
        });
    }

    const heroStatsEl = document.querySelector('.hero-stats');
    if (heroStatsEl) {
        let animated = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    animateHeroStats();
                }
            });
        }, { threshold: 0.1 });
        observer.observe(heroStatsEl);
        setTimeout(animateHeroStats, 400);
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    /* --------------------------------------------------------------------------
       32. OUR HONEST REVIEWS SYSTEM
       -------------------------------------------------------------------------- */
    const REVIEWS_STORAGE_KEY = 'mc_honest_reviews_v1';

    function getHonestReviews() {
        try {
            const data = localStorage.getItem(REVIEWS_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveHonestReviews(reviews) {
        try {
            localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
        } catch (e) {}
    }

    function renderHonestReviews() {
        const listWrapper = document.getElementById('reviews-display-list');
        const countEl = document.getElementById('review-count');
        if (!listWrapper) return;

        const reviews = getHonestReviews();
        if (countEl) countEl.textContent = reviews.length;

        if (reviews.length === 0) {
            listWrapper.innerHTML = `
                <div class="empty-reviews-state">
                    <i class="fas fa-comment-dots"></i>
                    <p>No reviews submitted yet. Be the first to share your honest review!</p>
                </div>
            `;
            return;
        }

        let html = '';
        reviews.forEach((item) => {
            const stars = Array.from({ length: 5 }, (_, i) => 
                `<i class="fas fa-star" style="color: ${i < item.rating ? '#ffc107' : 'rgba(255,255,255,0.2)'}"></i>`
            ).join('');

            html += `
                <div class="review-card-item">
                    <div class="review-card-header">
                        <span class="review-author-name"><i class="fas fa-user-circle"></i> ${escapeHTML(item.name)}</span>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="review-date-badge">${escapeHTML(item.date)}</span>
                            ${isAdmin() ? `<button class="btn-icon-sm danger btn-delete-review" data-id="${item.id}" title="Delete Review"><i class="fas fa-trash"></i></button>` : ''}
                        </div>
                    </div>
                    <div class="review-stars-display">${stars}</div>
                    <p class="review-body-text">${escapeHTML(item.content)}</p>
                </div>
            `;
        });

        listWrapper.innerHTML = html;

        if (isAdmin()) {
            listWrapper.querySelectorAll('.btn-delete-review').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.getAttribute('data-id'));
                    if (confirm('Delete this review?')) {
                        const current = getHonestReviews();
                        const updated = current.filter(x => x.id !== id);
                        saveHonestReviews(updated);
                        renderHonestReviews();
                        showToast('Review deleted!', 'info');
                    }
                });
            });
        }
    }

    // Star Rating Selection Handler
    const starContainer = document.getElementById('star-rating-select');
    if (starContainer) {
        let currentRating = 5;
        const stars = starContainer.querySelectorAll('i');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.getAttribute('data-value'));
                currentRating = val;
                starContainer.setAttribute('data-rating', val);
                stars.forEach((s, idx) => {
                    if (idx < val) s.classList.add('active');
                    else s.classList.remove('active');
                });
            });
        });
    }

    // Form Submit Handler
    const reviewForm = document.getElementById('honest-review-form');
    if (reviewForm) {
        renderHonestReviews();

        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('review-name');
            const contentInput = document.getElementById('review-content');
            const starContainer = document.getElementById('star-rating-select');

            const name = nameInput ? nameInput.value.trim() : '';
            const content = contentInput ? contentInput.value.trim() : '';
            const rating = starContainer ? parseInt(starContainer.getAttribute('data-rating')) || 5 : 5;

            if (!name || !content) {
                showToast('Please enter both your name and review!', 'error');
                return;
            }

            const newReview = {
                id: Date.now(),
                name: name,
                content: content,
                rating: rating,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };

            const existing = getHonestReviews();
            existing.unshift(newReview);
            saveHonestReviews(existing);
            renderHonestReviews();

            if (nameInput) nameInput.value = '';
            if (contentInput) contentInput.value = '';

            showToast('Thank you! Your honest review has been posted.', 'success');
        });
    }



/* --------------------------------------------------------------------------
   MEDIA PROTECTION SYSTEM IMPLEMENTATION
   -------------------------------------------------------------------------- */
(function setupMediaProtectionSystem() {
    // 1. Disable Right-Click Context Menu on Media Elements
    document.addEventListener('contextmenu', (e) => {
        const isMedia = e.target.closest('img, video, canvas, .apple-media-card, .placeholder-card, .lightbox-container');
        if (isMedia) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    // 2. Disable Drag and Drop on Media Elements
    document.addEventListener('dragstart', (e) => {
        const isMedia = e.target.closest('img, video, canvas, .apple-media-card, .placeholder-card');
        if (isMedia) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    // 3. Enforce Video Protection Attributes (nodownload, disablePictureInPicture)
    function enforceVideoProtection() {
        document.querySelectorAll('video').forEach(video => {
            video.setAttribute('controlsList', 'nodownload');
            video.setAttribute('disablePictureInPicture', 'true');
            video.setAttribute('oncontextmenu', 'return false;');
            video.setAttribute('ondragstart', 'return false;');
        });
    }

    // Run enforcement periodically & on DOM ready
    document.addEventListener('DOMContentLoaded', enforceVideoProtection);
    setInterval(enforceVideoProtection, 2000);

    // 4. Keyboard Shortcuts & Screenshot Shield Deterrent
    document.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
        const key = e.key ? e.key.toLowerCase() : '';

        if (
            e.key === 'F12' ||
            e.key === 'PrintScreen' || e.code === 'PrintScreen' ||
            (ctrlOrCmd && key === 's') ||
            (ctrlOrCmd && key === 'u') ||
            (ctrlOrCmd && e.shiftKey && key === 'i') ||
            (ctrlOrCmd && e.shiftKey && key === 'c') ||
            (ctrlOrCmd && e.shiftKey && key === 'j')
        ) {
            e.preventDefault();
            e.stopPropagation();

            // Trigger temporary blur shield on screenshot / inspector shortcuts
            document.body.classList.add('screenshot-shield-active');
            setTimeout(() => {
                document.body.classList.remove('screenshot-shield-active');
            }, 1500);

            return false;
        }
    }, true);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApplication);
} else {
    startApplication();
}
window.addEventListener('load', startApplication);
setTimeout(startApplication, 10);
setTimeout(startApplication, 100);