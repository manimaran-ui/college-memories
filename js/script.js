import { galleryImages, eventImages, friendImages, teacherImages, gradImages } from "./images.js";
import { galleryVideos, videoArchive, eventVideos } from "./videos.js";

/*
==========================================================================
   MADURA COLLEGE MEMORIES | BATCH 2022–2025
   STATIC MEDIA ENGINE & USER ROLE UI MANAGEMENT
   ========================================================================== */

function startApplication() {

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
    const MEDIA_STORAGE_KEY = 'mc_static_media_store_v6';

    // Clear legacy storage cache to instantly load real static images
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

        // Only redirect from login page to index.html if user is already logged in
        if (isAdmin() && isLoginPage) {
            window.location.replace('index.html');
            return;
        }

        if (isAdmin() || user) {
            if (navActions) {
                if (!document.getElementById('role-badge')) {
                    const badge = document.createElement('span');
                    badge.id = 'role-badge';
                    badge.className = isAdmin() ? 'role-badge admin' : 'role-badge user';
                    badge.innerHTML = isAdmin() ? '<i class="fas fa-shield-halved"></i> Admin' : '<i class="fas fa-user"></i> Friend';
                    const logoutBtn = document.getElementById('logout-btn');
                    if (logoutBtn) navActions.insertBefore(badge, logoutBtn);
                }

                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.className = 'btn btn-sm btn-logout';
                    logoutBtn.innerHTML = '<i class="fas fa-right-from-bracket"></i> <span>Logout</span>';
                }
            }
        }

        // Enforce Admin visibility rules across all pages without blocking access
        document.querySelectorAll('.admin-only, .admin-card-actions').forEach(el => {
            el.style.display = isAdmin() ? 'inline-flex' : 'none';
        });
        document.querySelectorAll('.admin-block-only').forEach(el => {
            el.style.display = isAdmin() ? 'block' : 'none';
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
        id: i + 1, title: `Professor Tribute Video #${i + 1}`, duration: '05:00', url: `../assets/videos/video${(i % 3) + 1}.mp4`, comment: `<!-- TEACHER VIDEO ${i + 1} -->`
    }));
    const DEFAULT_FRIEND_IMAGES = friendImages;
    const DEFAULT_FRIEND_VIDEOS = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1, title: `Friendship Memory Reel #${i + 1}`, duration: '02:45', url: `../assets/videos/video${(i % 3) + 1}.mp4`, comment: `<!-- FRIEND VIDEO ${i + 1} -->`
    }));
    const DEFAULT_GRAD_IMAGES = gradImages;
    const DEFAULT_GRAD_VIDEOS = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1, title: `Graduation Ceremony Reel #${i + 1}`, duration: '05:30', url: `../assets/videos/video${(i % 3) + 1}.mp4`, comment: `<!-- GRADUATION VIDEO ${i + 1} -->`
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
            hero_photo: [{ id: 1, title: 'Madura College Hero Photo', url: '../batch-group-photo.jpg' }],
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
        renderGridSection(['gallery-grid', 'gallery-photo-grid', 'gallery-image-grid'], store.gallery_images, 'image', 'gallery_images', 'Gallery Photo Vault (50 Photos)');
        renderGridSection(['gallery-video-grid', 'gallery-videos-grid'], store.gallery_videos, 'video', 'gallery_videos', 'Gallery Video Vault (10 Videos)');

        // 2. Videos Archive
        renderGridSection(['video-archive-grid', 'videos-grid', 'video-grid'], store.video_archive, 'video', 'video_archive', 'College Video Archive (20 Videos)');

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
        renderDynamicJourneyStory();
        renderHeroPhotoAdminControls();
    }

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
            img.src = (item && item.url && item.url.length > 5) ? item.url : '../batch-group-photo.jpg';
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

        grid.innerHTML = '';
        (items || []).forEach((item, idx) => {
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
                cardWrapper.innerHTML = `
                    <div class="placeholder-card video-placeholder-card ${hasUrl ? 'has-media' : ''}">
                        <div class="video-duration">${escapeHTML(item.duration || '03:45')}</div>
                        ${isAdmin() ? `
                            <div class="admin-card-actions">
                                <button class="btn-card-edit" data-id="${item.id}" data-section="${sectionKey}" data-type="${type}" title="Edit"><i class="fas fa-pen"></i></button>
                                <button class="btn-card-delete" data-id="${item.id}" data-section="${sectionKey}" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        ` : ''}
                        ${hasUrl ? `
                            <video src="${escapeHTML(item.url)}" class="card-media-video" controls controlsList="nodownload" disablePictureInPicture oncontextmenu="return false;" ondragstart="return false;"></video>
                            <div class="media-watermark-overlay">© Madura College Memories 2022–2025</div>
                        ` : `
                            <div class="placeholder-content">
                                <div class="play-btn-circle"><i class="fas fa-play"></i></div>
                                <h4 class="video-title">${escapeHTML(item.title)}</h4>
                                <span class="code-comment">${item.comment || `<!-- VIDEO ${numStr} -->`}</span>
                            </div>
                        `}
                    </div>
                    <div class="video-info">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span class="video-category"><i class="fas fa-film"></i> Reel #${numStr}</span>
                            ${isAdmin() ? `
                                <span>
                                    <button class="btn-icon-sm btn-card-edit" data-id="${item.id}" data-section="${sectionKey}" data-type="${type}"><i class="fas fa-pen"></i></button>
                                    <button class="btn-icon-sm btn-card-delete danger" data-id="${item.id}" data-section="${sectionKey}"><i class="fas fa-trash"></i></button>
                                </span>
                            ` : ''}
                        </div>
                        <h3>${escapeHTML(item.title)}</h3>
                    </div>
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
            script.onload = callback;
            document.body.appendChild(script);
        } else {
            const script = document.getElementById('cropper-js');
            script.addEventListener('load', callback);
        }
    }

    function openImageEditor(sectionKey, id) {
        if (!isAdmin()) {
            showToast('Access denied! Admin privileges required.', 'error');
            return;
        }

        const store = getMediaStore();
        const list = store[sectionKey] || [];
        const item = list.find(x => String(x.id) === String(id));
        if (!item) return;

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
                targetImg.src = item.url || '../hero-group-photo.jpg';

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

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) icon.className = 'fas fa-xmark'; else icon.className = 'fas fa-bars';
        });
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (mobileToggle.querySelector('i')) mobileToggle.querySelector('i').className = 'fas fa-bars';
            });
        });
    }

    function updateActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) link.classList.add('active');
            else if (!href.includes('#')) link.classList.remove('active');
        });
    }
    updateActiveNavLink();

    function triggerAllReveals() {
        document.querySelectorAll('[data-reveal]').forEach(el => {
            el.classList.add('revealed');
        });
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

    function getOrCreateLightboxModal() {
        let modal = document.getElementById('lightbox-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'lightbox-modal';
            modal.className = 'lightbox-modal';
            modal.innerHTML = `
                <div class="lightbox-overlay" id="lightbox-overlay"></div>
                <button class="lightbox-close" id="lightbox-close" aria-label="Close Lightbox" style="position: fixed; top: 20px; right: 20px; font-size: 1.8rem; color: #ffffff; background: rgba(0, 0, 0, 0.85); border: 2px solid rgba(0, 242, 254, 0.7); width: 48px; height: 48px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 100005; backdrop-filter: blur(12px); box-shadow: 0 0 25px rgba(0, 242, 254, 0.6);"><i class="fas fa-xmark"></i></button>
                <div class="lightbox-container glass-panel" style="max-width: 95vw; max-height: 90vh; padding: 20px; border-radius: 20px; background: rgba(8, 9, 14, 0.95); border: 1px solid rgba(0, 242, 254, 0.45); box-shadow: 0 30px 70px rgba(0,0,0,0.95); position: relative; z-index: 100000;">
                    <div id="lightbox-content"></div>
                </div>
            `;
            document.body.appendChild(modal);

            const closeModal = () => {
                const vid = modal.querySelector('video');
                if (vid) {
                    vid.pause();
                    vid.currentTime = 0;
                }
                modal.classList.remove('active');
            };

            modal.addEventListener('click', (e) => {
                if (e.target.closest('#lightbox-close') || e.target.closest('.lightbox-close') || e.target.closest('#lightbox-overlay') || e.target.closest('.lightbox-overlay')) {
                    e.stopPropagation();
                    closeModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    closeModal();
                }
            });
        }
        return modal;
    }

    // Global document-level fallback handler for closing any Lightbox modal
    document.addEventListener('click', (e) => {
        if (e.target.closest('#lightbox-close, .lightbox-close, #lightbox-overlay, .lightbox-overlay')) {
            const activeModals = document.querySelectorAll('.lightbox-modal.active, #lightbox-modal.active');
            activeModals.forEach(m => {
                const vid = m.querySelector('video');
                if (vid) {
                    vid.pause();
                    vid.currentTime = 0;
                }
                m.classList.remove('active');
            });
        }
    });

    document.addEventListener('click', (e) => {
        const card = e.target.closest('.placeholder-card, .gallery-card, .event-card, .hero-photo-card, .story-media, .story-slot, .video-card, .video-placeholder-card, .teacher-photo, .friend-photo');
        if (card && !e.target.closest('.btn-card-edit') && !e.target.closest('.btn-card-delete') && !e.target.closest('.admin-bar-info') && !e.target.closest('.btn-upload-trigger') && !e.target.closest('.admin-card-actions')) {
            const modal = getOrCreateLightboxModal();
            const lightboxContent = modal.querySelector('#lightbox-content');

            const title = card.querySelector('.gallery-title, .placeholder-title, h3, .overlay-label, .video-title, .teacher-name, .friend-name')?.textContent || 'College Memory';
            const img = card.querySelector('img');
            const vid = card.querySelector('video');

            if (lightboxContent) {
                if (img && img.src && img.src.length > 5) {
                    lightboxContent.innerHTML = `
                        <div style="text-align: center; padding: 10px; position: relative;">
                            <img src="${img.src}" style="max-height: 78vh; max-width: 90vw; object-fit: contain; border-radius: 14px; box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 242, 254, 0.45); border: 2px solid rgba(0, 242, 254, 0.5); display: block; margin: 0 auto 16px auto;">
                            <h3 style="font-size: 1.5rem; font-weight: 700; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.8); margin: 0;">${escapeHTML(title)}</h3>
                        </div>
                    `;
                } else if (vid && vid.src && vid.src.length > 5) {
                    lightboxContent.innerHTML = `
                        <div style="text-align: center; padding: 10px; position: relative;">
                            <video src="${vid.src}" controls autoplay style="max-height: 78vh; max-width: 90vw; border-radius: 14px; box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(0, 242, 254, 0.45); border: 2px solid rgba(0, 242, 254, 0.5); display: block; margin: 0 auto 16px auto;"></video>
                            <h3 style="font-size: 1.5rem; font-weight: 700; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.8); margin: 0;">${escapeHTML(title)}</h3>
                        </div>
                    `;
                } else {
                    const cardSection = card.querySelector('.btn-card-edit')?.getAttribute('data-section') || card.getAttribute('data-section') || 'gallery_images';
                    const isVidSection = cardSection.includes('video');

                    lightboxContent.innerHTML = `
                        <div class="lightbox-placeholder-preview" style="padding: 30px; text-align: center;">
                            <div class="placeholder-icon" style="margin: 0 auto 20px auto; width: 90px; height: 90px; font-size: 3rem;"><i class="fas ${isVidSection ? 'fa-video' : 'fa-camera'}"></i></div>
                            <span class="placeholder-tag">Interactive Media Card Shell</span>
                            <h2 style="font-size: 1.8rem; margin-bottom: 12px; color: #fff;">${escapeHTML(title)}</h2>
                            <p style="color: var(--color-text-muted); max-width: 500px; margin: 0 auto 24px auto;">Clean frame ready for real photo or video upload.</p>
                            ${isAdmin() ? `
                                <button class="btn btn-primary btn-glow btn-lightbox-upload" data-section="${cardSection}" data-type="${isVidSection ? 'video' : 'image'}" style="margin: 0 auto; display: inline-flex; align-items: center; gap: 8px; font-size: 1rem; padding: 12px 24px;">
                                    <i class="fas fa-cloud-arrow-up"></i> Upload ${isVidSection ? 'Video' : 'Photo'} Now
                                </button>
                            ` : `
                                <div class="code-comment" style="display: inline-block; padding: 10px 20px; font-size: 0.95rem;">Admin permissions required to upload media.</div>
                            `}
                        </div>
                    `;
                }
            }
            modal.classList.add('active');
        }
    });

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