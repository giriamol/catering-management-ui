

import { useEffect, useRef, useState } from "react";
import "../CSS/ReportsOverview.css";

import { getEmployees } from "../api/employeeApi";
import {
    getReportEmployee,
    getAllReportEmployee,
} from "../api/dailyEmployeePaymentApi";

import { getVendorReport,getAllVendorReport, getVendorWorkReportSummary } from "../api/vendorPaymentApi";

import { getVendors } from "../api/vendorApi";
import { getHotels } from "../api/hotelApi";

import {
    GetemployeeReportwork ,getCaterersPaymentReport,
    getAllCaterersPaymentReport,   
} from "../api/hotelAssignmentDataApi";
//import{ 
//}from "../api/hotelAssignmentData";
const reportItems = [
    { id: "employee-payment", title: "Employee Payment Statements", implemented: true },
    { id: "all-employee-payment", title: "All Employee Payment Statements", implemented: true },
    { id: "employee-work-Report", title: "Employee Work Statements", implemented: true },

    { id: "vendor-payment", title: "Vendor Payment Statements", implemented: true },
    { id: "all-vendor-payment", title: "All Vendor Payment Statements", implemented: true },
    { id: "vendor-work-report", title: "Vendor Work Statements", implemented: true },
    { id: "caterer-payment", title: "Caterers Payment Statements", implemented: true },
    { id: "all-caterer-payment", title: "All Caterers Payment Statements", implemented: true },
    { id: "employee-work-Report", title: "Statements", implemented: false },
    { id: "supplier-work-report", title: "Supplier Work Report", implemented: true },
    { id: "all-supplier-work-report", title: "All Supplier Work Report", implemented: true },
   
];

const getEmployeeId = (item) =>
    item?.employeeId ?? item?.EmployeeId ?? item?.employeeID ?? item?.id;

const getEmployeeName = (item) =>
    item?.fullName ??
    item?.FullName ??
    item?.employeeName ??
    item?.EmployeeName ??
    "";

const getVendorId = (item) =>
    item?.vendorId ?? item?.VendorId ?? item?.vendorID ?? item?.id;

const getVendorName = (item) =>
    item?.vendorName ??
    item?.VendorName ??
    item?.name ??
    item?.Name ??
    "";

const getHotelId = (item) =>
    item?.hotelId ??
    item?.HotelId ??
    item?.hotelID ??
    item?.caterersId ??
    item?.CaterersId ??
    item?.id ??
    item?.Id;

const getHotelName = (item) =>
    item?.hotelName ??
    item?.HotelName ??
    item?.caterersName ??
    item?.CaterersName ??
    item?.catersName ??
    item?.CatersName ??
    item?.name ??
    item?.Name ??
    "";

const normalizeStatusValue = (value) =>
    String(value ?? "").replace(/[\s_-]+/g, "").toLowerCase();

const isObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

/*
 * Supports Axios responses, arrays, and wrapped API responses:
 * { data: [...] }, { result: [...] }, { data: { data: [...] } }
 */
const getResponseRows = (input) => {
    let value = input;

    for (let depth = 0; depth < 6; depth += 1) {
        if (Array.isArray(value)) return value;

        if (!isObject(value)) return [];

        if (Array.isArray(value.$values)) return value.$values;
        if (Array.isArray(value.items)) return value.items;
        if (Array.isArray(value.result)) return value.result;
        if (Array.isArray(value.results)) return value.results;

        const next =
            value.data ??
            value.$values ??
            value.items ??
            value.result ??
            value.results;

        if (next === undefined || next === value) {
            return Object.keys(value).length ? [value] : [];
        }

        value = next;
    }

    if (Array.isArray(value)) return value;

    return isObject(value) && Object.keys(value).length ? [value] : [];
};

/* Supports camelCase and PascalCase API properties. */
const getField = (row, ...names) => {
    if (!isObject(row)) return "";

    for (const name of names) {
        if (row[name] !== undefined && row[name] !== null) {
            return row[name];
        }
    }

    const keys = Object.keys(row);

    for (const name of names) {
        const match = keys.find(
            (key) => key.toLowerCase() === name.toLowerCase()
        );

        if (match && row[match] !== undefined && row[match] !== null) {
            return row[match];
        }
    }

    return "";
};

const matchesStatusFilter = (row, statusFilter) => {
    if (!statusFilter || statusFilter === "All") return true;

    const filterValue = normalizeStatusValue(statusFilter);

    const values = [
        getField(
            row,
            "status",
            "Status",
            "paymentStatus",
            "PaymentStatus",
            "payment_status",
            "Payment_Status"
        ),
        getField(
            row,
            "hotelPaymentStatus",
            "HotelPaymentStatus",
            "currentStatus",
            "CurrentStatus"
        ),
    ];

    return values.some(
        (value) => normalizeStatusValue(value) === filterValue
    );
};

const formatAmount = (value) => {
    const amount = Number(value);

    return (Number.isFinite(amount) ? amount : 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/* Format API dates as DD/MM/YYYY without UTC date shifting. */
const formatDate = (value) => {
    if (!value) return "--";

    const text = String(value).trim();

    const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoMatch) {
        return `${isoMatch[3]}-${isoMatch[2]}-${isoMatch[1]}`;
    }

    const displayMatch = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);

    if (displayMatch) {
        return `${displayMatch[1]}-${displayMatch[2]}-${displayMatch[3]}`;
    }

    return text;
};

