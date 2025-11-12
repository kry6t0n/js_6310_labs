import React, { useCallback, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNodes/CustomNode';
import Toolbar from './Toolbar';
import { 
  canConnectNodes,
  getSuggestedConnectionType,
  getConnectionStyle
} from '../../utils/connectionLogic';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [];
const initialEdges = [];

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      // Проверяем совместимость
      const compatibility = canConnectNodes(sourceNode, targetNode);
      
      if (!compatibility.allowed) {
        alert(`❌ Cannot connect: ${compatibility.message}`);
        return;
      }

      // Определяем тип соединения
      const suggestedType = getSuggestedConnectionType(sourceNode, targetNode);

      // Добавляем соединение с типом и стилем
      const newEdge = {
        ...params,
        connectionType: suggestedType,
        data: {
          status: 'active',
          description: ''
        },
        style: getConnectionStyle(suggestedType, 'active')
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setSelectedNode(null);
      setSelectedEdge(newEdge);
    },
    [nodes, setEdges],
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const addNode = useCallback((type) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type: type,
        ip: type === 'network' ? '' : `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        mask: type === 'network' ? '' : '255.255.255.0',
        status: 'active'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Toolbar 
        onAddNode={addNode}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        nodes={nodes}
        edges={edges}
        onSetNodes={setNodes}
        onSetEdges={setEdges}
      />
      
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function NetworkCanvas() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
