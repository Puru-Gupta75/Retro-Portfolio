// Random error generator for 404 system anomaly
export interface SystemError {
  type: string;
  traceId: string;
  status: string;
  message: string;
  timestamp: number;
}

const ERROR_TYPES = [
  'NODE_NOT_FOUND',
  'ROUTE_POINTER_NULL',
  'STACK_OVERFLOW',
  'MEMORY_CORRUPTION',
  'KERNEL_PANIC',
  'UNAUTHORIZED_ACCESS',
  'MEMORY_ACCESS_DENIED',
  'SEGMENTATION_FAULT',
  'BUFFER_UNDERRUN',
  'INVALID_OPCODE',
  'THREAD_DEADLOCK',
  'RESOURCE_EXHAUSTED'
];

const ERROR_MESSAGES = [
  'Critical system failure detected',
  'Unable to resolve memory address',
  'Access violation in protected region',
  'Corrupted data structure',
  'Invalid pointer dereference',
  'System integrity compromised',
  'Fatal exception occurred',
  'Unrecoverable error state',
  'Resource allocation failed',
  'Permission denied by kernel'
];

function generateTraceId(): string {
  const chars = '0123456789ABCDEF';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function generateRandomError(): SystemError {
  return {
    type: ERROR_TYPES[Math.floor(Math.random() * ERROR_TYPES.length)],
    traceId: generateTraceId(),
    status: 'FAILURE',
    message: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
    timestamp: Date.now()
  };
}

export function formatErrorDisplay(error: SystemError): string {
  return `
> ERROR_404 _ _ _ _ _

${error.type}
TRACE_ID: ${error.traceId}
STATUS: ${error.status}

${error.message}
  `.trim();
}
