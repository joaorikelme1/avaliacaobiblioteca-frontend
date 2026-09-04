import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { ApiError, del, get } from './api.js'

const fetchOriginal = globalThis.fetch

afterEach(() => {
  globalThis.fetch = fetchOriginal
})

test('retorna os dados quando a API responde com sucesso', async () => {
  globalThis.fetch = async () => new Response(
    JSON.stringify([{ id: 1, titulo: 'Livro' }]),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )

  const livros = await get('/livros')

  assert.deepEqual(livros, [{ id: 1, titulo: 'Livro' }])
})

test('lança ApiError com a mensagem e o status retornados pela API', async () => {
  globalThis.fetch = async () => new Response(
    JSON.stringify({ detail: 'Não há exemplares disponíveis' }),
    {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    }
  )

  await assert.rejects(
    get('/livros/1'),
    (error) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.status, 409)
      assert.equal(error.message, 'Não há exemplares disponíveis')
      return true
    }
  )
})

test('informa quando não é possível conectar à API', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('fetch failed')
  }

  await assert.rejects(
    get('/livros'),
    (error) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.status, 0)
      assert.equal(error.message, 'Não foi possível conectar à API.')
      return true
    }
  )
})

test('aceita resposta de sucesso sem conteúdo', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 })

  const resultado = await del('/livros/1')

  assert.equal(resultado, null)
})
