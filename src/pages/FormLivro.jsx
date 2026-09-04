import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Feedback from '../components/Feedback'
import { get, post, put } from '../services/api'

export default function FormLivro() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ titulo: '', autor: '', isbn: '', quantidadeTotal: 1 })
  const [quantidadeEmprestada, setQuantidadeEmprestada] = useState(0)
  const [erro, setErro] = useState('')
  const [erroCarregamento, setErroCarregamento] = useState('')
  const [carregando, setCarregando] = useState(Boolean(id))
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (id) {
      setCarregando(true)
      setErroCarregamento('')

      get(`/livros/${id}`)
        .then((livro) => {
          setForm(livro)
          setQuantidadeEmprestada(
            Math.max(0, Number(livro.quantidadeTotal) - Number(livro.quantidadeDisponivel))
          )
        })
        .catch((error) => {
          setErroCarregamento(error.message || 'Não foi possível carregar o livro.')
        })
        .finally(() => setCarregando(false))
    }
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErro('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const titulo = String(form.titulo ?? '').trim()
    const autor = String(form.autor ?? '').trim()
    const quantidadeTotal = Number(form.quantidadeTotal)

    if (!titulo || !autor) {
      setErro('Título e autor são obrigatórios.')
      return
    }

    if (form.quantidadeTotal == null || form.quantidadeTotal === '' || !Number.isInteger(quantidadeTotal) || quantidadeTotal < 0) {
      setErro('A quantidade total deve ser um número inteiro maior ou igual a zero.')
      return
    }

    if (quantidadeTotal < quantidadeEmprestada) {
      setErro(`A quantidade total não pode ser menor que ${quantidadeEmprestada}, pois existem exemplares emprestados.`)
      return
    }

    const dadosLivro = {
      ...form,
      titulo,
      autor,
      isbn: String(form.isbn ?? '').trim(),
      quantidadeTotal,
    }

    setErro('')
    setSalvando(true)

    try {
      if (id) {
        await put(`/livros/${id}`, dadosLivro)
      } else {
        await post('/livros', dadosLivro)
      }

      navigate('/livros')
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar o livro.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div>
        <h1>Editar Livro</h1>
        <Feedback type="loading">Carregando dados do livro...</Feedback>
      </div>
    )
  }

  if (erroCarregamento) {
    return (
      <div>
        <h1>Editar Livro</h1>
        <Feedback type="error">{erroCarregamento}</Feedback>
        <button type="button" className="secondary" onClick={() => navigate('/livros')}>Voltar</button>
      </div>
    )
  }

  return (
    <div>
      <h1>{id ? 'Editar Livro' : 'Novo Livro'}</h1>
      <form className="card" onSubmit={handleSubmit} aria-busy={salvando}>
        {erro && <Feedback type="error">{erro}</Feedback>}
        <div className="field">
          <label>Titulo</label>
          <input name="titulo" value={form.titulo ?? ''} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Autor</label>
          <input name="autor" value={form.autor ?? ''} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>ISBN</label>
          <input name="isbn" value={form.isbn ?? ''} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Quantidade total</label>
          <input
            type="number"
            name="quantidadeTotal"
            min={quantidadeEmprestada}
            step="1"
            value={form.quantidadeTotal}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
