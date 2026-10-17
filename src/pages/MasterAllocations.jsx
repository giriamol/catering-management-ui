import React, { useEffect, useMemo, useState, useCallback } from "react";

import "../CSS/MasterAllocations.css";

import DatePicker from "../components/DatePicker";



import {

    getAssignmentsByDate,

    getVendorsByDate,

} from "../api/dailyHotelAssignmentApi";

import { getEmployees } from "../api/employeeApi";

import { getVendors } from "../api/vendorApi";

import { getHotels } from "../api/hotelApi";



const ALLOCATION_TYPES = {

    employee: "Employee",

    vendor: "Vendor",

    hotel: "Hotel",

};



const SHIFTS = [

    { shiftId: 1, shiftCode: "MORNING", shiftName: "Morning" },

    { shiftId: 2, shiftCode: "EVENING", shiftName: "Evening" },

    { shiftId: 3, shiftCode: "TwoHalfDay", shiftName: "TwoHalfDay" },

];



const TABLE_COLUMNS = {

    employee: [

        { key: "assignmentId", label: "Sr. No." },

        { key: "employeeName", label: "Employee Name" },

        { key: "hotelName", label: "Caters-Name" },

        { key: "venueName", label: "Caters-Venue" },

        { key: "assignmentDate", label: "Assign-Date" },

        { key: "shiftName", label: "Shift Name" },

        { key: "workType", label: "Work Type" },

    ],

    vendor: [

        { key: "assignmentId", label: "Sr. No." },

        { key: "vendorName", label: "Vendor Name" },

        { key: "emp_Quantity", label: "Employee Count" },

        { key: "hotelName", label: "Caters-Name" },

        { key: "venueName", label: "Caters-Venue" },

        { key: "assignmentDate", label: "Assign-Date" },

        { key: "shiftName", label: "Shift Name" },

        { key: "workType", label: "Work Type" },

    ],

    hotel: [

        { key: "assignmentId", label: "Sr. No." },

        { key: "hotelId", label: "Caters ID" },

        { key: "hotelName", label: "Caters-Name" },

        { key: "venueName", label: "Caters-Venue" },

        { key: "assignmentDate", label: "Assign-Date" },

        { key: "shiftName", label: "Shift Name" },

        { key: "workType", label: "Work Type" },

    ],

};



