import { handleResponseError, handleSuccessToast, resolveRequestError } from '../utils/toast';
import { RequestConfig, RequestInteractionConfigType, RequestParamsType } from '../utils/http-types';
import { encodeQueryString } from '../utils/util';

export default function RestClient() {
  function getRequestPath(path: string, reqParams?: RequestParamsType) {
    let url = process.env.NEXT_PUBLIC_API_URL.concat(path);

    if (reqParams?.query) {
      url = url.concat(encodeQueryString(reqParams.query));
    }

    return url;
  }

  function createRequestHeaders(reqParams: RequestParamsType) {
    const requestHeaders = new Headers();

    if (reqParams.headers) {
      for (const [key, value] of reqParams.headers) {
        requestHeaders.set(key, value);
      }
    }

    if (reqParams.token) {
      requestHeaders.set('Authorization', 'Bearer '.concat(reqParams.token));
    }

    return requestHeaders;
  }

  function createRequest(method: string, requestHeaders: Headers, json?: string | FormData) {
    if (json) {
      if (typeof json === 'string') {
        requestHeaders.set('Content-Type', 'application/json');
      }

      return { headers: requestHeaders, body: json, method };
    }

    return { headers: requestHeaders, method };
  }

  function requestInitGET(reqParams: RequestParamsType) {
    return createRequest('GET', createRequestHeaders(reqParams));
  }

  function requestInitPOST(reqParams: RequestParamsType) {
    return createRequest('POST', createRequestHeaders(reqParams), reqParams.json);
  }

  function requestInitPUT(reqParams: RequestParamsType) {
    return createRequest('PUT', createRequestHeaders(reqParams), reqParams.json);
  }

  function requestInitPATCH(reqParams: RequestParamsType) {
    return createRequest('PATCH', createRequestHeaders(reqParams), reqParams.json);
  }

  function requestInitDELETE(reqParams: RequestParamsType) {
    return createRequest('DELETE', createRequestHeaders(reqParams));
  }

  function fetchData(url: RequestInfo, reqInit?: RequestInit, reqIntConfig?: RequestInteractionConfigType) {
    return fetch(url, reqInit)
      .then((res) => {
        if (res.ok) {
          if (reqIntConfig?.toastifySuccessMsg) {
            handleSuccessToast(reqIntConfig.toastifySuccessMsg, reqIntConfig.toastify);
          }

          if (res.status === 204 || res.status === 201) {
            return;
          }

          return res.json();
        }

        return handleResponseError(res, reqIntConfig);
      })
      .catch((err) => resolveRequestError(err, reqIntConfig));
  }

  function get(url: string, reqConfig: RequestConfig) {
    return fetchData(getRequestPath(url, reqConfig.reqParams), requestInitGET(reqConfig.reqParams), reqConfig.reqInitConfig);
  }

  function post(url: string, reqConfig: RequestConfig) {
    return fetchData(getRequestPath(url, reqConfig.reqParams), requestInitPOST(reqConfig.reqParams), reqConfig.reqInitConfig);
  }

  function put(url: string, reqConfig: RequestConfig) {
    return fetchData(getRequestPath(url, reqConfig.reqParams), requestInitPUT(reqConfig.reqParams), reqConfig.reqInitConfig);
  }

  function patch(url: string, reqConfig: RequestConfig) {
    return fetchData(getRequestPath(url, reqConfig.reqParams), requestInitPATCH(reqConfig.reqParams), reqConfig.reqInitConfig);
  }

  function reqDelete(url: string, reqConfig: RequestConfig) {
    return fetchData(getRequestPath(url, reqConfig.reqParams), requestInitDELETE(reqConfig.reqParams), reqConfig.reqInitConfig);
  }

  return { get, post, put, patch, reqDelete };
}
