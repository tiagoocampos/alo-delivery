import { Router } from "express";
import multer from "multer";
import uploadConfig from "./config/multer.js";

import { validateSchema } from "./middlewares/ValidateSchema.js";
import { authenticate } from "./middlewares/Authenticate.js";
import { requireTenant } from "./middlewares/RequireTenant.js";
import { authorize } from "./middlewares/Authorize.js";
import { authenticateCustomer } from "./middlewares/AuthenticateCustomer.js";
import { optionalAuthenticateCustomer } from "./middlewares/OptionalAuthenticateCustomer.js";
import { authRateLimiter, publicOrderRateLimiter } from "./middlewares/RateLimit.js";

import { RegisterTenantController } from "./controllers/tenant/RegisterTenantController.js";
import { LoginTenantController } from "./controllers/tenant/LoginTenantController.js";
import { GetTenantController } from "./controllers/tenant/GetTenantController.js";
import { GetMyTenantController } from "./controllers/tenant/GetMyTenantController.js";
import { UpdateMyTenantController } from "./controllers/tenant/UpdateMyTenantController.js";
import { GetStoreMenuController } from "./controllers/tenant/GetStoreMenuController.js";
import { CreateCategoryController } from "./controllers/category/CreateCategoryController.js";
import { ListCategoriesController } from "./controllers/category/ListCategoriesController.js";
import { CreateProductController } from "./controllers/product/CreateProductController.js";
import { ListProductsController } from "./controllers/product/ListProductsController.js";
import { UpdateProductController } from "./controllers/product/UpdateProductController.js";
import { DeleteProductController } from "./controllers/product/DeleteProductController.js";
import { CreateProductVariantController } from "./controllers/product/CreateProductVariantController.js";
import { CreateProductFlavorController } from "./controllers/product/CreateProductFlavorController.js";
import { DeleteProductFlavorController } from "./controllers/product/DeleteProductFlavorController.js";
import { CreateProductCrustController } from "./controllers/product/CreateProductCrustController.js";
import { DeleteProductCrustController } from "./controllers/product/DeleteProductCrustController.js";
import { CreateOrderController } from "./controllers/order/CreateOrderController.js";
import { ListOrdersController } from "./controllers/order/ListOrdersController.js";
import { GetOrderDetailController } from "./controllers/order/GetOrderDetailController.js";
import { UpdateOrderStatusController } from "./controllers/order/UpdateOrderStatusController.js";
import { GetLoyaltyPointsController } from "./controllers/loyalty/GetLoyaltyPointsController.js";
import { RegisterCustomerController } from "./controllers/customer/RegisterCustomerController.js";
import { LoginCustomerController } from "./controllers/customer/LoginCustomerController.js";
import { GetCustomerMeController } from "./controllers/customer/GetCustomerMeController.js";
import { ListAddressesController } from "./controllers/customer/ListAddressesController.js";
import { CreateAddressController } from "./controllers/customer/CreateAddressController.js";
import { UpdateAddressController } from "./controllers/customer/UpdateAddressController.js";
import { DeleteAddressController } from "./controllers/customer/DeleteAddressController.js";
import { ListCustomerOrdersController } from "./controllers/customer/ListCustomerOrdersController.js";

import { tenantSchema, getTenantSchema, getStoreMenuSchema, updateMyTenantSchema } from "./schemas/tenantSchema.js";
import { loginSchema } from "./schemas/loginShema.js";
import { createCategorySchema, updateCategorySchema, deleteCategorySchema } from "./schemas/categorySchema.js";
import {
    createProductSchema,
    listProductsSchema,
    updateProductSchema,
    deleteProductSchema,
    createProductVariantSchema,
    createProductFlavorSchema,
    deleteProductFlavorSchema,
    createProductCrustSchema,
    deleteProductCrustSchema
} from "./schemas/productSchema.js";
import {
    createOrderSchema,
    listOrdersSchema,
    getOrderDetailSchema,
    updateOrderStatusSchema
} from "./schemas/orderSchema.js";
import { getLoyaltyPointsSchema } from "./schemas/loyaltySchema.js";
import {
    registerCustomerSchema,
    loginCustomerSchema,
    getCustomerMeSchema,
    listAddressesSchema,
    createAddressSchema,
    updateAddressSchema,
    deleteAddressSchema,
    listCustomerOrdersSchema
} from "./schemas/customerSchema.js";
import { DeleteCategoryController } from "./controllers/category/DeleteCategoryController.js";
import { UpdateCategoryController } from "./controllers/category/UpdateCategoryController.js";

const router = Router();
const upload = multer(uploadConfig);

/* ---------------------------------------------------------------------------
 * Autenticação
 * ------------------------------------------------------------------------ */
router.post("/register", authRateLimiter, validateSchema(tenantSchema), new RegisterTenantController().handle);
router.post("/login", authRateLimiter, validateSchema(loginSchema), new LoginTenantController().handle);

/* ---------------------------------------------------------------------------
 * Painel do lojista — tenantId sempre vem do JWT (req.auth), nunca da request
 * ------------------------------------------------------------------------ */
