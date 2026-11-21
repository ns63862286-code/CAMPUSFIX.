const path = require('node:path');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'campusfix.db');
const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'campusfix-secure-secret-key-2026';

module.exports = {
  PORT,
  DB_PATH,
  UPLOADS_DIR,
  JWT_SECRET,
  MAX_PHOTO_SIZE_MB: 10,
  CATEGORIES: [
    'Electrical & Power',
    'Plumbing & Water',
    'Infrastructure & Furniture',
    'IT & Campus Wi-Fi',
    'Cleanliness & Sanitation',
    'Safety & Security',
    'Hostel & Mess',
    'Library & Labs'
  ],
  PRIORITIES: ['Low', 'Medium', 'High', 'Urgent'],
  STATUSES: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected']
};
