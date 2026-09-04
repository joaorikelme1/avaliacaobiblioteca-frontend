import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Feedback from '../components/Feedback'
import { get, del } from '../services/api'

export default function ListaLivros() {
  const [livros, setLivros] = useState([])
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [excluindoId, setExcluindoId] = useState(null)

  useEffect(() => {
    carregar().catch((error) => {
      setErro(error.message || 'Não foi possível carregar os livros.')
    })
  }, [])

  async function carregar() {
    setCarregando(true)

    try {
      const livrosCarregados = await get('/livros')
      setLivros(livrosCarregados)
    } finally {
      setCarregando(false)
    }
  }

  async function excluir(id) {
    // BUG: nao pede confirmacao antes de excluir
    setErro('')
    setExcluindoId(id)

    try {
      await del(`/livros/${id}`)
      await carregar()
    } catch (error) {
      setErro(error.message || 'Não foi possível excluir o livro.')
    } finally {
      setExcluindoId(null)
    }
  }

  return (
    <div>
      <h1>Livros</h1>
      {erro && <Feedback type="error">{erro}</Feedback>}
      {carregando && <Feedback type="loading">Carregando livros...</Feedback>}
      {!carregando && (!erro || livros.length > 0) && <table>
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Autor</th>
            <th>Disponiveis</th>
            <th>Total</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {livros.length === 0 ? (
            <tr className="empty-row">
              <td colSpan="5">Nenhum livro cadastrado.</td>
            </tr>
          ) : livros.map((livro) => (
            <tr key={livro.id}>
              <td>{livro.titulo}</td>
              <td>{livro.autor}</td>
              <td>{livro.quantidadeDisponivel}</td>
              <td>{livro.quantidadeTotal}</td>
              <td>
                <Link to={`/livros/${livro.id}/editar`}>Editar</Link>
                {' '}
                <button
                  className="danger"
                  onClick={() => excluir(livro.id)}
                  disabled={excluindoId !== null}
                >
                  {excluindoId === livro.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      }
    </div>
  )
}
