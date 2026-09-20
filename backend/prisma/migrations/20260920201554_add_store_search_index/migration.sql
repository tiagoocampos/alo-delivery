-- Busca de loja por nome (GET /stores/search): precisa comparar nomes
-- ignorando maiúsculas/minúsculas e acentos (ex: "emporio" encontra "Empório").
--
-- unaccent() do Postgres é STABLE, não IMMUTABLE (depende de configuração de
-- locale), então não pode ser usada direto num índice funcional. A wrapper
-- abaixo fixa o dicionário "unaccent" explicitamente, o que a torna segura
-- pra marcar como IMMUTABLE.
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS
$$
    SELECT public.unaccent('public.unaccent'::regdictionary, $1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

-- Índice GIN trigram sobre o nome normalizado (minúsculo + sem acento) —
-- acelera tanto "começa com" quanto "contém" na mesma expressão usada pela
-- query de busca, sem exigir full table scan conforme a base de tenants cresce.
CREATE INDEX tenants_name_search_trgm_idx ON tenants USING gin (immutable_unaccent(lower(name)) gin_trgm_ops);
