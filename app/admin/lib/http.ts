// Cliente HTTP do painel: monta a URL, envia JSON e padroniza os erros da API.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiError {
  status: number; // 0 quando a API nem respondeu
  message: string;
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'message' in err;
}

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
}

export async function http<T>(path: string, { method = 'GET', query, body }: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw { status: 0, message: 'NEXT_PUBLIC_API_URL não configurada no .env.local' } satisfies ApiError;
  }

  const url = new URL(path, BASE_URL);
  // Filtro vazio não vai para a URL: a API entende ausência como "sem filtro".
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch só falha assim quando não há resposta (API fora do ar, CORS, rede).
    throw { status: 0, message: 'Não foi possível conectar à API. Verifique se o back-end está rodando.' } satisfies ApiError;
  }

  if (!response.ok) {
    // A API devolve { "message": "..." } nos erros 400 e 404.
    const message = await response
      .json()
      .then((data: { message?: string }) => data?.message)
      .catch(() => undefined);
    throw { status: response.status, message: message ?? `Erro ${response.status} na API` } satisfies ApiError;
  }

  // 204 No Content (ex.: desativar produtor) não tem corpo.
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Mensagem amigável para exibir em toast, com um texto padrão para erros inesperados.
export function errorMessage(err: unknown, fallback: string): string {
  return isApiError(err) ? err.message : fallback;
}