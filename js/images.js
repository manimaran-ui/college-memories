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
    "images/journey/classroom.jpg",
    "images/journey/teachers.jpg",
    "images/journey/download.jfif",
    "images/journey/libray.png",
    "images/journey/canteen.jfif"
];

export const galleryImages = Array.from({ length: 116 }, (_, idx) => {
    const i = idx + 1;
    if (i === 92) return null;
    const numStr = i < 10 ? '00' + i : (i < 100 ? '0' + i : '' + i);
    return {
        id: i,
        src: `images/gallery/gallery_${numStr}.jpg`,
        url: `images/gallery/gallery_${numStr}.jpg`,
        title: `Group Image ${i < 10 ? '0' + i : '' + i}`,
        category: ['campus', 'canteen', 'events', 'farewell'][i % 4]
    };
}).filter(Boolean);

export const eventImages = [1, 2, 3].map(i => ({
    id: i,
    src: `images/events/event_00${i}.jpg`,
    url: `images/events/event_00${i}.jpg`,
    title: `Event Photo #0${i}`,
    category: 'events'
}));

const friendFileNumbers = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49
];

export const friendImages = friendFileNumbers.map((num, idx) => {
    const i = idx + 1;
    const fileNumStr = num < 10 ? '00' + num : '0' + num;
    const displayNumStr = i < 10 ? '0' + i : '' + i;
    const nicknames = ['Canteen Squad', 'Soul Tribe', 'Backbenchers', 'Classroom Gang', 'Campus Squad', 'Forever Friends', 'Fun Tribe'];
    return {
        id: i,
        name: `Best Friend #${displayNumStr}`,
        title: `Best Friend #${displayNumStr}`,
        nickname: nicknames[idx % nicknames.length],
        memory: 'Classroom laughter & tea breaks.',
        src: `images/friends/friend_${fileNumStr}.jpg`,
        url: `images/friends/friend_${fileNumStr}.jpg`
    };
});

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
