import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get, post, put } from '../services/api'

export default function FormLivro() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ titulo: '', autor: '', isbn: '', quantidadeTotal: 1 })

  useEffect(() => {
    if (id) {
      get(`/livros/${id}`).then(setForm)
    }
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // BUG: nao valida quantidadeTotal (aceita negativo ou vazio) antes de enviar
    if (id) {
      put(`/livros/${id}`, form).then(() => navigate('/livros'))
    } else {
      post('/livros', form).then(() => navigate('/livros'))
    }
  }

  return (
    <div>
      <h1>{id ? 'Editar Livro' : 'Novo Livro'}</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label>Titulo</label>
          <input name="titulo" value={form.titulo} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Autor</label>
          <input name="autor" value={form.autor} onChange={handleChange} />
        </div>
        <div className="field">
          <label>ISBN</label>
          <input name="isbn" value={form.isbn} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Quantidade total</label>
          <input type="number" name="quantidadeTotal" value={form.quantidadeTotal} onChange={handleChange} />
        </div>
        <button type="submit">Salvar</button>
      </form>
    </div>
  )
}
