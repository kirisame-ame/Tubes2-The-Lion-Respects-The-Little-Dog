import React, { createContext, useContext, ReactNode } from "react";
import { ReactFlowInstance, Node } from "@xyflow/react";

type FlowContextType = {
    reactFlowInstance: ReactFlowInstance | null;
    setReactFlowInstance: (instance: ReactFlowInstance) => void;
    nodeCount: number;
    setNodeCount: (count: number) => void;
    clearAndAddNode: (element: string, imageUrl: string) => void;
    appendChildRecipe: (
        element1: string,
        imageUrl1: string,
        leftChildId: number,
        element2: string,
        imageUrl2: string,
        rightChildId: number,
        parentElement: number,
        parentX: number,
        parentY: number,
        depthWidth: number,
    ) => void;
};

const FlowContext = createContext<FlowContextType>({
    reactFlowInstance: null,
    setReactFlowInstance: () => {},
    nodeCount: 0,
    setNodeCount: () => {},
    clearAndAddNode: () => {},
    appendChildRecipe: () => {},
});

export function useFlowContext() {
    return useContext(FlowContext);
}

type FlowProviderProps = {
    children: ReactNode;
};

export function FlowProvider({ children }: FlowProviderProps) {
    const [reactFlowInstance, setReactFlowInstance] =
        React.useState<ReactFlowInstance | null>(null);
    // Use a ref for a global node counter
    const nodeIdRef = React.useRef(0);
    const [nodeCount, setNodeCount] = React.useState(0);
    // Function to clear all nodes and add a new one
    const clearAndAddNode = (element: string, imageUrl: string) => {
        if (reactFlowInstance) {
            reactFlowInstance.setNodes([]);
            nodeIdRef.current = 0; // Reset global counter
            const newNode = {
                id: "node-" + nodeIdRef.current,
                type: "graphNode",
                position: { x: 0, y: 300 },
                data: {
                    element,
                    imageUrl,
                },
            };
            reactFlowInstance.addNodes(newNode);
            console.log(
                "clearAndAddNode: newNodeId",
                nodeIdRef.current,
                "element:",
                element,
            );
            nodeIdRef.current++;
            setNodeCount(1);

            // Adjust zoom
            setTimeout(() => {
                reactFlowInstance.fitView();
            }, 100);
        }
    };
    const appendChildRecipe = (
        element1: string,
        imageUrl1: string,
        leftChildId: number,
        element2: string,
        imageUrl2: string,
        rightChildId: number,
        parentId: number,
        parentX: number,
        parentY: number,
        depthWidth: number,
    ) => {
        if (reactFlowInstance) {
            console.log(
                "appendChildRecipe: parentId",
                parentId,
                "parentX",
                parentX,
                "parentY",
                parentY,
                "depthWidth",
                depthWidth,
            );
            // First child node
            const newNode: Node = {
                id: "node-" + leftChildId,
                type: "graphNode",
                position: {
                    x: parentX - depthWidth / 2,
                    y: parentY - 300,
                },
                data: {
                    element: element1,
                    imageUrl: imageUrl1,
                },
            };
            reactFlowInstance.addNodes(newNode);
            // Second child node
            const newNode2: Node = {
                id: "node-" + rightChildId,
                type: "graphNode",
                position: {
                    x: parentX + depthWidth / 2,
                    y: parentY - 300,
                },
                data: {
                    element: element2,
                    imageUrl: imageUrl2,
                },
            };
            reactFlowInstance.addNodes(newNode2);
            setNodeCount((prev) => prev + 2);
            reactFlowInstance.addEdges([
                {
                    id: "edge-" + parentId + "-" + newNode.id,
                    source: "node-" + parentId,
                    target: newNode.id,
                    animated: true,
                },
                {
                    id: "edge-" + parentId + "-" + newNode2.id,
                    source: "node-" + parentId,
                    target: newNode2.id,
                    animated: true,
                },
                {
                    id: "edge-" + newNode.id + "-" + newNode2.id,
                    source: newNode.id,
                    sourceHandle: "s-right",
                    target: newNode2.id,
                    targetHandle: "t-left",
                    animated: true,
                },
            ]);
            // Adjust zoom
            setTimeout(() => {
                reactFlowInstance.fitView();
            }, 100);
        }
    };

    return (
        <FlowContext.Provider
            value={{
                reactFlowInstance,
                setReactFlowInstance,
                nodeCount: reactFlowInstance
                    ? reactFlowInstance.getNodes().length
                    : 0,
                setNodeCount,
                clearAndAddNode,
                appendChildRecipe,
            }}
        >
            {children}
        </FlowContext.Provider>
    );
}
