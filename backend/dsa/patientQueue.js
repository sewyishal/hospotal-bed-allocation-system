// 3. Priority Queue – Waiting Patients
// Higher severity first
// If severity is equal, earlier arrival time first

class PatientPriorityQueue {
    constructor() {
        this.heap = [];
    }

    // Helper: Get parent index
    getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }

    // Helper: Get left child index
    getLeftChildIndex(i) {
        return 2 * i + 1;
    }

    // Helper: Get right child index
    getRightChildIndex(i) {
        return 2 * i + 2;
    }

    // Helper: Swap two elements
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Compare logic: Returns true if patient A has higher priority than patient B
    isHigherPriority(patientA, patientB) {
        if (patientA.severity > patientB.severity) return true;
        if (patientA.severity < patientB.severity) return false;
        
        // If severity is equal, check arrival time (earlier is better)
        return new Date(patientA.arrivalTime) < new Date(patientB.arrivalTime);
    }

    enqueue(patient) {
        this.heap.push(patient);
        this.heapifyUp();
    }

    dequeue() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return root;
    }

    peek() {
        if (this.isEmpty()) return null;
        return this.heap[0];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    heapifyUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = this.getParentIndex(index);
            if (this.isHigherPriority(this.heap[index], this.heap[parentIndex])) {
                this.swap(index, parentIndex);
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    heapifyDown(startIndex = 0) {
        let index = startIndex;
        while (this.getLeftChildIndex(index) < this.heap.length) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            let rightChildIndex = this.getRightChildIndex(index);

            if (rightChildIndex < this.heap.length && 
                this.isHigherPriority(this.heap[rightChildIndex], this.heap[smallerChildIndex])) {
                smallerChildIndex = rightChildIndex;
            }

            if (this.isHigherPriority(this.heap[smallerChildIndex], this.heap[index])) {
                this.swap(index, smallerChildIndex);
                index = smallerChildIndex;
            } else {
                break;
            }
        }
    }

    remove(patientId) {
        const index = this.heap.findIndex(p => p.patientId === patientId);
        if (index === -1) return null;

        const removed = this.heap[index];
        const last = this.heap.pop();

        if (index < this.heap.length) {
            this.heap[index] = last;
            this.rebuildHeap(); 
        }
        return removed;
    }

    rebuildHeap() {
        for (let i = Math.floor(this.heap.length / 2); i >= 0; i--) {
            this.heapifyDown(i);
        }
    }

    // For visualization/debugging/searching
    toArray() {
        // Return a copy to avoid mutation
        return [...this.heap];
    }

    size() {
        return this.heap.length;
    }
}

module.exports = new PatientPriorityQueue();
