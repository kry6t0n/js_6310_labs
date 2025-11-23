import React, { useCallback, useState, FC } from 'react'

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Node,
  Edge,
  Connection,
  NodeTypes,
  BackgroundVariant
} from 'reactflow'
import 'reactflow/dist/style.css'

import CustomNode from './CustomNodes/CustomNode'
import Toolbar from './Toolbar'
import {
  canConnectNodes,
  getSuggestedConnectionType,
  getConnectionStyle
} from '../../utils/connectionLogic'

interface CustomNodeData {
  label: string
  type: string
  ip?: string
  mask?: string
  status: string
}

interface CustomEdgeData {
  status: string
  description: string
  connectionType?: string
}

type CustomNode = Node<CustomNodeData>
type CustomEdge = Edge<CustomEdgeData>

const nodeTypes: NodeTypes = {
  custom: CustomNode
}

const initialNodes: CustomNode[] = []
const initialEdges: CustomEdge[] = []

const Flow: FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<CustomEdge | null>(null)

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)

      if (!sourceNode || !targetNode) {
        alert('❌ Invalid connection')

        return
      }

      const compatibility = canConnectNodes(sourceNode, targetNode)

      if (!compatibility.allowed) {
        alert(`❌ Cannot connect: ${compatibility.message}`)

        return
      }

      const suggestedType = getSuggestedConnectionType(sourceNode, targetNode)

      const newEdge: CustomEdge = {
        id: `${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        data: {
          status: 'active',
          description: '',
          connectionType: suggestedType
        },
        style: getConnectionStyle(suggestedType, 'active')
      }

      setEdges((eds) => addEdge(newEdge, eds) as CustomEdge[])
      setSelectedNode(null)
      setSelectedEdge(newEdge)
    },
    [nodes, setEdges]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as CustomNode)
    setSelectedEdge(null)
  }, [])

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge as CustomEdge)
    setSelectedNode(null)
  }, [])

  const addNode = useCallback((type: string) => {
    const newNode: CustomNode = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type: type,
        ip: type === 'network' ? '' : `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        mask: type === 'network' ? '' : '255.255.255.0',
        status: 'active'
      }
    }

    setNodes((nds) => nds.concat(newNode))
  }, [setNodes])

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
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  )
}

const NetworkCanvas: FC = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}

export default NetworkCanvas