import {
  getConnectionStyle,
  getNetworkAddress,
  areIPsCompatible,
  canConnectNodes,
  validateConnections,
  getSuggestedConnectionType,
  getEdgeInfo,
  CONNECTION_TYPES
} from './connectionLogic'

describe('connectionLogic utilities', () => {
  test('getConnectionStyle returns merged style for known type/status', () => {
    const s = getConnectionStyle('routing', 'error')

    expect(s).toHaveProperty('stroke')
    expect(s).toHaveProperty('opacity')
    expect(s.strokeDasharray).toBeDefined()
  })

  test('getNetworkAddress computes network address or returns null for bad input', () => {
    expect(getNetworkAddress('192.168.1.100', '255.255.255.0')).toBe('192.168.1.0')
    expect(getNetworkAddress(null, '255.255.255.0')).toBeNull()
    expect(getNetworkAddress('bad', 'mask')).toBeNull()
  })

  test('areIPsCompatible works for same and different subnets', () => {
    expect(areIPsCompatible('10.0.0.1', '255.0.0.0', '10.1.2.3', '255.0.0.0')).toBe(true)
    expect(areIPsCompatible('192.168.1.2', '255.255.255.0', '192.168.2.2', '255.255.255.0')).toBe(false)
  })

  test('canConnectNodes covers multiple device types and edge cases', () => {
    const nodeA = { id: 'a', data: { type: 'server', ip: '192.168.1.2', mask: '255.255.255.0', label: 'A' } }
    const nodeB = { id: 'b', data: { type: 'workstation', ip: '192.168.1.5', mask: '255.255.255.0', label: 'B' } }
    const nodeC = { id: 'c', data: { type: 'router', label: 'R' } }
    const nodeNet = { id: 'n', data: { type: 'network', label: 'Net' } }

    expect(canConnectNodes(nodeA, nodeB).allowed).toBe(true)
    expect(canConnectNodes(nodeA, nodeC).allowed).toBe(true)
    expect(canConnectNodes(nodeA, nodeNet).allowed).toBe(true)
    expect(canConnectNodes(nodeA, nodeA).allowed).toBe(false)
  })

  test('validateConnections detects missing nodes and IP incompatibilities', () => {
    const nodes = [
      { id: '1', data: { type: 'server', label: 'S1', ip: '10.0.0.1', mask: '255.0.0.0' } },
      { id: '2', data: { type: 'workstation', label: 'W1', ip: '192.168.0.2', mask: '255.255.255.0' } }
    ]

    const edges = [
      { id: 'e1', source: '1', target: '2', connectionType: CONNECTION_TYPES.PHYSICAL, data: {} },
      { id: 'e2', source: '1', target: 'missing', connectionType: CONNECTION_TYPES.PHYSICAL, data: {} }
    ]

    const result = validateConnections(nodes, edges)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(1)
  })

  test('getSuggestedConnectionType and getEdgeInfo return expected defaults', () => {
    const source = { id: 's', data: { type: 'server', label: 'S' } }
    const target = { id: 't', data: { type: 'workstation', label: 'T' } }
    const suggested = getSuggestedConnectionType(source, target)

    expect(typeof suggested).toBe('string')

    const edge = { id: 'e', source: 's', target: 't', connectionType: null, data: {} }
    const info = getEdgeInfo(edge, [source, target])

    expect(info).toHaveProperty('source')
    expect(info).toHaveProperty('target')
    expect(info.type).toBeDefined()
  })
})
