
import axiosClient from "./axiosClient";

const API_URL = "/DailySupplierAssignmentToVendor";

// Add outsourced supplier assignment
export const addSupplierAssignment = (data) => {
    return axiosClient.post(API_URL, data);
};

// Update outsourced supplier assignment
export const updateSupplierAssignment = (id, data) => {
    return axiosClient.put(`${API_URL}/${id}`, data);
};

// Delete outsourced supplier assignment (Soft Delete)
export const deleteSupplierAssignment = (id) => {
    return axiosClient.delete(`${API_URL}/${id}`);
};

// Get all outsourced supplier assignments
export const getAllSupplierAssignments = () => {
    return axiosClient.get(API_URL);
};

// Get outsourced supplier assignment by ID
// export const getSupplierAssignmentById = (id) => {
//     return axiosClient.get(`${API_URL}/${id}`);
// };

// Get outsourced supplier assignments by date
export const getSupplierAssignmentsByDate = (date) => {
    return axiosClient.get(`${API_URL}/${date}`);
};
 

// Get supplier report by VendorId and date range
export const getSupplierByDateRange = (vendorId, fromDate, toDate) => {
    return axiosClient.get(`${API_URL}/getbydate`, {
        params: {
            vendorId,
            fromDate,
            toDate
        }
    });
};

// Get all supplier summary by date range
export const getAllSupplierSummary = (fromDate, toDate) => {
    return axiosClient.get(`${API_URL}/All`, {
        params: {
            fromDate,
            toDate
        }
    });
};