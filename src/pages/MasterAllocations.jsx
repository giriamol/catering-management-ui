

import React, {

    useEffect,

    useMemo,

    useState,

    useCallback,

} from "react";

import "../CSS/MasterAllocations.css";

import DatePicker from "../components/DatePicker";

import {

    getAssignmentsByDate,

    getVendorsByDate,

} from "../api/dailyHotelAssignmentApi";

import { getSupplierAssignmentsByDate, } from "../api/dailySupplierAssignmentToVendorApi";

import { getEmployees } from "../api/employeeApi";

import { getVendors } from "../api/vendorApi";

import { getHotels } from "../api/hotelApi";

const ALLOCATION_TYPES = {

    employee: "Employee",

    local: "Local",

    vendor: "Vendor",

    hotel: "Caterers",

    supplier: "Supplier",

};

const SHIFTS = [

    { shiftId: 1, shiftCode: "MORNING", shiftName: "Morning" },

    { shiftId: 2, shiftCode: "EVENING", shiftName: "Evening" },

    { shiftId: 3, shiftCode: "TwoHalfDay", shiftName: "TwoHalfDay" },

];

// The Hotel tab must use this single, explicit column list.

// Hotel counts are displayed once each.

const HOTEL_TABLE_COLUMNS = [

    { key: "assignmentId", label: "Sr. No." },

    { key: "hotelName", label: "Caterers Name" },

    { key: "venueName", label: "Caterers Venue" },

    { key: "assignmentDate", label: "Assignment Date" },

    { key: "shiftName", label: "Shift Name" },

    { key: "workType", label: "Work Type" },

    { key: "localEmployeeCount", label: "Local Emp" },

    { key: "inHouseEmployeeCount", label: "InHouse Emp" },

    { key: "vendorEmployeeCount", label: "Vendor Emp" },

    { key: "totalEmployeeCount", label: "Total Emp Count" },

];

const TABLE_COLUMNS = {

    employee: [

        { key: "assignmentId", label: "Sr. No." },

        { key: "employeeName", label: "Employee Name" },

        { key: "hotelName", label: "Caterers-Name" },

        { key: "venueName", label: "Caterers-Venue" },

        { key: "assignmentDate", label: "Assign-Date" },

        { key: "shiftName", label: "Shift Name" },

        { key: "workType", label: "Work Type" },

    ],

    // Local assignments use the same employee assignment fields.

    local: [

        { key: "assignmentId", label: "Sr. No." },

        { key: "employeeName", label: "Employee Name" },

        { key: "hotelName", label: "Caterers-Name" },

        { key: "venueName", label: "Caterers-Venue" },

        { key: "assignmentDate", label: "Assign-Date" },

        { key: "shiftName", label: "Shift Name" },

        { key: "workType", label: "Work Type" },

    ],

    vendor: [

        { key: "assignmentId", label: "Sr. No." },

        { key: "vendorName", label: "Vendor Name" },

        { key: "emp_Quantity", label: "Employee Count" },

        { key: "hotelName", label: "Caterers-Name" },

        { key: "venueName", label: "Caterers-Venue" },

        { key: "assignmentDate", label: "Assign-Date" },

        { key: "shiftName", label: "Shift Name" },

        { key: "workType", label: "Work Type" },

    ],

    supplier: [

        { key: "assignmentId", label: "Sr. No." },

        { key: "assignmentDate", label: "Assignment Date" },

        { key: "vendorName", label: "Vendor Name" },

        { key: "venueName", label: "Venue" },

        { key: "shiftName", label: "Shift" },

        { key: "workType", label: "Work Type" },

    ],

};

const getTodayDate = () => {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

};

// Supports Axios responses and common API list wrappers.

const extractList = (response) => {

    let data = response?.data ?? response;

    for (let i = 0; i < 4 && data && !Array.isArray(data); i += 1) {

        if (Array.isArray(data.items)) return data.items;

        if (Array.isArray(data.Items)) return data.Items;

        if (Array.isArray(data.$values)) return data.$values;

        if (Array.isArray(data.data)) return data.data;

        if (data.data && typeof data.data === "object") {

            data = data.data;

            continue;

        }

        if (data.result && typeof data.result === "object") {

            data = data.result;

            continue;

        }

        break;

    }

    return Array.isArray(data) ? data : [];

};

