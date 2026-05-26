const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ['.mp4', '.zip', '.rar'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no soportado. Solo MP4, ZIP o RAR.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1000 * 1024 * 1024 // 1GB limit
    }
});

module.exports = upload;
