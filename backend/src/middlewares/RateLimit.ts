import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas tentativas. Tente novamente em alguns minutos." }
});

export const publicOrderRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitos pedidos enviados. Aguarde alguns minutos." }
});

export const storeSearchRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas buscas em pouco tempo. Aguarde um instante." }
});

// Favoritos: cada toque no coração é uma chamada, então o limite é folgado.
export const customerAccountRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas ações em pouco tempo. Aguarde um instante." }
});

// Importação de cardápio com IA: cada chamada custa uma consulta ao Gemini,
// então o limite é por loja (tenant do JWT), não por IP.
export const productImportRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `import:${req.auth?.tenantId ?? "anon"}`,
    validate: { keyGeneratorIpFallback: false },
    message: { error: "Você já importou muitos cardápios nesta hora. Tente novamente mais tarde." }
});
