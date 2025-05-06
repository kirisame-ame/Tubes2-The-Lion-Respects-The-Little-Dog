import { useEffect, useState } from "react";
import { useAppContext } from "./hooks/AppContext";
import Spinner from "./components/Spinner";
function App() {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [globalState, setGlobalState] = useAppContext();

    useEffect(() => {
        (async () => {
            try {
                setMessage("Loading Recipes...");
                setGlobalState({
                    ...globalState,
                    isScraping: true,
                });
                const response = await fetch("/api/scrape");
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setMessage(data.message);
                setError(null);
            } catch (error) {
                console.error("Error fetching data:", error);
                setMessage(null);
                setError("Failed to connect to the backend. Is it running?");
            } finally {
                setGlobalState({
                    ...globalState,
                    isScraping: false,
                });
            }
        })();
    }, []);

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
        <div className="mx-auto p-6 bg-cover bg-center bg-xpurple h-screen flex flex-col items-center font-sans">
            <div>
                <h1 className="text-3xl font-bold mb-6 text-center text-xyellow">
                    Little Alchetree!
                </h1>
                <h2 className="text-xl font-semibold mb-4 text-center text-xyellow">
                    Little Alchemy 2 Recipe Finder!
                </h2>
            </div>
            {globalState.isScraping && <Spinner />}
            {message && (
                <div className="my-5 p-4 bg-green-100 rounded-md">
                    <p className="font-medium">
                        ✅ Backend connection successful!
                    </p>
                    <p>
                        Message from server: <strong>{message}</strong>
                    </p>
                </div>
            )}

            {error && (
                <div className="my-5 p-4 bg-red-100 rounded-md">
                    <p className="font-medium">❌ {error}</p>
                </div>
            )}
            <div></div>
            <div className="flex justify-center mt-8">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={handleTestButtonClick}
                >
                    Click me
                </button>
                <button
                    onClick={handleButtonJovClick}
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                    Call Jovkon API
                </button>
            </div>
        </div>
    );
}
export default App;
