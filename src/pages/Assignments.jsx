
import React, { useEffect, useMemo, useState } from "react";

import { getAllEmployeeRateMasters } from "../api/employeeRateMasterApi";
import { getHotels } from "../api/hotelApi";
import { getVendors } from "../api/vendorApi";

import {
    createAssignment,
    createVendorAssignment,
} from "../api/dailyHotelAssignmentApi";

import DatePicker from "../components/DatePicker";
import "../CSS/EmployeeHotelAssignment.css";

const getTodayDate = () => {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
};

const normalizeDateForPayload = (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        throw new Error("Please select a valid assignment date.");
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        throw new Error("The selected assignment date is invalid.");
    }

    return value;
};

const formatDateForDisplay = (value) => {
    if (!value) return "Not selected";

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }

    return value;
};

const extractList = (response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;

    const lists = [
        data?.items,
        data?.Items,
        data?.data,
        data?.Data,
        data?.$values,
        data?.vendors,
        data?.Vendors,
        data?.employees,
        data?.Employees,
        data?.hotels,
        data?.Hotels,
    ];

    return lists.find(Array.isArray) ?? [];
};

const getApiErrorMessage = (error, fallback) => {
    const data = error?.response?.data;

    if (typeof data === "string") return data;

    return (
        data?.message ??
        data?.Message ??
        data?.title ??
        data?.detail ??
        error?.message ??
        fallback
    );
};

