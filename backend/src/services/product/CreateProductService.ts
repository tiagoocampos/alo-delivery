import { Readable } from "stream";
import { CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import { ImageUploadError, ProductPriceRequiredError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";
import cloudinary from "../../config/cloudinary.js";
import type { ProductBadge } from "../../generated/prisma/enums.js";

interface CreateProductServiceProps {
    tenantId: string;
    name: string;
    description?: string | undefined;
    basePrice?: number | undefined;
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
            },
            select: {
                id: true,
                _count: {
                    select: { sizes: true }
                }
            }
        });

        if (!categoryExists) {
            throw new CategoryNotFoundError();
        }

        // Categoria com tamanho: o produto é um "sabor", sem preço próprio.
        // Categoria sem tamanho: preço continua obrigatório, como sempre foi.
        const categoryHasSizes = categoryExists._count.sizes > 0;
        if (!categoryHasSizes && (basePrice === undefined || basePrice === null)) {
            throw new ProductPriceRequiredError();
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
                basePrice: basePrice ?? null,
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
