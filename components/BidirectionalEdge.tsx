import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";

export default function BidirectionalEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label,
    style = {},
    data,
}: EdgeProps){

    const pathOffset = 30;

    const direction = data?.direction as number || 1;

    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const angle = Math.atan2(dy, dx);

    const ctrlPointOffsetX = Math.sin(angle) * pathOffset * direction;
    const ctrlPointOffsetY = -Math.cos(angle) * pathOffset * direction;


    const controlX = midX + ctrlPointOffsetX;
    const controlY = midY + ctrlPointOffsetY;

    const edgePath = `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;

    const labelX = (sourceX +controlX)/2;
    const labelY = (sourceY + controlY)/2;


    return (
        <>
        <BaseEdge id={id} path={edgePath} style={style}/>

        <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                background: '#ffffff',
                padding: '2px 8px',
                borderRadius: 5,
                fontSize: 10,
                fontWeight: 500,
              }}
              className="nodrag nopan"
            >
                {label}
            </div>
        </EdgeLabelRenderer>
        </>
    )
}