import multer from "multer";
import { InvalidImageTypeError } from "../errors/product/ProductErrors.js";

// Multer próprio da importação de cardápio por foto: só em memória (a imagem
// vai para a IA e é descartada, nunca é gravada) e sem tocar no multer de produtos.
export const importUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new InvalidImageTypeError());
        }
    }
});
