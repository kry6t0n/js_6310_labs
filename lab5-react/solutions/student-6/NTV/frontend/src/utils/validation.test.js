const { validateTopologyData } = require('./validation')

describe('validateTopologyData', () => {
  test('returns invalid for null', () => {
    expect(validateTopologyData(null).isValid).toBe(false)
  })

  test('returns invalid for missing arrays', () => {
    expect(validateTopologyData({}).isValid).toBe(false)
  })

  test('returns invalid for bad node/edge structure', () => {
    const bad = { nodes: [{ id: '1' }], edges: [{ id: 'e' }] }
    expect(validateTopologyData(bad).isValid).toBe(false)
  })

  test('valid topology passes', () => {
    const good = {
      nodes: [{ id: '1', position: { x: 0, y: 0 }, data: {} }],
      edges: [{ id: 'e1', source: '1', target: '1' }]
    }
    expect(validateTopologyData(good).isValid).toBe(true)
  })
})