// Case-insensitive property lookup supports camelCase and PascalCase.

const getValue = (record, key) => {

    if (!record || !key) return null;

    if (record[key] != null) return record[key];

    const matchingKey = Object.keys(record).find(

        (property) => property.toLowerCase() === key.toLowerCase()

    );

    return matchingKey ? record[matchingKey] : null;

};

// Normalizes MemberType, including values with extra spaces.

const normalizeMemberType = (value) => {

    const normalized = String(value ?? "")

        .trim()

        .toLowerCase()

        .replace(/[^a-z]/g, "");

    if (normalized.includes("local")) return "local";

    if (normalized.includes("inhouse") || normalized.includes("house")) {

        return "inhouse";

    }
    return normalized;
};

const getMemberType = (record) =>

    normalizeMemberType(getValue(record, "memberType"));

const formatDate = (value) => {

    if (!value) return "—";

    const text = String(value).trim();

    const displayMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (displayMatch) {

        return `${displayMatch[1]}/${displayMatch[2]}/${displayMatch[3]}`;

    }

    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoMatch) {

        return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

    }
    return text;
};

const getShiftName = (shiftId) => {

    const shift = SHIFTS.find(

        (item) => item.shiftId === Number(shiftId)

    );

    return shift?.shiftName ?? `Shift ID: ${shiftId ?? "—"}`;

};

const getEmployeeName = (employeeId, employees) => {

    if (employeeId == null) return "—";

    const employee = employees.find((item) => {

        const id = getValue(item, "employeeId") ?? getValue(item, "id");

        return Number(id) === Number(employeeId);

    });

    if (!employee) return `Employee ID: ${employeeId}`;

    const name =

        getValue(employee, "fullName") ??

        getValue(employee, "employeeName") ??

        getValue(employee, "name");

    if (name) return name;

    const firstName = getValue(employee, "firstName") ?? "";

    const lastName = getValue(employee, "lastName") ?? "";

    return (

        `${firstName} ${lastName}`.trim() ||

        `Employee ID: ${employeeId}`

    );

};

const getVendorName = (record, vendors) => {

    const directName =

        getValue(record, "vendorName") ??

        getValue(record, "companyName") ??

        getValue(record, "businessName");

    if (directName) return directName;

    const vendorId =

        getValue(record, "vendorId") ??

        getValue(record, "fk_VendorId");

    if (vendorId == null) return "—";

    const vendor = vendors.find((item) => {

        const id = getValue(item, "vendorId") ?? getValue(item, "id");

        return Number(id) === Number(vendorId);

    });

    if (!vendor) return `Vendor ID: ${vendorId}`;

    return (

        getValue(vendor, "vendorName") ??

        getValue(vendor, "companyName") ??

        getValue(vendor, "businessName") ??

        getValue(vendor, "name") ??

        `Vendor ID: ${vendorId}`
    );

};

const getHotelName = (record, hotels) => {

    const directName = getValue(record, "hotelName");

    if (directName != null && String(directName).trim() !== "") {

        return directName;
    }

    const hotelId =

        getValue(record, "hotelId") ??

        getValue(record, "fk_HotelId") ??

        getValue(record, "hotelMasterId");

    if (hotelId == null) return "—";

    const hotel = hotels.find((item) => {

        const id =

            getValue(item, "hotelId") ??

            getValue(item, "id") ??

            getValue(item, "fk_HotelId");

        return id != null && String(id) === String(hotelId);

    });

    const name = getValue(hotel, "hotelName") ?? getValue(hotel, "name");

    return name || `Hotel ID: ${hotelId}`;
};

