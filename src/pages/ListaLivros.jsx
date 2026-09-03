import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get, del } from '../services/api'

export default function ListaLivros() {
  const [livros, setLivros] = useState([])

  useEffect(() => {
    carregar()
  }, [])

  function carregar() {
    get('/livros').then(setLivros)
  }

  function excluir(id) {
    // BUG: nao pede confirmacao antes de excluir
    del(`/livros/${id}`).then(carregar)
  }

  return (
    <div>
      <h1>Livros</h1>
      <table>
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
          {livros.map((livro, index) => (
            // BUG: key usando o indice do array em vez do id do livro
            <tr key={index}>
              <td>{livro.titulo}</td>
              <td>{livro.autor}</td>
              <td>{livro.quantidadeDisponivel}</td>
              <td>{livro.quantidadeTotal}</td>
              <td>
                <Link to={`/livros/${livro.id}/editar`}>Editar</Link>
                {' '}
                <button className="danger" onClick={() => excluir(livro.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
