import { z } from "zod";

export const tenantSchema =
    z.object({
        body: z.object({
            storeName: z.string().min(1, { message: "Name is required" }),
            ownerName: z.string().min(1, { message: "Owner name is required" }),
            email: z.string().email({ message: "Invalid email address" }),
            password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
        })
    })


