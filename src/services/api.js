const BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function lerResposta(response) {
  const texto = await response.text()

  if (!texto) {
    return null
  }

  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

function obterMensagemErro(data, status) {
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  const errosValidacao = Array.isArray(data?.errors)
    ? data.errors
        .map((erro) => erro.defaultMessage || erro.message)
        .filter(Boolean)
    : []

  if (errosValidacao.length > 0) {
    return errosValidacao.join(' ')
  }

  return data?.detail
    || data?.message
    || data?.error
    || `A API retornou um erro (${status}).`
}

async function request(path, options = {}) {
  let response

  try {
    response = await fetch(`${BASE_URL}${path}`, options)
  } catch (cause) {
    const erro = new ApiError('Não foi possível conectar à API.', 0, null)
    erro.cause = cause
    throw erro
  }

  const data = await lerResposta(response)

  if (!response.ok) {
    throw new ApiError(obterMensagemErro(data, response.status), response.status, data)
  }

  return data
}

export function get(path) {
  return request(path)
}

export function post(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function put(path, body) {
  return request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export function del(path) {
  return request(path, { method: 'DELETE' })
}
