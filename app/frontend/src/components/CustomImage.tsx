import { useState, useEffect } from "react";
import Spinner from "./Spinner";

function CustomImage({ url }: { url: string | undefined }) {
    const [imageLoaded, setImageLoaded] = useState(!url);
    const [imageError, setImageError] = useState(false);
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        // If URL changes (not first render), reset loading states
        if (!isFirstRender) {
            setImageLoaded(false);
            setImageError(false);
        } else {
            setIsFirstRender(false);
        }
    }, [url, isFirstRender]);

    const handleImageLoaded = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="relative w-32 h-32">
            {!imageLoaded && url && !imageError && <Spinner />}

            {url && (
                <img
                    src={url}
                    alt="Custom"
                    className={`absolute w-32 h-32 shadow-lg ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={handleImageLoaded}
                    onError={handleImageError}
                />
            )}
        </div>
    );
}

export default CustomImage;
