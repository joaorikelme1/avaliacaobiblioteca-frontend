import { useEffect, useState } from 'react'
import { get, post } from '../services/api'

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([])
  const [livros, setLivros] = useState([])
  const [form, setForm] = useState({ livroId: '', nomeUsuario: '' })

  useEffect(() => {
    carregar()
    get('/livros').then(setLivros)
  }, [])

  function carregar() {
    get('/emprestimos').then(setEmprestimos)
  }

  function handleSubmit(e) {
    e.preventDefault()
    post('/emprestimos', form)
    // BUG: nao espera a resposta (sem then/await) antes de recarregar a lista,
    // entao o emprestimo recem-criado pode nao aparecer ainda
    carregar()
  }

  function devolver(id) {
    // aponta pro endpoint de devolucao (que no backend esta como GET, veja o bug la)
    fetch(`http://localhost:3000/api/emprestimos/${id}/devolver`).then(carregar)
  }

  return (
    <div>
      <h1>Emprestimos</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field">
          <label>Livro</label>
          <select
            value={form.livroId}
            onChange={(e) => setForm({ ...form, livroId: e.target.value })}
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
            onChange={(e) => setForm({ ...form, nomeUsuario: e.target.value })}
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
