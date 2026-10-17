import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/EmployeeRateMaster.css";

import { getEmployeeRateMastersPaged } from "../api/employeeRateMasterApi";
import { getEmployees } from "../api/employeeApi";

// Formats API date values as DD/MM/YYYY without timezone conversion.
// Supports yyyy-MM-dd, ISO datetime, and dd/MM/yyyy.
const formatDate = (dateValue) => {
    if (
        dateValue === null ||
        dateValue === undefined ||
        String(dateValue).trim() === ""
    ) {
        return "-";
    }

    const value = String(dateValue).trim();

    // Already formatted as DD/MM/YYYY.
    const displayMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (displayMatch) {
        return value;
    }

    // ISO date or ISO datetime, e.g. 2026-10-12 or 2026-10-12T00:00:00.
    // Use the date portion only to avoid timezone shifting the calendar day.
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }

    // Fallback for other parseable date formats.
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();

    return `${day}/${month}/${year}`;
};

const EmployeeRateMaster = () => {
    const navigate = useNavigate();

    // Rate Master records
    const [employees, setEmployees] = useState([]);

    // Employee master list
    const [employeeList, setEmployeeList] = useState([]);

    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);

    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(20);

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        loadRateRecords();
    }, [pageNumber, pageSize]);

    const loadEmployees = async () => {
        try {
            const response = await getEmployees(1, 2000);
            const data = response.data;

            let employeeData = [];

            if (Array.isArray(data)) {
                employeeData = data;
            } else if (Array.isArray(data?.items)) {
                employeeData = data.items;
            } else if (Array.isArray(data?.data)) {
                employeeData = data.data;
            } else if (Array.isArray(data?.employees)) {
                employeeData = data.employees;
            } else if (Array.isArray(data?.result)) {
                employeeData = data.result;
            } else if (Array.isArray(data?.data?.items)) {
                employeeData = data.data.items;
            }

            setEmployeeList(employeeData);
        } catch (error) {
            console.error(
                "Error loading employees:",
                error.response?.data || error
            );
            setEmployeeList([]);
        }
    };

    const loadRateRecords = async () => {
        try {
            setLoading(true);

            const response = await getEmployeeRateMastersPaged(
                pageNumber,
                pageSize
            );

            const data = response.data;

            console.log("Rate Master API response:", data);

            setEmployees(Array.isArray(data?.items) ? data.items : []);
            setTotalRecords(Number(data?.totalRecords) || 0);
            setTotalPages(Number(data?.totalPages) || 0);
        } catch (error) {
            console.error(
                "Error fetching Rate Master records:",
                error.response?.data || error
            );

            setEmployees([]);
            setTotalRecords(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    const getEmployeeName = (employeeId) => {
        if (
            employeeId === null ||
            employeeId === undefined ||
            employeeId === ""
        ) {
            return "-";
        }

        const employee = employeeList.find((item) => {
            const id =
                item?.employeeId ??
                item?.EmployeeId ??
                item?.id ??
                item?.Id;

            return Number(id) === Number(employeeId);
        });

        if (!employee) {
            return "-";
        }

        return (
            employee?.fullName ??
            employee?.FullName ??
            employee?.employeeName ??
            employee?.EmployeeName ??
            employee?.name ??
            employee?.Name ??
            "-"
        );
    };

    const handleAdd = () => {
        navigate("/RateMasters/employeerate/add");
    };

    const handleEdit = (rateMasterId) => {
        if (
            rateMasterId === null ||
            rateMasterId === undefined ||
            rateMasterId === ""
        ) {
            alert("Employee rate history ID not found.");
            return;
        }

        navigate(`/RateMasters/employeerate/edit/${rateMasterId}`);
    };

    const filteredEmployees = employees.filter((employee) => {
        const employeeId =
            employee?.employeeId ??
            employee?.EmployeeId ??
            employee?.fkEmployeeId ??
            employee?.FkEmployeeId ??
            "";

        const employeeName = getEmployeeName(employeeId).toLowerCase();
        const search = searchText.trim().toLowerCase();

        return (
            employeeName.includes(search) ||
            String(employeeId).toLowerCase().includes(search)
        );
    });

    return (
        <div className="employee-rate-page">
            <div className="employee-rate-header">
                <div>
                    <h2>Employee Rate Master List</h2>
                    <p>Employees added to Rate Master</p>
                </div>

                <button
                    type="button"
                    className="add-rate-btn"
                    onClick={handleAdd}
                >
                    + Add Employee Rate
                </button>
            </div>

            <div className="employee-rate-search">
                <input
                    type="text"
                    placeholder="Search employee by name or ID..."
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setPageNumber(1);
                    }}
                />
            </div>

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
                                    <th>Employee</th>
                                    <th>Half Day Rate</th>
                                    <th>Full Day Rate</th>
                                    <th>Two Half Day Rate</th>
                                    <th>From Date</th>
                                    <th>To Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredEmployees.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="no-data">
                                            No employee rate records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEmployees.map((employee, index) => {
                                        const rateMasterId =
                                            employee?.employeeRateHistoryId ??
                                            employee?.employeeRateHistoryID ??
                                            employee?.rateMasterId ??
                                            employee?.id;

                                        const employeeId =
                                            employee?.employeeId ??
                                            employee?.EmployeeId ??
                                            employee?.fkEmployeeId ??
                                            employee?.FkEmployeeId;

                                        return (
                                            <tr key={rateMasterId ?? `${employeeId}-${index}`}>
                                                <td>
                                                    {(pageNumber - 1) * pageSize +
                                                        index +
                                                        1}
                                                </td>

                                                <td>{getEmployeeName(employeeId)}</td>

                                                <td>{employee?.halfDayRate ?? "-"}</td>

                                                <td>{employee?.fullDayRate ?? "-"}</td>

                                                <td>{employee?.twoHalfDayRate ?? "-"}</td>

                                                <td>
                                                    {formatDate(
                                                        employee?.effectiveFrom ??
                                                        employee?.fromDate ??
                                                        employee?.EffectiveFrom ??
                                                        employee?.FromDate
                                                    )}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        employee?.effectiveTo ??
                                                        employee?.toDate ??
                                                        employee?.EffectiveTo ??
                                                        employee?.ToDate
                                                    )}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="edit-rate-btn"
                                                        onClick={() =>
                                                            handleEdit(rateMasterId)
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="employee-rate-pagination">
                        <span>Total Records: {totalRecords}</span>

                        <button
                            type="button"
                            disabled={pageNumber <= 1 || loading}
                            onClick={() =>
                                setPageNumber((previous) => previous - 1)
                            }
                        >
                            Previous
                        </button>

                        <span>
                            Page {pageNumber} of {Math.max(totalPages, 1)}
                        </span>

                        <button
                            type="button"
                            disabled={
                                totalPages === 0 ||
                                pageNumber >= totalPages ||
                                loading
                            }
                            onClick={() =>
                                setPageNumber((previous) => previous + 1)
                            }
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default EmployeeRateMaster;
