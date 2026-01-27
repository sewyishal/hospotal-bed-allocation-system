# Hospital Bed Allocation System - Testing Guide

This guide outlines how to manually test the system to verify the **DSA components** (Hash Table, Priority Queue, Greedy Algorithm) are working correctly together with the REST API.

## Prerequisites
1. Ensure MongoDB is running.
2. Start the server:
   ```bash
   node backend/index.js
   ```

---

## Trivial Test Scenarios

### 1. **Greedy Allocation Test (Immediate Assignment)**
*Goal: Verify `GreedyAllocator` finds a bed immediately.*

1. **Add a Bed** (Make sure it's free)
   *   **POST** `http://localhost:5000/api/beds`
   *   **Body:**
       ```json
       {
           "bedId": "B-101",
           "wardNumber": "101",
           "type": "GENERAL"
       }
       ```
2. **Register a Patient** (Matching Ward)
   *   **POST** `http://localhost:5000/api/patients/register`
   *   **Body:**
       ```json
       {
           "patientId": "P-001",
           "name": "John Doe",
           "severity": 5,
           "requiredWard": "101"
       }
       ```
3. **Verify Result:**
   *   Response should contain `"action": "ADMITTED"`.
   *   `assignedBedId` should be `"B-101"`.

---

### 2. **Priority Queue Logic Test (The Heap Property)**
*Goal: Verify `PatientPriorityQueue` (Max Heap) correctly orders patients by Severity > Arrival Time.*

1. **Ensure No Beds are Available** (Or register enough dummy patients to fill them).

2. **Register Low Priority Patient**
   *   **POST** `http://localhost:5000/api/patients/register`
   *   **Body:** `{"patientId": "P-Low", "severity": 1, "requiredWard": "101", "name": "Low Sev"}`
   *   **Result:** `QUEUED`

3. **Register High Priority Patient**
   *   **POST** `http://localhost:5000/api/patients/register`
   *   **Body:** `{"patientId": "P-High", "severity": 10, "requiredWard": "101", "name": "High Sev"}`
   *   **Result:** `QUEUED`

4. **Register Medium Priority Patient**
   *   **POST** `http://localhost:5000/api/patients/register`
   *   **Body:** `{"patientId": "P-Mid", "severity": 5, "requiredWard": "101", "name": "Mid Sev"}`
   *   **Result:** `QUEUED`

5. **Check Queue Order**
   *   **GET** `http://localhost:5000/api/patients/queue`
   *   **Expected Order:** `P-High` (10) -> `P-Mid` (5) -> `P-Low` (1).
   *   *Note: This proves that even though P-High arrived later, they jumped to the front.*

---

### 3. **Automatic Allocation Test (Bed Release)**
*Goal: Verify releasing a bed triggers the prompt assignment to the highest priority waiting patient.*

1. **Setup:** Ensure the Queue has patients (from Test 2) and `B-101` is Occupied (from Test 1).

2. **Release Bed B-101**
   *   **PATCH** `http://localhost:5000/api/beds/B-101/status`
   *   **Body:**
       ```json
       {
           "status": "FREE"
       }
       ```

3. **Verify Response:**
   *   The response should explicitly state: `"Bed released and immediately re-assigned to waiting patient"`.
   *   The `allocatedPatient` in the response should be **P-High** (Severity 10).

4. **Verify Queue State:**
   *   **GET** `http://localhost:5000/api/patients/queue`
   *   **P-High** should be gone.
   *   **P-Mid** should be at the top now.

---

### 4. **Persistence & Recovery Test**
*Goal: Verify DSA structures rebuild themselves from MongoDB on restart.*

1. Stop the Node server (Ctrl+C).
2. Start the Node server again.
3. Check Server Logs:
   *   You should see `Loaded X beds...` and `Loaded Y patients...`.
4. **GET** `http://localhost:5000/api/patients/queue`
   *   The queue should still contain the remaining patients in the correct order.
