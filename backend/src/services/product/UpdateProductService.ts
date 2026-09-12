import { Readable } from "stream";
import { CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import { ImageUploadError, ProductNotFoundError, ProductPriceRequiredError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";
import cloudinary from "../../config/cloudinary.js";
import type { ProductBadge } from "../../generated/prisma/enums.js";

interface UpdateProductServiceProps {
    tenantId: string;
    productId: string;
    name?: string | undefined;
    description?: string | undefined;
    basePrice?: number | undefined;
    categoryId?: string | undefined;
    isActive?: boolean | undefined;
    badge?: ProductBadge | null | undefined;
    imageBuffer?: Buffer | undefined;
    imageName?: string | undefined;
}

class UpdateProductService {
    async execute({
        tenantId,
        productId,
        name,
        description,
        basePrice,
        categoryId,
        isActive,
        badge,
        imageBuffer,
        imageName
    }: UpdateProductServiceProps) {

        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                tenantId
            }
        });

        if (!product) {
            throw new ProductNotFoundError();
        }

        // Categoria "efetiva" após o update: a nova, se estiver sendo trocada,
        // senão a que o produto já tem.
        const effectiveCategoryId = categoryId ?? product.categoryId;

        const effectiveCategory = await prismaClient.category.findFirst({
            where: {
                id: effectiveCategoryId,
                tenantId
            },
            select: {
                id: true,
                _count: {
                    select: { sizes: true }
                }
            }
        });

        if (!effectiveCategory) {
            throw new CategoryNotFoundError();
        }

        // Categoria com tamanho: o produto é um "sabor", sem preço próprio.
        // Categoria sem tamanho: preço final (novo valor, ou o já salvo) precisa existir.
        const categoryHasSizes = effectiveCategory._count.sizes > 0;
        const effectiveBasePrice = basePrice === undefined ? product.basePrice : basePrice;
        if (!categoryHasSizes && (effectiveBasePrice === undefined || effectiveBasePrice === null)) {
            throw new ProductPriceRequiredError();
        }

        let imageUrl: string | undefined;
        if (imageBuffer && imageName) {
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
        }

        const updated = await prismaClient.product.update({
            where: {
                id: product.id
            },
            data: {
                ...(name === undefined ? {} : { name }),
                ...(description === undefined ? {} : { description }),
                ...(basePrice === undefined ? {} : { basePrice }),
                ...(categoryId === undefined ? {} : { categoryId }),
                ...(isActive === undefined ? {} : { isActive }),
                ...(badge === undefined ? {} : { badge }),
                ...(imageUrl === undefined ? {} : { imageUrl }),
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
                createdAt: true,
                updatedAt: true
            }
        });

        return updated;
    }
}

export { UpdateProductService };
