import { useState, useEffect } from "react";
interface User {
  githubId: number;
  username: string;
  avatarUrl: string;
}
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/auth/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => {
        console.log("Got user data:", data);
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Fetch failed:", err);
        setUser(null);
        setLoading(false);
      });
  }, []);
  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:3000/api/repos", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setRepos(data.response));
  }, [user]);
  const handleLogout = async () => {
    await fetch("http://localhost:3000/auth/logout", {
      credentials: "include",
    });
    setUser(null);
  };
  if (loading) return <div>Loading...</div>;

  if (!user)
    return (
      <div>
        <h1>DevPulse</h1>
        <a href="http://localhost:3000/auth/login">Login with GitHub</a>
      </div>
    );

  return (
    <div>
      {<h1>{user.username}</h1>}
      {<img src={user.avatarUrl} alt={user.username} />}
      {<button onClick={handleLogout}>Logout</button>}
      {
        <ul>
          {repos.map((repo) => (
            <li key={repo.id}>{repo.name}</li>
          ))}
        </ul>
      }
    </div>
  );
}

export default App;
