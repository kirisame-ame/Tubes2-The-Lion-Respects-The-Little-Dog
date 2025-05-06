"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { useAppContext } from "@/hooks/AppContext";
export function ComboBox({
    options,
    param,
}: {
    options: string[];
    param: string;
}) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [globalState, setGlobalState] = useAppContext();
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? options.find((option) => option === value)
                        : "Select " + param}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder={"Search " + param}
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={(currentValue) => {
                                        setValue(
                                            currentValue === value
                                                ? ""
                                                : currentValue,
                                        );
                                        setGlobalState({
                                            ...globalState,
                                            [param]: currentValue,
                                        });
                                        setOpen(false);
                                    }}
                                >
                                    {option}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === option
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
