/* ==========================================================================
   STATIC VIDEO DATA STORE (Madura College Batch 2022–2025)
   ========================================================================== */

// 1. Videos Archive: 25 Static Videos
export const videoArchive = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    src: '',
    url: '',
    title: `College Video Clip #${i + 1 < 10 ? '0' + (i + 1) : (i + 1)}`,
    duration: '04:15',
    category: 'events',
    comment: `<!-- VIDEO ${i + 1 < 10 ? '0' + (i + 1) : (i + 1)} -->`
}));

// 2. Gallery Video Vault: 10 Videos
export const galleryVideos = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    src: '',
    url: '',
    title: `Gallery Video Reel #${i + 1}`,
    duration: '03:30',
    category: 'events',
    comment: `<!-- VIDEO 0${i + 1} -->`
}));

// 3. Events: 10 Static Videos
export const eventVideos = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    src: '',
    url: '',
    title: `Event Video Reel #${i + 1}`,
    duration: '04:00',
    category: 'events',
    comment: `<!-- EVENT VIDEO 0${i + 1} -->`
}));

if (typeof window !== 'undefined') {
    window.videoArchive = videoArchive;
    window.galleryVideos = galleryVideos;
    window.eventVideos = eventVideos;
}
