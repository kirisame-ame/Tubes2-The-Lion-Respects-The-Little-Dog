import { useCallback, useState, useEffect } from "react";
import {
    ReactFlow,
    addEdge,
    useReactFlow,
    applyEdgeChanges,
    applyNodeChanges,
    type Node,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import GraphNode from "./GraphNode";
import { useFlowContext } from "../hooks/FlowContext";

// Start with an empty graph
const initialNodes: Node[] = [];
// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { graphNode: GraphNode };

function FlowGraph() {
    const { setReactFlowInstance } = useFlowContext();
    const reactFlowInstance = useReactFlow();
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>([]);

    // Make the instance available to the context when it's ready
    useEffect(() => {
        if (reactFlowInstance) {
            setReactFlowInstance(reactFlowInstance);
        }
    }, [reactFlowInstance, setReactFlowInstance]);

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes],
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges],
    );
    const onConnect: OnConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges],
    );
    return (
        <div className="h-[500px] w-1/2 mt-4 relative">
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xyellow z-10">
                    Search for an element to see its recipe graph
                </div>
            )}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodesConnectable={false}
                elementsSelectable={false}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                className="bg-white/5 rounded-lg shadow-md"
            ></ReactFlow>
        </div>
    );
}

export default FlowGraph;
