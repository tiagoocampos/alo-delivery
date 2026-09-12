import { Readable } from "stream";
import { TenantNotFoundError, TenantSlugAlreadyInUseError } from "../../errors/tenant/TenantErrors.js";
import { ImageUploadError } from "../../errors/product/ProductErrors.js";
import prismaClient from "../../prisma/index.js";
import cloudinary from "../../config/cloudinary.js";
import { Prisma } from "../../generated/prisma/client.js";

interface UpdateMyTenantServiceProps {
    tenantId: string;
    name?: string;
    slug?: string;
    phone?: string;
    deliveryFee?: number;
    isActive?: boolean;
    description?: string;
    address?: string;
    instagramUrl?: string;
    minimumOrderValue?: number;
    businessHours?: Prisma.InputJsonValue;
    logoBuffer?: Buffer | undefined;
    logoName?: string | undefined;
    bannerBuffer?: Buffer | undefined;
    bannerName?: string | undefined;
    faviconBuffer?: Buffer | undefined;
    faviconName?: string | undefined;
}

async function uploadBrandingAsset(buffer: Buffer, name: string, tenantId: string, asset: string) {
    try {
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: `branding/${tenantId}/${asset}`,
                resource_type: "image",
                public_id: `${Date.now()}-${name.split(".")[0]}`
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });

            const bufferStream = Readable.from(buffer);
            bufferStream.pipe(uploadStream);
        });

        return result.secure_url as string;
    } catch (error) {
        console.error(error);
        throw new ImageUploadError();
    }
}

class UpdateMyTenantService {
    async execute({
        tenantId,
        name,
        slug,
        phone,
        deliveryFee,
        isActive,
        description,
        address,
        instagramUrl,
        minimumOrderValue,
        businessHours,
        logoBuffer,
        logoName,
        bannerBuffer,
        bannerName,
        faviconBuffer,
        faviconName
    }: UpdateMyTenantServiceProps) {
        const tenant = await prismaClient.tenant.findUnique({
            where: {
                id: tenantId
            }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        if (slug && slug !== tenant.slug) {
            const slugInUse = await prismaClient.tenant.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (slugInUse) {
                throw new TenantSlugAlreadyInUseError();
            }
        }

        const logoUrl = logoBuffer && logoName
            ? await uploadBrandingAsset(logoBuffer, logoName, tenantId, "logo")
            : undefined;

        const bannerUrl = bannerBuffer && bannerName
            ? await uploadBrandingAsset(bannerBuffer, bannerName, tenantId, "banner")
            : undefined;

        const faviconUrl = faviconBuffer && faviconName
            ? await uploadBrandingAsset(faviconBuffer, faviconName, tenantId, "favicon")
            : undefined;

        const updatedTenant = await prismaClient.tenant.update({
            where: {
                id: tenantId
            },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(phone !== undefined && { phone }),
                ...(deliveryFee !== undefined && { deliveryFee }),
                ...(isActive !== undefined && { isActive }),
                ...(description !== undefined && { description }),
                ...(address !== undefined && { address }),
                ...(instagramUrl !== undefined && { instagramUrl }),
                ...(minimumOrderValue !== undefined && { minimumOrderValue }),
                ...(businessHours !== undefined && { businessHours }),
                ...(logoUrl !== undefined && { logoUrl }),
                ...(bannerUrl !== undefined && { bannerUrl }),
                ...(faviconUrl !== undefined && { faviconUrl })
            },
            select: {
                id: true,
                name: true,
                slug: true,
                phone: true,
                deliveryFee: true,
                isActive: true,
                logoUrl: true,
                bannerUrl: true,
                faviconUrl: true,
                description: true,
                address: true,
                instagramUrl: true,
                minimumOrderValue: true,
                businessHours: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return updatedTenant;
    }
}

export { UpdateMyTenantService };
