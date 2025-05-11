import { useEffect } from "react";
import { useFlowContext } from "../hooks/FlowContext";

type SearchResultDisplayProps = {
    results: Array<{
        Element: string;
        ImageUrl: string;
    }>;
};

export default function SearchResultDisplay({
    results,
}: SearchResultDisplayProps) {
    const { clearAndAddNode } = useFlowContext();

    // Automatically update the graph when results change
    useEffect(() => {
        if (results && results.length > 0) {
            const firstResult = results[0];
            // Clear the graph and add the first result
            clearAndAddNode(firstResult.Element, firstResult.ImageUrl);
        }
    }, [results, clearAndAddNode]);

    if (!results || results.length === 0) {
        return null;
    }

    return (
        <div className="my-4 p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-center text-xpurple">
                Search Results
            </h2>
            <div className="max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                        <div className="flex items-center">
                            <img
                                src={result.ImageUrl}
                                alt={result.Element}
                                className="w-10 h-10 mr-3"
                            />
                            <span>{result.Element}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
