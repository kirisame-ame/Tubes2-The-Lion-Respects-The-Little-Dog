import { createContext, useState, useContext, ReactNode } from "react";

interface AppState {
    isScraping: boolean;
    target: string | null;
    traversal: string | null;
    direction: string | null;
    recipes: any[];
}

type AppContextType = [
    AppState,
    React.Dispatch<React.SetStateAction<AppState>>,
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [globalState, setGlobalState] = useState<AppState>({
        isScraping: true,
        target: null,
        traversal: null,
        direction: null,
        recipes: [],
    });

    return (
        <AppContext.Provider value={[globalState, setGlobalState]}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}
