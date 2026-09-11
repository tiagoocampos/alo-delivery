import { Router } from "express";
import { RegisterTenantController } from "./controllers/tenant/RegisterTenantController.js";
import { tenantSchema } from "./schemas/tenantSchema.js";
import { validateSchema } from "./middlewares/ValidateSchema.js";
import { loginSchema } from "./schemas/loginShema.js";
import { LoginTenantController } from "./controllers/tenant/LoginTenantController.js";

const router = Router();

router.post("/register", validateSchema(tenantSchema), new RegisterTenantController().handle);
router.post("/login", validateSchema(loginSchema), new LoginTenantController().handle);

export { router };