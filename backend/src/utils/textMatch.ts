// Normalização e semelhança de nomes de produto. Usado pela importação de
// cardápio: a comparação com o que já está cadastrado é feita aqui, de forma
// determinística — nunca pela IA.

// minúsculas, sem acentos, sem pontuação, espaços colapsados
// ("X-Bacon!" e "x bacon" viram "x bacon").
export function normalizeName(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
}

// Distância de Levenshtein (duas linhas de memória).
export function levenshtein(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

    for (let i = 1; i <= a.length; i++) {
        const current = [i];
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            current[j] = Math.min(previous[j]! + 1, current[j - 1]! + 1, previous[j - 1]! + cost);
        }
        previous = current;
    }

    return previous[b.length]!;
}

// 1 = iguais, 0 = nada a ver (já com nomes normalizados).
export function similarity(a: string, b: string): number {
    const longest = Math.max(a.length, b.length);
    if (longest === 0) return 1;
    return 1 - levenshtein(a, b) / longest;
}

// Um nome contém o outro como palavras inteiras ("x bacon" em "x bacon duplo").
// Nome muito curto ("x") não conta, senão tudo seria parecido com tudo.
export function containsWholeWords(a: string, b: string): boolean {
    const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
    if (shorter.length < 4) return false;
    return ` ${longer} `.includes(` ${shorter} `);
}

export const SIMILAR_THRESHOLD = 0.85;

// Pontuação de "parecido" entre dois nomes normalizados; 0 se não passa no limiar.
export function similarityScore(a: string, b: string): number {
    const score = similarity(a, b);
    if (score >= SIMILAR_THRESHOLD) return score;
    if (containsWholeWords(a, b)) return Math.max(score, SIMILAR_THRESHOLD);
    return 0;
}
