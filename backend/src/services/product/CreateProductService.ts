import { Readable } from "stream";
import { CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import { ImageUploadError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";
import cloudinary from "../../config/cloudinary.js";
import type { ProductBadge } from "../../generated/prisma/enums.js";

interface CreateProductServiceProps {
    tenantId: string;
    name: string;
    description?: string | undefined;
    basePrice: number;
    categoryId: string;
    badge?: ProductBadge | null | undefined;
    imageBuffer: Buffer;
    imageName: string;
}

class CreateProductService {
    async execute({
        tenantId,
        name,
        description,
        basePrice,
        categoryId,
        badge,
        imageBuffer,
        imageName
    }: CreateProductServiceProps) {

        // A categoria precisa ser da mesma loja, senão um lojista conseguiria
        // pendurar produto na categoria de outro.
        const categoryExists = await prismaClient.category.findFirst({
            where: {
                id: categoryId,
                tenantId
            }
        });

        if (!categoryExists) {
            throw new CategoryNotFoundError();
        }

        let imageUrl = "";
        try {

            const result = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: `products/${tenantId}`,
                    resource_type: "image",
                    public_id: `${Date.now()}-${imageName.split(".")[0]}`
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result)
                    }
                })

                const bufferStream = Readable.from(imageBuffer);
                bufferStream.pipe(uploadStream);
            })

            imageUrl = result.secure_url

        } catch (error) {
            console.error(error);
            throw new ImageUploadError();
        }

        const product = await prismaClient.product.create({
            data: {
                tenantId,
                categoryId,
                name,
                description: description ?? null,
                imageUrl,
                basePrice,
                badge: badge ?? null
            },
            select: {
                id: true,
                tenantId: true,
                categoryId: true,
                name: true,
                description: true,
                imageUrl: true,
                basePrice: true,
                isActive: true,
                badge: true,
                createdAt: true
            }
        });

        return product;
    }
}

export { CreateProductService };
