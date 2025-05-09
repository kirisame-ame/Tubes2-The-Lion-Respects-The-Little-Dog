import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/hooks/AppContext";

export default function CustomSwitch({
    label,
    param,
}: {
    label?: string;
    param: string;
}) {
    const [globalState, setGlobalState] = useAppContext();
    return (
        <div className="flex items-center w-64 space-x-2 text-xyellow">
            <Switch
                onCheckedChange={(checked) => {
                    setGlobalState({
                        ...globalState,
                        [param]: checked,
                    });
                }}
            />
            <Label>{label}</Label>
        </div>
    );
}
