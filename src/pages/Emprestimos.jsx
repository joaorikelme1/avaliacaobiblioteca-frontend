import { useEffect, useState } from 'react'
import { get, post } from '../services/api'

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([])
  const [livros, setLivros] = useState([])
  const [form, setForm] = useState({ livroId: '', nomeUsuario: '' })
  const [erro, setErro] = useState('')

  useEffect(() => {
    carregar()
    get('/livros').then(setLivros)
  }, [])

  function carregar() {
    get('/emprestimos').then(setEmprestimos)
  }

  function handleSubmit(e) {
    e.preventDefault()

    const livroId = Number(form.livroId)
    const nomeUsuario = String(form.nomeUsuario ?? '').trim()

    if (!Number.isInteger(livroId) || livroId <= 0) {
      setErro('Selecione um livro.')
      return
    }

    if (!nomeUsuario) {
      setErro('Informe o nome do usuário.')
      return
    }

    setErro('')
    post('/emprestimos', { livroId, nomeUsuario })
    // BUG: nao espera a resposta (sem then/await) antes de recarregar a lista,
    // entao o emprestimo recem-criado pode nao aparecer ainda
    carregar()
  }

  function devolver(id) {
    // aponta pro endpoint de devolucao (que no backend esta como GET, veja o bug la)
    get(`/emprestimos/${id}/devolver`).then(carregar)
  }

  return (
    <div>
      <h1>Emprestimos</h1>
      <form className="card" onSubmit={handleSubmit}>
        {erro && <p className="form-error" role="alert">{erro}</p>}
        <div className="field">
          <label>Livro</label>
          <select
            value={form.livroId}
            onChange={(e) => {
              setForm({ ...form, livroId: e.target.value })
              setErro('')
            }}
            required
          >
            <option value="">Selecione...</option>
            {livros.map((l) => (
              <option key={l.id} value={l.id}>{l.titulo}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Nome do usuario</label>
          <input
            value={form.nomeUsuario}
            onChange={(e) => {
              setForm({ ...form, nomeUsuario: e.target.value })
              setErro('')
            }}
            required
          />
        </div>
        <button type="submit">Emprestar</button>
      </form>

      <table>
        <thead>
          <tr><th>Livro</th><th>Usuario</th><th>Status</th><th>Previsao</th><th>Acoes</th></tr>
        </thead>
        <tbody>
          {emprestimos.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.livroId}</td>
              <td>{emp.nomeUsuario}</td>
              <td>{emp.status}</td>
              <td>{emp.dataDevolucaoPrevista}</td>
              <td>
                {emp.status === 'ATIVO' && (
                  <button onClick={() => devolver(emp.id)}>Devolver</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
