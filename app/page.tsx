"use client";

import { addEdge, applyEdgeChanges, applyNodeChanges, ReactFlow,  type Node, type Edge  } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useState } from "react";
import { convertDataToGraphNodesAndEdges } from "../core/data/data-converter";
import { GraphFormatService } from "../core/graph-format.service";
import { ReactFlowService } from "../core/react-flow.service";

const graphFormatService = new GraphFormatService();
const reactFlowService = new ReactFlowService();


export default function App() {
	const [nodes, setNodes] = useState<Node[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);
	const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Calculating layout...");

	 useEffect(() => {
        const loadGraph = async () => {
            const {
                graphNodes,
                graphEdges,
                c1Output,
                c2Subcategories,
                c2Relationships,
                crossC1C2Relationships
            } = convertDataToGraphNodesAndEdges();

           try {

                const layoutedData =  graphFormatService.layoutCategoriesWithNodes(
                    graphNodes,
                    graphEdges,
                    c1Output,
                    c2Subcategories,
                    c2Relationships,
                    crossC1C2Relationships
                );

                if (layoutedData) {
                    const filteredEdges = layoutedData.edges.filter((e) => !!e.source && !!e.target) as any[];

                    const { nodes: initialNodes, edges: initialEdges } = reactFlowService.convertDataToReactFlowDataTypes(
                        layoutedData.graphNodes,
                        layoutedData.c1Nodes,
                        layoutedData.c2Nodes,
                        filteredEdges,
                    );
                    
                    setNodes(initialNodes as Node[]);
                    setEdges(initialEdges as Edge[]);
                }
            } catch (err: any) {
                // If anything goes wrong, catch the error here
                console.error("Failed to layout graph:", err);
                setError(`Failed to layout graph: ${err.message}`);
            }
            // ===================================
        };

        loadGraph();
    }, []);

	const onNodesChange = useCallback(
		(changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
		[],
	);
	const onConnect = useCallback(
		(params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
		[],
	);

    if(error){
        return <div style={{ width: "100vw", height: "100vh", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{error}.</div>;
    }
	 if (nodes.length === 0) {
        return <div style={{ width: "100vw", height: "100vh", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{status}.</div>;
    }

	return (
		<div style={{ width: "100vw", height: "100vh", background: "white" }}>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				fitView
				minZoom={0.1}
				maxZoom={2}
				style={{ background: "white" }}
			/>
		</div>
	);
}
