import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get, post, put } from '../services/api'

export default function FormLivro() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ titulo: '', autor: '', isbn: '', quantidadeTotal: 1 })
  const [quantidadeEmprestada, setQuantidadeEmprestada] = useState(0)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (id) {
      get(`/livros/${id}`).then((livro) => {
        setForm(livro)
        setQuantidadeEmprestada(
          Math.max(0, Number(livro.quantidadeTotal) - Number(livro.quantidadeDisponivel))
        )
      })
    }
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErro('')
  }

  function handleSubmit(e) {
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

    if (id) {
      put(`/livros/${id}`, dadosLivro).then(() => navigate('/livros'))
    } else {
      post('/livros', dadosLivro).then(() => navigate('/livros'))
    }
  }

  return (
    <div>
      <h1>{id ? 'Editar Livro' : 'Novo Livro'}</h1>
      <form className="card" onSubmit={handleSubmit}>
        {erro && <p className="form-error" role="alert">{erro}</p>}
        <div className="field">
          <label>Titulo</label>
          <input name="titulo" value={form.titulo} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Autor</label>
          <input name="autor" value={form.autor} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>ISBN</label>
          <input name="isbn" value={form.isbn} onChange={handleChange} />
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
        <button type="submit">Salvar</button>
      </form>
    </div>
  )
}
