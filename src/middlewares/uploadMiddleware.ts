import multer from "multer";
import path from "path";
import createHttpError from "http-errors";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new createHttpError.BadRequest("Only JPEG, PNG, and WEBP images are allowed") as any);
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter
});
