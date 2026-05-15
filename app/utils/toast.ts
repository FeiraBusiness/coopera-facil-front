import { Id, toast, UpdateOptions } from 'react-toastify';
import { RequestInteractionConfigType } from './http-types';

export class HttpError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'HttpError';
  }
}

export function getToastError(msg: string): UpdateOptions {
  return { render: msg, type: 'error', isLoading: false, autoClose: 5000, closeButton: true };
}

export function getToastWarn(msg: string): UpdateOptions {
  return { render: msg, type: 'warning', isLoading: false, autoClose: 5000, closeButton: true };
}

export function getToastSuccess(msg: string): UpdateOptions {
  return { render: msg, type: 'success', isLoading: false, autoClose: 5000, closeButton: true };
}

export function handleWarnToast(warnPhrase: string, toastId?: Id) {
  const message = warnPhrase?.includes('Error:') ? warnPhrase.replace('Error:', '') : warnPhrase;

  if (toastId) {
    toast.update(toastId, getToastWarn(message));
  } else {
    toast.warn(message);
  }
}

export function handleErrorToast(errorPhrase: string, toastId?: Id) {
  const message = errorPhrase?.includes('Error:') ? errorPhrase.replace('Error:', '') : errorPhrase;

  if (toastId) {
    toast.update(toastId, getToastError(message));
  } else {
    toast.error(message);
  }
}

export function handleSuccessToast(successPhrase: string, toastId?: Id) {
  if (toastId) {
    toast.update(toastId, getToastSuccess(successPhrase));
  } else {
    toast.success(successPhrase);
  }
}

export async function handleResponseError(res: Response, reqIntConfig?: RequestInteractionConfigType) {
  let error = 'Erro desconhecido';

  const bodyText = await res.text().catch(() => '');
  let bodyJson: Record<string, unknown> | null = null;

  try {
    bodyJson = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    bodyJson = null;
  }

  if (res.status === 403) {
    error = (bodyJson?.error as string) ?? 'Acesso negado ao realizar operação.';
  }

  if (res.status === 401 && res.url.includes('token')) {
    error = 'Credenciais informadas inválidas tente novamente.';
  }

  if (res.status === 403 || res.status === 401) {
    if (reqIntConfig?.toastError) {
      handleWarnToast(error, reqIntConfig.toastify);
    }

    if (reqIntConfig?.throws) {
      throw new HttpError(error, res.status);
    }

    return;
  }

  const errMsg = (bodyJson?.error as string) ?? 'Erro desconhecido ao realizar operação.';

  handleException(reqIntConfig, errMsg);
}

function handleException(reqIntConfig?: RequestInteractionConfigType, err?: string) {
  const message = err ?? 'Erro desconhecido ao realizar operação.';

  if (reqIntConfig?.toastError) {
    handleErrorToast(message, reqIntConfig.toastify);
  }

  if (reqIntConfig?.throws) {
    throw new Error(message);
  }
}

export function resolveRequestError(err: unknown, reqIntConfig?: RequestInteractionConfigType) {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    const error = 'Serviços indisponíveis!';

    if (reqIntConfig?.toastError) {
      handleErrorToast(error, reqIntConfig.toastify);
    }

    if (reqIntConfig?.throws) {
      throw new Error(error);
    }

    return;
  }

  if (err instanceof HttpError && err.statusCode === 403) {
    handleWarnToast(err.message, reqIntConfig?.toastify);

    if (reqIntConfig?.throws) {
      throw err;
    }

    return;
  }

  const error = (err instanceof Error ? err.message : undefined) ?? 'Erro desconhecido ao realizar operação.';

  if (reqIntConfig?.toastError) {
    handleErrorToast(error, reqIntConfig.toastify);
  }

  if (reqIntConfig?.throws) {
    throw new Error(error);
  }
}
