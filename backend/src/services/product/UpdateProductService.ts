import { Readable } from "stream";
import { CategoryNotFoundError } from "../../errors/category/CategoryErrors.js";
import { ImageUploadError, ProductNotFoundError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";
import cloudinary from "../../config/cloudinary.js";

interface UpdateProductServiceProps {
    tenantId: string;
    productId: string;
    name?: string | undefined;
    description?: string | undefined;
    basePrice?: number | undefined;
    categoryId?: string | undefined;
    isActive?: boolean | undefined;
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

        if (categoryId) {
            const categoryExists = await prismaClient.category.findFirst({
                where: {
                    id: categoryId,
                    tenantId
                }
            });

            if (!categoryExists) {
                throw new CategoryNotFoundError();
            }
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
                createdAt: true,
                updatedAt: true
            }
        });

        return updated;
    }
}

export { UpdateProductService };
