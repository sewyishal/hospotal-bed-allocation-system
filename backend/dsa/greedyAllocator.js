// 2. Greedy Algorithm – Bed Assignment
// Choose the nearest suitable bed to the patient’s required ward
// Make an immediate decision without backtracking

const { BED_STATUS } = require('../utils/constants');

class GreedyAllocator {

    /**
     * Finds the best available bed using a GREEDY Approach.
     * 
     * Strategy:
     * 1. Check Constraint: Bed Type must match Patient Requirement (Type).
     * 2. Greedy Choice: Select the bed with the MINIMUM distance (Ward Number).
     *    - We assume Ward Number contains distance info (e.g. "I101" -> 101).
     *    - We pick the lowest number immediately available.
     * 
     * @param {Array} beds - List of all beds
     * @param {String} requiredType - The Bed Type required (e.g., 'ICU', 'GENERAL')
     * @returns {Object|null}
     */
    static findBestBed(beds, requiredType) {
        let bestBed = null;
        let minDistance = Infinity;

        for (const bed of beds) {
            // Constraint 1: Must be FREE
            if (bed.status !== BED_STATUS.FREE) continue;

            // Constraint 2: Must match Type (e.g. Patient needs ICU -> Bed must be ICU)
            // Note: In our model, 'requiredWard' in Patient maps to 'type' in Bed
            if (bed.type !== requiredType) continue;

            // Greedy Metric: Minimize Distance (Ward Number)
            // Extract numeric part from "I101", "G-200", etc.
            const distance = this.extractDistance(bed.wardNumber);

            // Optimization: If distance is smaller, update our choice
            // If no bed selected yet, take this one (handles cases with no numbers in Ward name)
            if (bestBed === null || distance < minDistance) {
                minDistance = distance;
                bestBed = bed;
            }
        }
        
        return bestBed;
    }

    // Helper to extract the first number found in a string
    static extractDistance(wardStr) {
        const matches = String(wardStr).match(/\d+/);
        if (matches) {
            return parseInt(matches[0], 10);
        }
        return Infinity; // If no number, treat as very far
    }
}

module.exports = GreedyAllocator;
