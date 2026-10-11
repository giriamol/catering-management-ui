
import axiosClient from "./axiosClient";

export const getAllEmployeeRateMasters = () => {
    return axiosClient.get("/EmployeeRateHistory/all");
};


// =========================================================
// GET PAGED RATE RECORDS
// =========================================================

export const getEmployeeRateMastersPaged = (
    pageNumber = 1,
    pageSize = 20
) => {
    return axiosClient.get(
        "/EmployeeRateHistory",
        {
            params: {
                pageNumber,
                pageSize
            }
        }
    );
};


// =========================================================
// GET RATE RECORDS BY EMPLOYEE
// This endpoint is NOT used for Edit by ID.
// =========================================================

export const getEmployeeRateMasters = (
    employeeId
) => {
    return axiosClient.get(
        `/EmployeeRateHistory/employee/${employeeId}`
    );
};


// =========================================================
// GET ONE RATE RECORD BY EmployeeRateHistoryId
//
// Example:
// GET /api/EmployeeRateHistory/10
//
// Here "10" = EmployeeRateHistoryId
// NOT EmployeeId
// =========================================================

export const getEmployeeRateMasterById = (
    employeeRateHistoryId
) => {

    console.log(
        "GET EmployeeRateHistory BY ID:",
        employeeRateHistoryId
    );

    return axiosClient.get(
        `/EmployeeRateHistory/employee/${employeeRateHistoryId}`
    );
};


// =========================================================
// CREATE
// =========================================================

export const createEmployeeRateMaster = (
    rateMaster
) => {

    return axiosClient.post(
        "/EmployeeRateHistory",
        rateMaster
    );
};


// =========================================================
// UPDATE
// =========================================================

export const updateEmployeeRateMaster = (
    employeeRateHistoryId,
    rateMaster
) => {

    console.log(
        "UPDATE EmployeeRateHistory ID:",
        employeeRateHistoryId
    );

    console.log(
        "UPDATE DATA:",
        rateMaster
    );

    return axiosClient.put(
        `/EmployeeRateHistory/${employeeRateHistoryId}`,
        rateMaster
    );
};


// =========================================================
// DELETE
// =========================================================

export const deleteEmployeeRateMaster = (
    employeeRateHistoryId
) => {

    return axiosClient.delete(
        `/EmployeeRateHistory/${employeeRateHistoryId}`
    );
};