// creates a queue object which acts in O(1) time in the long run since the input and removal operation will be O(1) and the operation to pop from inqueue to outqueue is going to be 1

class GachaEventQueue {
    inQueue = [];
    outQueue = [];

    enqueue(input) {
        this.inQueue.push(input);
    }
    dequeue() {
        if (this.outQueue.length === 0) {
            while(this.inQueue.length > 0) {
                this.outQueue.push(this.inQueue.pop());
            }
        }
        return this.outQueue.pop();
    }
    isEmpty() {
        return this.inQueue.length === 0 && this.outQueue.length === 0;
    }
}
