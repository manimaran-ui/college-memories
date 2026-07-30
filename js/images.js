/* ==========================================================================
   REAL STATIC IMAGE DATA STORE (Madura College Batch 2022–2025)
   Organized by category subfolders
   ========================================================================== */

export const homeImages = [
    "images/home/home_001.jpg",
    "images/home/home_002.jpg",
    "images/home/home_003.jpg",
    "images/home/home_004.jpg",
    "images/home/home_005.jpg"
];

export const journeyImages = [
    "images/journey/journey_001.jpg",
    "images/journey/journey_002.jpg",
    "images/journey/journey_003.jpg",
    "images/journey/journey_004.jpg",
    "images/journey/journey_005.jpg"
];

export const galleryImages = Array.from({ length: 71 }, (_, idx) => {
    const i = idx + 1;
    const numStr = i < 10 ? '00' + i : (i < 100 ? '0' + i : '' + i);
    return {
        id: i,
        src: `images/gallery/gallery_${numStr}.jpg`,
        url: `images/gallery/gallery_${numStr}.jpg`,
        title: `Gallery Photo #${numStr}`,
        category: ['campus', 'canteen', 'events', 'farewell'][i % 4]
    };
});

export const eventImages = [1, 2, 3].map(i => ({
    id: i,
    src: `images/events/event_00${i}.jpg`,
    url: `images/events/event_00${i}.jpg`,
    title: `Event Photo #0${i}`,
    category: 'events'
}));

export const friendImages = [1, 2, 3, 4, 5, 6].map(i => ({
    id: i,
    name: `Batchmate Profile #0${i}`,
    nickname: 'Canteen Squad',
    memory: 'Classroom laughter & tea breaks.',
    src: `images/friends/friend_00${i}.jpg`,
    url: `images/friends/friend_00${i}.jpg`
}));

export const gradImages = Array.from({ length: 55 }, (_, idx) => {
    const i = idx + 1;
    const numStr = i < 10 ? '00' + i : (i < 100 ? '0' + i : '' + i);
    return {
        id: i,
        title: `Graduation Memory #${numStr}`,
        category: 'graduation',
        src: `images/graduation/graduation_${numStr}.jpg`,
        url: `images/graduation/graduation_${numStr}.jpg`
    };
});

export const teacherImages = homeImages.map((imgUrl, i) => ({
    id: i + 1,
    name: `Professor #${i + 1}`,
    dept: 'Department of Commerce / Computer Applications',
    quote: '"Education is the training of the mind to think."',
    src: imgUrl,
    url: imgUrl
}));

if (typeof window !== 'undefined') {
    window.homeImages = homeImages;
    window.journeyImages = journeyImages;
    window.galleryImages = galleryImages;
    window.eventImages = eventImages;
    window.friendImages = friendImages;
    window.teacherImages = teacherImages;
    window.gradImages = gradImages;
}
