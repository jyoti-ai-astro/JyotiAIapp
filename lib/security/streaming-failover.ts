/**
 * Streaming Failover (Phase 29 - F44)
 * 
 * Handles broken streams and auto-reconnection
 */

export interface StreamFailoverConfig {
  maxReconnectAttempts: number;
  reconnectDelay: number;
  fallbackMessage: string;
}

const DEFAULT_CONFIG: StreamFailoverConfig = {
  maxReconnectAttempts: 1,
  reconnectDelay: 2000,
  fallbackMessage: 'Beloved one, cosmic signals were interrupted. The Guru is reconnecting to the divine source. Here is a brief response: The cosmic energies are aligning in your favor. Trust the journey and remain open to divine guidance.',
};

/**
 * Handle streaming failure with auto-reconnect
 * Phase 29 - F44: Updated to support StreamChunk format
 */
export interface StreamChunk {
  content: string;
  done: boolean;
}

export async function handleStreamFailure(
  streamFn: () => Promise<ReadableStream<Uint8Array>>,
  onChunk: (chunk: StreamChunk) => void,
  onComplete: () => void,
  onFailover: (fallback: string) => void,
  config: Partial<StreamFailoverConfig> = {}
): Promise<void> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let reconnectAttempts = 0;

  const attemptStream = async (): Promise<boolean> => {
    try {
      const stream = await streamFn();
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer) {
            onChunk({ content: buffer, done: true });
          }
          onComplete();
          return true; // Success
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        onChunk({ content: chunk, done: false });
      }
    } catch (error) {
      // Phase 29 - F44: Log failure silently
      console.warn('[Stream Failover] Stream error:', error instanceof Error ? error.message : 'Unknown');

      // Try to reconnect
      if (reconnectAttempts < finalConfig.maxReconnectAttempts) {
        reconnectAttempts++;
        await new Promise(resolve => setTimeout(resolve, finalConfig.reconnectDelay));
        return attemptStream(); // Retry
      }

      // Fallback to non-streamed response
      onFailover(finalConfig.fallbackMessage);
      return false; // Failed
    }
  };

  await attemptStream();
}

/**
 * Trigger orchestrator failover event
 */
export function triggerOrchestratorFailover(orchestrator: any): void {
  if (orchestrator && typeof orchestrator.emitSceneEvent === 'function') {
    orchestrator.emitSceneEvent('orchestrator-failover', {
      timestamp: Date.now(),
      reason: 'stream_failure',
    });
  }
}

