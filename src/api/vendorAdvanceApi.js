import axiosClient from "./axiosClient";

// ============================================================
// GET ALL
// ============================================================

export const getVendorAdvances = () => {
    return axiosClient.get("/VendorAdvance");
};


// ============================================================
// GET BY ID
// ============================================================

export const getVendorAdvanceById = (id) => {
    return axiosClient.get(
        `/VendorAdvance/${id}`
    );
};


// ============================================================
// CREATE
// ============================================================

export const createVendorAdvance = (data) => {
    return axiosClient.post(
        "/VendorAdvance",
        data
    );
};


// ============================================================
// UPDATE
// ============================================================

export const updateVendorAdvance = (
    id,
    data
) => {
    return axiosClient.put(
        `/VendorAdvance/${id}`,
        data
    );
};


// ============================================================
// DELETE
// ============================================================

export const deleteVendorAdvance = (id) => {
    return axiosClient.delete(
        `/VendorAdvance/${id}`
    );
};
