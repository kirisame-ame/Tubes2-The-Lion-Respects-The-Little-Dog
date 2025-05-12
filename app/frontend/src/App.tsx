import { useEffect, useState } from "react";
import { useAppContext } from "./hooks/AppContext";
import Spinner from "./components/Spinner";
import { ComboBox } from "./components/ComboBox";
import CustomSwitch from "./components/CustomSwitch";

import CustomImage from "./components/CustomImage";
import bfsImage from "/src/assets/images/bfs.png";
import dfsImage from "/src/assets/images/dfs.png";
import bidirecImage from "/src/assets/images/bidirectional.png";
import FlowGraph from "./components/FlowGraph";
import { ReactFlowProvider } from "@xyflow/react";
import { useFlowContext } from "./hooks/FlowContext";
import "@xyflow/react/dist/style.css";
interface Entry {
    category: string;
    element: string;
    recipes: string[];
    imageUrl: string;
}
function App() {
    const { clearAndAddNode, appendChildRecipe } = useFlowContext();
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
            const response = await fetch(
                "/api/search?target=" +
                    globalState.target +
                    "&traversal=" +
                    globalState.traversal +
                    "&isMulti=" +
                    globalState.isMultiSearch +
                    "&num=" +
                    globalState.searchNumber,
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setMessage(data.results[0]["Element"]);
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
                    "&isMulti=" +
                    globalState.isMultiSearch +
                    "&num=" +
                    globalState.searchNumber,
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            console.log("Data received:", data);
            setMessage(data.product);
            setError(null);

            // Clear the flow and create the root node before DFS
            clearAndAddNode(data.product, data.imageUrl1);

            // DFS recursive function with unique nodeId tracking for every node
            let nodeIdCounter = 1; // root is 0
            let depthWidth = 1000;
            function dfsBuildTree(
                node: any,
                parentId: number,
                parentX: number,
                parentY: number,
                depthWidth: number,
            ) {
                if (!node) return;
                // If node has ingredients, create child nodes and attach to parentId
                if (node.ingredients && node.ingredients[0] !== "") {
                    // Assign unique IDs for left and right children
                    const leftChildId = nodeIdCounter++;
                    const rightChildId = nodeIdCounter++;
                    // Attach both children to the parent, passing their unique IDs
                    appendChildRecipe(
                        node.ingredients[0],
                        node.imageUrl1,
                        leftChildId,
                        node.ingredients[1],
                        node.imageUrl2,
                        rightChildId,
                        parentId,
                        parentX,
                        parentY,
                        depthWidth,
                    );
                    // Recursively build the tree for each child, passing their unique IDs as parentId
                    if (node.children && node.children.length > 0) {
                        if (node.children[0]) {
                            dfsBuildTree(
                                node.children[0],
                                leftChildId,
                                parentX,
                                parentY - 100,
                                depthWidth / 2,
                            );
                        }
                        if (node.children[1]) {
                            dfsBuildTree(
                                node.children[1],
                                rightChildId,
                                parentX,
                                parentY - 100,
                                depthWidth / 2,
                            );
                        }
                    }
                } else if (node.children && node.children.length > 0) {
                    // If this node is a dummy node (ingredients are empty), just recurse to its children
                    for (let i = 0; i < node.children.length; i++) {
                        dfsBuildTree(
                            node.children[i],
                            parentId,
                            parentX,
                            parentY - 100,
                            depthWidth,
                        );
                    }
                }
            }
            // Start DFS from the root's children, root nodeId is 0
            if (data.children && data.children.length > 0) {
                for (let i = 0; i < data.children.length; i++) {
                    dfsBuildTree(data.children[i], 0, 0, 300, depthWidth);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to connect to the backend. Is it running?");
            setMessage(null);
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
                    <ComboBox
                        options={["DFS", "BFS", "Bidirectional"]}
                        param={"traversal"}
                    />
                    <CustomImage
                        url={
                            globalState.traversal === "DFS"
                                ? dfsImage
                                : globalState.traversal === "BFS"
                                  ? bfsImage
                                  : globalState.traversal === "Bidirectional"
                                    ? bidirecImage
                                    : undefined
                        }
                    ></CustomImage>
                </div>
            </div>
            <div className="flex flex-col mt-5 gap-y-2">
                <CustomSwitch
                    label="Find Shortest Path"
                    param="isShortestPath"
                ></CustomSwitch>
                <CustomSwitch
                    className={`${
                        globalState.isShortestPath
                            ? "pointer-events-none opacity-30"
                            : ""
                    }`}
                    label="Find Multiple Recipes"
                    param="isMultiSearch"
                />
                <div
                    className={`flex items-center transition-opacity duration-300 ${
                        globalState.isMultiSearch && !globalState.isShortestPath
                            ? "opacity-100"
                            : "opacity-30 pointer-events-none"
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
            <div className="flex justify-center mt-4">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={handleSearchButtonClick}
                >
                    Search
                </button>
                <button
                    onClick={handleTestButtonClick}
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                    Append to Root
                </button>
            </div>

            <ReactFlowProvider>
                <FlowGraph />
            </ReactFlowProvider>
            <div className="flex invisible md:visible absolute left-max right-0 justify-center mt-8 mx-6">
                {message && !error && (
                    <div className="my-5 p-4 bg-green-100 rounded-md">
                        <p className="font-medium">
                            ✅ Backend connection successful!
                        </p>
                        <p>
                            <strong>{message}</strong>
                        </p>
                    </div>
                )}

                {error && !message && (
                    <div className="my-5 p-4 bg-red-100 rounded-md">
                        <p className="font-medium">❌ {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default App;
