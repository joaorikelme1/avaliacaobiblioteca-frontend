import { useEffect, useState } from 'react'
import { get } from '../services/api'

export default function Dashboard() {
  const [livros, setLivros] = useState([])
  const [emprestimos, setEmprestimos] = useState([])

  useEffect(() => {
    get('/livros').then(setLivros)
    get('/emprestimos').then(setEmprestimos)
  }, [])

  const totalLivros = livros.length
  const disponiveis = livros.reduce((acc, l) => acc + (l.quantidadeDisponivel || 0), 0)
  const ativos = emprestimos.filter(e => e.status === 'ATIVO').length

  return (
    <div>
      <h1>Painel da Biblioteca</h1>
      <div className="grid">
        <div className="card">
          <div>Titulos cadastrados</div>
          <div className="stat">{totalLivros}</div>
        </div>
        <div className="card">
          <div>Exemplares disponiveis</div>
          <div className="stat">{disponiveis}</div>
        </div>
        <div className="card">
          <div>Emprestimos ativos</div>
          <div className="stat">{ativos}</div>
        </div>
      </div>
    </div>
  )
}
