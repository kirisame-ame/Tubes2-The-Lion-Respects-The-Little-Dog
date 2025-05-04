import { useEffect, useState } from "react";
import background from "./assets/images/bg.jpg";
function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestButtonClick = async () => {
    try {
      const response = await fetch("/api/hello");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setMessage(data.message);
      setError(null); // Clear any previous error
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to connect to the backend. Is it running?");
    }
  };
  
  const handleButtonJovClick = async () => {
    try {
      const response = await fetch("/api/jovkon");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setMessage(data.message);
      setError(null); // Clear any previous error
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to connect to the backend. Is it running?");
    }
  };
  return (
    <div 
      className="mx-auto p-6 bg-cover bg-center h-screen flex flex-col items-center justify-center" 
      style={{ backgroundImage: `url(${background})` }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Hello Vite + React!</h1>
      
      {message && (
        <div className="my-5 p-4 bg-green-100 rounded-md">
          <p className="font-medium">✅ Backend connection successful!</p>
          <p>Message from server: <strong>{message}</strong></p>
        </div>
      )}
      
      {error && (
        <div className="my-5 p-4 bg-red-100 rounded-md">
          <p className="font-medium">❌ {error}</p>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          onClick={handleTestButtonClick}
        >
          Click me
        </button>
        <button onClick={handleButtonJovClick} className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
          Call Jovkon API

        </button>
      </div>
    </div>
  );
}
export default App;