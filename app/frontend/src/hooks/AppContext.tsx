import { createContext, useState, useContext, ReactNode } from "react";

interface Entry {
    category: string;
    element: string;
    recipes: string[];
    imageUrl: string;
}
interface AppState {
    isScraping: boolean;
    target: string | null;
    traversal: string | null;
    //traversal dfs/bfs
    direction: string | null;
    // direction up/down
    recipes: Entry[];
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