router.get("/tenant/me", authenticate, requireTenant, new GetMyTenantController().handle);
router.put(
    "/tenant/me",
    authenticate,
    requireTenant,
    authorize("store_owner"),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
        { name: "favicon", maxCount: 1 }
    ]),
    validateSchema(updateMyTenantSchema),
    new UpdateMyTenantController().handle
);

/* ---------------------------------------------------------------------------
 * Rotas públicas da loja (cliente final, sem login) — identificadas pelo slug
 * ------------------------------------------------------------------------ */
router.get("/tenant/:slug", validateSchema(getTenantSchema), new GetTenantController().handle);
router.get("/store/:slug/menu", validateSchema(getStoreMenuSchema), new GetStoreMenuController().handle);
router.post("/store/:slug/orders", publicOrderRateLimiter, optionalAuthenticateCustomer, validateSchema(createOrderSchema), new CreateOrderController().handle);
router.get("/store/:slug/loyalty", validateSchema(getLoyaltyPointsSchema), new GetLoyaltyPointsController().handle);

/* ---------------------------------------------------------------------------
 * Conta do cliente final — login opcional. Convidado continua pedindo sem
 * conta; quem quiser pode se cadastrar e logar para salvar endereço e ver
 * "Meus Pedidos". Tenant sempre resolvido pelo slug da URL.
 * ------------------------------------------------------------------------ */
router.post("/store/:slug/customer/register", authRateLimiter, validateSchema(registerCustomerSchema), new RegisterCustomerController().handle);
router.post("/store/:slug/customer/login", authRateLimiter, validateSchema(loginCustomerSchema), new LoginCustomerController().handle);

router.get("/store/:slug/customer/me", authenticateCustomer, validateSchema(getCustomerMeSchema), new GetCustomerMeController().handle);

router.get("/store/:slug/customer/addresses", authenticateCustomer, validateSchema(listAddressesSchema), new ListAddressesController().handle);
router.post("/store/:slug/customer/addresses", authenticateCustomer, validateSchema(createAddressSchema), new CreateAddressController().handle);
router.put("/store/:slug/customer/addresses/:id", authenticateCustomer, validateSchema(updateAddressSchema), new UpdateAddressController().handle);
router.delete("/store/:slug/customer/addresses/:id", authenticateCustomer, validateSchema(deleteAddressSchema), new DeleteAddressController().handle);

router.get("/store/:slug/customer/orders", authenticateCustomer, validateSchema(listCustomerOrdersSchema), new ListCustomerOrdersController().handle);

/* ---------------------------------------------------------------------------
 * Painel do lojista — tenantId sempre vem do JWT (req.auth), nunca da request
 * ------------------------------------------------------------------------ */
router.post("/categories", authenticate, requireTenant, authorize("store_owner"), validateSchema(createCategorySchema), new CreateCategoryController().handle);
router.get("/categories", authenticate, requireTenant, new ListCategoriesController().handle);
router.put("/categories/:categoryId", authenticate, requireTenant, authorize("store_owner"), validateSchema(updateCategorySchema), new UpdateCategoryController().handle);
router.delete("/categories/:categoryId", authenticate, requireTenant, authorize("store_owner"), validateSchema(deleteCategorySchema), new DeleteCategoryController().handle);

router.post("/products", authenticate, requireTenant, authorize("store_owner"), upload.single("file"), validateSchema(createProductSchema), new CreateProductController().handle);
router.get("/products", authenticate, requireTenant, validateSchema(listProductsSchema), new ListProductsController().handle);
router.put("/products/:id", authenticate, requireTenant, authorize("store_owner"), upload.single("file"), validateSchema(updateProductSchema), new UpdateProductController().handle);
router.delete("/products/:id", authenticate, requireTenant, authorize("store_owner"), validateSchema(deleteProductSchema), new DeleteProductController().handle);
router.post("/products/:id/variants", authenticate, requireTenant, authorize("store_owner"), validateSchema(createProductVariantSchema), new CreateProductVariantController().handle);

router.post("/products/:id/flavors", authenticate, requireTenant, authorize("store_owner"), validateSchema(createProductFlavorSchema), new CreateProductFlavorController().handle);
router.delete("/products/:id/flavors/:flavorId", authenticate, requireTenant, authorize("store_owner"), validateSchema(deleteProductFlavorSchema), new DeleteProductFlavorController().handle);

router.post("/products/:id/crusts", authenticate, requireTenant, authorize("store_owner"), validateSchema(createProductCrustSchema), new CreateProductCrustController().handle);
router.delete("/products/:id/crusts/:crustId", authenticate, requireTenant, authorize("store_owner"), validateSchema(deleteProductCrustSchema), new DeleteProductCrustController().handle);

router.get("/orders", authenticate, requireTenant, validateSchema(listOrdersSchema), new ListOrdersController().handle);
router.get("/orders/:id", authenticate, requireTenant, validateSchema(getOrderDetailSchema), new GetOrderDetailController().handle);
router.patch("/orders/:id/status", authenticate, requireTenant, authorize("store_owner", "store_staff"), validateSchema(updateOrderStatusSchema), new UpdateOrderStatusController().handle);

export { router };
