import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import bookCricketLogo from "../assets/book cricket.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3000/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Save user session
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.removeItem("guest");

      navigate("/menu");
    } catch (err) {
      setError("Something went wrong, try again.");
    }
  };


  return (
    <div className="relative h-screen">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://t3.ftcdn.net/jpg/00/77/81/02/360_F_77810263_zgIAUTTlwF0Bl8ZCxHsofgTzXlZXy9Nn.jpg)",
        }}
      ></div>

      <div className="relative flex flex-col items-center h-full">
        <h1 className="text-6xl mt-16 font-bold text-white drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]">
          Book Cricket Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 mt-12 rounded-lg shadow-xl w-80 flex flex-col space-y-4"
        >
          <h2 className="text-2xl font-semibold text-center flex items-center justify-center">
            <LogIn className="mr-2" /> Login
          </h2>

          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-blue-500 text-white font-semibold py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out"
          >
            Login
          </button>
        </form>
      </div>

      <footer className="absolute bottom-0 right-0 p-4">
        <img
          src={bookCricketLogo}
          alt="Book Cricket Logo"
          className="h-12 w-auto"
        />
      </footer>
    </div>
  );
};

export default Login;
