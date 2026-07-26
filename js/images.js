/* ==========================================================================
   REAL STATIC IMAGE DATA STORE (Madura College Batch 2022–2025)
   ========================================================================== */

const FOLDER_IMAGES = [
    "../images/mc project.jpeg",
    "../images/WhatsApp Image 2026-07-24 at 10.56.21 PM (1).jpeg",
    "../images/WhatsApp Image 2026-07-24 at 10.56.21 PM.jpeg",
    "../images/WhatsApp Image 2026-07-24 at 10.56.22 PM.jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.27.35 PM (1).jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.27.35 PM.jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.27.36 PM.jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.28.49 PM (1).jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.28.49 PM (2).jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.28.49 PM.jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.30.08 PM.jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.31.27 PM.jpeg",
    "../images/WhatsApp Image 2026-07-24 at 11.31.46 PM.jpeg",
    "../images/WhatsApp Image 2026-07-25 at 11.27.42 PM.jpeg",
    "../images/WhatsApp Image 2026-07-25 at 11.27.43 PM.jpeg"
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
