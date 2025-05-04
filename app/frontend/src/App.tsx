import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/hello");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log(data);
        setMessage(data.message);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to connect to the backend. Is it running?");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Hello Vite + React!</h1>
      
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
          onClick={() => alert("Button clicked!")}
        >
          Click me
        </button>
      </div>
    </div>
  );
}
export default App;