const getVenueName = (record, hotels) => {

    const directVenue =

        getValue(record, "venueName") ??

        getValue(record, "venue");

    if (directVenue && typeof directVenue === "object") {

        const name =

            getValue(directVenue, "venueName") ??

            getValue(directVenue, "name") ??

            getValue(directVenue, "venue");

        if (name != null && String(name).trim() !== "") return name;

    } else if (

        directVenue != null &&

        String(directVenue).trim() !== "" &&

        Number.isNaN(Number(directVenue))

    ) {

        return directVenue;

    }

    const venueId =

        getValue(record, "venueId") ??

        getValue(record, "fk_VenueId") ??

        getValue(record, "hotelVenueId") ??

        getValue(record, "fk_HotelVenueId");

    const hotelId =

        getValue(record, "hotelId") ??

        getValue(record, "fk_HotelId") ??

        getValue(record, "hotelMasterId");

    const hotel = hotels.find((item) => {

        const id =

            getValue(item, "hotelId") ??

            getValue(item, "id") ??

            getValue(item, "fk_HotelId");

        return (

            id != null &&

            hotelId != null &&

            String(id) === String(hotelId)

        );

    });

    if (hotel) {

        const hotelVenue =

            getValue(hotel, "venueName") ??

            getValue(hotel, "venue") ??

            getValue(hotel, "catersVenue") ??

            getValue(hotel, "hotelVenueName");

        if (hotelVenue && typeof hotelVenue === "object") {

            const name =

                getValue(hotelVenue, "venueName") ??

                getValue(hotelVenue, "name") ??

                getValue(hotelVenue, "venue");

            if (name != null && String(name).trim() !== "") return name;

        } else if (

            hotelVenue != null &&

            String(hotelVenue).trim() !== "" &&

            Number.isNaN(Number(hotelVenue))

        ) {

            return hotelVenue;

        }

    }

    return venueId != null ? `Venue ID: ${venueId}` : "—";

};

const RECORDS_PER_PAGE = 20;

