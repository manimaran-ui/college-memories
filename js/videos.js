/* ==========================================================================
   VIDEO DATA STORE (Madura College Batch 2022–2025)
   ========================================================================== */

export const galleryVideos = [];
export const videoArchive = Array.from({ length: 57 }, (_, idx) => {
    const i = idx + 1;
    const numStr = i < 10 ? '00' + i : (i < 100 ? '0' + i : '' + i);
    return {
        id: i,
        title: `College Memory Video #${numStr}`,
        category: 'College Archive',
        duration: '00:45',
        url: `videos/video_${numStr}.mp4`,
        src: `videos/video_${numStr}.mp4`
    };
});
export const eventVideos = [];

if (typeof window !== 'undefined') {
    window.galleryVideos = galleryVideos;
    window.videoArchive = videoArchive;
    window.eventVideos = eventVideos;
}
