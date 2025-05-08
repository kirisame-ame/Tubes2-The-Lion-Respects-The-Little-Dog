import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/hooks/AppContext";

export default function CustomSwitch({ label }: { label?: string }) {
    const [globalState, setGlobalState] = useAppContext();
    return (
        <div className="flex items-center space-x-2 text-xyellow">
            <Switch
                onCheckedChange={(checked) => {
                    setGlobalState({
                        ...globalState,
                        isMultiSearch: checked,
                    });
                }}
            />
            <Label>{label}</Label>
        </div>
    );
}
