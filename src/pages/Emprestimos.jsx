import { useEffect, useState } from 'react'
import Feedback from '../components/Feedback'
import { get, post } from '../services/api'

export default function Emprestimos() {
  const [emprestimos, setEmprestimos] = useState([])
  const [livros, setLivros] = useState([])
  const [form, setForm] = useState({ livroId: '', nomeUsuario: '' })
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [cadastrando, setCadastrando] = useState(false)
  const [devolvendoId, setDevolvendoId] = useState(null)

  useEffect(() => {
    let ativo = true

    Promise.all([get('/emprestimos'), get('/livros')])
      .then(([emprestimosCarregados, livrosCarregados]) => {
        if (ativo) {
          setEmprestimos(emprestimosCarregados)
          setLivros(livrosCarregados)
        }
      })
      .catch((error) => {
        if (ativo) setErro(error.message || 'Não foi possível carregar os empréstimos.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [])

  async function carregar() {
    const emprestimosCarregados = await get('/emprestimos')
    setEmprestimos(emprestimosCarregados)
  }

  async function handleSubmit(e) {
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
    setCadastrando(true)

    try {
      await post('/emprestimos', { livroId, nomeUsuario })
      await carregar()
      setForm({ livroId: '', nomeUsuario: '' })
    } catch (error) {
      setErro(error.message || 'Não foi possível cadastrar o empréstimo.')
    } finally {
      setCadastrando(false)
    }
  }

  async function devolver(id) {
    // aponta pro endpoint de devolucao (que no backend esta como GET, veja o bug la)
    setErro('')
    setDevolvendoId(id)

    try {
      await get(`/emprestimos/${id}/devolver`)
      await carregar()
    } catch (error) {
      setErro(error.message || 'Não foi possível devolver o empréstimo.')
    } finally {
      setDevolvendoId(null)
    }
  }

  return (
    <div>
      <h1>Emprestimos</h1>
      {erro && <Feedback type="error">{erro}</Feedback>}
      <form className="card" onSubmit={handleSubmit} aria-busy={cadastrando}>
        <div className="field">
          <label>Livro</label>
          <select
            value={form.livroId}
            onChange={(e) => {
              setForm({ ...form, livroId: e.target.value })
              setErro('')
            }}
            disabled={carregando || cadastrando || livros.length === 0}
            required
          >
            <option value="">
              {livros.length === 0 && !carregando ? 'Nenhum livro cadastrado' : 'Selecione...'}
            </option>
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
            disabled={cadastrando}
            required
          />
        </div>
        <button type="submit" disabled={carregando || cadastrando || livros.length === 0}>
          {cadastrando ? 'Cadastrando...' : 'Emprestar'}
        </button>
      </form>

      {carregando && <Feedback type="loading">Carregando empréstimos...</Feedback>}
      {!carregando && (!erro || emprestimos.length > 0) && <table>
        <thead>
          <tr><th>Livro</th><th>Usuario</th><th>Status</th><th>Previsao</th><th>Acoes</th></tr>
        </thead>
        <tbody>
          {emprestimos.length === 0 ? (
            <tr className="empty-row">
              <td colSpan="5">Nenhum empréstimo cadastrado.</td>
            </tr>
          ) : emprestimos.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.livroId}</td>
              <td>{emp.nomeUsuario}</td>
              <td>{emp.status}</td>
              <td>{emp.dataDevolucaoPrevista}</td>
              <td>
                {emp.status === 'ATIVO' && (
                  <button
                    onClick={() => devolver(emp.id)}
                    disabled={devolvendoId !== null}
                  >
                    {devolvendoId === emp.id ? 'Devolvendo...' : 'Devolver'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      }
    </div>
  )
}
