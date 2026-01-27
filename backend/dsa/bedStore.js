// 1. Bed Storage – Hash Table
// Maintain an in-memory bed store using a Hash Table
// Bed ID → bed object
// Allow constant-time lookup and status updates
// This is a BedStore class that manages hospital/facility beds using a Hash Table data structure
// The class provides efficient O(1) operations for bed management:

// Constructor: Initializes an empty Map to store beds
// - The Map uses bed IDs as keys and bed objects as values
class BedStore {
    constructor() {
        this.beds = new Map(); // Hash Table implementation in JS
    }

    // Adds a new bed to the store
    // Parameters: bed object containing bedId and other bed properties
    addBed(bed) {
        this.beds.set(bed.bedId, bed);
    }

    // Retrieves a bed by its ID
    // Parameters: bedId
    // Returns: bed object if found, undefined if not found
    getBed(bedId) {
        return this.beds.get(bedId);
    }

    // Updates the status of a bed
    // Parameters: bedId and new status
    // Returns: true if bed was found and updated, false if bed not found
    updateBedStatus(bedId, status) {
        if (this.beds.has(bedId)) {
            const bed = this.beds.get(bedId);
            bed.status = status;
            this.beds.set(bedId, bed);
            return true;
        }
        return false;
    }

    // Removes a bed from the store
    // Parameters: bedId
    // Returns: true if bed was found and deleted, false if bed not found
    deleteBed(bedId) {
        return this.beds.delete(bedId);
    }

    // Returns array of all beds in the store
    getAllBeds() {
        return Array.from(this.beds.values());
    }

    // Checks if a bed exists in the store
    // Parameters: bedId
    // Returns: true if bed exists, false if not
    hasBed(bedId) {
        return this.beds.has(bedId);
    }
}

// Exports a singleton instance of BedStore
module.exports = new BedStore();
