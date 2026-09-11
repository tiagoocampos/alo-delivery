import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/multer.js";

import { validateSchema } from "./middlewares/ValidateSchema.js";
import { authenticate } from "./middlewares/Authenticate.js";
import { requireTenant } from "./middlewares/RequireTenant.js";
import { authorize } from "./middlewares/Authorize.js";
import { authRateLimiter, publicOrderRateLimiter } from "./middlewares/RateLimit.js";

import { RegisterTenantController } from "./controllers/tenant/RegisterTenantController.js";
import { LoginTenantController } from "./controllers/tenant/LoginTenantController.js";
import { GetTenantController } from "./controllers/tenant/GetTenantController.js";
import { GetStoreMenuController } from "./controllers/tenant/GetStoreMenuController.js";
import { CreateCategoryController } from "./controllers/category/CreateCategoryController.js";
import { ListCategoriesController } from "./controllers/category/ListCategoriesController.js";
import { CreateProductController } from "./controllers/product/CreateProductController.js";
import { ListProductsController } from "./controllers/product/ListProductsController.js";
import { UpdateProductController } from "./controllers/product/UpdateProductController.js";
import { DeleteProductController } from "./controllers/product/DeleteProductController.js";
import { CreateProductVariantController } from "./controllers/product/CreateProductVariantController.js";
import { CreateOrderController } from "./controllers/order/CreateOrderController.js";
import { ListOrdersController } from "./controllers/order/ListOrdersController.js";
import { GetOrderDetailController } from "./controllers/order/GetOrderDetailController.js";
import { UpdateOrderStatusController } from "./controllers/order/UpdateOrderStatusController.js";
import { GetLoyaltyPointsController } from "./controllers/loyalty/GetLoyaltyPointsController.js";

import { tenantSchema, getTenantSchema, getStoreMenuSchema } from "./schemas/tenantSchema.js";
import { loginSchema } from "./schemas/loginShema.js";
import { createCategorySchema } from "./schemas/categorySchema.js";
import {
    createProductSchema,
    listProductsSchema,
    updateProductSchema,
    deleteProductSchema,
    createProductVariantSchema
} from "./schemas/productSchema.js";
import {
    createOrderSchema,
    listOrdersSchema,
    getOrderDetailSchema,
    updateOrderStatusSchema
} from "./schemas/orderSchema.js";
import { getLoyaltyPointsSchema } from "./schemas/loyaltySchema.js";

const router = Router();
const upload = multer(uploadConfig);

/* ---------------------------------------------------------------------------
 * Autenticação
 * ------------------------------------------------------------------------ */
router.post("/register", authRateLimiter, validateSchema(tenantSchema), new RegisterTenantController().handle);
router.post("/login", authRateLimiter, validateSchema(loginSchema), new LoginTenantController().handle);

/* ---------------------------------------------------------------------------
 * Rotas públicas da loja (cliente final, sem login) — identificadas pelo slug
 * ------------------------------------------------------------------------ */
router.get("/tenant/:slug", validateSchema(getTenantSchema), new GetTenantController().handle);
router.get("/store/:slug/menu", validateSchema(getStoreMenuSchema), new GetStoreMenuController().handle);
router.post("/store/:slug/orders", publicOrderRateLimiter, validateSchema(createOrderSchema), new CreateOrderController().handle);
router.get("/store/:slug/loyalty", validateSchema(getLoyaltyPointsSchema), new GetLoyaltyPointsController().handle);

/* ---------------------------------------------------------------------------
 * Painel do lojista — tenantId sempre vem do JWT (req.auth), nunca da request
 * ------------------------------------------------------------------------ */
router.post("/categories", authenticate, requireTenant, authorize("store_owner"), validateSchema(createCategorySchema), new CreateCategoryController().handle);
router.get("/categories", authenticate, requireTenant, new ListCategoriesController().handle);

router.post("/products", authenticate, requireTenant, authorize("store_owner"), upload.single("file"), validateSchema(createProductSchema), new CreateProductController().handle);
router.get("/products", authenticate, requireTenant, validateSchema(listProductsSchema), new ListProductsController().handle);
router.put("/products/:id", authenticate, requireTenant, authorize("store_owner"), upload.single("file"), validateSchema(updateProductSchema), new UpdateProductController().handle);
router.delete("/products/:id", authenticate, requireTenant, authorize("store_owner"), validateSchema(deleteProductSchema), new DeleteProductController().handle);
router.post("/products/:id/variants", authenticate, requireTenant, authorize("store_owner"), validateSchema(createProductVariantSchema), new CreateProductVariantController().handle);

router.get("/orders", authenticate, requireTenant, validateSchema(listOrdersSchema), new ListOrdersController().handle);
router.get("/orders/:id", authenticate, requireTenant, validateSchema(getOrderDetailSchema), new GetOrderDetailController().handle);
router.patch("/orders/:id/status", authenticate, requireTenant, authorize("store_owner", "store_staff"), validateSchema(updateOrderStatusSchema), new UpdateOrderStatusController().handle);

export { router };
