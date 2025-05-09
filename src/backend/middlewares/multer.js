import multer from 'multer';
import path from 'path';
import os from 'os';

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed.'));
  }
};

export const uploadAvatar = multer({ storage, fileFilter }).single('avatar');
