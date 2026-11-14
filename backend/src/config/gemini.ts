// Cliente da API Gemini (Google AI Studio) — https://ai.google.dev/gemini-api/docs
// Adaptado do projeto Mandala Cristais: usa fetch nativo (sem SDK) na Interactions
// API, com saída JSON estruturada, timeout e modelos alternativos de fallback.
// Variáveis: GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODELS (ver .env.example).
// A chave nunca é logada nem devolvida em resposta.

import { AIAssistUnavailableError } from "../errors/ai/AIErrors.js";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
// Imagem de cardápio leva mais tempo que texto curto.
const REQUEST_TIMEOUT_MS = 45_000;

// Modelo principal + alternativos. Quando um modelo está sobrecarregado no Google (503),
// estourou a cota (429) ou não existe/não aceita o formato (404), tentamos o próximo.
function models(): string[] {
    const primary = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const fallbacks = (process.env.GEMINI_FALLBACK_MODELS ?? "gemini-3.5-flash")
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean);
    return [...new Set([primary, ...fallbacks])];
}

type JsonSchema = Record<string, unknown>;

export type GeminiImage = { data: Buffer; mimeType: string };

// Resposta da Interactions API. O texto gerado fica nos passos de saída do modelo;
// aceitamos também os atalhos documentados para não depender de um único formato.
type InteractionResponse = {
    status?: string;
    output_text?: string;
    steps?: { type?: string; content?: { type?: string; text?: string }[] }[];
    outputs?: { type?: string; text?: string }[];
};

function extractText(data: InteractionResponse): string | null {
    if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text;

    const fromSteps = (data.steps ?? [])
        .filter((step) => !step.type || step.type === "model_output")
        .flatMap((step) => step.content ?? [])
        .filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("");
    if (fromSteps.trim()) return fromSteps;

    const fromOutputs = (data.outputs ?? [])
        .filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("");
    return fromOutputs.trim() ? fromOutputs : null;
}

type Attempt =
    | { ok: true; text: string }
    | { ok: false; retryable: boolean; error: AIAssistUnavailableError };

interface CallInput {
    prompt: string;
    schema: JsonSchema;
    systemInstruction?: string | undefined;
    image?: GeminiImage | undefined;
}

// Só texto: `input` continua sendo a string de sempre (mesmo comportamento do Mandala).
// Com imagem: lista de partes (texto + imagem em base64).
function buildInput({ prompt, image }: CallInput) {
    if (!image) return prompt;

    return [
        { type: "text", text: prompt },
        { type: "image", data: image.data.toString("base64"), mime_type: image.mimeType },
    ];
}

async function callModel(model: string, apiKey: string, call: CallInput): Promise<Attempt> {
    let response: Response;
    try {
        response = await fetch(`${BASE_URL}/interactions`, {
            method: "POST",
            headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                input: buildInput(call),
                ...(call.systemInstruction ? { system_instruction: call.systemInstruction } : {}),
                response_format: { type: "text", mime_type: "application/json", schema: call.schema },
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
    } catch (error) {
        console.error(`[gemini] ${model}: falha de rede/timeout:`, error instanceof Error ? error.name : "erro");
        return { ok: false, retryable: true, error: new AIAssistUnavailableError() };
    }

    if (!response.ok) {
        // Só o status vai para o log: o corpo do erro do Google nunca é repassado ao cliente.
        const body = await response.text().catch(() => "");
        console.error(`[gemini] ${model} respondeu ${response.status}: ${body.slice(0, 300).replace(/key=[^\s&"]+/gi, "key=***")}`);

        if (response.status === 503) {
            return {
                ok: false,
                retryable: true,
                error: new AIAssistUnavailableError(
                    "Os modelos de IA do Google estão sobrecarregados agora. Tente de novo em alguns minutos."
                ),
            };
        }
        if (response.status === 429) {
            return {
                ok: false,
                retryable: true,
                error: new AIAssistUnavailableError("O limite de uso da IA foi atingido por agora. Tente de novo mais tarde."),
            };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                ok: false,
                retryable: false,
                error: new AIAssistUnavailableError("A IA não está configurada corretamente. Fale com o suporte."),
            };
        }
        // 400/404: modelo inexistente ou que não aceita imagem/formato — tenta o próximo
        return { ok: false, retryable: response.status === 404 || response.status === 400, error: new AIAssistUnavailableError() };
    }

    const data = (await response.json()) as InteractionResponse;
    if (data.status && data.status !== "completed") {
        console.error(`[gemini] ${model}: interação não concluída (${data.status})`);
        return { ok: false, retryable: true, error: new AIAssistUnavailableError() };
    }

    const text = extractText(data);
    if (!text) {
        console.error(`[gemini] ${model}: resposta sem texto`);
        return {
            ok: false,
            retryable: true,
            error: new AIAssistUnavailableError("A IA não retornou conteúdo. Tente de novo."),
        };
    }
    return { ok: true, text };
}

/**
 * Gera uma resposta em JSON seguindo `schema`. Aceita texto, ou texto + imagem.
 * Devolve o texto JSON cru (quem chama valida). Sem GEMINI_API_KEY o servidor sobe
 * normalmente e só quem usa a IA recebe 503.
 */
async function generateJson(call: CallInput): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new AIAssistUnavailableError("A importação com IA não está configurada neste servidor.");
    }

    let lastError: AIAssistUnavailableError = new AIAssistUnavailableError();
    for (const model of models()) {
        const attempt = await callModel(model, apiKey, call);
        if (attempt.ok) return attempt.text;
        lastError = attempt.error;
        if (!attempt.retryable) break;
        console.warn(`[gemini] ${model} indisponível; tentando o próximo modelo`);
    }
    throw lastError;
}

const gemini = { generateJson, models };

export { gemini };
