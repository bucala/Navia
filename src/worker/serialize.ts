/**
 * Runs async operations one at a time per instance. Durable Object handlers
 * re-enter at every await, so mutations that span storage or D1 I/O must hold
 * this mutex to keep reads and writes interleaving-free.
 */
export class SerialExecutor {
  private queue: Promise<void> = Promise.resolve();

  async run<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.queue;
    let release = () => {};
    this.queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}
