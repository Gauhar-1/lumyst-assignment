import dagre from 'dagre';
import type { GraphNode, GraphEdge, C1Output, C2Subcategory, C2Relationship, CrossC1C2Relationship } from './types';

export class GraphFormatService {
	layoutCategoriesWithNodes(
		graphNodes: GraphNode[],
		graphEdges: GraphEdge[],
		c1Outputs: C1Output[],
		c2Subcategories: C2Subcategory[],
		c2Relationships: C2Relationship[],
		crossC1C2Relationships: CrossC1C2Relationship[]
	) {
		
		const dagreGraph = new dagre.graphlib.Graph({ compound: true});
		dagreGraph.setDefaultEdgeLabel(() => ({ compound: true }));

		// Set up the graph
		dagreGraph.setGraph({ rankdir: 'TB', nodesep: 150, ranksep: 200 });
        dagreGraph.setDefaultEdgeLabel(() => ({}));

		// Add all nodes to dagre
        const allNodeIds = new Set<string>();
		const allNodes = [
			...graphNodes,
			...c1Outputs.map(c1 => ({ ...c1, type: 'c1' })),
			...c2Subcategories.map(c2 => ({ ...c2, type: 'c2' }))
		];


		allNodes.forEach((node) => {
			dagreGraph.setNode(node.id, { width: 150, height: 50 });
            allNodeIds.add(node.id);
		});


        const c1Position = new Map();
        const c2Position = new Map();
		const nameToIdMap = new Map();

        let DIRECTION_X = 10;
        c1Outputs.forEach(c1 => {
            nameToIdMap.set(c1.label, c1.id);
            c1Position.set(c1.id, { x : DIRECTION_X, y:0});
            DIRECTION_X += 1000;
        });

        let originalNode : string = '';
        let equalPosNode = 1;
		c2Subcategories.forEach(c2 => {
			nameToIdMap.set(c2.c2Name, c2.id);
            if(c1Position.has(c2.c1CategoryId)){
                let newPos = c1Position.get(c2.c1CategoryId);

                if(originalNode == c2.id){
                    equalPosNode++; 
                }
                else{
                    originalNode = c2.id;
                }
                newPos.x += equalPosNode *160;
                c2Position.set(c2.id, { x : newPos.x, y:0});
            }
		});


         const allEdges: GraphEdge[] = [
            ...graphEdges,
            // The "contains" edges are removed from here.
            ...c2Subcategories.map(c2 => {
                const sourceId = c2.c1CategoryId;
                const targetId = c2.id;
                if(!sourceId || !targetId){
                    return null;
                }

                return {
                    id: c2.id,
                    source: sourceId,
                    target: targetId,
                    label: 'contains'
                }
            }),
            
            ...c2Relationships.map(rel => {
				const sourceId = nameToIdMap.get(rel.fromC2);
				const targetId = nameToIdMap.get(rel.toC2);
				if (!sourceId || !targetId) {
					return null;
				}
				return {
					id: rel.id,
					source: sourceId,
					target: targetId,
					label: rel.label
				};
			}),
            ...crossC1C2Relationships.map(rel => {
				let sourceId = nameToIdMap.get(rel.fromC2);
				let targetId = nameToIdMap.get(rel.toC2);
				if (!sourceId || !targetId) {
					return null;
				}
				return {
					id: rel.id,
					source: sourceId,
					target: targetId,
					label: rel.label
				};
			}),
            
        ].filter((edge): edge is GraphEdge => !!edge && !!edge.source && !!edge.target);

        allEdges.forEach((edge) => {
            if (allNodeIds.has(edge.source) && allNodeIds.has(edge.target)) {
                dagreGraph.setEdge(edge.source, edge.target);
            }
        });

		// Calculate layout
		dagre.layout(dagreGraph);

         const applyPosition = (node: any, isGroup: boolean) => {
            const pos = dagreGraph.node(node.id);
            let position = null;

            if(c1Position.has(node.id)){
               position = c1Position.get(node.id);
            }
            else if(c1Position.has(node.c1CategoryId)){
                const newPos = c2Position.get(node.id);
                position = { x: newPos.x , y: pos.y}
            }
            

            if (!pos) return { ...node, position: { x: 0, y: 0 } };
            const result: any = { ...node, position };
            if (isGroup) {
                result.width = pos.width;
                result.height = pos.height;
            }
            return result;
        };


        return {
            graphNodes: graphNodes.map(n => applyPosition(n, false)),
            c1Nodes: c1Outputs.map(n => applyPosition(n, true)),
            c2Nodes: c2Subcategories.map(n => applyPosition(n, true)),
            edges: allEdges,
        };
	}
}
