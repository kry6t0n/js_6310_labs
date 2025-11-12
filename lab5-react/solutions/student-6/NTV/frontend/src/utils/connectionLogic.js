/**
 * Логика для управления соединениями между устройствами в сети
 */

// Типы соединений
export const CONNECTION_TYPES = {
  PHYSICAL: 'physical',      // Физическое соединение (кабель)
  ROUTING: 'routing',        // Маршрутизация между подсетями
  LOGICAL: 'logical'         // Логическое соединение (VLAN, VPN)
};

// Стили для разных типов соединений
export const CONNECTION_STYLES = {
  physical: {
    strokeDasharray: 'none',
    strokeWidth: 2,
    label: 'Physical'
  },
  routing: {
    strokeDasharray: '5,5',
    strokeWidth: 2,
    label: 'Routing'
  },
  logical: {
    strokeDasharray: '10,5',
    strokeWidth: 2,
    label: 'Logical'
  }
};

// Стили для разных статусов соединений
export const CONNECTION_STATUS_STYLES = {
  active: {
    stroke: '#10b981',      // Зелёный - активное
    opacity: 1
  },
  inactive: {
    stroke: '#ef9a00',      // Оранжевый - неактивное
    opacity: 0.6
  },
  error: {
    stroke: '#ef4444',      // Красный - ошибка
    opacity: 1,
    strokeDasharray: '3,3'  // Добавляем пунктир для ошибок
  }
};

/**
 * Получает полный стиль соединения на основе типа и статуса
 */
export const getConnectionStyle = (connectionType = 'physical', status = 'active') => {
  const typeStyle = CONNECTION_STYLES[connectionType] || CONNECTION_STYLES.physical;
  const statusStyle = CONNECTION_STATUS_STYLES[status] || CONNECTION_STATUS_STYLES.active;
  
  return {
    ...typeStyle,
    stroke: statusStyle.stroke,
    opacity: statusStyle.opacity,
    // Если статус error, объединяем пунктиры
    strokeDasharray: status === 'error' ? statusStyle.strokeDasharray : typeStyle.strokeDasharray
  };
};

/**
 * Преобразует IP адрес и маску в сетевой адрес
 * @param {string} ip - IP адрес (например, 192.168.1.100)
 * @param {string} mask - Маска сети (например, 255.255.255.0)
 * @returns {string} - Сетевой адрес (например, 192.168.1.0)
 */
export const getNetworkAddress = (ip, mask) => {
  if (!ip || !mask) return null;
  
  try {
    const ipParts = ip.split('.').map(Number);
    const maskParts = mask.split('.').map(Number);
    
    const network = ipParts.map((part, i) => part & maskParts[i]);
    return network.join('.');
  } catch (error) {
    console.error('Error calculating network address:', error);
    return null;
  }
};

/**
 * Проверяет совместимость IP адресов
 * @param {string} ip1 - Первый IP адрес
 * @param {string} mask1 - Маска первого адреса
 * @param {string} ip2 - Второй IP адрес
 * @param {string} mask2 - Маска второго адреса
 * @returns {boolean} - true если в одной подсети
 */
export const areIPsCompatible = (ip1, mask1, ip2, mask2) => {
  if (!ip1 || !mask1 || !ip2 || !mask2) return false;
  
  const net1 = getNetworkAddress(ip1, mask1);
  const net2 = getNetworkAddress(ip2, mask2);
  
  return net1 === net2;
};

/**
 * Проверяет можно ли соединить два узла
 * @param {object} sourceNode - Исходный узел
 * @param {object} targetNode - Целевой узел
 * @returns {object} - { allowed: boolean, message: string, suggestedType: string }
 */
