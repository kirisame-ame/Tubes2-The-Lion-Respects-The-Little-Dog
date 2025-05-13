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
import { ReactFlowProvider, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
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
    const [graphNodes, setGraphNodes] = useState<Node[]>([]);
    const [graphEdges, setGraphEdges] = useState<Edge[]>([]);

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

            // Build all nodes and edges at once from the tree
            let nodeIdCounter = 0;
            const colors = [
                "#FF0000",
                "#00FF00",
                "#0000FF",
                "#FFFF00",
                "#FF00FF",
                "#00FFFF",
            ];
            const nodes: Node[] = [];
            const edges: Edge[] = [];
            function dfsBuildAll(node: any, parentId: number | null) {
                // Root Constructor
                if (parentId === null) {
                    nodes.push({
                        id: `node-${0}`,
                        type: "graphNode",
                        data: {
                            element: node.product,
                            imageUrl: node.imageUrl1,
                        },
                        position: { x: 0, y: 1000 },
                    });
                    nodeIdCounter++;
                    for (let i = 0; i < node.children.length; i++) {
                        dfsBuildAll(node.children[i], 0);
                    }
                } else if (node.ingredients[0] !== "") {
                    const thisId = nodeIdCounter++;
                    nodes.push(
                        {
                            id: `node-${thisId}`,
                            type: "graphNode",
                            data: {
                                element: node.ingredients[0],
                                imageUrl: node.imageUrl1,
                            },
                            position: { x: 0, y: 0 }, //auto layouted
                        },
                        {
                            id: `node-${thisId + 1}`,
                            type: "graphNode",
                            data: {
                                element: node.ingredients[1],
                                imageUrl: node.imageUrl2,
                            },
                            position: { x: 0, y: 0 },
                        },
                    );
                    nodeIdCounter++;
                    if (parentId !== null) {
                        let randColor =
                            colors[Math.floor(Math.random() * colors.length)];
                        edges.push(
                            {
                                id: `edge-${parentId}-${thisId}`,
                                source: `node-${parentId}`,
                                target: `node-${thisId}`,
                                animated: true,
                                style: {
                                    stroke: randColor,
                                    strokeWidth: 2,
                                },
                            },
                            {
                                id: `edge-${parentId}-${thisId + 1}`,
                                source: `node-${parentId}`,
                                target: `node-${thisId + 1}`,
                                animated: true,
                                style: {
                                    stroke: randColor,
                                    strokeWidth: 2,
                                },
                            },
                            {
                                id: `edge-${thisId}-${thisId + 1}`,
                                source: `node-${thisId}`,
                                sourceHandle: "s-right",
                                target: `node-${thisId + 1}`,
                                targetHandle: "t-left",
                                animated: false,
                            },
                        );
                        if (node.children && node.children.length > 0) {
                            for (let i = 0; i < node.children.length; i++) {
                                if (
                                    node.children[i].product ===
                                    node.ingredients[0]
                                ) {
                                    dfsBuildAll(node.children[i], thisId);
                                } else if (
                                    node.children[i].product ===
                                    node.ingredients[1]
                                ) {
                                    dfsBuildAll(node.children[i], thisId + 1);
                                }
                            }
                        }
                    }
                } else {
                    // Container node
                    for (let i = 0; i < node.children.length; i++) {
                        dfsBuildAll(node.children[i], parentId);
                    }
                }
            }
            dfsBuildAll(data, null);
            console.log("Node counts:", nodeIdCounter);
            setGraphNodes(nodes);
            setGraphEdges(edges);
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
                    label="Find Multiple Recipes"
                    param="isMultiSearch"
                />
                <div
                    className={`flex items-center transition-opacity duration-300 ${
                        globalState.isMultiSearch
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
            </div>

            <ReactFlowProvider>
                <FlowGraph nodes={graphNodes} edges={graphEdges} />
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
