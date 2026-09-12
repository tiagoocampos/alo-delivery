// Datas de "dia" (YYYY-MM-DD) são sempre interpretadas no horário local do
// servidor, sem conversão de fuso — mesmo princípio já usado em businessHours.

export function parseDateOnly(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year!, month! - 1, day!);
}

export function getDayRange(dateStr?: string): { start: Date; end: Date } {
    const base = dateStr ? parseDateOnly(dateStr) : new Date();
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
    const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999);
    return { start, end };
}

export function formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// monthsAgo: 0 = mês atual, 1 = mês anterior, etc.
export function getMonthRange(monthsAgo: number, reference: Date = new Date()): { start: Date; end: Date } {
    const year = reference.getFullYear();
    const month = reference.getMonth() - monthsAgo;
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999); // dia 0 do mês seguinte = último dia deste mês
    return { start, end };
}
