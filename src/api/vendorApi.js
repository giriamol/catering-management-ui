import axiosClient from "./axiosClient";

export const getVendors = (pageNumber = 1, pageSize = 0) => {
    return axiosClient.get("/Vendors", {
        params: {
            pageNumber,
            pageSize
        }
    });
};


export const createVendor = (vendor) => {
    return axiosClient.post("/Vendors", vendor);
};

export const getVendorById = (id) => {
    return axiosClient.get(`/Vendors/${id}`);
};

export const updateVendor = (id, vendor) => {
    return axiosClient.put(`/Vendors/${id}`, vendor);
};

export const deleteVendor = (id) => {
    return axiosClient.delete(`/Vendors/${id}`);
};