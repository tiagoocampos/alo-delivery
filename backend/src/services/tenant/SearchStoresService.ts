import prismaClient from "../../prisma/index.js";

interface SearchStoresServiceProps {
    q: string;
}

interface StoreSearchResult {
    name: string;
    slug: string;
}

const RESULT_LIMIT = 8;

// Busca pública de loja por nome, pra quem chega no storefront sem slug.
// Ignora maiúsculas/minúsculas e acentos (imutable_unaccent, criado na
// migration add_store_search_index) e prioriza nomes que começam com o termo
// digitado antes dos que só contêm o termo em outro lugar do nome.
// Devolve só { name, slug } — nunca telefone, e-mail, chave Pix etc.
class SearchStoresService {
    async execute({ q }: SearchStoresServiceProps): Promise<StoreSearchResult[]> {
        const term = q.trim();

        if (!term) {
            return [];
        }

        const results = await prismaClient.$queryRaw<StoreSearchResult[]>`
            SELECT t.name, t.slug
            FROM tenants t
            LEFT JOIN subscriptions s ON s.tenant_id = t.id
            WHERE t.is_active = true
              AND (s.status IS NULL OR s.status != 'canceled')
              AND immutable_unaccent(lower(t.name)) LIKE '%' || immutable_unaccent(lower(${term})) || '%'
            ORDER BY
              (immutable_unaccent(lower(t.name)) LIKE immutable_unaccent(lower(${term})) || '%') DESC,
              t.name ASC
            LIMIT ${RESULT_LIMIT}
        `;

        return results;
    }
}

export { SearchStoresService };
