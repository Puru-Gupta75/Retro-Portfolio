import { safetyLogger } from './logger';

/**
 * errorHandler
 * Global wrapper to catch, log, and classify system failures.
 */
export const errorHandler = {
  /**
   * Wraps an async function with safety logging.
   * Ensures no silent failures.
   */
  async wrap<T>(
    operation: () => Promise<T>,
    contextName: string,
    fallback?: T
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      await safetyLogger.error(`FAILURE IN [${contextName}]: ${error.message}`, {
        stack: error.stack,
        context: contextName
      });
      
      if (fallback !== undefined) return fallback;
      throw error;
    }
  }
};
