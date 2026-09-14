import { useState } from "react";
import axios from "axios";

function Signup() {
  const [name, setName] = useState("Anju");
  const [email, setEmail] = useState("anju@gmail.com");
  const [password, setPassword] = useState("123456");

  const signup = async () => {
    try {
      const res = await axios.post("https://website-vltl.onrender.com/signup", {
        name,
        email,
        password,
      });

      alert(res.data.message);
      console.log(res.data);
    } catch (err) {
      console.log(err);
      alert("Signup failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Create First User</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />

      <br /><br />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <br /><br />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <br /><br />

      <button onClick={signup}>
        Signup
      </button>
    </div>
  );
}

export default Signup;