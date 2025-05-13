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
    //traversal dfs/bfs/bidirectional
    recipes: Entry[];
    isMultiSearch: boolean;
    searchNumber?: number;
    // number of search results to show
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
        recipes: [],
        isMultiSearch: false,
        searchNumber: 1,
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
