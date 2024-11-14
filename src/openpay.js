import { Base64 } from "js-base64";
import snakeize from "snakeize";
import Constants from "expo-constants";

const SANDBOX_URL = "https://sandbox-api.openpay.mx";
const PROD_URL = "https://api.openpay.mx";
const API_VERSION = "/v1/";

let merchantId = "";
let secretKey = "";
let apiUrl = "";
let isSandbox = true;
let headers = null;

const KNOWN_ERRORS = {
  2005: {
    data: {
      http_code: 422,
      error_code: 2005,
      category: "request",
      description: "The expiration date has already passed",
    },
    message: "Request error",
    status: 422,
  },
  2004: {
    data: {
      http_code: 422,
      error_code: 2004,
      category: "request",
      description: "The card number verification digit is invalid",
    },
    message: "Request error",
    status: 422,
  },
  1001: [
    {
      data: {
        http_code: 400,
        error_code: 1001,
        category: "request",
        description: "cvv2 length must be 3 digits",
      },
      message: "Request error",
      status: 400,
    },
    {
      data: {
        http_code: 400,
        error_code: 1001,
        category: "request",
        description: "cvv2 length must be 4 digits",
      },
      message: "Request error",
      status: 400,
    },
  ],
};

const request = (url, method, body) =>
  fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  }).then((response) => response.json());

export function configOpenPay(
  _merchantId,
  _secretKey,
  config = { isSandbox: true }
) {
  isSandbox = Boolean(config.isSandbox);
  merchantId = _merchantId;
  secretKey = _secretKey;
  headers = {
    Authorization: `Basic ${Base64.encode(`${secretKey}:`)}`,
    "Content-Type": "application/json",
  };
  apiUrl = `${(isSandbox ? SANDBOX_URL : PROD_URL) + API_VERSION + merchantId}`;
}

export function createToken(cardData) {
  const body = snakeize(cardData);
  return request(`${apiUrl}/tokens`, "POST", body);
}

export function createDeviceSessionId() {
  return Constants.sessionId.replace(/-/g, "");
}

export function handleOpenPayError(error) {
  let errorCode;
  if (typeof error === "string") {
    errorCode = error;
  } else {
    errorCode = error && error.data && String(error.data.error_code);
  }

  if (Object.keys(KNOWN_ERRORS).includes(errorCode)) {
    return true;
  }
  return false;
}
