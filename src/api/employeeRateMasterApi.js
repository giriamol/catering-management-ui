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

export const getEmployeeRateMasterById = async (
    employeeRateHistoryId
) => {

    console.log(
        "GET EmployeeRateHistory BY ID:",
        employeeRateHistoryId
    );

    const historyId = Number(employeeRateHistoryId);

    try {
        return await axiosClient.get(`/EmployeeRateHistory/${historyId}`);
    } catch (historyError) {
        if (
            historyError.response?.status !== 404 &&
            historyError.response?.status !== 405
        ) {
            throw historyError;
        }

        // Compatibility fallback for deployments that do not expose
        // GET /EmployeeRateHistory/{id}. Find the exact record from the
        // paged employee-rate list instead of calling an employee route.
        const pagedResponse = await axiosClient.get("/EmployeeRateHistory", {
            params: { pageNumber: 1, pageSize: 2000 }
        });

        let payload = pagedResponse.data;
        if (payload?.data) payload = payload.data;
        if (payload?.result) payload = payload.result;

        const records = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.items)
                ? payload.items
                : [];

        const record = records.find((item) => {
            const itemHistoryId =
                item?.employeeRateHistoryId ??
                item?.EmployeeRateHistoryId ??
                item?.employeeRateHistoryID ??
                item?.EmployeeRateHistoryID ??
                item?.rateMasterId ??
                item?.RateMasterId ??
                item?.id ??
                item?.Id;

            return Number(itemHistoryId) === historyId;
        });

        if (!record) {
            throw historyError;
        }

        return { ...pagedResponse, data: record };
    }
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