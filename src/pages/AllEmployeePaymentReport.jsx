
import React, { useState } from "react";
import {
    getAllEmployeePaymentSummary,
    getAllReportEmployee,
} from "../api/dailyEmployeePaymentApi";
//import "../CSS/AllEmployeePaymentReport.css";

const AllEmployeePaymentReport = () => {
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [employees, setEmployees] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const formatAmount = (amount) =>
        Number(amount ?? 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formatDate = (date) => {
        if (!date) return "—";

        const value = String(date).split("T")[0];
        const [year, month, day] = value.split("-");

        return year && month && day
            ? `${day}-${month}-${year}`
            : value;
    };

    const getErrorMessage = (err) => {
        const data = err?.response?.data;

        if (typeof data === "string") return data;

        if (data?.errors) {
            return Object.values(data.errors).flat().join(" ");
        }

        return (
            data?.message ||
            data?.title ||
            data?.detail ||
            err?.message ||
            "Unable to load employee payment details."
        );
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        setError("");
        setEmployees([]);
        setSearched(false);

        if (!fromDate || !toDate) {
            setError("Please select both From Date and To Date.");
            return;
        }

        if (fromDate > toDate) {
            setError("From Date cannot be later than To Date.");
            return;
        }

        try {
            setLoading(true);

            const response = await getAllReportEmployee(
                fromDate,
                toDate,
                "All"
            );

            const data = response?.data;

            // Supports either an array or common wrapped API responses.
            const rows = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.items)
                        ? data.items
                        : Array.isArray(data?.employees)
                            ? data.employees
                            : Array.isArray(data?.records)
                                ? data.records
                                : null;

            if (!rows) {
                throw new Error(
                    "The API response is not an employee payment list. Please check the response structure."
                );
            }

            setEmployees(rows);
            setSearched(true);
        } catch (err) {
            console.error("Get all employee payments failed:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        setEmployees([]);
        setSearched(false);
        setError("");
    };

    // Change these property names if your backend DTO uses different names.
    const getValue = (row, ...keys) => {
        for (const key of keys) {
            if (row?.[key] !== undefined && row?.[key] !== null) {
                return row[key];
            }
        }
        return 0;
    };

    const totalGross = employees.reduce(
        (sum, row) =>
            sum + Number(getValue(row, "grossAmount", "GrossAmount")),
        0
    );

    const totalPaid = employees.reduce(
        (sum, row) =>
            sum + Number(
                getValue(row, "amountPaid", "AmountPaid", "totalPaid")
            ),
        0
    );

    const totalPending = employees.reduce(
        (sum, row) =>
            sum + Number(
                getValue(
                    row,
                    "closingPendingAmount",
                    "ClosingPendingAmount",
                    "pendingAmount"
                )
            ),
        0
    );

    return (
        <div className="all-payment-page">
            <div className="all-payment-heading">
                <div>
                    <span className="all-payment-eyebrow">
                        PAYMENT MANAGEMENT
                    </span>
                    <h2>All Employee Payments</h2>
                    <p>
                        View and review employee payment details for
                        your selected date range.
                    </p>
                </div>

                <div className="all-payment-count">
                    <span>Employees</span>
                    <strong>{employees.length}</strong>
                </div>
            </div>

            <form
                className="all-payment-filter"
                onSubmit={handleSearch}
            >
                <div className="all-payment-field">
                    <label htmlFor="allPaymentFromDate">
                        From Date
                    </label>
                    <input
                        id="allPaymentFromDate"
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(e) => setFromDate(e.target.value)}
                        required
                    />
                </div>

                <div className="all-payment-field">
                    <label htmlFor="allPaymentToDate">
                        To Date
                    </label>
                    <input
                        id="allPaymentToDate"
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(e) => setToDate(e.target.value)}
                        required
                    />
                </div>

                <div className="all-payment-filter-actions">
                    <button
                        type="button"
                        className="all-payment-reset"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        Reset
                    </button>

                    <button
                        type="submit"
                        className="all-payment-search"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Search Payments"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="all-payment-alert" role="alert">
                    {error}
                </div>
            )}

            {searched && !error && (
                <>
                    <div className="all-payment-stats">
                        <div className="all-payment-stat">
                            <span>Total Employees</span>
                            <strong>{employees.length}</strong>
                        </div>

                        <div className="all-payment-stat">
                            <span>Total Gross Amount</span>
                            <strong>₹ {formatAmount(totalGross)}</strong>
                        </div>

                        <div className="all-payment-stat">
                            <span>Total Amount Paid</span>
                            <strong>₹ {formatAmount(totalPaid)}</strong>
                        </div>

                        <div className="all-payment-stat pending-stat">
                            <span>Total Pending</span>
                            <strong>₹ {formatAmount(totalPending)}</strong>
                        </div>
                    </div>

                    <div className="all-payment-table-card">
                        <div className="all-payment-table-heading">
                            <div>
                                <h3>Payment Details</h3>
                                <p>
                                    {formatDate(fromDate)} – {formatDate(toDate)}
                                </p>
                            </div>
                            <span className="all-payment-result-count">
                                {employees.length} record(s)
                            </span>
                        </div>

                        {employees.length === 0 ? (
                            <div className="all-payment-empty">
                                <span className="all-payment-empty-icon">
                                    ₹
                                </span>
                                <h3>No payment records found</h3>
                                <p>
                                    Try selecting a different date range.
                                </p>
                            </div>
                        ) : (
                            <div className="all-payment-table-scroll">
                                <table className="all-payment-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Employee ID</th>
                                            <th>Employee Name</th>
                                            <th>Member Type</th>
                                            <th>Gross Amount</th>
                                            <th>Advance Deducted</th>
                                            <th>Amount Paid</th>
                                            <th>Pending Amount</th>
                                            <th>Payment Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {employees.map((row, index) => {
                                            const id = getValue(
                                                row, "employeeId", "EmployeeId"
                                            );

                                            const name = getValue(
                                                row, "employeeName", "EmployeeName"
                                            );

                                            const gross = getValue(
                                                row, "grossAmount", "GrossAmount"
                                            );

                                            const advance = getValue(
                                                row, "advanceDeducted",
                                                "AdvanceDeducted"
                                            );

                                            const paid = getValue(
                                                row, "amountPaid", "AmountPaid"
                                            );

                                            const pending = getValue(
                                                row, "closingPendingAmount",
                                                "ClosingPendingAmount",
                                                "pendingAmount"
                                            );

                                            const status = getValue(
                                                row, "paymentStatus",
                                                "PaymentStatus"
                                            );

                                            return (
                                                <tr
                                                    key={
                                                        id
                                                            ? `${id}-${index}`
                                                            : index
                                                    }
                                                >
                                                    <td>{index + 1}</td>
                                                    <td className="all-payment-id">
                                                        {id || "—"}
                                                    </td>
                                                    <td className="all-payment-name">
                                                        {name || "—"}
                                                    </td>
                                                    <td>
                                                        {getValue(
                                                            row,
                                                            "memberType",
                                                            "MemberType"
                                                        ) || "—"}
                                                    </td>
                                                    <td>
                                                        ₹ {formatAmount(gross)}
                                                    </td>
                                                    <td>
                                                        ₹ {formatAmount(advance)}
                                                    </td>
                                                    <td className="all-payment-paid">
                                                        ₹ {formatAmount(paid)}
                                                    </td>
                                                    <td className="all-payment-pending">
                                                        ₹ {formatAmount(pending)}
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={
                                                                "payment-status " +
                                                                (
                                                                    String(status).toLowerCase() === "paid"
                                                                        ? "status-paid"
                                                                        : String(status).toLowerCase() === "pending"
                                                                            ? "status-pending"
                                                                            : "status-other"
                                                                )
                                                            }
                                                        >
                                                            {status || "—"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                    <tfoot>
                                        <tr>
                                            <td colSpan={4}>TOTAL</td>
                                            <td>₹ {formatAmount(totalGross)}</td>
                                            <td>
                                                ₹ {formatAmount(
                                                    employees.reduce(
                                                        (sum, row) =>
                                                            sum + Number(
                                                                getValue(
                                                                    row,
                                                                    "advanceDeducted",
                                                                    "AdvanceDeducted"
                                                                )
                                                            ),
                                                        0
                                                    )
                                                )}
                                            </td>
                                            <td>₹ {formatAmount(totalPaid)}</td>
                                            <td>₹ {formatAmount(totalPending)}</td>
                                            <td>—</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {!searched && !loading && !error && (
                <div className="all-payment-placeholder">
                    <div className="all-payment-placeholder-icon">₹</div>
                    <h3>Ready to view payment reports?</h3>
                    <p>
                        Select your date range above and click
                        Search Payments to load all employee records.
                    </p>
                </div>
            )}

            {loading && (
                <div className="all-payment-placeholder">
                    <div className="all-payment-spinner" />
                    <p>Fetching employee payment details...</p>
                </div>
            )}
        </div>
    );
};

export default AllEmployeePaymentReport;
