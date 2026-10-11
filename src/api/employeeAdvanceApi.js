import axiosClient from "./axiosClient";


// ============================================================
// GET ALL
// ============================================================

export const getEmployeeAdvances = () => {
    return axiosClient.get("/EmployeeAdvance");
};


// ============================================================
// GET BY ID
// ============================================================

export const getEmployeeAdvanceById = (id) => {
    return axiosClient.get(
        `/EmployeeAdvance/${id}`
    );
};


// ============================================================
// CREATE
// ============================================================

export const createEmployeeAdvance = (data) => {
    return axiosClient.post(
        "/EmployeeAdvance",
        data
    );
};


// ============================================================
// UPDATE
// ============================================================

export const updateEmployeeAdvance = (
    id,
    data
) => {
    return axiosClient.put(
        `/EmployeeAdvance/${id}`,
        data
    );
};


// ============================================================
// DELETE
// ============================================================

export const deleteEmployeeAdvance = (id) => {
    return axiosClient.delete(
        `/EmployeeAdvance/${id}`
    );
};