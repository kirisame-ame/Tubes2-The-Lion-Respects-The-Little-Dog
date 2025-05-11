import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { AppProvider } from "./hooks/AppContext.tsx";
import "./index.css";
import { FlowProvider } from "./hooks/FlowContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AppProvider>
            <FlowProvider>
                <App />
            </FlowProvider>
        </AppProvider>
    </React.StrictMode>,
);
