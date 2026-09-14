// A loja opera no horário de Brasília (UTC-3 fixo, sem horário de verão desde
// 2019) — mas o servidor pode rodar em qualquer fuso (ex: UTC em produção).
// Toda fronteira de dia/mês usada pra filtrar ou agrupar pedidos por data
// precisa ser calculada com o fuso do Brasil embutido explicitamente, nunca
// depender do fuso local do processo.

const BRAZIL_OFFSET = "-03:00";
const BRAZIL_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Intervalo UTC exato correspondente a um dia civil em Brasília. dateStr no
// formato "YYYY-MM-DD"; sem argumento, usa o dia de hoje em Brasília.
export function getDayRange(dateStr?: string): { start: Date; end: Date } {
    const day = dateStr ?? formatDateOnly(new Date());
    return {
        start: new Date(`${day}T00:00:00${BRAZIL_OFFSET}`),
        end: new Date(`${day}T23:59:59.999${BRAZIL_OFFSET}`)
    };
}

// Converte um instante (ex: createdAt, sempre UTC) pro dia civil
// correspondente em Brasília — não pro dia UTC.
export function formatDateOnly(date: Date): string {
    const shifted = new Date(date.getTime() - BRAZIL_OFFSET_MS);
    const year = shifted.getUTCFullYear();
    const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
    const day = String(shifted.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Desloca um dia civil (Brasília) por um número de dias, positivo ou
// negativo — sempre exato, porque o fuso do Brasil não tem horário de verão.
export function shiftDateKey(dateStr: string, days: number): string {
    const shifted = new Date(new Date(`${dateStr}T00:00:00${BRAZIL_OFFSET}`).getTime() + days * DAY_MS);
    return formatDateOnly(shifted);
}

function normalizeYearMonth(year: number, month: number): { year: number; month: number } {
    const normalizedYear = year + Math.floor((month - 1) / 12);
    const normalizedMonth = ((((month - 1) % 12) + 12) % 12) + 1;
    return { year: normalizedYear, month: normalizedMonth };
}

// "YYYY-MM" do mês `monthsAgo` meses antes do mês civil (Brasília) de
// `reference`. monthsAgo: 0 = mês atual, 1 = mês anterior, etc.
export function getMonthKey(monthsAgo: number, reference: Date = new Date()): string {
    const [refYear, refMonth] = formatDateOnly(reference).split("-").map(Number);
    const { year, month } = normalizeYearMonth(refYear!, refMonth! - monthsAgo);
    return `${year}-${String(month).padStart(2, "0")}`;
}

// Intervalo UTC exato correspondente a um mês civil em Brasília, a partir de
// "YYYY-MM" (ex: filtro vindo de query param).
export function getMonthRangeFromString(value: string): { start: Date; end: Date } {
    const [year, month] = value.split("-").map(Number);
    const { year: y, month: m } = normalizeYearMonth(year!, month!);

    const start = new Date(`${y}-${String(m).padStart(2, "0")}-01T00:00:00${BRAZIL_OFFSET}`);
    const nextYear = m === 12 ? y + 1 : y;
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextMonthStart = new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00${BRAZIL_OFFSET}`);
    const end = new Date(nextMonthStart.getTime() - 1);

    return { start, end };
}

// monthsAgo: 0 = mês atual, 1 = mês anterior, etc. — "mês atual" é o mês
// civil em Brasília no momento em que a função roda, não em UTC.
export function getMonthRange(monthsAgo: number, reference: Date = new Date()): { start: Date; end: Date } {
    return getMonthRangeFromString(getMonthKey(monthsAgo, reference));
}

export function formatMonthOnly(date: Date): string {
    const shifted = new Date(date.getTime() - BRAZIL_OFFSET_MS);
    const year = shifted.getUTCFullYear();
    const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}
