import { useEffect, useState } from "react";
import { useAppContext } from "./hooks/AppContext";
import Spinner from "./components/Spinner";
import { ComboBox } from "./components/ComboBox";
import CustomSwitch from "./components/CustomSwitch";

import CustomImage from "./components/CustomImage";
import bfsImage from "/src/assets/images/bfs.png";
import dfsImage from "/src/assets/images/dfs.png";
import upArrowImage from "/src/assets/images/up_arrow.png";
import bidirecImage from "/src/assets/images/bidirectional.png";
interface Entry {
    category: string;
    element: string;
    recipes: string[];
    imageUrl: string;
}
function App() {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [globalState, setGlobalState] = useAppContext();

    // Load recipes on component mount i.e. Page's First Render
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
                try {
                    const response = await fetch("/api/entries");
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    const data = await response.json();
                    let parsedEntries: Entry[] = [];
                    for (let i = 0; i < data.entries.length; i++) {
                        const entry: Entry = {
                            category: data.entries[i].Category,
                            element: data.entries[i].Element,
                            recipes: data.entries[i].Recipes,
                            imageUrl: data.entries[i].ImageUrl,
                        };
                        parsedEntries.push(entry);
                    }
                    setGlobalState({
                        ...globalState,
                        recipes: parsedEntries,
                        isScraping: false,
                    });
                    setError(null);
                } catch (error) {
                    setError("Failed parsing recipes" + error);
                }
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
            setError(null);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to connect to the backend. Is it running?");
        }
    };

    const handleSearchButtonClick = async () => {
        try {
            const response = await fetch(
                "/api/search?target=" +
                    globalState.target +
                    "&traversal=" +
                    globalState.traversal +
                    "&direction=" +
                    globalState.direction +
                    "&isMulti=" +
                    globalState.isMultiSearch +
                    "&num=" +
                    globalState.searchNumber,
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setMessage(data.results[0]["Category"]);
            setError(null);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to connect to the backend. Is it running?");
        }
    };
    const handleSearchNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setGlobalState({
            ...globalState,
            searchNumber: parseInt(e.target.value, 10),
        });
    };

    return (
        <div className="mx-auto my-auto p-6 bg-cover bg-center bg-xpurple min-h-screen flex flex-col items-center font-sans">
            <div>
                <h1 className="text-3xl font-bold mb-6 text-center text-xyellow">
                    Little Alchetree!
                </h1>
                <h2 className="text-xl font-semibold mb-4 text-center text-xyellow">
                    Little Alchemy 2 Recipe Finder!
                </h2>
            </div>
            {globalState.isScraping && (
                <div className="mb-3">
                    <h1 className="text-2xl text-xyellow mb-3">Loading Data</h1>
                    <Spinner />
                </div>
            )}

            <div className="flex flex-col gap-x-5 md:flex-row">
                <div className="flex flex-col gap-y-4 items-center">
                    <ComboBox
                        options={globalState.recipes.map(
                            (entry) => entry.element,
                        )}
                        param={"target"}
                    />
                    <CustomImage
                        url={
                            globalState.recipes.find(
                                (entry) => entry.element === globalState.target,
                            )?.imageUrl
                        }
                    />
                </div>
                <div className="flex flex-col gap-y-4 items-center">
                    <ComboBox options={["DFS", "BFS"]} param={"traversal"} />
                    <CustomImage
                        url={
                            globalState.traversal === "DFS"
                                ? dfsImage
                                : globalState.traversal === "BFS"
                                  ? bfsImage
                                  : undefined
                        }
                    ></CustomImage>
                </div>
                <div className="flex flex-col gap-y-4 items-center">
                    <ComboBox
                        options={["Single", "Bidirectional"]}
                        param={"direction"}
                    />
                    <CustomImage
                        url={
                            globalState.direction === "Single"
                                ? upArrowImage
                                : globalState.direction === "Bidirectional"
                                  ? bidirecImage
                                  : undefined
                        }
                    ></CustomImage>
                </div>
            </div>
            <div className="flex flex-col gap-y-2">
                <CustomSwitch
                    label="Find Shortest Path"
                    param="isShortestPath"
                ></CustomSwitch>
                <CustomSwitch
                    label="Find Multiple Recipes"
                    param="isMultiSearch"
                />
                <div
                    className={`flex items-center transition-opacity duration-300 ${
                        globalState.isMultiSearch
                            ? "opacity-100"
                            : "opacity-0 invisible"
                    }`}
                >
                    <label className="text-xyellow">
                        Number of Recipes to Find:
                    </label>
                    <input
                        type="number"
                        min="1"
                        className="ml-2 w-10 text-center rounded-sm"
                        placeholder="1"
                        value={globalState.searchNumber ?? ""}
                        onChange={handleSearchNumberChange}
                    />
                </div>
            </div>
            <div className="flex flex-col justify-center mt-5 text-xyellow">
                <h1>Target: {globalState.target}</h1>
                <h1>Traversal: {globalState.traversal}</h1>
                <h1>Direction: {globalState.direction}</h1>
                <h1>
                    Multi Search: {globalState.isMultiSearch ? "Yes" : "No"}
                </h1>
                <h1
                    className={`${globalState.isMultiSearch ? "opacity-100" : "opacity-0"}`}
                >
                    Search Number: {globalState.searchNumber ?? "Not Set"}
                </h1>
            </div>
            <div className="flex justify-center mt-8">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={handleSearchButtonClick}
                >
                    Click me
                </button>
                <button
                    onClick={handleTestButtonClick}
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                    Call Jovkon API
                </button>
            </div>
            <div className="flex invisible md:visible absolute bottom-0 left-max right-0 justify-center mt-8 mx-6">
                {message && (
                    <div className="my-5 p-4 bg-green-100 rounded-md">
                        <p className="font-medium">
                            ✅ Backend connection successful!
                        </p>
                        <p>
                            <strong>{message}</strong>
                        </p>
                    </div>
                )}

                {error && (
                    <div className="my-5 p-4 bg-red-100 rounded-md">
                        <p className="font-medium">❌ {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default App;