const MasterAllocations = () => {

    const [allocationType, setAllocationType] = useState("employee");

    const [allocationDate, setAllocationDate] = useState(getTodayDate);

    const [searchText, setSearchText] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Stores the API records before tab-specific filtering.

    const [records, setRecords] = useState([]);

    const [employees, setEmployees] = useState([]);

    const [vendors, setVendors] = useState([]);

    const [hotels, setHotels] = useState([]);

    const [loading, setLoading] = useState(false);

    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [error, setError] = useState("");

    // Render the Hotel table from a strict whitelist so the employee-count

    // columns cannot be duplicated by an old/expanded table configuration.

    const columns = allocationType === "hotel"

        ? HOTEL_TABLE_COLUMNS

        : (TABLE_COLUMNS[allocationType] ?? []);

    // Load employee master data.

    useEffect(() => {

        let isCurrent = true;

        const loadEmployees = async () => {

            try {

                setLoadingEmployees(true);

                const response = await getEmployees(1, 2000);

                if (isCurrent) {

                    setEmployees(extractList(response));

                }

            } catch (err) {

                console.error(

                    "Error loading employees:",

                    err.response?.data ?? err.message

                );

                if (isCurrent) setEmployees([]);

            } finally {

                if (isCurrent) setLoadingEmployees(false);

            }

        };

        loadEmployees();

        return () => {

            isCurrent = false;

        };

    }, []);

    // Load vendor master data.

    useEffect(() => {

        let isCurrent = true;

        const loadVendorMaster = async () => {

            try {

                const response = await getVendors(1, 2000);

                if (isCurrent) setVendors(extractList(response));

            } catch (err) {

                console.error(

                    "Error loading vendor master:",

                    err.response?.data ?? err.message

                );

                if (isCurrent) setVendors([]);

            }

        };

        loadVendorMaster();

        return () => {

            isCurrent = false;

        };

    }, []);

    // Load hotel master data.

    useEffect(() => {

        let isCurrent = true;

        const loadHotelMaster = async () => {

            try {

                const response = await getHotels();

                const hotelList = extractList(response);

                if (isCurrent) setHotels(hotelList);

            } catch (err) {

                console.error(

                    "Error loading hotels:",

                    err.response?.data ?? err.message

                );

                if (isCurrent) setHotels([]);

            }

        };

        loadHotelMaster();

        return () => {

            isCurrent = false;
        };

    }, []);

    // Employee and Local tabs use the same employee assignment endpoint.

    const loadAllocations = useCallback(async (type, date) => {

        if (!date) {

            throw new Error("Please select an allocation date.");

        }

        const dateToSend = String(date).slice(0, 10);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToSend)) {

            throw new Error(

                `Invalid date "${date}". Expected YYYY-MM-DD.`

            );

        }

        let response;

        if (type === "employee" || type === "local") {

            // console.log(

            //     "Calling employee assignment endpoint:",

            //     `/DailyHotelAssignment/date/${dateToSend}`

            // );

            response = await getAssignmentsByDate(dateToSend);

        } else if (type === "vendor") {

            // console.log(

            //     "Calling vendor assignment endpoint:",

            //     `/DailyHotelAssignment/vendor/date/${dateToSend}`

            // );

            response = await getVendorsByDate(dateToSend);

        } else if (type === "supplier") {

            // Supplier tab: fetch outsourced supplier assignments for selected date.

            // console.log(

            //     "Calling supplier assignment endpoint:",

            //     `/DailySupplierAssignmentToVendor/date/${dateToSend}`

            // );

            response = await getSupplierAssignmentsByDate(dateToSend);

        } else if (type === "hotel") {

            // Hotel tab: aggregate active employee and vendor assignments by

            // caterer, venue, assignment date, shift and work type.

            const [employeeResponse, vendorResponse] = await Promise.all([

                getAssignmentsByDate(dateToSend),

                getVendorsByDate(dateToSend),

            ]);

            const employeeList = extractList(employeeResponse);

            const vendorList = extractList(vendorResponse);

            const isCancelled = (record) => {

                const value = getValue(record, "isCancelled");

                return value === true || String(value).toLowerCase() === "true";

            };

            // Some assignment responses omit MemberType. Resolve it from the

            // employee master list by EmployeeId in that case.

            const resolveMemberType = (assignment) => {

                const directType = getMemberType(assignment);

                if (directType === "local" || directType === "inhouse") {

                    return directType;

                }

                const employeeId = getValue(assignment, "employeeId");

                if (employeeId == null) return directType;

                const employee = employees.find((item) => {

                    const id = getValue(item, "employeeId") ?? getValue(item, "id");

                    return id != null && String(id) === String(employeeId);

                });

                return getMemberType(employee);

            };

            const activeEmployees = employeeList.filter((record) => !isCancelled(record));

            const activeVendors = vendorList.filter((record) => !isCancelled(record));

            const groups = new Map();

            const getHotelId = (record) =>

                getValue(record, "hotelId") ??

                getValue(record, "fk_HotelId") ??

                getValue(record, "hotelMasterId");

            const getAssignmentDate = (record) =>

                getValue(record, "assignmentDate") ??

                getValue(record, "assignDate") ??

                dateToSend;

            const getVenueGroupValue = (record) => {

                const venueName = getVenueName(record, hotels);

                if (venueName && venueName !== "—" && !String(venueName).startsWith("Venue ID:")) {

                    return String(venueName).trim().toLowerCase();

                }

                return String(

                    getValue(record, "venueId") ??

                    getValue(record, "fk_VenueId") ??

                    getValue(record, "venue") ??

                    ""

                ).trim().toLowerCase();

            };

            const getGroupKey = (record) => JSON.stringify([

                String(getHotelId(record) ?? ""),

                getVenueGroupValue(record),

                String(getAssignmentDate(record)).slice(0, 10),

                String(getValue(record, "shiftId") ?? ""),

                String(getValue(record, "workType") ?? "").trim().toLowerCase(),

            ]);

            const getOrCreateGroup = (record) => {

                const key = getGroupKey(record);

                if (!groups.has(key)) {

                    const hotelId = getHotelId(record);

                    const assignmentDate = getAssignmentDate(record);

                    const shiftId = getValue(record, "shiftId");

                    groups.set(key, {

                        assignmentId: groups.size + 1,

                        hotelId: hotelId ?? "—",

                        hotelName: getHotelName(record, hotels),

                        venueName: getVenueName(record, hotels),

                        assignmentDate,

                        shiftId,

                        shiftName: getValue(record, "shiftName") ?? getShiftName(shiftId),

                        workType: getValue(record, "workType") ?? "—",

                        _localEmployeeIds: new Set(),

                        _inHouseEmployeeIds: new Set(),

                        vendorEmployeeCount: 0,

                    });

                }

                return groups.get(key);

            };

            activeEmployees.forEach((record) => {

                const employeeId = getValue(record, "employeeId");

                if (employeeId == null) return;

                const memberType = resolveMemberType(record);

                if (memberType !== "local" && memberType !== "inhouse") return;

                const row = getOrCreateGroup(record);

                if (memberType === "local") {

                    row._localEmployeeIds.add(String(employeeId));

                } else {

                    row._inHouseEmployeeIds.add(String(employeeId));

                }

            });

            activeVendors.forEach((record) => {

                const row = getOrCreateGroup(record);

                const quantity = Number(

                    getValue(record, "emp_Quantity") ??

                    getValue(record, "employeeCount") ??

                    getValue(record, "employeeQuantity") ??

                    0

                );

                if (Number.isFinite(quantity)) row.vendorEmployeeCount += quantity;

            });

            return Array.from(groups.values())

                .map((row, index) => {

                    const localEmployeeCount = row._localEmployeeIds.size;

                    const inHouseEmployeeCount = row._inHouseEmployeeIds.size;

                    const vendorEmployeeCount = row.vendorEmployeeCount;

                    return {

                        assignmentId: index + 1,

                        hotelId: row.hotelId,

                        hotelName: row.hotelName,

                        venueName: row.venueName,

                        assignmentDate: row.assignmentDate,

                        shiftId: row.shiftId,

                        shiftName: row.shiftName,

                        workType: row.workType,

                        localEmployeeCount,

                        inHouseEmployeeCount,

                        vendorEmployeeCount,

                        totalEmployeeCount: localEmployeeCount + inHouseEmployeeCount + vendorEmployeeCount,

                    };

                })

                .sort((a, b) =>

                    String(a.hotelName).localeCompare(String(b.hotelName)) ||

                    String(a.venueName).localeCompare(String(b.venueName)) ||

                    Number(a.shiftId ?? 0) - Number(b.shiftId ?? 0)

                );

        } else {

            return [];

        }

        const list = extractList(response);

        //console.log(`${type} assignments response:`, response?.data ?? response);

        //console.log(`${type} assignments parsed list:`, list);

        return list;

    }, [hotels, employees]);

    // Reload data when the selected date or tab changes.

    useEffect(() => {

        let isCurrent = true;

        const fetchAllocations = async () => {

            setRecords([]);

            setError("");

            if (!allocationDate) {

                setLoading(false);

                setError("Please select an allocation date.");

                return;

            }

            setLoading(true);

            try {

                const result = await loadAllocations(

                    allocationType,

                    allocationDate

                );

                if (isCurrent) {

                    setRecords(result);

                }

            } catch (err) {

                console.error(

                    "Master Allocations API error:",

                    err.response?.data ?? err.message

                );

                if (isCurrent) {

                    setRecords([]);

                    setError(

                        err.response?.data?.message ??

                        err.response?.data?.title ??

                        err.message ??

                        "Failed to load allocation records."

                    );

                }

            } finally {

                if (isCurrent) setLoading(false);

            }

        };

        fetchAllocations();

        return () => {

            isCurrent = false;

        };

    }, [allocationType, allocationDate, loadAllocations]);

    // IMPORTANT:

    // Employee tab excludes Local assignments.

    // Local tab includes only records whose memberType is "Local".

    const tabRecords = useMemo(() => {

        if (allocationType === "local") {

            return records.filter(

                (record) => getMemberType(record) === "local"

            );

        }

        if (allocationType === "employee") {

            return records.filter(

                (record) => getMemberType(record) !== "local"

            );

        }

        return records;

    }, [records, allocationType]);

    // Apply search to records already filtered for the selected tab.

    const filteredRecords = useMemo(() => {

        const query = searchText.trim().toLowerCase();

        if (!query) return tabRecords;

        return tabRecords.filter((record) => {

            const employeeName = getEmployeeName(

                getValue(record, "employeeId"),

                employees

            );

            const vendorName = getVendorName(record, vendors);

            const hotelName = getHotelName(record, hotels);

            const venueName = getVenueName(record, hotels);

            const searchableValues = [

                ...Object.values(record ?? {}),

                employeeName,

                vendorName,

                hotelName,

                venueName,

                getShiftName(getValue(record, "shiftId")),

                formatDate(

                    getValue(record, "assignmentDate") ??

                    getValue(record, "assignDate")

                ),

            ];

            return searchableValues.some((value) =>

                String(value ?? "").toLowerCase().includes(query)

            );

        });

    }, [tabRecords, searchText, employees, vendors, hotels]);

    // Reset pagination whenever the selected tab, date, or search changes.
    useEffect(() => {
        setCurrentPage(1);
    }, [allocationType, allocationDate, searchText]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredRecords.length / RECORDS_PER_PAGE)
    );
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = Math.min(
        startIndex + RECORDS_PER_PAGE,
        filteredRecords.length
    );
    const paginatedRecords = useMemo(
        () => filteredRecords.slice(startIndex, endIndex),
        [filteredRecords, startIndex, endIndex]
    );

    const handleTypeChange = (event) => {

        setAllocationType(event.target.value);

        setSearchText("");

        setError("");

    };

    const handleRefresh = async () => {

        if (!allocationDate) {

            setError("Please select an allocation date.");

            return;

        }

        setLoading(true);

        setError("");

        try {

            const result = await loadAllocations(

                allocationType,

                allocationDate

            );

            setRecords(result);

        } catch (err) {

            console.error(

                "Refresh allocation error:",

                err.response?.data ?? err.message

            );

            setRecords([]);

            setError(

                err.response?.data?.message ??

                err.response?.data?.title ??

                err.message ??

                "Failed to refresh allocation records."

            );

        } finally {

            setLoading(false);

        }

    };

    const summaryIcon =

        allocationType === "employee"

            ? "♟"

            : allocationType === "local"

                ? "♙"

                : allocationType === "vendor"

                    ? "▣"

                    : allocationType === "supplier"

                        ? "♧"

                        : "⌂";

    return (

        <div className="master-allocations-page">

            <div className="master-allocations-header">

                <div>

                    <h2>Master Allocations</h2>

                    <p>

                        View allocation records by date and allocation type.

                    </p>

                </div>

                <button

                    type="button"

                    className="allocation-refresh-button"

                    onClick={handleRefresh}

                    disabled={loading}

                >

                    {loading ? "Loading..." : "↻ Refresh"}

                </button>

            </div>

            <div className="master-allocations-filters">

                <div className="allocation-filter">

                    <DatePicker

                        id="allocationDate"

                        name="allocationDate"

                        label="Allocation Date"

                        value={allocationDate}

                        onChange={setAllocationDate}

                        required

                    />

                </div>

                <div className="allocation-filter">

                    <label>Allocation Type</label>

                    <div className="allocation-type-options">

                        {Object.entries(ALLOCATION_TYPES).map(

                            ([value, label]) => (

                                <label

                                    key={value}

                                    className={`allocation-type-option ${

                                        allocationType === value

                                            ? "selected"

                                            : ""

                                    }`}

                                >

                                    <input

                                        type="radio"

                                        name="allocationType"

                                        value={value}

                                        checked={allocationType === value}

                                        onChange={handleTypeChange}

                                    />

                                    <span>{label}</span>

                                </label>

                            )

                        )}

                    </div>

                </div>

                <div className="allocation-filter">

                    <label htmlFor="allocationSearch">

                        Search Records

                    </label>

                    <input

                        id="allocationSearch"

                        type="search"

                        placeholder="Search ID, employee, vendor, supplier, hotel, date, shift..."

                        value={searchText}

                        onChange={(event) =>

                            setSearchText(event.target.value)

                        }

                    />

                </div>

            </div>

            {error && (

                <div className="allocation-message allocation-error">

                    <strong>Error:</strong> {error}

                </div>

            )}

            <div className="allocation-summary-row">

                <div className="allocation-summary-card">

                    <div className="allocation-summary-icon">

                        <span aria-hidden="true">{summaryIcon}</span>

                    </div>

                    <div className="allocation-summary-details">

                        <span>

                            Total {ALLOCATION_TYPES[allocationType]} Allocations

                        </span>

                        <h2>

                            {loading ? "—" : filteredRecords.length}

                        </h2>

                        <small>

                            Date: {formatDate(allocationDate)}

                        </small>

                    </div>

                </div>

                <div className="allocation-result-info">

                    Showing {filteredRecords.length} of {tabRecords.length}{" "}

                    {ALLOCATION_TYPES[allocationType].toLowerCase()} records

                </div>

            </div>

            <div className="master-allocations-table-card">

                <div className="master-allocations-table-heading">

                    <div>

                        <h3>

                            {ALLOCATION_TYPES[allocationType]} Allocation Details

                        </h3>

                        <p>
                            Assignments for {formatDate(allocationDate)}
                        </p>

                    </div>

                </div>

                <div className="allocation-table-container">

                    <table

                        className={`master-allocations-table ${

                            allocationType === "hotel" ? "hotel-allocation-table" : ""

                        }`}

                    >

                        <thead>

                            <tr>

                                {columns.map((column) => (

                                    <th key={column.key}>

                                        {column.label}

                                    </th>

                                ))}

                            </tr>

                        </thead>

                        <tbody>

                            {loading ? (

                                <tr>

                                    <td

                                        colSpan={columns.length}

                                        className="allocation-empty"

                                    >

                                        Loading allocations...

                                    </td>

                                </tr>

                            ) : error ? (

                                <tr>

                                    <td

                                        colSpan={columns.length}

                                        className="allocation-empty"

                                    >

                                        Unable to load allocation records.

                                    </td>

                                </tr>

                            ) : filteredRecords.length === 0 ? (

                                <tr>

                                    <td

                                        colSpan={columns.length}

                                        className="allocation-empty"

                                    >

                                        No{" "}

                                        {ALLOCATION_TYPES[

                                            allocationType

                                        ].toLowerCase()}{" "}

                                        allocations found for the selected date.

                                    </td>

                                </tr>

                            ) : (

                                paginatedRecords.map((record, index) => (

                                    <tr

                                        key={

                                            getValue(record, "assignmentId") ??

                                            `${allocationType}-${startIndex + index}`

                                        }

                                    >

                                        {columns.map((column) => {

                                            const value = getValue(

                                                record,

                                                column.key

                                            );

                                            let displayValue = value ?? "—";

                                            if (

                                                column.key === "assignmentId"

                                            ) {

                                                // Show sequential row numbers.

                                                displayValue = startIndex + index + 1;

                                            } else if (

                                                column.key === "assignmentDate"

                                            ) {

                                                displayValue = formatDate(

                                                    getValue(record, "assignmentDate") ??

                                                    getValue(record, "assignDate")

                                                );

                                            } else if (

                                                column.key === "employeeName"

                                            ) {

                                                displayValue =

                                                    getValue(

                                                        record,

                                                        "employeeName"

                                                    ) ??

                                                    getEmployeeName(

                                                        getValue(

                                                            record,

                                                            "employeeId"

                                                        ),

                                                        employees

                                                    );

                                            } else if (

                                                column.key === "vendorName"

                                            ) {

                                                displayValue = getVendorName(

                                                    record,

                                                    vendors

                                                );

                                            } else if (

                                                column.key === "emp_Quantity"

                                            ) {

                                                displayValue =

                                                    getValue(

                                                        record,

                                                        "emp_Quantity"

                                                    ) ?? "—";

                                            } else if (

                                                column.key === "hotelName"

                                            ) {

                                                displayValue = getHotelName(

                                                    record,

                                                    hotels

                                                );

                                            } else if (

                                                column.key === "venueName"

                                            ) {

                                                displayValue = getVenueName(

                                                    record,

                                                    hotels

                                                );

                                            } else if (

                                                column.key === "shiftName"

                                            ) {

                                                displayValue =

                                                    getValue(record, "shiftName") ??

                                                    getShiftName(getValue(record, "shiftId"));

                                            } else if (

                                                [

                                                    "localEmployeeCount",

                                                    "inHouseEmployeeCount",

                                                    "vendorEmployeeCount",

                                                    "totalEmployeeCount",

                                                ].includes(column.key)

                                            ) {

                                                displayValue = getValue(record, column.key) ?? 0;

                                            }

                                            return (

                                                <td key={column.key}>

                                                    {displayValue}

                                                </td>

                                            );

                                        })}

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            {!loading && !error && filteredRecords.length > 0 && (
                <div className="allocation-pagination">
                    <div className="pagination-info">
                        Showing {startIndex + 1} to {endIndex} of {filteredRecords.length} records
                    </div>
                    <div className="pagination-buttons">
                        <button
                            type="button"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            First
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="pagination-current">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            Next
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage >= totalPages}
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}

            <div className="master-allocations-table-footer">

                    <span>

                        {loading

                            ? "Loading records..."

                            : `${filteredRecords.length} record(s) displayed`}

                    </span>

                    {loadingEmployees && (

                        <span>Loading employee names...</span>

                    )}

                </div>

            </div>

        </div>

    );

};

export default MasterAllocations;
