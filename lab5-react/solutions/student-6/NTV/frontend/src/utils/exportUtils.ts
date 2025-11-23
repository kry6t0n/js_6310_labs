/**
 * Утилиты для экспорта/импорта топологии сети
 */

interface TopologyData {
  nodes: any[]
  edges: any[]
}

export const exportToJson = (data: TopologyData): void => {
  try {
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')

    link.href = URL.createObjectURL(dataBlob)
    link.download = `network-topology-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error exporting topology:', error)
    alert('Error exporting topology')
  }
}

export const importFromJson = (file: File, onSetNodes: (nodes: any[]) => void, onSetEdges: (edges: any[]) => void): void => {
  const reader = new FileReader()

  reader.onload = (event) => {
    try {
      const content = event.target?.result as string
      const data: TopologyData = JSON.parse(content)

      if (!data.nodes || !data.edges) {
        alert('Invalid topology file format')

        return
      }

      onSetNodes(data.nodes)
      onSetEdges(data.edges)
      alert('Topology imported successfully')
    } catch (error) {
      console.error('Error importing topology:', error)
      alert('Error importing topology: Invalid file format')
    }
  }

  reader.readAsText(file)
}
