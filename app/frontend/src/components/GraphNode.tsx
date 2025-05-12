import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import CustomImage from "./CustomImage";

type GraphNode = Node<{ element: string; imageUrl: string }>;

export default function GraphNode({ data }: NodeProps<GraphNode>) {
    return (
        <div className="bg-white/5 rounded-lg shadow-md p-4">
            <CustomImage url={data.imageUrl} />
            <div className="text-center mt-2 text-xyellow">{data.element}</div>
            <Handle type="target" position={Position.Bottom} />
            <Handle type="source" position={Position.Top} />
            <Handle type="source" position={Position.Right} id="s-right" />
            <Handle type="source" position={Position.Left} id="s-left" />
            <Handle type="target" position={Position.Left} id="t-left" />
            <Handle type="target" position={Position.Right} id="t-right" />
        </div>
    );
}