const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (typeof data === "string") return data;

    return (
        data?.message ||
        data?.title ||
        error?.message ||
        "Unable to generate the report. Please try again."
    );
};

function ReportsOverview() {
    const fromDatePickerRef = useRef(null);
    const toDatePickerRef = useRef(null);

    const openDatePicker = (pickerRef) => {
        const picker = pickerRef.current;
        if (!picker) return;

        if (typeof picker.showPicker === "function") {
            picker.showPicker();
        } else {
            picker.focus();
            picker.click();
        }
    };

    const [selectedReport, setSelectedReport] = useState("");

    const [employees, setEmployees] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [hotels, setHotels] = useState([]);

    const [employeesLoading, setEmployeesLoading] = useState(false);
    const [vendorsLoading, setVendorsLoading] = useState(false);
    const [hotelsLoading, setHotelsLoading] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: "",
        vendorId: "",
        hotelId: "",
        fromDate: "",
        toDate: "",
        status: "Paid",
    });

    const [generatedReport, setGeneratedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const activeReport =
        reportItems.find((item) => item.id === selectedReport) || null;

    const isSingleEmployeeReport = selectedReport === "employee-payment";
    const isAllEmployeeReport = selectedReport === "all-employee-payment";
    const isEmployeeReport =
        isSingleEmployeeReport || isAllEmployeeReport;

    const isEmployeeWorkReport =
        selectedReport === "employee-work-Report";

    const isSingleVendorReport = selectedReport === "vendor-payment";
    const isAllVendorReport = selectedReport === "all-vendor-payment";
    const isVendorWorkReport = selectedReport === "vendor-work-report";
    const isVendorReport = isSingleVendorReport || isAllVendorReport;

    const isSingleSupplierReport = selectedReport === "supplier-work-report";
    const isAllSupplierReport = selectedReport === "all-supplier-work-report";
    const isSupplierReport = isSingleSupplierReport || isAllSupplierReport;

    const isSingleCatererReport = selectedReport === "caterer-payment";
    const isAllCatererReport = selectedReport === "all-caterer-payment";
    const isCatererReport =
        isSingleCatererReport || isAllCatererReport;

    const selectedEmployee = employees.find(
        (employee) =>
            String(getEmployeeId(employee)) === String(formData.employeeId)
    );

    const selectedVendor = vendors.find(
        (vendor) =>
            String(getVendorId(vendor)) === String(formData.vendorId)
    );

    const selectedHotel = hotels.find(
        (hotel) =>
            String(getHotelId(hotel)) === String(formData.hotelId)
    );

    /*
     * Find the hotel name by matching the HotelId in the report
     * with the ID returned by getHotels().
     */
    const getHotelNameById = (hotelId) => {
        if (hotelId === undefined || hotelId === null || hotelId === "") {
            return "--";
        }

        const hotel = hotels.find(
            (item) => String(getHotelId(item)) === String(hotelId)
        );

        return hotel ? getHotelName(hotel) || "--" : "--";
    };

    /* Load employees for employee reports. */
    useEffect(() => {
        if (!isSingleEmployeeReport && !isEmployeeWorkReport) {
            return undefined;
        }

        let cancelled = false;

        const loadEmployees = async () => {
            setEmployeesLoading(true);
            setError("");

            try {
                const response = await getEmployees(1, 2000);
                const rows = getResponseRows(response?.data ?? response);

                if (!cancelled) {
                    setEmployees(
                        rows.filter((item) => getEmployeeId(item) != null)
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        `${getErrorMessage(err)} Check the employee list API.`
                    );
                }
            } finally {
                if (!cancelled) setEmployeesLoading(false);
            }
        };

        loadEmployees();

        return () => {
            cancelled = true;
        };
    }, [isSingleEmployeeReport, isEmployeeWorkReport]);

    /* Load vendors only for vendor payment and vendor work reports. */
    useEffect(() => {
        if (
            !isSingleVendorReport &&
            !isVendorWorkReport
        ) {
            return undefined;
        }

        let cancelled = false;

        const loadVendors = async () => {
            setVendorsLoading(true);
            setError("");

            try {
                const response = await getVendors(1, 2000);
                const rows = getResponseRows(response?.data ?? response);

                if (!cancelled) {
                    setVendors(
                        rows.filter((item) => getVendorId(item) != null)
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        `${getErrorMessage(err)} Check the vendor list API.`
                    );
                }
            } finally {
                if (!cancelled) setVendorsLoading(false);
            }
        };

        loadVendors();

        return () => {
            cancelled = true;
        };
    }, [isSingleVendorReport, isVendorWorkReport]);

    /* Load hotels for caterer, supplier, employee work, and vendor work reports. */
    useEffect(() => {
        if (
            !isSingleCatererReport &&
            !isEmployeeWorkReport &&
            !isVendorWorkReport &&
            !isSingleSupplierReport
        ) {
            return undefined;
        }

        let cancelled = false;

        const loadHotels = async () => {
            setHotelsLoading(true);
            setError("");

            try {
                const response = await getHotels(1, 2000);
                const rows = getResponseRows(response?.data ?? response);

                if (!cancelled) {
                    setHotels(
                        rows.filter((item) => getHotelId(item) != null)
                    );
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        `${getErrorMessage(err)} Check the hotel list API.`
                    );
                }
            } finally {
                if (!cancelled) setHotelsLoading(false);
            }
        };

        loadHotels();

        return () => {
            cancelled = true;
        };
    }, [
        isSingleCatererReport,
        isEmployeeWorkReport,
        isVendorWorkReport,
        isSingleSupplierReport,
    ]);

    const resetFilters = () => {
        setFormData({
            employeeId: "",
            vendorId: "",
            hotelId: "",
            fromDate: "",
            toDate: "",
            status: "Paid",
        });

        setGeneratedReport(null);
        setError("");
    };

    const handleSelectReport = (reportId) => {
        setSelectedReport(reportId);

        setFormData({
            employeeId: "",
            vendorId: "",
            hotelId: "",
            fromDate: "",
            toDate: "",
            status: "Paid",
        });

        setGeneratedReport(null);
        setError("");
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setGeneratedReport(null);
        setError("");
    };

    const handleGenerateReport = async (event) => {
        event.preventDefault();

        if (!activeReport) return;

        setError("");
        setGeneratedReport(null);

        if (!formData.fromDate || !formData.toDate) {
            setError("Please select both From Date and To Date.");
            return;
        }

        if (formData.fromDate > formData.toDate) {
            setError("From Date cannot be greater than To Date.");
            return;
        }

        if (
            (isSingleEmployeeReport || isEmployeeWorkReport) &&
            !formData.employeeId
        ) {
            setError("Please select an employee.");
            return;
        }

        if (
            (isSingleVendorReport || isVendorWorkReport) &&
            !formData.vendorId
        ) {
            setError("Please select a vendor.");
            return;
        }

        if (isSingleSupplierReport && !formData.hotelId) {
            setError("Please select a caterer.");
            return;
        }

        if (isSingleCatererReport && !formData.hotelId) {
            setError("Please select a caterer.");
            return;
        }

        if (!activeReport.implemented) {
            setError(
                "This report is not connected yet. Please connect its API."
            );
            return;
        }

        const status =
            formData.status === "All" || formData.status === "NULL"
                ? null
                : formData.status;

        setLoading(true);

        try {
            let response;

            if (isEmployeeWorkReport) {
                response = await GetemployeeReportwork(
                    Number(formData.employeeId),
                    formData.fromDate,
                    formData.toDate
                );
            } else if (isVendorWorkReport) {
                response = await getVendorWorkReportSummary(
                    Number(formData.vendorId),
                    formData.fromDate,
                    formData.toDate
                );
            } else if (isSingleSupplierReport) {
                response = await getCaterersPaymentReport(
                    Number(formData.hotelId),
                    formData.fromDate,
                    formData.toDate,
                    status
                );
                console.log("response", response);
            } else if (isAllSupplierReport) {
                response = await getAllCaterersPaymentReport(
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else if (isSingleEmployeeReport) {
                response = await getReportEmployee(
                    Number(formData.employeeId),
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else if (isAllEmployeeReport) {
                response = await getAllReportEmployee(
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else if (isSingleVendorReport) {
                response = await getVendorReport(
                    Number(formData.vendorId),
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else if (isAllVendorReport) {
                response = await getAllVendorReport(
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else if (isSingleCatererReport) {
                response = await getCaterersPaymentReport(
                    Number(formData.hotelId),
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else if (isAllCatererReport) {
                response = await getAllCaterersPaymentReport(
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else {
                setError("Please select a valid report.");
                return;
            }

            let rows = getResponseRows(response);

            if ((isCatererReport || isSupplierReport) && formData.status !== "All") {
                rows = rows.filter((row) =>
                    matchesStatusFilter(row, formData.status)
                );
            }

            setGeneratedReport({
                title: activeReport.title,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                status:
                    isEmployeeWorkReport || isVendorWorkReport  ? "" : status || "All",rows,
            });

            if (!rows.length) {
                setError(
                    isEmployeeWorkReport
                        ? "No employee work records were found for the selected date range."
                        : isVendorWorkReport
                            ? "No vendor work records were found for the selected vendor and date range."
                            : isSupplierReport
                                ? "No supplier work records were found for the selected filters and date range."
                                : "No payment records were found for the selected filters."
                );
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedReport("");
        resetFilters();
    };

    const handlePrint = () => {
        if (!generatedReport) {
            setError("Generate a report before printing.");
            return;
        }

        window.print();
    };

    return (
        <div className="reports-overview-page">
            <div className="reports-overview-panel">
                {!selectedReport ? (
                    <>
                        <div className="reports-overview-header">
                            <span className="reports-overview-title-icon">
                                ₹
                            </span>

                            <div>
                                <h1>Reports</h1>
                                <p>
                                    Select a report to view payment or employee
                                    work details.
                                </p>
                            </div>
                        </div>

                        <div className="reports-overview-grid">
                            {reportItems.map((report) => (
                                <button
                                    key={report.id}
                                    type="button"
                                    className="reports-overview-card"
                                    onClick={() =>
                                        handleSelectReport(report.id)
                                    }
                                >
                                    <span className="reports-overview-card-icon">
                                        ₹
                                    </span>

                                    <span className="reports-overview-card-title">
                                        {report.title}
                                    </span>

                                    <span className="reports-overview-card-description">
                                        {report.description}
                                    </span>

                                    <span className="reports-overview-card-arrow">
                                        →
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="report-builder">
                        <div className="report-builder-header no-print">
                            <button
                                type="button"
                                className="report-back-button"
                                onClick={handleBack}
                            >
                                ← Back to Reports
                            </button>

                            <h2>{activeReport?.title}</h2>

                            <p>
                                Select the required filters and generate your
                                report.
                            </p>
                        </div>

                        {!activeReport?.implemented ? (
                            <div className="report-form no-print">
                                <div className="report-error" role="status">
                                    {activeReport?.title} is not connected yet.
                                    Connect the corresponding API to generate
                                    this report.
                                </div>

                                <div className="report-form-actions">
                                    <button
                                        type="button"
                                        className="report-reset-button"
                                        onClick={handleBack}
                                    >
                                        Back to Reports
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <form
                                    className="report-form no-print"
                                    onSubmit={handleGenerateReport}
                                >
                                    <div className="report-form-grid">
                                        {(isSingleEmployeeReport ||
                                            isEmployeeWorkReport) && (
                                            <label className="report-form-field">
                                                <span>Employee Name</span>

                                                <select
                                                    name="employeeId"
                                                    value={formData.employeeId}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={employeesLoading}
                                                >
                                                    <option value="">
                                                        {employeesLoading
                                                            ? "Loading employees..."
                                                            : "Select Employee"}
                                                    </option>

                                                    {employees.map(
                                                        (employee) => {
                                                            const id =
                                                                getEmployeeId(
                                                                    employee
                                                                );

                                                            return (
                                                                <option
                                                                    key={id}
                                                                    value={id}
                                                                >
                                                                    {getEmployeeName(
                                                                        employee
                                                                    ) ||
                                                                        `Employee ${id}`}
                                                                </option>
                                                            );
                                                        }
                                                    )}
                                                </select>
                                            </label>
                                        )}

                                        {(isSingleVendorReport ||
                                            isVendorWorkReport) && (
                                            <label className="report-form-field">
                                                <span>Vendor Name</span>

                                                <select
                                                    name="vendorId"
                                                    value={formData.vendorId}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={vendorsLoading}
                                                >
                                                    <option value="">
                                                        {vendorsLoading
                                                            ? "Loading vendors..."
                                                            : "Select Vendor"}
                                                    </option>

                                                    {vendors.map((vendor) => {
                                                        const id =
                                                            getVendorId(vendor);

                                                        return (
                                                            <option
                                                                key={id}
                                                                value={id}
                                                            >
                                                                {getVendorName(
                                                                    vendor
                                                                ) ||
                                                                    `Vendor ${id}`}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </label>
                                        )}

                                        {(isSingleCatererReport || isSingleSupplierReport) && (
                                            <label className="report-form-field">
                                                <span>Caterer Name</span>

                                                <select
                                                    name="hotelId"
                                                    value={formData.hotelId}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={hotelsLoading}
                                                >
                                                    <option value="">
                                                        {hotelsLoading
                                                            ? "Loading caterers..."
                                                            : "Select Caterer"}
                                                    </option>

                                                    {hotels.map((hotel) => {
                                                        const id =
                                                            getHotelId(hotel);

                                                        return (
                                                            <option
                                                                key={id}
                                                                value={id}
                                                            >
                                                                {getHotelName(
                                                                    hotel
                                                                ) ||
                                                                    `Caterer ${id}`}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </label>
                                        )}

                                        <label className="report-form-field">
                                            <span>From Date</span>

                                            <div className="report-date-picker" style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
                                                <input
                                                    type="text"
                                                    value={
                                                        formData.fromDate
                                                            ? formatDate(formData.fromDate)
                                                            : ""
                                                    }
                                                    placeholder="DD-MM-YYYY"
                                                    readOnly
                                                    style={{ flex: 1, minWidth: 0 }}
                                                    aria-label="From Date in DD-MM-YYYY format"
                                                />
                                                <button
                                                    type="button"
                                                    className="report-date-picker-button"
                                                    onClick={() => openDatePicker(fromDatePickerRef)}
                                                    aria-label="Choose From Date"
                                                    style={{ flexShrink: 0, cursor: "pointer" }}
                                                >
                                                    <span aria-hidden="true">📅</span>
                                                </button>
                                                <input
                                                    ref={fromDatePickerRef}
                                                    type="date"
                                                    name="fromDate"
                                                    value={formData.fromDate}
                                                    onChange={handleInputChange}
                                                    max={formData.toDate || undefined}
                                                    required
                                                    aria-label="Select From Date"
                                                    style={{
                                                        position: "absolute",
                                                        width: "1px",
                                                        height: "1px",
                                                        padding: 0,
                                                        margin: "-1px",
                                                        overflow: "hidden",
                                                        clip: "rect(0, 0, 0, 0)",
                                                        whiteSpace: "nowrap",
                                                        border: 0,
                                                    }}
                                                />
                                            </div>
                                        </label>

                                        <label className="report-form-field">
                                            <span>To Date</span>

                                            <div className="report-date-picker" style={{ display: "flex", alignItems: "center", gap: "8px", position: "relative" }}>
                                                <input
                                                    type="text"
                                                    value={
                                                        formData.toDate
                                                            ? formatDate(formData.toDate)
                                                            : ""
                                                    }
                                                    placeholder="DD-MM-YYYY"
                                                    readOnly
                                                    style={{ flex: 1, minWidth: 0 }}
                                                    aria-label="To Date in DD-MM-YYYY format"
                                                />
                                                <button
                                                    type="button"
                                                    className="report-date-picker-button"
                                                    onClick={() => openDatePicker(toDatePickerRef)}
                                                    aria-label="Choose To Date"
                                                    style={{ flexShrink: 0, cursor: "pointer" }}
                                                >
                                                    <span aria-hidden="true">📅</span>
                                                </button>
                                                <input
                                                    ref={toDatePickerRef}
                                                    type="date"
                                                    name="toDate"
                                                    value={formData.toDate}
                                                    onChange={handleInputChange}
                                                    min={formData.fromDate || undefined}
                                                    required
                                                    aria-label="Select To Date"
                                                    style={{
                                                        position: "absolute",
                                                        width: "1px",
                                                        height: "1px",
                                                        padding: 0,
                                                        margin: "-1px",
                                                        overflow: "hidden",
                                                        clip: "rect(0, 0, 0, 0)",
                                                        whiteSpace: "nowrap",
                                                        border: 0,
                                                    }}
                                                />
                                            </div>
                                        </label>

                                        {!isEmployeeWorkReport &&
                                            !isVendorWorkReport && (
                                                <label className="report-form-field">
                                                    <span>Payment Status</span>

                                                    <select
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                    >
                                                        <option value="All">
                                                            All
                                                        </option>
                                                        <option value="Paid">
                                                            Paid
                                                        </option>
                                                        <option value="Pending">
                                                            Pending
                                                        </option>
                                                        <option value="PartiallyPaid">
                                                            Partially Paid
                                                        </option>
                                                        <option value="Finalized">
                                                            Finalized
                                                        </option>
                                                        <option value="Draft">
                                                            Draft
                                                        </option>
                                                    </select>
                                                </label>
                                            )}
                                    </div>

                                    {error && (
                                        <div
                                            className="report-error"
                                            role="alert"
                                        >
                                            {error}
                                        </div>
                                    )}

                                    <div className="report-form-actions">
                                        <button
                                            type="submit"
                                            className="primary-button"
                                            disabled={
                                                loading ||
                                                employeesLoading ||
                                                vendorsLoading ||
                                                hotelsLoading
                                            }
                                        >
                                            {loading
                                                ? "Generating..."
                                                : "Generate Report"}
                                        </button>

                                        <button
                                            type="button"
                                            className="report-reset-button"
                                            onClick={resetFilters}
                                            disabled={loading}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </form>

                                {generatedReport && (
                                    <section className="report-output-card">
                                        <div className="report-company-header">
                                            <h1>Balaji Enterprises</h1>
                                            <p>
                                                Address: Godhale Nagar, Near
                                                Gadital, Hadapsar, Pune - 412300
                                            </p>
                                            <p>
                                                GSTIN: 789ABDYDH457KO45621
                                            </p>
                                            <p>
                                                Mobile: 456125464545,
                                                789456125
                                            </p>
                                        </div>

                                        <div className="report-output-heading">
                                            <h2>{generatedReport.title}</h2>

                                            <p>
                                                Period:{" "}
                                                {formatDate(
                                                    generatedReport.fromDate
                                                )}{" "}
                                                -{" "}
                                                {formatDate(
                                                    generatedReport.toDate
                                                )}
                                            </p>

                                            {!isEmployeeWorkReport &&
                                                !isVendorWorkReport && (
                                                    <p>
                                                        Payment Status:{" "}
                                                        {generatedReport.status}
                                                    </p>
                                                )}

                                            {(isSingleEmployeeReport ||
                                                isEmployeeWorkReport) && (
                                                <p>
                                                    Employee:{" "}
                                                    {getEmployeeName(
                                                        selectedEmployee
                                                    ) ||
                                                        `Employee ${formData.employeeId}`}
                                                </p>
                                            )}

                                            {(isSingleVendorReport ||
                                                isVendorWorkReport) && (
                                                <p>
                                                    Vendor:{" "}
                                                    {getVendorName(
                                                        selectedVendor
                                                    ) ||
                                                        `Vendor ${formData.vendorId}`}
                                                </p>
                                            )}

                                            {(isSingleCatererReport || isSingleSupplierReport) && (
                                                <p>
                                                    Caterer:{" "}
                                                    {getHotelName(
                                                        selectedHotel
                                                    ) ||
                                                        `Caterer ${formData.hotelId}`}
                                                </p>
                                            )}
                                        </div>

                                        {generatedReport.rows.length > 0 ? (
                                            <div className="report-table-wrapper">
                                                <table className="report-results-table">
                                                    <thead>
                                                        {isSupplierReport ? (
                                                            <tr>
                                                                <th>Sr. No.</th>
                                                                {/* <th>Caterer ID</th> */}
                                                                <th>Caterer Name</th>
                                                                <th>InHouse Half Day</th>
                                                                <th>InHouse Full Day</th>
                                                                <th>Local Half Day</th>
                                                                <th>Local Full Day</th>
                                                                <th>Vendor Half Day</th>
                                                                <th>Vendor Full Day</th>
                                                                <th>Payment Date</th>
                                                                <th>Opening Pending</th>
                                                                <th>Gross Amount</th>
                                                                <th>Total Payable</th>
                                                                <th>Amount Paid</th>
                                                                <th>Closing Pending</th>
                                                                <th>Payment Status</th>
                                                            </tr>
                                                        ) : isVendorWorkReport ? (
                                                            <tr>
                                                                <th>Sr. No.</th>
                                                                <th>
                                                                    Assignment
                                                                    Date
                                                                </th>
                                                                <th>Vendor Name</th>
                                                                <th>
                                                                    Employee
                                                                    Quantity
                                                                </th>
                                                                <th>
                                                                    Hotel Name
                                                                </th>
                                                                <th>Venue</th>
                                                                
                                                                <th>Shift</th>
                                                                <th>Work Type</th>
                                                                <th>
                                                                    Description
                                                                </th>
                                                            </tr>
                                                        ) : isEmployeeWorkReport ? (
                                                            <tr>
                                                                <th>Sr. No.</th>
                                                                <th>
                                                                    Assignment
                                                                    Date
                                                                </th>
                                                                <th>
                                                                    Employee Name
                                                                </th>
                                                                <th>
                                                                    Caterers Name
                                                                </th>
                                                                <th>Venue</th>
                                                                <th>Shift</th>
                                                                <th>Work Type</th>
                                                                <th>Description</th>
                                                            </tr>
                                                        ) : isCatererReport ? (
                                                            <tr>
                                                                <th>Sr. No.</th>
                                                                {/* <th>Caterer ID</th> */}
                                                                <th>Caterer Name</th>
                                                                <th>
                                                                    Opening
                                                                    Pending
                                                                </th>
                                                                <th>Gross Amount</th>
                                                                <th>Total Payable</th>
                                                                <th>Amount Paid</th>
                                                                <th>
                                                                    Closing
                                                                    Pending
                                                                </th>
                                                                <th>
                                                                    Payment Status
                                                                </th>
                                                            </tr>
                                                        ) : isVendorReport ? (
                                                            <tr>
                                                                <th>Sr. No.</th>
                                                                <th>Payment Date</th>
                                                                <th>Vendor ID</th>
                                                                <th>Vendor Name</th>
                                                                <th>
                                                                    Half Day
                                                                    Quantity
                                                                </th>
                                                                <th>
                                                                    Full Day
                                                                    Quantity
                                                                </th>
                                                                <th>
                                                                    Opening
                                                                    Pending
                                                                </th>
                                                                <th>Gross Amount</th>
                                                                <th>
                                                                    Advance
                                                                    Deducted
                                                                </th>
                                                                <th>Total Payable</th>
                                                                <th>Amount Paid</th>
                                                                <th>
                                                                    Closing
                                                                    Pending
                                                                </th>
                                                            </tr>
                                                        ) : (
                                                            <tr>
                                                                <th>Sr. No.</th>
                                                                {/* <th>Employee ID</th> */}
                                                                <th>Employee Name</th>
                                                                <th>Member Type</th>
                                                                <th>Half Day</th>
                                                                <th>Full Day</th>
                                                                <th>Two Half Day</th>
                                                                <th>
                                                                    Opening
                                                                    Pending
                                                                </th>
                                                                <th>Gross Amount</th>
                                                                <th>
                                                                    Advance
                                                                    Deducted
                                                                </th>
                                                                <th>Total Payable</th>
                                                                <th>Amount Paid</th>
                                                                <th>
                                                                    Closing
                                                                    Pending
                                                                </th>
                                                            </tr>
                                                        )}
                                                    </thead>

                                                    <tbody>
                                                        {generatedReport.rows.map(
                                                            (row, index) => (
                                                                <tr
                                                                    key={`${getField(
                                                                        row,
                                                                        "AssignmentId",
                                                                        "assignmentId",
                                                                        "VendorId",
                                                                        "vendorId",
                                                                        "HotelId",
                                                                        "hotelId",
                                                                        "EmployeeId",
                                                                        "employeeId"
                                                                    ) || "row"}-${index}`}
                                                                >
                                                                    <td>
                                                                        {index +
                                                                            1}
                                                                    </td>

                                                                    {isSupplierReport ? (
                                                                        <>
                                                                            {/* <td>{getField(row, "CaterersId", "caterersId", "HotelId", "hotelId") || "--"}</td> */}
                                                                            <td>{getField(row, "CaterersName", "catersName", "HotelName", "hotelName") || "--"}</td>
                                                                            <td>{getField(row, "InHouseHalfDay", "inHouseHalfDay") || 0}</td>
                                                                            <td>{getField(row, "InHouseFullDay", "inHouseFullDay") || 0}</td>
                                                                            <td>{getField(row, "LocalHalfDay", "localHalfDay") || 0}</td>
                                                                            <td>{getField(row, "LocalFullDay", "localFullDay") || 0}</td>
                                                                            <td>{getField(row, "VendorHalfDay", "vendorHalfDay") || 0}</td>
                                                                            <td>{getField(row, "VendorFullDay", "vendorFullDay") || 0}</td>
                                                                            <td>{formatDate(getField(row, "PaymentMonth", "paymentMonth", "PaymentDate", "paymentDate"))}</td>
                                                                            <td>{formatAmount(getField(row, "OpeningPendingAmount", "openingPendingAmount"))}</td>
                                                                            <td>{formatAmount(getField(row, "GrossAmount", "grossAmount"))}</td>
                                                                            <td>{formatAmount(getField(row, "TotalPayable", "totalPayable"))}</td>
                                                                            <td>{formatAmount(getField(row, "AmountPaid", "amountPaid"))}</td>
                                                                            <td>{formatAmount(getField(row, "ClosingPendingAmount", "closingPendingAmount"))}</td>
                                                                            <td>{getField(row, "PaymentStatus", "paymentStatus", "Status", "status") || "--"}</td>
                                                                        </>
                                                                    ) : isVendorWorkReport ? (
                                                                        <>
                                                                            <td>
                                                                                {formatDate(
                                                                                    getField(
                                                                                        row,
                                                                                        "AssignmentDate",
                                                                                        "assignmentDate",
                                                                                        "AssignDate",
                                                                                        "assignDate"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "VendorName",
                                                                                    "vendorName"
                                                                                ) ||
                                                                                    getVendorName(
                                                                                        selectedVendor
                                                                                    ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "Emp_Quantity",
                                                                                    "emp_Quantity",
                                                                                    "empQuantity"
                                                                                ) || 0}
                                                                            </td>

                                                                            <td>
                                                                                {getHotelNameById(
                                                                                    getField(
                                                                                        row,
                                                                                        "HotelId",
                                                                                        "hotelId"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "Venue",
                                                                                    "venue",
                                                                                    "CatersVenue",
                                                                                    "catersVenue"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                           

                                                                            <td>
                                                                                {(() => {
                                                                                    const shiftId =
                                                                                        Number(
                                                                                            getField(
                                                                                                row,
                                                                                                "ShiftId",
                                                                                                "shiftId"
                                                                                            )
                                                                                        );

                                                                                    if (
                                                                                        shiftId ===
                                                                                        1
                                                                                    )
                                                                                        return "Morning";

                                                                                    if (
                                                                                        shiftId ===
                                                                                        2
                                                                                    )
                                                                                        return "Evening";

                                                                                    if (
                                                                                        shiftId ===
                                                                                        3
                                                                                    )
                                                                                        return "TwoHalfDay";

                                                                                    return (
                                                                                        getField(
                                                                                            row,
                                                                                            "ShiftName",
                                                                                            "shiftName"
                                                                                        ) ||
                                                                                        "--"
                                                                                    );
                                                                                })()}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "WorkType",
                                                                                    "workType"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "Description",
                                                                                    "description"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>
                                                                        </>
                                                                    ) : isEmployeeWorkReport ? (
                                                                        <>
                                                                            <td>
                                                                                {formatDate(
                                                                                    getField(
                                                                                        row,
                                                                                        "AssignmentDate",
                                                                                        "assignmentDate",
                                                                                        "AssignDate",
                                                                                        "assignDate"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "FullName",
                                                                                    "fullName",
                                                                                    "EmployeeName",
                                                                                    "employeeName"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {(() => {
                                                                                    const rowHotelId =
                                                                                        getField(
                                                                                            row,
                                                                                            "HotelId",
                                                                                            "hotelId"
                                                                                        );

                                                                                    return (
                                                                                        getField(
                                                                                            row,
                                                                                            "HotelName",
                                                                                            "hotelName"
                                                                                        ) ||
                                                                                        getHotelNameById(
                                                                                            rowHotelId
                                                                                        ) ||
                                                                                        "--"
                                                                                    );
                                                                                })()}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "Venue",
                                                                                    "venue",
                                                                                    "CatersVenue",
                                                                                    "catersVenue"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {(() => {
                                                                                    const shiftId =
                                                                                        Number(
                                                                                            getField(
                                                                                                row,
                                                                                                "ShiftId",
                                                                                                "shiftId"
                                                                                            )
                                                                                        );

                                                                                    if (
                                                                                        shiftId ===
                                                                                        1
                                                                                    )
                                                                                        return "Morning";

                                                                                    if (
                                                                                        shiftId ===
                                                                                        2
                                                                                    )
                                                                                        return "Evening";

                                                                                    if (
                                                                                        shiftId ===
                                                                                        3
                                                                                    )
                                                                                        return "TwoHalfDay";

                                                                                    return (
                                                                                        getField(
                                                                                            row,
                                                                                            "ShiftName",
                                                                                            "shiftName"
                                                                                        ) ||
                                                                                        "--"
                                                                                    );
                                                                                })()}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "WorkType",
                                                                                    "workType"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "Description",
                                                                                    "description"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>
                                                                        </>
                                                                    ) : isCatererReport ? (
                                                                        <>
                                                                            {/* <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "CaterersId",
                                                                                    "caterersId",
                                                                                    "HotelId",
                                                                                    "hotelId"
                                                                                ) || "--"}
                                                                            </td> */}

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "CaterersName",
                                                                                    "caterersName",
                                                                                    "HotelName",
                                                                                    "hotelName",
                                                                                    "CatersName",
                                                                                    "catersName"
                                                                                ) || "--"}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "OpeningPendingAmount",
                                                                                        "openingPendingAmount"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "GrossAmount",
                                                                                        "grossAmount"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "TotalPayable",
                                                                                        "totalPayable"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "AmountPaid",
                                                                                        "amountPaid"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "ClosingPendingAmount",
                                                                                        "closingPendingAmount"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "PaymentStatus",
                                                                                    "paymentStatus",
                                                                                    "Status",
                                                                                    "status",
                                                                                    "HotelPaymentStatus",
                                                                                    "hotelPaymentStatus"
                                                                                ) ||
                                                                                    "Pending"}
                                                                            </td>
                                                                        </>
                                                                    ) : isVendorReport ? (
                                                                        <>
                                                                        <td>
                                                                                {formatDate(
                                                                                    getField(
                                                                                        row,
                                                                                        "PaymentMonth",
                                                                                        "PaymentDate",
                                                                                        "Payment_Month",
                                                                                        "payment_month"
                                                                                    )
                                                                                )}
                                                                            </td>
                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "VendorId",
                                                                                    "vendorId"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "VendorName",
                                                                                    "vendorName"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "HalfDayShiftCount",
                                                                                    "halfDayShiftCount"
                                                                                ) || 0}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "FullDayShiftCount",
                                                                                    "fullDayShiftCount"
                                                                                ) || 0}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "OpeningPendingAmount",
                                                                                        "openingPendingAmount"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "GrossAmount",
                                                                                        "grossAmount"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "AdvanceDeducted",
                                                                                        "advanceDeducted"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "TotalPayable",
                                                                                        "totalPayable",
                                                                                        "TotalBeforeDeductions",
                                                                                        "totalBeforeDeductions"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "AmountPaid",
                                                                                        "amountPaid"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "ClosingPendingAmount",
                                                                                        "closingPendingAmount"
                                                                                    )
                                                                                )}
                                                                            </td>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            {/* <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "EmployeeId",
                                                                                    "employeeId"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td> */}

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "EmployeeName",
                                                                                    "employeeName",
                                                                                    "FullName",
                                                                                    "fullName"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "MemberType",
                                                                                    "memberType"
                                                                                ) ||
                                                                                    "--"}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "HalfDayShiftCount",
                                                                                    "halfDayShiftCount"
                                                                                ) || 0}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "FullDayShiftCount",
                                                                                    "fullDayShiftCount"
                                                                                ) || 0}
                                                                            </td>

                                                                            <td>
                                                                                {getField(
                                                                                    row,
                                                                                    "TwoHalfDayCount",
                                                                                    "twoHalfDayCount"
                                                                                ) || 0}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "OpeningPendingAmount",
                                                                                        "openingPendingAmount"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "GrossAmount",
                                                                                        "grossAmount"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "AdvanceDeducted",
                                                                                        "advanceDeducted"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "TotalPayable",
                                                                                        "totalPayable",
                                                                                        "TotalBeforeDeductions",
                                                                                        "totalBeforeDeductions"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "AmountPaid",
                                                                                        "amountPaid"
                                                                                    )
                                                                                )}
                                                                            </td>

                                                                            <td>
                                                                                {formatAmount(
                                                                                    getField(
                                                                                        row,
                                                                                        "ClosingPendingAmount",
                                                                                        "closingPendingAmount"
                                                                                    )
                                                                                )}
                                                                            </td>
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>


                                                </table>
                                            </div>
                                        ) : (
                                            <p className="report-empty-state">
                                                {isEmployeeWorkReport
                                                    ? "No employee work records found for the selected date range."
                                                    : isVendorWorkReport
                                                        ? "No vendor work records found for the selected vendor and date range."
                                                        : isSupplierReport
                                                            ? "No supplier report records found for the selected filters and date range."
                                                            : "No payment records found for the selected filters."}
                                            </p>
                                        )}

                                        {error && (
                                            <div
                                                className="report-error no-print"
                                                role="alert"
                                            >
                                                {error}
                                            </div>
                                        )}

                                        <div className="report-output-actions no-print">
                                            <button
                                                type="button"
                                                className="primary-button"
                                                onClick={handlePrint}
                                            >
                                                Print / Save PDF
                                            </button>

                                            <button
                                                type="button"
                                                className="report-reset-button"
                                                onClick={handleBack}
                                            >
                                                Back to Reports
                                            </button>
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportsOverview;
