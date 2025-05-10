import React, { createContext, useContext, ReactNode } from "react";
import { ReactFlowInstance, Node, Edge } from "@xyflow/react";

type FlowContextType = {
    reactFlowInstance: ReactFlowInstance | null;
    setReactFlowInstance: (instance: ReactFlowInstance) => void;
    clearAndAddNode: (element: string, imageUrl: string) => void;
    appendNode: (element: string, imageUrl: string) => void;
};

const FlowContext = createContext<FlowContextType>({
    reactFlowInstance: null,
    setReactFlowInstance: () => {},
    clearAndAddNode: () => {},
    appendNode: () => {},
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

    // Function to clear all nodes and add a new one
    const clearAndAddNode = (element: string, imageUrl: string) => {
        if (reactFlowInstance) {
            reactFlowInstance.setNodes([]);

            const newNode = {
                id: "result-node",
                type: "graphNode",
                position: { x: 0, y: 300 },
                data: {
                    element,
                    imageUrl,
                },
            };
            reactFlowInstance.addNodes(newNode);

            // Adjust zoom
            setTimeout(() => {
                reactFlowInstance.fitView();
            }, 100);
        }
    };
    const appendNode = (element: string, imageUrl: string) => {
        if (reactFlowInstance) {
            const newNode: Node = {
                id: `node-${Math.floor(Math.random() * 10000)}`,
                type: "graphNode",
                position: {
                    x: Math.random() * 500,
                    y: 0,
                },
                data: {
                    element,
                    imageUrl,
                },
            };
            reactFlowInstance.addNodes(newNode);
            reactFlowInstance.addEdges([
                {
                    id: `edge-${Math.floor(Math.random() * 10000)}`,
                    source: "result-node",
                    target: newNode.id,
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
                clearAndAddNode,
                appendNode,
            }}
        >
            {children}
        </FlowContext.Provider>
    );
}
