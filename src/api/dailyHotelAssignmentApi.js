import axiosClient from "./axiosClient";

// Get all assignments for a specific date
// export const getAssignmentsByDate = (date) => {
//     return axiosClient.get( `/DailyHotelAssignment/date/${date}`
//     );
// };
// Employee hotel assignments by date
export const getAssignmentsByDate = async (date) => {
    const response = await axiosClient.get(
        `/DailyHotelAssignment/date/${date}`
    );
    return response.data;
};


// Get assignments for a specific employee on a specific date
export const getAssignmentByEmployeeAndDate = (
    employeeId,date) => {
    return axiosClient.get(
        `${API_URL}/employee/${employeeId}/date/${date}`
    );
};


// Create employee daily hotel assignment
export const createAssignment = (payload) =>
    axiosClient.post("/DailyHotelAssignment", payload);

// Create vendor daily hotel assignment
//export const createVendorAssignment = (payload) =>
  //  axiosClient.post("/DailyHotelAssignment/vendor", payload);

export const createVendorAssignment = (payload) => 
    { return axiosClient.post( "/DailyHotelAssignment/vendor", payload ); };

// Update an existing assignment
export const updateAssignment = (
    assignmentId,
    assignment
) => {
    return axiosClient.put(
        `${API_URL}/${assignmentId}`,
        assignment
    );
};

// Delete an assignment
export const deleteAssignment = (assignmentId) => {
    return axiosClient.delete(
        `${API_URL}/${assignmentId}`
    );
};

// // Get vendors by assignment date
// export const getVendorsByDate = (date) => {
//     return axiosClient.get(`/DailyVendorAssignment/date/${date}`);
// };
// Vendor hotel assignments by date
// Get vendor assignments by date using the new endpoint 
export const getVendorsByDate = (date) => { 
    return axiosClient.get( `/DailyHotelAssignment/${encodeURIComponent(date)}` ); 

};