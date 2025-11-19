import React, { useState } from "react";
import { registerUser, loginUser } from "./api";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const action = isLogin ? loginUser : registerUser;
    const res = await action(form);
    setMessage(JSON.stringify(res));
  };

  return (
    <div style={{ margin: "40px auto", width: "300px" }}>
      <h2>{isLogin ? "Login" : "Register"}</h2>

      <input
        name="username"
        placeholder="Username"
        onChange={handleChange}
        style={{ display: "block", width: "100%", marginBottom: "10px" }}
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
        style={{ display: "block", width: "100%", marginBottom: "10px" }}
      />

      <button onClick={handleSubmit} style={{ width: "100%", height: "40px" }}>
        {isLogin ? "Login" : "Register"}
      </button>

      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ marginTop: "10px", width: "100%" }}
      >
        Switch to {isLogin ? "Register" : "Login"}
      </button>

      <div style={{ marginTop: "20px" }}>{message}</div>
    </div>
  );
}

export default App;