export const canConnectNodes = (sourceNode, targetNode) => {
  // Нельзя соединять узел с самим собой
  if (sourceNode.id === targetNode.id) {
    return {
      allowed: false,
      message: 'Cannot connect a node to itself',
      suggestedType: null
    };
  }

  const sourceType = sourceNode.data.type;
  const targetType = targetNode.data.type;

  // Сеть (Network) может соединяться с любым устройством
  if (sourceType === 'network' || targetType === 'network') {
    return {
      allowed: true,
      message: 'Network connection available',
      suggestedType: CONNECTION_TYPES.PHYSICAL
    };
  }

  // Router может быть посредником между разными подсетями
  if (sourceType === 'router' || targetType === 'router') {
    if (sourceType === 'router' && targetType === 'router') {
      return {
        allowed: true,
        message: 'Routing connection between routers',
        suggestedType: CONNECTION_TYPES.ROUTING
      };
    }
    // Router с другим устройством
    return {
      allowed: true,
      message: 'Router can connect to any device',
      suggestedType: CONNECTION_TYPES.PHYSICAL
    };
  }

  // Switch может соединяться с Server и Workstation
  if (sourceType === 'switch' || targetType === 'switch') {
    const otherType = sourceType === 'switch' ? targetType : sourceType;
    if (otherType === 'server' || otherType === 'workstation' || otherType === 'switch') {
      return {
        allowed: true,
        message: 'Physical connection available',
        suggestedType: CONNECTION_TYPES.PHYSICAL
      };
    }
  }

  // Server и Workstation между собой (требуют проверки IP)
  if ((sourceType === 'server' || sourceType === 'workstation') &&
      (targetType === 'server' || targetType === 'workstation')) {
    
    // Проверяем IP совместимость
    const sourceIP = sourceNode.data.ip;
    const sourceMask = sourceNode.data.mask;
    const targetIP = targetNode.data.ip;
    const targetMask = targetNode.data.mask;

    if (sourceIP && sourceMask && targetIP && targetMask) {
      if (areIPsCompatible(sourceIP, sourceMask, targetIP, targetMask)) {
        return {
          allowed: true,
          message: 'Direct connection (same subnet)',
          suggestedType: CONNECTION_TYPES.PHYSICAL
        };
      } else {
        return {
          allowed: false,
          message: 'Different subnets - require router',
          suggestedType: CONNECTION_TYPES.ROUTING
        };
      }
    }
    
    // Если нет IP адресов, разрешаем логическое соединение
    return {
      allowed: true,
      message: 'Logical connection available',
      suggestedType: CONNECTION_TYPES.LOGICAL
    };
  }

  return {
    allowed: false,
    message: 'Connection type not supported',
    suggestedType: null
  };
};

/**
 * Валидирует соединение перед сохранением проекта
 * @param {array} nodes - Массив всех узлов
 * @param {array} edges - Массив всех соединений
 * @returns {object} - { valid: boolean, errors: array }
 */
export const validateConnections = (nodes, edges) => {
  const errors = [];

  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      errors.push(`Edge ${edge.id}: Node not found`);
      return;
    }

    // Проверяем совместимость
    const compatibility = canConnectNodes(sourceNode, targetNode);
    if (!compatibility.allowed) {
      errors.push(`${sourceNode.data.label} → ${targetNode.data.label}: ${compatibility.message}`);
    }

    // Для физических соединений между обычными устройствами проверяем IP
    if (edge.connectionType === CONNECTION_TYPES.PHYSICAL &&
        sourceNode.data.type !== 'network' && targetNode.data.type !== 'network' &&
        sourceNode.data.type !== 'router' && targetNode.data.type !== 'router') {
      
      const sourceIP = sourceNode.data.ip;
      const sourceMask = sourceNode.data.mask;
      const targetIP = targetNode.data.ip;
      const targetMask = targetNode.data.mask;

      if (sourceIP && sourceMask && targetIP && targetMask) {
        if (!areIPsCompatible(sourceIP, sourceMask, targetIP, targetMask)) {
          errors.push(
            `${sourceNode.data.label} (${sourceIP}) → ${targetNode.data.label} (${targetIP}): ` +
            `IPs are in different subnets - should use routing`
          );
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Получает предложенный тип соединения для двух узлов
 * @param {object} sourceNode - Исходный узел
 * @param {object} targetNode - Целевой узел
 * @returns {string} - Тип соединения
 */
export const getSuggestedConnectionType = (sourceNode, targetNode) => {
  const result = canConnectNodes(sourceNode, targetNode);
  return result.suggestedType || CONNECTION_TYPES.LOGICAL;
};

/**
 * Получает информацию об соединении для отображения в UI
 * @param {object} edge - Объект соединения
 * @param {array} nodes - Массив всех узлов
 * @returns {object} - Информация для отображения
 */
export const getEdgeInfo = (edge, nodes) => {
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  return {
    source: sourceNode?.data.label || 'Unknown',
    target: targetNode?.data.label || 'Unknown',
    type: edge.connectionType || CONNECTION_TYPES.PHYSICAL,
    status: edge.data?.status || 'active',
    bandwidth: edge.data?.bandwidth || 'N/A',
    description: edge.data?.description || ''
  };
};
