/**
 * Priority Queue
 * Routes high-priority messages first
 */

interface PriorityItem<T> {
    item: T;
    priority: number;
}

export class PriorityQueue<T> {
    private items: PriorityItem<T>[] = [];
    private waiting: Array<(value: T) => void> = [];

    /**
     * Enqueue with priority (higher number = higher priority)
     */
    enqueue(item: T, priority: number = 0): void {
        const priorityItem = { item, priority };

        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift()!;
            resolve(item);
        } else {
            // Insert in priority order
            let inserted = false;
            for (let i = 0; i < this.items.length; i++) {
                if (priority > this.items[i]!.priority) {
                    this.items.splice(i, 0, priorityItem);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                this.items.push(priorityItem);
            }
        }
    }

    /**
     * Dequeue (returns highest priority item)
     */
    async dequeue(): Promise<T> {
        if (this.items.length > 0) {
            return this.items.shift()!.item;
        }

        return new Promise<T>((resolve) => {
            this.waiting.push(resolve);
        });
    }

    get size(): number {
        return this.items.length;
    }
}
