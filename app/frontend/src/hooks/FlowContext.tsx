import React, { createContext, useContext, ReactNode } from "react";
import { ReactFlowInstance } from "@xyflow/react";

type FlowContextType = {
    reactFlowInstance: ReactFlowInstance | null;
    setReactFlowInstance: (instance: ReactFlowInstance) => void;
};

const FlowContext = createContext<FlowContextType>({
    reactFlowInstance: null,
    setReactFlowInstance: () => {},
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

    return (
        <FlowContext.Provider
            value={{
                reactFlowInstance,
                setReactFlowInstance,
            }}
        >
            {children}
        </FlowContext.Provider>
    );
}
