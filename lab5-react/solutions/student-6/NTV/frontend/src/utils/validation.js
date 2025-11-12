export const validateTopologyData = (data) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid data format' };
  }

  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    return { isValid: false, error: 'Data must contain nodes and edges arrays' };
  }

  // Basic validation for nodes
  for (const node of data.nodes) {
    if (!node.id || !node.position || !node.data) {
      return { isValid: false, error: 'Invalid node structure' };
    }
  }

  // Basic validation for edges
  for (const edge of data.edges) {
    if (!edge.id || !edge.source || !edge.target) {
      return { isValid: false, error: 'Invalid edge structure' };
    }
  }

  return { isValid: true };
};
