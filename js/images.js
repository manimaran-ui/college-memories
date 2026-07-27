/* ==========================================================================
   REAL STATIC IMAGE DATA STORE (Madura College Batch 2022–2025)
   ========================================================================== */

const FOLDER_IMAGES = [
    "../images/gallery_001.jpeg",
    "../images/gallery_002.jpeg",
    "../images/gallery_003.jpeg",
    "../images/gallery_005.jpeg",
    "../images/gallery_006.jpeg",
    "../images/gallery_007.jpeg",
    "../images/gallery_009.jpeg",
    "../images/gallery_010.jpeg",
    "../images/gallery_011.jpeg",
    "../images/gallery_012.jpeg",
    "../images/gallery_013.jpeg",
    "../images/gallery_014.jpeg",
    "../images/gallery_015.jpeg",
    "../images/gallery_016.jpeg",
    "../images/gallery_017.jpeg",
    "../images/gallery_018.jpeg",
    "../images/gallery_020.jpeg",
    "../images/gallery_021.jpeg",
    "../images/gallery_022.jpeg",
    "../images/gallery_023.jpeg",
    "../images/gallery_024.jpeg",
    "../images/gallery_025.jpeg",
    "../images/gallery_030.jpeg",
    "../images/gallery_031.jpeg",
    "../images/gallery_032.jpeg",
    "../images/gallery_033.jpeg",
    "../images/gallery_034.jpeg",
    "../images/gallery_035.jpeg"
];

// 1. Gallery: Only unique 15 images (no repetition)
export const galleryImages = FOLDER_IMAGES.map((imgUrl, i) => ({
    id: i + 1,
    src: imgUrl,
    url: imgUrl,
    title: `Gallery Photo #${i + 1 < 10 ? '0' + (i + 1) : (i + 1)}`,
    category: ['campus', 'canteen', 'events', 'farewell'][i % 4]
}));

// 2. Events: Unique 15 images
export const eventImages = FOLDER_IMAGES.map((imgUrl, i) => ({
    id: i + 1,
    src: imgUrl,
    url: imgUrl,
    title: `Event Photo #${i + 1}`,
    category: 'events'
}));

// 3. Friends: Unique 15 images
export const friendImages = FOLDER_IMAGES.map((imgUrl, i) => ({
    id: i + 1,
    name: `Batchmate Profile #${i + 1}`,
    nickname: 'Canteen Squad',
    memory: 'Classroom laughter & tea breaks.',
    src: imgUrl,
    url: imgUrl
}));

// 4. Professors / Teachers: 10 Static Images
export const teacherImages = FOLDER_IMAGES.slice(0, 10).map((imgUrl, i) => ({
    id: i + 1,
    name: `Professor #${i + 1}`,
    dept: 'Department of Computer Science',
    quote: '"Education is the training of the mind to think."',
    src: imgUrl,
    url: imgUrl
}));

// 5. Graduation: Unique 15 images
export const gradImages = FOLDER_IMAGES.map((imgUrl, i) => ({
    id: i + 1,
    title: `Graduation Memory #${i + 1 < 10 ? '0' + (i + 1) : (i + 1)}`,
    category: 'graduation',
    src: imgUrl,
    url: imgUrl
}));

if (typeof window !== 'undefined') {
    window.galleryImages = galleryImages;
    window.eventImages = eventImages;
    window.friendImages = friendImages;
    window.teacherImages = teacherImages;
    window.gradImages = gradImages;
}
