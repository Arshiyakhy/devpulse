import { useState, useEffect } from 'react'
interface User {
  githubId: number
  username: string
  avatarUrl: string
}
function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/auth/me')
      .then(res=>{
        if(res.ok) return res.json()
        throw new Error('Not logged in')
      })
      .then(data => {
        setUser(data)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  if (!user) return (
    <div>
      <h1>DevPulse</h1>
      <a href="http://localhost:3000/auth/login">Login with GitHub</a>
    </div>
  )

  return (
    <div>
      {<h1>{user.username}</h1>}
      {<img src={user.avatarUrl} alt={user.username} />}
    </div>)
}

export default App