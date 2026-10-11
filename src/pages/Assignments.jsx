
import React, { useEffect, useMemo, useState } from "react";

import { getAllEmployeeRateMasters } from "../api/employeeRateMasterApi";
import { getHotels } from "../api/hotelApi";
import { getVendors } from "../api/vendorApi";

import {
    createAssignment,
    createVendorAssignment
} from "../api/dailyHotelAssignmentApi";

import "../CSS/EmployeeHotelAssignment.css";

// ====================================================
// DATE HELPERS
// ====================================================
const getTodayDate = () => {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
};

const normalizeDateForPayload = (value) => {
    if (!value) {
        throw new Error("Please select an assignment date.");
    }

    const date = String(value).trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error("Invalid assignment date.");
    }

    const [year, month, day] = date.split("-").map(Number);
    const check = new Date(year, month - 1, day);

    if (
        check.getFullYear() !== year ||
        check.getMonth() !== month - 1 ||
        check.getDate() !== day
    ) {
        throw new Error("The selected assignment date is invalid.");
    }

    return date;
};

// ====================================================
// API RESPONSE HELPERS
// ====================================================
const extractList = (response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;

    const possibleLists = [
        data?.items,
        data?.Items,
        data?.data,
        data?.Data,
        data?.$values,
        data?.vendors,
        data?.Vendors,
        data?.vendorRates,
        data?.VendorRates,
        data?.employees,
        data?.Employees,
        data?.hotels,
        data?.Hotels
    ];

    return possibleLists.find(Array.isArray) ?? [];
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

// ====================================================
// COMPONENT
// ====================================================
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

    // ====================================================
    // EMPLOYEE HELPERS
    // ====================================================
    const getEmployeeId = (employee) =>
        employee?.employeeId ??
        employee?.EmployeeId ??
        employee?.employeeID ??
        employee?.EmployeeID ??
        employee?.id ??
        employee?.Id;

    const getEmployeeName = (employee) => {
        const directName =
            employee?.employeeName ??
            employee?.EmployeeName ??
            employee?.fullName ??
            employee?.FullName ??
            employee?.name ??
            employee?.Name;

        if (directName) return directName;

        return [
            employee?.firstName ?? employee?.FirstName,
            employee?.middleName ?? employee?.MiddleName,
            employee?.lastName ?? employee?.LastName
        ]
            .filter(Boolean)
            .join(" ");
    };

    // ====================================================
    // VENDOR HELPERS
    // Supports vendor-rate records with nested vendor data.
    // ====================================================
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

        const directName =
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

        if (directName) return directName;

        const composedName = [
            vendor?.firstName ?? vendor?.FirstName,
            vendor?.middleName ?? vendor?.MiddleName,
            vendor?.lastName ?? vendor?.LastName
        ]
            .filter(Boolean)
            .join(" ");

        if (composedName) return composedName;

        // Some rate records contain only a vendor ID.
        // Do not display a rate or unrelated field as the name.
        return "";
    };

    const getVendorRowKey = (vendor) =>
        `vendor-${getVendorId(vendor)}`;

    // ====================================================
    // HOTEL HELPERS
    // ====================================================
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

    // ====================================================
    // LOAD EMPLOYEES
    // ====================================================
    const loadEmployees = async () => {
        try {
            setLoadingEmployees(true);
            setPageError("");

            const response = await getAllEmployeeRateMasters(1, 2000);
            const list = extractList(response);

            console.log("Employee API response:", response);
            console.log("Loaded employee records:", list);

            setEmployees(list);
        } catch (error) {
            console.error(
                "Error loading employees:",
                error?.response?.data ?? error
            );

            setEmployees([]);
            setPageError(
                getApiErrorMessage(error, "Unable to load employees.")
            );
        } finally {
            setLoadingEmployees(false);
        }
    };

    // ====================================================
    // LOAD VENDOR RATE RECORDS
    // ====================================================
    const loadVendors = async () => {
        try {
            setLoadingVendors(true);
            setPageError("");

            const response = await getVendors(1, 2000);
            const list = extractList(response);

            console.log("Full vendor-rate API response:", response);
            console.table(list);

            if (list.length > 0) {
                console.log("First vendor-rate record:", list[0]);
                console.log(
                    "Vendor-rate record properties:",
                    Object.keys(list[0])
                );
                console.log(
                    "Extracted vendor ID:",
                    getVendorId(list[0])
                );
                console.log(
                    "Extracted vendor name:",
                    getVendorName(list[0])
                );
            }

            const validVendors = list.filter((record) => {
                const id = getVendorId(record);

                return id !== undefined && id !== null && id !== "";
            });

            // Multiple rate records may exist for one vendor.
            // Keep one record per vendor for the assignment list.
            const uniqueVendors = Array.from(
                new Map(
                    validVendors.map((record) => [
                        String(getVendorId(record)),
                        record
                    ])
                ).values()
            );

            setVendors(uniqueVendors);

            if (uniqueVendors.length === 0 && list.length > 0) {
                console.warn(
                    "Vendor-rate records were returned, but a vendor ID could not be identified."
                );
            }

            if (uniqueVendors.some((record) => !getVendorName(record))) {
                console.warn(
                    "Some vendor-rate records have no recognized vendor-name property. Inspect the logged record to identify the actual field."
                );
            }
        } catch (error) {
            console.error(
                "Error loading vendor rates:",
                error?.response?.data ?? error
            );

            setVendors([]);
            setPageError(
                getApiErrorMessage(error, "Unable to load vendor records.")
            );
        } finally {
            setLoadingVendors(false);
        }
    };

    // ====================================================
    // LOAD HOTELS
    // ====================================================
    const loadHotels = async () => {
        try {
            setLoadingHotels(true);

            const response = await getHotels(1, 2000);
            const list = extractList(response);

            console.log("Hotel API response:", response);
            setHotels(list);
        } catch (error) {
            console.error(
                "Error loading hotels:",
                error?.response?.data ?? error
            );

            setHotels([]);
            setPageError(
                getApiErrorMessage(error, "Unable to load hotels.")
            );
        } finally {
            setLoadingHotels(false);
        }
    };

    // ====================================================
    // INITIAL LOAD
    // ====================================================
    useEffect(() => {
        loadEmployees();
        loadHotels();
    }, []);

    // ====================================================
    // MEMBER TYPE CHANGE
    // ====================================================
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

    // ====================================================
    // DATE CHANGE
    // ====================================================
    const handleAssignmentDateChange = (event) => {
        setAssignmentDate(event.target.value);
        setPageError("");
    };

    // ====================================================
    // FILTER EMPLOYEES
    // ====================================================
    const currentEmployees = useMemo(() => {
        if (memberType !== "InHouse") return [];

        const search = searchText.trim().toLowerCase();

        if (!search) return employees;

        return employees.filter((employee) => {
            const name = String(getEmployeeName(employee) ?? "")
                .toLowerCase();

            const id = String(getEmployeeId(employee) ?? "")
                .toLowerCase();

            return name.includes(search) || id.includes(search);
        });
    }, [employees, memberType, searchText]);

    // ====================================================
    // FILTER VENDORS
    // ====================================================
    const currentVendors = useMemo(() => {
        if (memberType !== "Vendor") return [];

        const search = searchText.trim().toLowerCase();

        if (!search) return vendors;

        return vendors.filter((vendor) => {
            const name = String(getVendorName(vendor) ?? "")
                .toLowerCase();

            const id = String(getVendorId(vendor) ?? "")
                .toLowerCase();

            return name.includes(search) || id.includes(search);
        });
    }, [vendors, memberType, searchText]);

    // ====================================================
    // ROW FIELD CHANGE
    // ====================================================
    const handleRowChange = (rowKey, field, value) => {
        setRowData((previous) => ({
            ...previous,
            [rowKey]: {
                ...previous[rowKey],
                [field]: value
            }
        }));
    };

    const getSelectedAssignmentDate = () =>
        normalizeDateForPayload(assignmentDate);

    // ====================================================
    // SAVE EMPLOYEE ASSIGNMENT
    // ====================================================
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
            AssignmentDate: selectedDate,
            ShiftId: Number(row.shiftId),
            WorkType: row.workType,
            IsCancelled: false,
            Description: row.description?.trim() || null
        };

        try {
            setSavingRowKey(rowKey);
            setPageError("");

            console.log("Employee assignment payload:", payload);

            await createAssignment(payload);

            alert(
                `Assignment saved successfully for ${getEmployeeName(employee)} on ${selectedDate}.`
            );

            setRowData((previous) => {
                const updated = { ...previous };
                delete updated[rowKey];
                return updated;
            });
        } catch (error) {
            console.error(
                "Error saving employee assignment:",
                error?.response?.data ?? error
            );

            alert(
                getApiErrorMessage(
                    error,
                    "Failed to save employee assignment."
                )
            );
        } finally {
            setSavingRowKey(null);
        }
    };

    // ====================================================
    // SAVE VENDOR ASSIGNMENT
    // ====================================================
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
            AssignmentDate: selectedDate,
            ShiftId: Number(row.shiftId),
            WorkType: row.workType,
            Description: row.description?.trim() || null
        };

        try {
            setSavingRowKey(rowKey);
            setPageError("");

            console.log("Vendor assignment payload:", payload);

            await createVendorAssignment(payload);

            alert(
                `Vendor assignment saved successfully for ${
                    getVendorName(vendor) || `Vendor ID ${vendorId}`
                } on ${selectedDate}.`
            );

            setRowData((previous) => {
                const updated = { ...previous };
                delete updated[rowKey];
                return updated;
            });
        } catch (error) {
            console.error(
                "Error saving vendor assignment:",
                error?.response?.data ?? error
            );

            alert(
                getApiErrorMessage(
                    error,
                    "Failed to save vendor assignment."
                )
            );
        } finally {
            setSavingRowKey(null);
        }
    };

    // ====================================================
    // CANCEL ROW
    // ====================================================
    const handleCancel = (rowKey) => {
        setRowData((previous) => {
            const updated = { ...previous };
            delete updated[rowKey];
            return updated;
        });
    };

    // ====================================================
    // LOADING AND COUNTS
    // ====================================================
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

    // ====================================================
    // RENDER
    // ====================================================
    return (
        <div className="assignment-page">
            <div className="assignment-header">
                <div>
                    <center><h2>Daily Employee Assignment</h2></center>
                    {/* <p>Assign employees or vendors to Caters and shifts</p> */}
                </div>
            </div>

            {/* FILTERS */}
            <div className="assignment-filter-card">
                <div className="filter-group">
                    <label>Member Type</label>

                    <div className="member-type-buttons">
                        <label className="type-option">
                            <input
                                type="radio"
                                name="memberType"
                                value="InHouse"
                                checked={memberType === "InHouse"}
                                onChange={() =>
                                    handleMemberTypeChange("InHouse")
                                }
                            />
                            <span>InHouse</span>
                        </label>

                        <label className="type-option">
                            <input
                                type="radio"
                                name="memberType"
                                value="Vendor"
                                checked={memberType === "Vendor"}
                                onChange={() =>
                                    handleMemberTypeChange("Vendor")
                                }
                            />
                            <span>Vendor</span>
                        </label>

                        <label className="type-option">
                            <input
                                type="radio"
                                name="memberType"
                                value="Local"
                                checked={memberType === "Local"}
                                onChange={() =>
                                    handleMemberTypeChange("Local")
                                }
                            />
                            <span>Local</span>
                        </label>
                    </div>
                </div>

                <div className="filter-group">
                    <label htmlFor="assignmentDate">Assignment Date</label>

                    <input
                        id="assignmentDate"
                        type="date"
                        value={assignmentDate}
                        onChange={handleAssignmentDateChange}
                    />
                </div>

                <div className="filter-group search-group">
                    <label>
                        {memberType === "Vendor"
                            ? "Search Vendor"
                            : "Search Employee"}
                    </label>

                    <input
                        type="search"
                        placeholder={
                            memberType === "Vendor"
                                ? "Search by vendor name or ID"
                                : "Search by employee name or ID"
                        }
                        value={searchText}
                        onChange={(event) =>
                            setSearchText(event.target.value)
                        }
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
                    <strong>{assignmentDate || "Not selected"}</strong>
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
                                    <th>Hotel Name</th>
                                    <th>Shift Type</th>
                                    <th>Work Type</th>
                                    <th>Description / Note</th>
                                    <th>Action</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>ID</th>
                                    <th>Employee Name</th>
                                    <th>Caterers Name</th>
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
                                        <td colSpan={8} className="no-data">
                                            {vendors.length === 0
                                                ? "No vendor records found. Check the vendor-rate API response."
                                                : "No matching vendors found."}
                                        </td>
                                    </tr>
                                ) : (
                                    currentVendors.map((vendor) => {
                                        const vendorId = getVendorId(vendor);
                                        const rowKey = getVendorRowKey(vendor);
                                        const row = rowData[rowKey] ?? {};
                                        const isSaving = savingRowKey === rowKey;
                                        const vendorName = getVendorName(vendor);

                                        return (
                                            <tr key={rowKey}>
                                                <td>{vendorId}</td>

                                                <td>
                                                    <div className="employee-name">
                                                        {vendorName ||
                                                            `Vendor name unavailable (ID: ${vendorId})`}
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
                                                        <option value="">
                                                            Select Hotel
                                                        </option>

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
                                                        <option value="">
                                                            Select Shift Type
                                                        </option>
                                                        <option value="1">Morning</option>
                                                        <option value="2">Evening</option>
                                                        <option value="3">TwoHalfDay</option>
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
                                                        <option value="">
                                                            Select Work Type
                                                        </option>
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
                                                            onClick={() =>
                                                                handleVendorSubmit(vendor)
                                                            }
                                                        >
                                                            {isSaving ? "Saving..." : "Submit"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn-cancel"
                                                            disabled={isSaving}
                                                            onClick={() =>
                                                                handleCancel(rowKey)
                                                            }
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
                                    <td colSpan={7} className="no-data">
                                        Local employee API is not connected yet.
                                    </td>
                                </tr>
                            ) : currentEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="no-data">
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
                                                    <option value="">
                                                        Select Hotel
                                                    </option>

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
                                                    <option value="">
                                                        Select Shift Type
                                                    </option>
                                                    <option value="1">Morning</option>
                                                    <option value="2">Evening</option>
                                                    <option value="3">TwoHalfDay</option>
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
                                                    <option value="">
                                                        Select Work Type
                                                    </option>
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
                                                        onClick={() =>
                                                            handleSubmit(employee)
                                                        }
                                                    >
                                                        {isSaving ? "Saving..." : "Submit"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-cancel"
                                                        disabled={isSaving}
                                                        onClick={() =>
                                                            handleCancel(rowKey)
                                                        }
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
