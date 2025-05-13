import { useEffect } from "react";
import Dagre from "@dagrejs/dagre";
import {
    ReactFlow,
    useReactFlow,
    type Node,
    type Edge,
    Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import GraphNode from "./GraphNode";
import { useFlowContext } from "../hooks/FlowContext";

// we define the nodeTypes outside of the component to prevent re-renderings
// you could also use useMemo inside the component
const nodeTypes = { graphNode: GraphNode };

// Dagre layout helper
const dagreGraph = new Dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 180;
const nodeHeight = 180;

function getLayoutedElements(nodes: Node[], edges: Edge[]) {
    dagreGraph.setGraph({ rankdir: "BT" });
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });
    Dagre.layout(dagreGraph);
    return nodes.map((node) => {
        const pos = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: pos.x,
                y: pos.y,
            },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
        };
    });
}

function FlowGraph({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) {
    const { setReactFlowInstance } = useFlowContext();
    const reactFlowInstance = useReactFlow();

    // Make the instance available to the context when it's ready
    useEffect(() => {
        if (reactFlowInstance) {
            setReactFlowInstance(reactFlowInstance);
        }
    }, [reactFlowInstance, setReactFlowInstance]);

    // Auto-layout nodes and edges when they change
    const layoutedNodes =
        nodes.length > 0
            ? getLayoutedElements(
                  nodes,
                  edges.filter((edge) => edge.animated !== false),
              )
            : [];

    return (
        <div className="h-[500px] w-full mt-4 relative">
            {layoutedNodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xyellow z-10">
                    Search for an element to see its recipe graph
                </div>
            )}
            <ReactFlow
                nodes={layoutedNodes}
                edges={edges}
                nodesConnectable={false}
                elementsSelectable={false}
                onNodesChange={() => {}}
                onEdgesChange={() => {}}
                onConnect={() => {}}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                className="bg-white/5 rounded-lg shadow-md"
            ></ReactFlow>
        </div>
    );
}

export default FlowGraph;
