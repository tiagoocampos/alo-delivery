export const MAX_INGREDIENTS = 30;
export const MAX_INGREDIENT_LENGTH = 40;

export type IngredientsResult =
    | { ok: true; value: string[] }
    | { ok: false; message: string };

// Chave de comparação: sem maiúsculas/minúsculas e sem acentos
// ("Tomate" = "tomate", "Pão" = "pao").
function comparisonKey(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
}

// Valida e normaliza a lista de ingredientes. O corpo de criar/editar produto é
// multipart/form-data, então o valor chega como TEXTO JSON (ex: '["Pão","Alface"]').
export function parseIngredients(raw: string): IngredientsResult {
    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        return { ok: false, message: "Ingredientes inválidos: envie uma lista em JSON, ex: [\"Pão\",\"Alface\"]" };
    }

    if (!Array.isArray(parsed)) {
        return { ok: false, message: "Ingredientes inválidos: envie uma lista de textos" };
    }

    if (parsed.length > MAX_INGREDIENTS) {
        return { ok: false, message: `Informe no máximo ${MAX_INGREDIENTS} ingredientes` };
    }

    const seen = new Set<string>();
    const value: string[] = [];

    for (const item of parsed) {
        if (typeof item !== "string") {
            return { ok: false, message: "Ingredientes inválidos: cada item deve ser um texto" };
        }

        const trimmed = item.trim();

        if (trimmed.length === 0) {
            return { ok: false, message: "Ingredientes inválidos: há um item vazio" };
        }

        if (trimmed.length > MAX_INGREDIENT_LENGTH) {
            return { ok: false, message: `Cada ingrediente deve ter no máximo ${MAX_INGREDIENT_LENGTH} caracteres` };
        }

        const key = comparisonKey(trimmed);

        // Duplicado: fica a primeira grafia.
        if (!seen.has(key)) {
            seen.add(key);
            value.push(trimmed);
        }
    }

    return { ok: true, value };
}

// Usado pelos controllers de criar/editar produto, depois do Zod já ter validado.
// undefined = campo não enviado.
export function readIngredientsField(raw: unknown): string[] | undefined {
    if (typeof raw !== "string") return undefined;

    const result = parseIngredients(raw);

    return result.ok ? result.value : undefined;
}

export type DescriptionExtraction =
    | { ok: true; ingredients: string[] }
    | { ok: false; reason: string };

// Usado só pelo script de preenchimento: tenta ler a descrição de um produto
// como lista de ingredientes ("Pão, hambúrguer, ketchup e mostarda"). Na dúvida,
// recusa — melhor deixar o produto vazio do que gravar lixo.
export function extractIngredientsFromDescription(description: string): DescriptionExtraction {
    // Ponto final da frase não faz parte do último ingrediente.
    const text = description.trim().replace(/[.\s]+$/, "");

    if (!text.includes(",")) {
        return { ok: false, reason: "sem vírgulas" };
    }

    // Mais de uma frase ("Lanche artesanal. Feito na hora, com carinho") não é lista.
    if (/\.\s+\S/.test(text)) {
        return { ok: false, reason: "parece um texto com mais de uma frase" };
    }

    const parts = text.split(",").map((part) => part.trim());

    // O último trecho pode trazer o "e" da enumeração: "ketchup e mostarda".
    const last = parts[parts.length - 1] ?? "";
    const andIndex = last.toLowerCase().lastIndexOf(" e ");

    if (andIndex > 0) {
        parts[parts.length - 1] = last.slice(0, andIndex).trim();
        parts.push(last.slice(andIndex + 3).trim());
    }

    const items = parts
        .filter((part) => part.length > 0)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

    if (items.length > MAX_INGREDIENTS) {
        return { ok: false, reason: `mais de ${MAX_INGREDIENTS} itens` };
    }

    const tooLong = items.find((item) => item.length > MAX_INGREDIENT_LENGTH);
    if (tooLong) {
        return { ok: false, reason: `item com mais de ${MAX_INGREDIENT_LENGTH} caracteres ("${tooLong.slice(0, 30)}…")` };
    }

    // Passa pela mesma normalização do cadastro (remove duplicados, etc.).
    const normalized = parseIngredients(JSON.stringify(items));

    if (!normalized.ok || normalized.value.length === 0) {
        return { ok: false, reason: "nenhum ingrediente válido" };
    }

    return { ok: true, ingredients: normalized.value };
}
