/**
 * Simple Queue Implementation
 */

export class Queue<T> {
    private items: T[] = [];
    private waiting: Array<(value: T) => void> = [];

    enqueue(item: T): void {
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift()!;
            resolve(item);
        } else {
            this.items.push(item);
        }
    }

    async dequeue(): Promise<T> {
        if (this.items.length > 0) {
            return this.items.shift()!;
        }

        return new Promise<T>((resolve) => {
            this.waiting.push(resolve);
        });
    }

    get size(): number {
        return this.items.length;
    }
}