const Assignments = () => {
    const [memberType, setMemberType] = useState("InHouse");
    const [assignmentDate, setAssignmentDate] = useState(getTodayDate);
    const [searchText, setSearchText] = useState("");
    const [savingRowKey, setSavingRowKey] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [hotels, setHotels] = useState([]);

    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [loadingHotels, setLoadingHotels] = useState(false);

    const [pageError, setPageError] = useState("");
    const [rowData, setRowData] = useState({});

    // Employee helpers
    const getEmployeeId = (employee) =>
        employee?.employeeId ??
        employee?.EmployeeId ??
        employee?.employeeID ??
        employee?.EmployeeID ??
        employee?.id ??
        employee?.Id;

    const getEmployeeName = (employee) => {
        const name =
            employee?.employeeName ??
            employee?.EmployeeName ??
            employee?.fullName ??
            employee?.FullName ??
            employee?.name ??
            employee?.Name;

        if (name) return name;

        return [
            employee?.firstName ?? employee?.FirstName,
            employee?.middleName ?? employee?.MiddleName,
            employee?.lastName ?? employee?.LastName,
        ]
            .filter(Boolean)
            .join(" ");
    };

    // Vendor helpers
    const getVendorObject = (record) =>
        record?.vendor ??
        record?.Vendor ??
        record?.vendorMaster ??
        record?.VendorMaster ??
        record?.vendorDetails ??
        record?.VendorDetails ??
        record;

    const getVendorId = (record) => {
        const vendor = getVendorObject(record);

        return (
            vendor?.vendorId ??
            vendor?.VendorId ??
            vendor?.vendorID ??
            vendor?.VendorID ??
            record?.fk_VendorId ??
            record?.Fk_VendorId ??
            record?.FK_VendorId ??
            record?.vendorId ??
            record?.VendorId ??
            record?.id ??
            record?.Id
        );
    };

    const getVendorName = (record) => {
        const vendor = getVendorObject(record);

        const name =
            vendor?.vendorName ??
            vendor?.VendorName ??
            vendor?.vendorFullName ??
            vendor?.VendorFullName ??
            vendor?.vendorCompanyName ??
            vendor?.VendorCompanyName ??
            vendor?.companyName ??
            vendor?.CompanyName ??
            vendor?.businessName ??
            vendor?.BusinessName ??
            vendor?.fullName ??
            vendor?.FullName ??
            vendor?.name ??
            vendor?.Name;

        if (name) return name;

        return [
            vendor?.firstName ?? vendor?.FirstName,
            vendor?.middleName ?? vendor?.MiddleName,
            vendor?.lastName ?? vendor?.LastName,
        ]
            .filter(Boolean)
            .join(" ");
    };

    const getVendorRowKey = (vendor) =>
        `vendor-${getVendorId(vendor)}`;

    // Hotel helpers
    const getHotelId = (hotel) =>
        hotel?.hotelId ??
        hotel?.HotelId ??
        hotel?.hotelID ??
        hotel?.HotelID ??
        hotel?.id ??
        hotel?.Id;

    const getHotelName = (hotel) =>
        hotel?.hotelName ??
        hotel?.HotelName ??
        hotel?.name ??
        hotel?.Name ??
        "";

    // Load employees
    const loadEmployees = async () => {
        try {
            setLoadingEmployees(true);
            setPageError("");

            const response = await getAllEmployeeRateMasters(1, 2000);
            const list = extractList(response);

            const validEmployees = list.filter((employee) => {
                const id = getEmployeeId(employee);
                return id !== undefined && id !== null && String(id).trim() !== "";
            });

            const uniqueEmployees = Array.from(
                new Map(
                    validEmployees.map((employee) => [
                        String(getEmployeeId(employee)),
                        employee,
                    ])
                ).values()
            );

            setEmployees(uniqueEmployees);
        } catch (error) {
            console.error("Error loading employees:", error?.response?.data ?? error);
            setEmployees([]);
            setPageError(getApiErrorMessage(error, "Unable to load employees."));
        } finally {
            setLoadingEmployees(false);
        }
    };

    // Load vendors
    const loadVendors = async () => {
        try {
            setLoadingVendors(true);
            setPageError("");

            const response = await getVendors(1, 2000);
            const list = extractList(response);

            const validVendors = list.filter((record) => {
                const id = getVendorId(record);
                return id !== undefined && id !== null && id !== "";
            });

            const uniqueVendors = Array.from(
                new Map(
                    validVendors.map((record) => [
                        String(getVendorId(record)),
                        record,
                    ])
                ).values()
            );

            setVendors(uniqueVendors);
        } catch (error) {
            console.error("Error loading vendors:", error?.response?.data ?? error);
            setVendors([]);
            setPageError(getApiErrorMessage(error, "Unable to load vendors."));
        } finally {
            setLoadingVendors(false);
        }
    };

    // Load hotels
    const loadHotels = async () => {
        try {
            setLoadingHotels(true);

            const response = await getHotels(1, 2000);
            setHotels(extractList(response));
        } catch (error) {
            console.error("Error loading hotels:", error?.response?.data ?? error);
            setHotels([]);
            setPageError(getApiErrorMessage(error, "Unable to load hotels."));
        } finally {
            setLoadingHotels(false);
        }
    };

    useEffect(() => {
        loadEmployees();
        loadHotels();
    }, []);

    const handleMemberTypeChange = (type) => {
        setMemberType(type);
        setSearchText("");
        setRowData({});
        setPageError("");

        if (type === "InHouse") {
            loadEmployees();
        } else if (type === "Vendor") {
            loadVendors();
        }
    };

    const handleAssignmentDateChange = (value) => {
        setAssignmentDate(value);
        setPageError("");
    };

    const currentEmployees = useMemo(() => {
        if (memberType !== "InHouse") return [];

        const search = searchText.trim().toLowerCase();
        if (!search) return employees;

        return employees.filter((employee) => {
            const name = String(getEmployeeName(employee)).toLowerCase();
            const id = String(getEmployeeId(employee)).toLowerCase();

            return name.includes(search) || id.includes(search);
        });
    }, [employees, memberType, searchText]);

    const currentVendors = useMemo(() => {
        if (memberType !== "Vendor") return [];

        const search = searchText.trim().toLowerCase();
        if (!search) return vendors;

        return vendors.filter((vendor) => {
            const name = String(getVendorName(vendor)).toLowerCase();
            const id = String(getVendorId(vendor)).toLowerCase();

            return name.includes(search) || id.includes(search);
        });
    }, [vendors, memberType, searchText]);

    // Update row values, including the new Venue field.
    const handleRowChange = (rowKey, field, value) => {
        setRowData((previous) => ({
            ...previous,
            [rowKey]: {
                ...previous[rowKey],
                [field]: value,
            },
        }));
    };

    const getSelectedAssignmentDate = () =>
        normalizeDateForPayload(assignmentDate);

    // Save employee assignment
    const handleSubmit = async (employee) => {
        const employeeId = getEmployeeId(employee);

        if (employeeId == null || employeeId === "") {
            alert("Employee ID not found.");
            return;
        }

        const rowKey = String(employeeId);
        const row = rowData[rowKey] ?? {};

        if (!row.hotelId) {
            alert("Please select hotel.");
            return;
        }

        if (!row.venue?.trim()) {
            alert("Please enter Venue.");
            return;
        }

        if (!row.shiftId) {
            alert("Please select shift type.");
            return;
        }

        if (!row.workType) {
            alert("Please select work type.");
            return;
        }

        let selectedDate;

        try {
            selectedDate = getSelectedAssignmentDate();
        } catch (error) {
            alert(error.message);
            return;
        }

        const payload = {
            EmployeeId: Number(employeeId),
            HotelId: Number(row.hotelId),
            Venue: row.venue.trim(),
            AssignmentDate: selectedDate,
            ShiftId: Number(row.shiftId),
            WorkType: row.workType,
            IsCancelled: false,
            Description: row.description?.trim() || null,
        };

        try {
            setSavingRowKey(rowKey);
            setPageError("");

            console.log("Employee assignment payload:", payload);

            await createAssignment(payload);

            alert(
                `Assignment saved successfully for ${getEmployeeName(employee)} on ${formatDateForDisplay(selectedDate)}.`
            );

            setRowData((previous) => {
                const updated = { ...previous };
                delete updated[rowKey];
                return updated;
            });
        } catch (error) {
            console.error("Error saving employee assignment:", error?.response?.data ?? error);

            alert(
                getApiErrorMessage(error, "Failed to save employee assignment.")
            );
        } finally {
            setSavingRowKey(null);
        }
    };

    // Save vendor assignment
    const handleVendorSubmit = async (vendor) => {
        const vendorId = getVendorId(vendor);
        const rowKey = getVendorRowKey(vendor);
        const row = rowData[rowKey] ?? {};

        if (vendorId == null || vendorId === "") {
            alert("Vendor ID not found.");
            return;
        }

        const quantityText = String(row.employeeQuantity ?? "").trim();
        const quantity = Number(quantityText);

        if (
            quantityText === "" ||
            !Number.isInteger(quantity) ||
            quantity < 1
        ) {
            alert("Please enter a valid Employee Quantity (at least 1).");
            return;
        }

        if (!row.hotelId) {
            alert("Please select hotel.");
            return;
        }

        if (!row.venue?.trim()) {
            alert("Please enter Venue.");
            return;
        }

        if (!row.shiftId) {
            alert("Please select shift type.");
            return;
        }

        if (!row.workType) {
            alert("Please select work type.");
            return;
        }

        let selectedDate;

        try {
            selectedDate = getSelectedAssignmentDate();
        } catch (error) {
            alert(error.message);
            return;
        }

        const payload = {
            VendorId: Number(vendorId),
            Emp_Quantity: quantity,
            HotelId: Number(row.hotelId),
            Venue: row.venue.trim(),
            AssignmentDate: selectedDate,
            ShiftId: Number(row.shiftId),
            WorkType: row.workType,
            Description: row.description?.trim() || null,
        };

        try {
            setSavingRowKey(rowKey);
            setPageError("");

            console.log("Vendor assignment payload:", payload);

            await createVendorAssignment(payload);

            alert(
                `Vendor assignment saved successfully for ${
                    getVendorName(vendor) || `Vendor ID ${vendorId}`
                } on ${formatDateForDisplay(selectedDate)}.`
            );

            setRowData((previous) => {
                const updated = { ...previous };
                delete updated[rowKey];
                return updated;
            });
        } catch (error) {
            console.error("Error saving vendor assignment:", error?.response?.data ?? error);

            alert(
                getApiErrorMessage(error, "Failed to save vendor assignment.")
            );
        } finally {
            setSavingRowKey(null);
        }
    };

    const handleCancel = (rowKey) => {
        setRowData((previous) => {
            const updated = { ...previous };
            delete updated[rowKey];
            return updated;
        });
    };

    const isLoading =
        memberType === "Vendor"
            ? loadingVendors
            : memberType === "InHouse"
              ? loadingEmployees
              : false;

    const displayedCount =
        memberType === "Vendor"
            ? currentVendors.length
            : memberType === "InHouse"
              ? currentEmployees.length
              : 0;

    return (
        <div className="assignment-page">
            <div className="assignment-header">
                <div>
                    <center>
                        <h2>Daily Employee Assignment</h2>
                    </center>
                </div>
            </div>

            <div className="assignment-filter-card">
                <div className="filter-group">
                    <label>Member Type</label>

                    <div className="member-type-buttons">
                        {["InHouse", "Vendor", "Local"].map((type) => (
                            <label className="type-option" key={type}>
                                <input
                                    type="radio"
                                    name="memberType"
                                    value={type}
                                    checked={memberType === type}
                                    onChange={() => handleMemberTypeChange(type)}
                                />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-group">
                    <DatePicker
                        label="Assignment Date"
                        name="assignmentDate"
                        value={assignmentDate}
                        onChange={handleAssignmentDateChange}
                        required
                        placeholder="DD/MM/YYYY"
                    />
                </div>

                <div className="filter-group search-group">
                    <label>
                        {memberType === "Vendor" ? "Search Vendor" : "Search Employee"}
                    </label>

                    <input
                        type="search"
                        placeholder={
                            memberType === "Vendor"
                                ? "Search by vendor name or ID"
                                : "Search by employee name or ID"
                        }
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                    />
                </div>
            </div>

            {pageError && (
                <div className="allocation-message allocation-error">
                    {pageError}
                </div>
            )}

            <div className="assignment-info">
                <span>
                    Type: <strong>{memberType}</strong>
                </span>

                <span>
                    Selected Date:{" "}
                    <strong>{formatDateForDisplay(assignmentDate)}</strong>
                </span>

                <span>
                    {memberType === "Vendor" ? "Vendors" : "Employees"}:{" "}
                    <strong>{displayedCount}</strong>
                </span>
            </div>

            {isLoading ? (
                <div className="loading-message">
                    {memberType === "Vendor"
                        ? "Loading vendors..."
                        : "Loading employees..."}
                </div>
            ) : (
                <div className="assignment-table-card">
                    <table className="assignment-table">
                        <thead>
                            {memberType === "Vendor" ? (
                                <tr>
                                    <th>ID</th>
                                    <th>Vendor Name</th>
                                    <th>Employee Quantity</th>
                                    <th>Hotel</th>
                                    <th>Venue</th>
                                    <th>Shift Type</th>
                                    <th>Work Type</th>
                                    <th>Description / Note</th>
                                    <th>Action</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>ID</th>
                                    <th>Employee Name</th>
                                    <th>Hotel</th>
                                    <th>Venue</th>
                                    <th>Shift Type</th>
                                    <th>Work Type</th>
                                    <th>Description / Note</th>
                                    <th>Action</th>
                                </tr>
                            )}
                        </thead>

                        <tbody>
                            {memberType === "Vendor" ? (
                                currentVendors.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="no-data">
                                            {vendors.length === 0
                                                ? "No vendor records found."
                                                : "No matching vendors found."}
                                        </td>
                                    </tr>
                                ) : (
                                    currentVendors.map((vendor) => {
                                        const vendorId = getVendorId(vendor);
                                        const rowKey = getVendorRowKey(vendor);
                                        const row = rowData[rowKey] ?? {};
                                        const isSaving = savingRowKey === rowKey;

                                        return (
                                            <tr key={rowKey}>
                                                <td>{vendorId}</td>

                                                <td>
                                                    <div className="employee-name">
                                                        {getVendorName(vendor) ||
                                                            `Vendor ID ${vendorId}`}
                                                    </div>
                                                </td>

                                                <td>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={row.employeeQuantity ?? ""}
                                                        onChange={(event) =>
                                                            handleRowChange(
                                                                rowKey,
                                                                "employeeQuantity",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Enter quantity"
                                                        className="assignment-select"
                                                        disabled={isSaving}
                                                    />
                                                </td>

                                                <td>
                                                    <select
                                                        value={row.hotelId ?? ""}
                                                        onChange={(event) =>
                                                            handleRowChange(
                                                                rowKey,
                                                                "hotelId",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="assignment-select-head"
                                                        disabled={loadingHotels || isSaving}
                                                    >
                                                        <option value="">Select Hotel</option>

                                                        {hotels.map((hotel) => (
                                                            <option
                                                                key={getHotelId(hotel)}
                                                                value={getHotelId(hotel)}
                                                            >
                                                                {getHotelName(hotel)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                {/* NEW: Venue field after Hotel */}
                                                <td>
                                                    <input
                                                        type="text"
                                                        value={row.venue ?? ""}
                                                        onChange={(event) =>
                                                            handleRowChange(
                                                                rowKey,
                                                                "venue",
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Enter venue"
                                                        className="assignment-select"
                                                        maxLength={100}
                                                        disabled={isSaving}
                                                    />
                                                </td>

                                                <td>
                                                    <select
                                                        value={row.shiftId ?? ""}
                                                        onChange={(event) =>
                                                            handleRowChange(
                                                                rowKey,
                                                                "shiftId",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="assignment-select"
                                                        disabled={isSaving}
                                                    >
                                                        <option value="">Select Shift Type</option>
                                                        <option value="1">Morning</option>
                                                        <option value="2">Evening</option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <select
                                                        value={row.workType ?? ""}
                                                        onChange={(event) =>
                                                            handleRowChange(
                                                                rowKey,
                                                                "workType",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="assignment-select"
                                                        disabled={isSaving}
                                                    >
                                                        <option value="">Select Work Type</option>
                                                        <option value="HalfDay">HalfDay</option>
                                                        <option value="FullDay">FullDay</option>
                                                    </select>
                                                </td>

                                                <td>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter description / note"
                                                        value={row.description ?? ""}
                                                        onChange={(event) =>
                                                            handleRowChange(
                                                                rowKey,
                                                                "description",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="assignment-select-dscrip"
                                                        disabled={isSaving}
                                                    />
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            type="button"
                                                            className="btn-submit"
                                                            disabled={isSaving || loadingHotels}
                                                            onClick={() => handleVendorSubmit(vendor)}
                                                        >
                                                            {isSaving ? "Saving..." : "Submit"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn-cancel"
                                                            disabled={isSaving}
                                                            onClick={() => handleCancel(rowKey)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )
                            ) : memberType === "Local" ? (
                                <tr>
                                    <td colSpan={8} className="no-data">
                                        Local employee API is not connected yet.
                                    </td>
                                </tr>
                            ) : currentEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="no-data">
                                        No employees found.
                                    </td>
                                </tr>
                            ) : (
                                currentEmployees.map((employee) => {
                                    const employeeId = getEmployeeId(employee);
                                    const rowKey = String(employeeId);
                                    const row = rowData[rowKey] ?? {};
                                    const isSaving = savingRowKey === rowKey;

                                    return (
                                        <tr key={rowKey}>
                                            <td>{employeeId}</td>

                                            <td>
                                                <div className="employee-name">
                                                    {getEmployeeName(employee)}
                                                </div>
                                            </td>

                                            <td>
                                                <select
                                                    value={row.hotelId ?? ""}
                                                    onChange={(event) =>
                                                        handleRowChange(
                                                            rowKey,
                                                            "hotelId",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="assignment-select-head"
                                                    disabled={loadingHotels || isSaving}
                                                >
                                                    <option value="">Select Hotel</option>

                                                    {hotels.map((hotel) => (
                                                        <option
                                                            key={getHotelId(hotel)}
                                                            value={getHotelId(hotel)}
                                                        >
                                                            {getHotelName(hotel)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* NEW: Venue field after Hotel */}
                                            <td>
                                                <input
                                                    type="text"
                                                    value={row.venue ?? ""}
                                                    onChange={(event) =>
                                                        handleRowChange(
                                                            rowKey,
                                                            "venue",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Enter venue"
                                                    className="assignment-select"
                                                    maxLength={100}
                                                    disabled={isSaving}
                                                />
                                            </td>

                                            <td>
                                                <select
                                                    value={row.shiftId ?? ""}
                                                    onChange={(event) =>
                                                        handleRowChange(
                                                            rowKey,
                                                            "shiftId",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="assignment-select"
                                                    disabled={isSaving}
                                                >
                                                    <option value="">Select Shift Type</option>
                                                    <option value="1">Morning</option>
                                                    <option value="2">Evening</option>
                                                </select>
                                            </td>

                                            <td>
                                                <select
                                                    value={row.workType ?? ""}
                                                    onChange={(event) =>
                                                        handleRowChange(
                                                            rowKey,
                                                            "workType",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="assignment-select"
                                                    disabled={isSaving}
                                                >
                                                    <option value="">Select Work Type</option>
                                                    <option value="HalfDay">HalfDay</option>
                                                    <option value="FullDay">FullDay</option>
                                                </select>
                                            </td>

                                            <td>
                                                <input
                                                    type="text"
                                                    placeholder="Enter description / note"
                                                    value={row.description ?? ""}
                                                    onChange={(event) =>
                                                        handleRowChange(
                                                            rowKey,
                                                            "description",
                                                            event.target.value
                                                        )
                                                    }
                                                    className="assignment-select-dscrip"
                                                    disabled={isSaving}
                                                />
                                            </td>

                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        className="btn-submit"
                                                        disabled={isSaving || loadingHotels}
                                                        onClick={() => handleSubmit(employee)}
                                                    >
                                                        {isSaving ? "Saving..." : "Submit"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-cancel"
                                                        disabled={isSaving}
                                                        onClick={() => handleCancel(rowKey)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Assignments;
