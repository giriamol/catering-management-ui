
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../CSS/EmployeeRateMaster.css";

import {
    getAllEmployeeRateMasters,
    deleteEmployeeRateMaster
} from "../api/employeeRateMasterApi";

const PAGE_SIZE = 20;

// Format date as DD/MM/YYYY
const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const value = String(dateValue).trim();

    // Already formatted as DD/MM/YYYY
    const displayMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (displayMatch) {
        return value;
    }

    // ISO date: 2026-11-06T00:00:00
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoMatch) {
        return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${day}/${month}/${date.getFullYear()}`;
};

// Get employee rate history ID
const getRateHistoryId = (employee) => {
    return (
        employee?.employeeRateHistoryId ??
        employee?.EmployeeRateHistoryId ??
        employee?.employeeRateHistoryID ??
        employee?.EmployeeRateHistoryID ??
        employee?.id ??
        employee?.Id
    );
};

// Get employee ID
const getEmployeeId = (employee) => {
    return (
        employee?.employeeId ??
        employee?.EmployeeId ??
        employee?.fkEmployeeId ??
        employee?.FkEmployeeId
    );
};

// Get employee name directly from API response
const getEmployeeName = (employee) => {
    return (
        employee?.employeeName ??
        employee?.EmployeeName ??
        employee?.fullName ??
        employee?.FullName ??
        "-"
    );
};

const EmployeeRateMaster = () => {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [searchText, setSearchText] = useState("");

    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [pageNumber, setPageNumber] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isServerPaged, setIsServerPaged] = useState(false);

    const [popup, setPopup] = useState(null);

    // Load employee rate records
    useEffect(() => {
        loadRateRecords();
    }, [pageNumber]);

    const loadRateRecords = async () => {
        try {
            setLoading(true);

            const response = await getAllEmployeeRateMasters();

            const data = response?.data;

            console.log("Employee Rate API Response:", data);

            let records = [];
            let serverPagination = false;
            let recordsCount = 0;
            let pagesCount = 0;

            // Case 1: API returns a direct array
            // Example: [{ employeeRateHistoryId: 10041, ... }]
            if (Array.isArray(data)) {
                records = data;

                serverPagination = false;
                recordsCount = records.length;
                pagesCount = Math.ceil(recordsCount / PAGE_SIZE);
            }

            // Case 2: API returns { items: [], totalRecords: 100 }
            else if (Array.isArray(data?.items)) {
                records = data.items;

                serverPagination = true;

                recordsCount = Number(
                    data.totalRecords ?? records.length
                );

                pagesCount = Number(
                    data.totalPages ??
                    Math.ceil(recordsCount / PAGE_SIZE)
                );
            }

            // Case 3: API returns { data: { items: [] } }
            else if (Array.isArray(data?.data?.items)) {
                records = data.data.items;

                serverPagination = true;

                recordsCount = Number(
                    data.data.totalRecords ?? records.length
                );

                pagesCount = Number(
                    data.data.totalPages ??
                    Math.ceil(recordsCount / PAGE_SIZE)
                );
            }

            // Case 4: API returns { data: [] }
            else if (Array.isArray(data?.data)) {
                records = data.data;

                serverPagination = false;
                recordsCount = records.length;
                pagesCount = Math.ceil(recordsCount / PAGE_SIZE);
            }

            // Case 5: API returns { result: [] }
            else if (Array.isArray(data?.result)) {
                records = data.result;

                serverPagination = false;
                recordsCount = records.length;
                pagesCount = Math.ceil(recordsCount / PAGE_SIZE);
            }

            console.log("Extracted Employee Rate Records:", records);
            console.log("Total Records:", recordsCount);

            setEmployees(records);
            setIsServerPaged(serverPagination);

            setTotalRecords(recordsCount);
            setTotalPages(pagesCount);

        } catch (error) {
            console.error(
                "Error fetching employee rate records:",
                error.response?.data || error
            );

            setEmployees([]);
            setTotalRecords(0);
            setTotalPages(0);

        } finally {
            setLoading(false);
        }
    };

    // Search records
    const filteredEmployees = useMemo(() => {
        const search = searchText.trim().toLowerCase();

        if (!search) {
            return employees;
        }

        return employees.filter((employee) => {
            const employeeName = String(
                getEmployeeName(employee)
            ).toLowerCase();

            const employeeId = String(
                getEmployeeId(employee) ?? ""
            ).toLowerCase();

            return (
                employeeName.includes(search) ||
                employeeId.includes(search)
            );
        });
    }, [employees, searchText]);

    // Client-side pagination is used when API returns a direct array.
    // Server-side pagination is used when API returns paginated data.
    const displayedEmployees = useMemo(() => {
        if (isServerPaged) {
            return filteredEmployees;
        }

        const startIndex = (pageNumber - 1) * PAGE_SIZE;

        return filteredEmployees.slice(
            startIndex,
            startIndex + PAGE_SIZE
        );
    }, [filteredEmployees, isServerPaged, pageNumber]);

    // Total count for the current search
    const currentTotalRecords = isServerPaged
        ? totalRecords
        : filteredEmployees.length;

    const currentTotalPages = isServerPaged
        ? totalPages
        : Math.ceil(currentTotalRecords / PAGE_SIZE);

    // Add employee rate
    const handleAdd = () => {
        navigate("/RateMasters/employeerate/add");
    };

    // Search
    const handleSearch = (value) => {
        setSearchText(value);
        setPageNumber(1);
    };

    // Edit employee rate
    const handleEdit = (rateMasterId, selectedRecord) => {
        if (!rateMasterId) {
            alert("Employee rate history ID not found.");
            return;
        }

        navigate(
            `/RateMasters/employeerate/edit/${rateMasterId}`,
            {
                state: {
                    rateRecord: selectedRecord
                }
            }
        );
    };

    // Delete employee rate
    const handleDelete = async (rateMasterId) => {
        if (!rateMasterId) {
            alert("Employee rate history ID not found.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete employee rate record ${rateMasterId}?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(rateMasterId);

            await deleteEmployeeRateMaster(rateMasterId);

            alert("Employee rate deleted successfully.");

            await loadRateRecords();

        } catch (error) {
            console.error(
                "Error deleting employee rate:",
                error.response?.data || error
            );

            alert("Unable to delete employee rate record.");

        } finally {
            setDeletingId(null);
        }
    };

    // Pagination
    const handleFirst = () => {
        setPageNumber(1);
    };

    const handlePrevious = () => {
        setPageNumber((previous) => Math.max(previous - 1, 1));
    };

    const handleNext = () => {
        setPageNumber((previous) =>
            Math.min(previous + 1, currentTotalPages)
        );
    };

    const handleLast = () => {
        setPageNumber(currentTotalPages);
    };

    const handlePageChange = (page) => {
        setPageNumber(page);
    };

    // Display maximum 5 page buttons
    const getPageNumbers = () => {
        const visiblePages = 5;

        let start = Math.max(1, pageNumber - 2);

        let end = Math.min(
            currentTotalPages,
            start + visiblePages - 1
        );

        if (end - start + 1 < visiblePages) {
            start = Math.max(1, end - visiblePages + 1);
        }

        return Array.from(
            { length: Math.max(0, end - start + 1) },
            (_, index) => start + index
        );
    };

    // Calculate displayed record numbers
    const startRecord =
        currentTotalRecords === 0
            ? 0
            : (pageNumber - 1) * PAGE_SIZE + 1;

    const endRecord = isServerPaged
        ? Math.min(pageNumber * PAGE_SIZE, currentTotalRecords)
        : Math.min(
            pageNumber * PAGE_SIZE,
            currentTotalRecords
        );

    return (
        <div className="employee-rate-page">

            {/* Header */}
            <div className="employee-rate-header">

                <div>
                    <h2>Employee Rate Master List</h2>

                    <p>
                        Employees added to Rate Master
                    </p>
                </div>

                <div className="employee-rate-header-actions">

                    {/* Search */}
                    <div className="employee-rate-search">

                        <input
                            type="text"
                            placeholder="Search employee by name or ID..."
                            value={searchText}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
                        />

                    </div>

                    {/* Add Button */}
                    <button
                        type="button"
                        className="add-btn"
                        onClick={handleAdd}
                    >
                        + Add Employee Rate
                    </button>

                </div>

            </div>

            {/* Table */}
            {loading ? (

                <div className="loading-message">
                    Loading employee rate records...
                </div>

            ) : (

                <>

                    <div className="employee-rate-table-container">

                        <table className="employee-rate-table">

                            <thead>

                                <tr>
                                    <th>Sr.No</th>
                                    <th>Employee Name</th>
                                    <th>Half Day Shift</th>
                                    <th>Half Day Rate</th>
                                    <th>Full Day Shift</th>
                                    <th>Full Day Rate</th>
                                    <th>From Date</th>
                                    <th>To Date</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {displayedEmployees.length === 0 ? (

                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="no-data"
                                        >
                                            No employee rate records found.
                                        </td>
                                    </tr>

                                ) : (

                                    displayedEmployees.map(
                                        (employee, index) => {

                                            const rateMasterId =
                                                getRateHistoryId(employee);

                                            const employeeId =
                                                getEmployeeId(employee);

                                            return (

                                                <tr
                                                    key={
                                                        rateMasterId ??
                                                        `${employeeId}-${index}`
                                                    }
                                                >

                                                    {/* Sr.No */}
                                                    <td>
                                                        {(pageNumber - 1) *
                                                            PAGE_SIZE +
                                                            index +
                                                            1}
                                                    </td>

                                                    {/* Employee Name */}
                                                    <td>
                                                        {getEmployeeName(employee)}
                                                    </td>

                                                    {/* Half Day Shift ID */}
                                                    <td>
                                                        {employee?.halfDShiftId ??
                                                            employee?.HalfDShiftId ??
                                                            "-"}
                                                    </td>

                                                    {/* Half Day Rate */}
                                                    <td>
                                                        {employee?.halfDayRate ??
                                                            employee?.HalfDayRate ??
                                                            "-"}
                                                    </td>

                                                    {/* Full Day Shift ID */}
                                                    <td>
                                                        {employee?.fullDShiftId ??
                                                            employee?.FullDShiftId ??
                                                            "-"}
                                                    </td>

                                                    {/* Full Day Rate */}
                                                    <td>
                                                        {employee?.fullDayRate ??
                                                            employee?.FullDayRate ??
                                                            "-"}
                                                    </td>

                                                    {/* From Date */}
                                                    <td>
                                                        {formatDate(
                                                            employee?.effectiveFrom ??
                                                            employee?.EffectiveFrom ??
                                                            employee?.fromDate ??
                                                            employee?.FromDate
                                                        )}
                                                    </td>

                                                    {/* To Date */}
                                                    <td>
                                                        {formatDate(
                                                            employee?.effectiveTo ??
                                                            employee?.EffectiveTo ??
                                                            employee?.toDate ??
                                                            employee?.ToDate
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td>

                                                        <div className="employee-rate-row-actions">

                                                            <button
                                                                type="button"
                                                                className="edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        rateMasterId,
                                                                        employee
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        rateMasterId
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    rateMasterId
                                                                }
                                                            >
                                                                {deletingId ===
                                                                rateMasterId
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* Pagination */}
                    <div className="employee-rate-pagination">

                        <span>
                            Showing {startRecord} - {endRecord} of{" "}
                            {currentTotalRecords} records
                        </span>

                        <div className="pagination-buttons">

                            <button
                                type="button"
                                disabled={pageNumber <= 1}
                                onClick={handleFirst}
                            >
                                First
                            </button>

                            <button
                                type="button"
                                disabled={pageNumber <= 1}
                                onClick={handlePrevious}
                            >
                                Previous
                            </button>

                            {getPageNumbers().map((page) => (

                                <button
                                    type="button"
                                    key={page}
                                    className={
                                        page === pageNumber
                                            ? "active-page"
                                            : ""
                                    }
                                    onClick={() =>
                                        handlePageChange(page)
                                    }
                                >
                                    {page}
                                </button>

                            ))}

                            <button
                                type="button"
                                disabled={
                                    currentTotalPages === 0 ||
                                    pageNumber >= currentTotalPages
                                }
                                onClick={handleNext}
                            >
                                Next
                            </button>

                            <button
                                type="button"
                                disabled={
                                    currentTotalPages === 0 ||
                                    pageNumber >= currentTotalPages
                                }
                                onClick={handleLast}
                            >
                                Last
                            </button>

                        </div>

                        <span>
                            Page{" "}
                            {currentTotalPages === 0 ? 0 : pageNumber}
                            {" "}of {currentTotalPages}
                        </span>

                    </div>

                </>

            )}

        </div>
    );
};

export default EmployeeRateMaster;
