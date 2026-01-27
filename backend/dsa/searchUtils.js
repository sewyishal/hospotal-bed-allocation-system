// 4. Searching Algorithms
// Use linear search for unsorted data

class SearchUtils {
    /**
     * Linear Search to find beds by specific criteria
     * @param {Array} beds - Array of bed objects
     * @param {Object} criteria - Key-value pair to match (e.g., { wardNumber: '101' })
     * @returns {Array} - List of matching beds
     */
    static searchBeds(beds, criteria) {
        const results = [];
        for (const bed of beds) {
            let match = true;
            for (const key in criteria) {
                if (bed[key] != criteria[key]) { // Loose equality for potential string/number mix
                    match = false;
                    break;
                }
            }
            if (match) {
                results.push(bed);
            }
        }
        return results;
    }

    /**
     * Linear Search to find a patient in the queue
     * @param {Array} queue - Array representation of the queue
     * @param {String} patientId 
     * @returns {Object|null}
     */
    static findPatientById(queue, patientId) {
        for (const patient of queue) {
            if (patient.patientId === patientId) {
                return patient;
            }
        }
        return null;
    }
}

module.exports = SearchUtils;