const getTodayDate = () => {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    // Keep the value used by the API in YYYY-MM-DD format.

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



// Case-insensitive lookup supports camelCase and PascalCase API models.

const getValue = (record, key) => {

    if (!record || !key) return null;

    if (record[key] != null) return record[key];



    const matchingKey = Object.keys(record).find(

        (property) => property.toLowerCase() === key.toLowerCase()

    );



    return matchingKey ? record[matchingKey] : null;

};



// Displays dates as DD/MM/YYYY, while the date picker and API continue

// using YYYY-MM-DD.

const formatDate = (value) => {

    if (!value) return "—";



    const text = String(value).trim();



    // Already in DD/MM/YYYY format.

    const displayMatch = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (displayMatch) return `${displayMatch[1]}/${displayMatch[2]}/${displayMatch[3]}`;



    // ISO date or ISO datetime: YYYY-MM-DD...

    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;



    // Also handle dates such as YYYY-MM-DDTHH:mm:ss via the ISO match above.

    return text;

};



const getShiftName = (shiftId) => {

    const shift = SHIFTS.find((item) => item.shiftId === Number(shiftId));

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



    return `${firstName} ${lastName}`.trim() || `Employee ID: ${employeeId}`;

};



const getVendorName = (record, vendors) => {

    const directName =

        getValue(record, "vendorName") ??

        getValue(record, "companyName") ??

        getValue(record, "businessName");



    if (directName) return directName;



    const vendorId =

        getValue(record, "vendorId") ?? getValue(record, "fk_VendorId");



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



// Resolves HotelId/FK_HotelId against the hotel master list when the

// assignment response does not include a hotel name.

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




// Resolves the venue name from the assignment response or matching hotel.
const getVenueName = (record, hotels) => {
    const directVenue =
        getValue(record, "venueName") ??
        getValue(record, "VenueName") ??
        getValue(record, "venue") ??
        getValue(record, "Venue") ??
        getValue(record, "catersVenue") ??
        getValue(record, "hotelVenueName") ??
        getValue(record, "venue_name");

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
        return id != null && hotelId != null && String(id) === String(hotelId);
    });

    if (hotel) {
        const hotelVenue =
            getValue(hotel, "venueName") ??
            getValue(hotel, "VenueName") ??
            getValue(hotel, "venue") ??
            getValue(hotel, "Venue") ??
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

const MasterAllocations = () => {

    const [allocationType, setAllocationType] = useState("employee");

    const [allocationDate, setAllocationDate] = useState(getTodayDate);

    const [searchText, setSearchText] = useState("");



    const [records, setRecords] = useState([]);

    const [employees, setEmployees] = useState([]);

    const [vendors, setVendors] = useState([]);

    const [hotels, setHotels] = useState([]);



    const [loading, setLoading] = useState(false);

    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [error, setError] = useState("");



    const columns = TABLE_COLUMNS[allocationType];



    // Load employee master data.

    useEffect(() => {

        let isCurrent = true;



        const loadEmployees = async () => {

            try {

                setLoadingEmployees(true);

                const response = await getEmployees(1, 2000);



                if (isCurrent) setEmployees(extractList(response));

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



                console.log("Hotel master response:", response);

                console.log("Hotel master list:", hotelList);



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



    const loadAllocations = useCallback(async (type, date) => {

        if (!date) {

            throw new Error("Please select an allocation date.");

        }



        // DatePicker returns YYYY-MM-DD, which is the format expected by the API.

        const dateToSend = String(date).slice(0, 10);



        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToSend)) {

            throw new Error(`Invalid date "${date}". Expected YYYY-MM-DD.`);

        }



        let response;



        if (type === "employee") {

            console.log(

                "Calling employee assignment endpoint:",

                `/DailyHotelAssignment/date/${dateToSend}`

            );

            response = await getAssignmentsByDate(dateToSend);

        } else if (type === "vendor") {

            console.log(

                "Calling vendor assignment endpoint:",

                `/DailyHotelAssignment/vendor/date/${dateToSend}`

            );

            response = await getVendorsByDate(dateToSend);

        } else {

            return [];

        }



        const list = extractList(response);



        console.log(`${type} assignments response:`, response?.data ?? response);

        console.log(`${type} assignments parsed list:`, list);



        return list;

    }, []);



    // Reload assignments when allocation type or date changes.

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



            if (allocationType === "hotel") {

                setLoading(false);

                return;

            }



            setLoading(true);



            try {

                const result = await loadAllocations(allocationType, allocationDate);



                if (isCurrent) setRecords(result);

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



    const filteredRecords = useMemo(() => {

        const query = searchText.trim().toLowerCase();



        if (!query) return records;



        return records.filter((record) => {

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

                formatDate(getValue(record, "assignmentDate")),

            ];



            return searchableValues.some((value) =>

                String(value ?? "").toLowerCase().includes(query)

            );

        });

    }, [records, searchText, employees, vendors, hotels]);



    const handleTypeChange = (event) => {

        setAllocationType(event.target.value);

        setSearchText("");

    };



    const handleRefresh = async () => {

        if (!allocationDate) {

            setError("Please select an allocation date.");

            return;

        }



        if (allocationType === "hotel") {

            setRecords([]);

            setError("");

            return;

        }



        setLoading(true);

        setError("");



        try {

            const result = await loadAllocations(allocationType, allocationDate);

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



    return (

        <div className="master-allocations-page">

            <div className="master-allocations-header">

                <div>

                    <h2>Master Allocations</h2>

                    <p>View allocation records by date and allocation type.</p>

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

                        onChange={(date) => setAllocationDate(date)}

                        required

                    />

                </div>



                <div className="allocation-filter">

                    <label>Allocation Type</label>

                    <div className="allocation-type-options">

                        {Object.entries(ALLOCATION_TYPES).map(([value, label]) => (

                            <label

                                key={value}

                                className={`allocation-type-option ${

                                    allocationType === value ? "selected" : ""

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

                        ))}

                    </div>

                </div>



                <div className="allocation-filter">

                    <label htmlFor="allocationSearch">Search Records</label>

                    <input

                        id="allocationSearch"

                        type="search"

                        placeholder="Search ID, employee, vendor, hotel, date, shift..."

                        value={searchText}

                        onChange={(event) => setSearchText(event.target.value)}

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

                        <span aria-hidden="true">

                            {allocationType === "employee"

                                ? "♟"

                                : allocationType === "vendor"

                                    ? "▣"

                                    : "⌂"}

                        </span>

                    </div>



                    <div className="allocation-summary-details">

                        <span>Total {ALLOCATION_TYPES[allocationType]} Allocations</span>

                        <h2>{loading ? "—" : filteredRecords.length}</h2>

                        <small>Date: {formatDate(allocationDate)}</small>

                    </div>

                </div>



                <div className="allocation-result-info">

                    Showing {filteredRecords.length} of {records.length} records

                </div>

            </div>



            <div className="master-allocations-table-card">

                <div className="master-allocations-table-heading">

                    <div>

                        <h3>{ALLOCATION_TYPES[allocationType]} Allocation Details</h3>

                        <p>Assignments for {formatDate(allocationDate)}</p>

                    </div>

                </div>



                <div className="allocation-table-container">

                    <table className="master-allocations-table">

                        <thead>

                            <tr>

                                {columns.map((column) => (

                                    <th key={column.key}>{column.label}</th>

                                ))}

                            </tr>

                        </thead>



                        <tbody>

                            {loading ? (

                                <tr>

                                    <td colSpan={columns.length} className="allocation-empty">

                                        Loading allocations...

                                    </td>

                                </tr>

                            ) : error ? (

                                <tr>

                                    <td colSpan={columns.length} className="allocation-empty">

                                        Unable to load allocation records.

                                    </td>

                                </tr>

                            ) : allocationType === "hotel" ? (

                                <tr>

                                    <td colSpan={columns.length} className="allocation-empty">

                                        Hotel allocation API is not connected yet.

                                    </td>

                                </tr>

                            ) : filteredRecords.length === 0 ? (

                                <tr>

                                    <td colSpan={columns.length} className="allocation-empty">

                                        No {ALLOCATION_TYPES[allocationType].toLowerCase()} allocations

                                        found for the selected date.

                                    </td>

                                </tr>

                            ) : (

                                filteredRecords.map((record, index) => (

                                    <tr

                                        key={

                                            getValue(record, "assignmentId") ??

                                            `${allocationType}-${index}`

                                        }

                                    >

                                        {columns.map((column) => {

                                            const value = getValue(record, column.key);

                                            let displayValue = value ?? "—";



                                            if (column.key === "assignmentId") {

                                                displayValue =

                                                    getValue(record, "assignmentId") ?? index + 1;

                                            } else if (column.key === "assignmentDate") {

                                                displayValue = formatDate(value);

                                            } else if (column.key === "employeeName") {

                                                displayValue =

                                                    getValue(record, "employeeName") ??

                                                    getEmployeeName(

                                                        getValue(record, "employeeId"),

                                                        employees

                                                    );

                                            } else if (column.key === "vendorName") {

                                                displayValue = getVendorName(record, vendors);

                                            } else if (column.key === "emp_Quantity") {

                                                displayValue =

                                                    getValue(record, "emp_Quantity") ?? "—";

                                            } else if (column.key === "hotelName") {

                                                displayValue = getHotelName(record, hotels);

                                            } else if (column.key === "venueName" || column.key === "Venue") {
                                                displayValue = getVenueName(record, hotels);
                                            } else if (column.key === "shiftName") {

                                                displayValue =

                                                    getValue(record, "shiftName") ??

                                                    getShiftName(getValue(record, "shiftId"));

                                            }



                                            return (

                                                <td key={column.key}>{displayValue}</td>

                                            );

                                        })}

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>



                <div className="master-allocations-table-footer">

                    <span>

                        {loading

                            ? "Loading records..."

                            : `${filteredRecords.length} record(s) displayed`}

                    </span>

                    {loadingEmployees && <span>Loading employee names...</span>}

                </div>

            </div>

        </div>

    );

};



export default MasterAllocations;
