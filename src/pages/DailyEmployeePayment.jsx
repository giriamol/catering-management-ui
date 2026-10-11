import React, { useState } from "react";
import "../CSS/DailyEmployeePayment.css";
import {
    getEmployeePaymentSummary,
    SaveEmployeePayment,
} from "../api/dailyEmployeePaymentApi";

const DailyEmployeePayment = () => {
    const [employeeId, setEmployeeId] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searched, setSearched] = useState(false);

    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentDate, setPaymentDate] = useState("");
    const [openingPendingAmount, setOpeningPendingAmount] = useState("0");
    const [advanceDeducted, setAdvanceDeducted] = useState("0");
    const [amountPaid, setAmountPaid] = useState("0");
    const [paymentStatus, setPaymentStatus] = useState("Paid");
    const [savingPayment, setSavingPayment] = useState(false);

    const formatAmount = (amount) =>
        Number(amount ?? 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formatDate = (date) => {
        if (!date) return "—";

        const datePart = String(date).split("T")[0];
        const [year, month, day] = datePart.split("-");

        return year && month && day
            ? `${day}-${month}-${year}`
            : datePart;
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
            "An unexpected error occurred."
        );
    };

    const resetPaymentForm = () => {
        setPaymentDate("");
        setOpeningPendingAmount("0");
        setAdvanceDeducted("0");
        setAmountPaid("0");
        setPaymentStatus("Paid");
    };

    const handleSearch = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");
        setSummary(null);
        setSearched(false);
        setShowPaymentForm(false);

        const id = Number(employeeId);

        if (!employeeId.trim() || !Number.isSafeInteger(id) || id <= 0) {
            setError("Please enter a valid Employee ID.");
            return;
        }

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

            const response = await getEmployeePaymentSummary(
                id,
                fromDate,
                toDate
            );

            if (!response?.data) {
                setError("No employee payment summary was returned.");
                return;
            }

            setSummary(response.data);
            setSearched(true);
        } catch (err) {
            console.error("Get payment summary failed:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        
    setEmployeeId("");
    setFromDate("");
    setToDate("");

    // Clear summary data
    setSummary(null);
    setSearched(false);

    // Clear messages
    setError("");
    setSuccessMessage("");

    // Close payment form
    setShowPaymentForm(false);

    // Reset payment inputs
    resetPaymentForm();
    };

    const handleOpenPaymentForm = () => {
        setError("");
        setSuccessMessage("");

        setPaymentDate("");
        setOpeningPendingAmount(
            String(summary?.openingPendingAmount ?? 0)
        );
        setAdvanceDeducted(
            String(summary?.advanceDeducted ?? 0)
        );
        setAmountPaid("0");
        setPaymentStatus("Paid");

        setShowPaymentForm(true);
    };

    const handleCancelPayment = () => {
        setShowPaymentForm(false);
        setError("");
        resetPaymentForm();
    };

    const handleSavePayment = async (event) => {
        event.preventDefault();

        console.log("Confirm Payment clicked.");

        if (savingPayment) {
            console.log("Payment request already in progress.");
            return;
        }

        setError("");
        setSuccessMessage("");

        if (!summary) {
            setError("Load the employee payment summary first.");
            return;
        }

        if (!paymentDate) {
            setError("Please select a payment date.");
            return;
        }

        const resolvedEmployeeId = Number(
            summary.employeeId ?? employeeId
        );

        const grossAmount = Number(summary.grossAmount ?? 0);
        const openingAmount = Number(openingPendingAmount);
        const advanceAmount = Number(advanceDeducted);
        const paidAmount = Number(amountPaid);

        if (
            !Number.isSafeInteger(resolvedEmployeeId) ||
            resolvedEmployeeId <= 0
        ) {
            setError("Invalid Employee ID.");
            return;
        }

        if (
            ![grossAmount, openingAmount, advanceAmount, paidAmount].every(
                (value) => Number.isFinite(value) && value >= 0
            )
        ) {
            setError("All payment amounts must be valid non-negative numbers.");
            return;
        }

        const totalPayable =
            openingAmount + grossAmount - advanceAmount;

        if (totalPayable < 0) {
            setError("Advance deducted cannot exceed the total payable.");
            return;
        }

        if (paidAmount > totalPayable) {
            setError("Amount paid cannot exceed the total payable.");
            return;
        }

        // IMPORTANT:
        // Confirm that these property names match your backend DTO.
        const payload = {
            employeeId: resolvedEmployeeId,
            paymentMonth: `${paymentDate}T00:00:00`,
            openingPendingAmount: openingAmount,
            grossAmount: grossAmount,
            advanceDeducted: advanceAmount,
            amountPaid: paidAmount,
            paymentStatus: paymentStatus,
        };

        console.log("Calling SaveEmployeePayment...");
        console.log("Payment payload:", payload);

        try {
            setSavingPayment(true);

            // API method call
            const response = await SaveEmployeePayment(payload);

            console.log("Save payment response:", response);

            setSuccessMessage(
                response?.data?.message ||
                "Payment saved successfully."
            );

            setShowPaymentForm(false);
            resetPaymentForm();

            // Refresh summary after saving.
            try {
                const refreshedResponse =
                    await getEmployeePaymentSummary(
                        resolvedEmployeeId,
                        fromDate,
                        toDate
                    );

                if (refreshedResponse?.data) {
                    setSummary(refreshedResponse.data);
                }
            } catch (refreshError) {
                console.error(
                    "Payment saved, but summary refresh failed:",
                    refreshError
                );

                setSuccessMessage(
                    "Payment saved successfully, but the summary could not be refreshed. Search again to reload it."
                );
            }
        } catch (err) {
            console.error("SaveEmployeePayment API failed:", err);
            console.error("Server response:", err?.response?.data);

            setError(getErrorMessage(err));
        } finally {
            setSavingPayment(false);
        }
    };

    const paymentDetails = summary
        ? [
              {
                  label: "Opening Pending Amount",
                  amount: summary.openingPendingAmount,
              },
              {
                  label: "Gross Amount",
                  amount: summary.grossAmount,
              },
              {
                  label: "Advance Deducted",
                  amount: summary.advanceDeducted,
              },
              {
                  label: "Total Before Deductions",
                  amount: summary.totalBeforeDeductions,
              },
              {
                  label: "Total Payable",
                  amount: summary.totalPayable,
                  highlight: true,
              },
              {
                  label: "Amount Paid",
                  amount: summary.amountPaid,
              },
              {
                  label: "Closing Pending Amount",
                  amount: summary.closingPendingAmount,
                  highlight: true,
              },
          ]
        : [];

    const calculatedTotalPayable =
        Number(openingPendingAmount || 0) +
        Number(summary?.grossAmount || 0) -
        Number(advanceDeducted || 0);

    return (
        <div className="daily-payment-page">
            <div className="payment-page-header">
                <div>
                    <h2>Employee Payment</h2>
                    <p>
                        View employee shift details and payment summary
                        for the selected date range.
                    </p>
                </div>
            </div>

            {/* Search Form */}
            <form
                className="payment-filter-card"
                onSubmit={handleSearch}
            >
                <div className="payment-filter-field">
                    <label htmlFor="employeeId">Employee ID</label>
                    <input
                        id="employeeId"
                        type="number"
                        min="1"
                        step="1"
                        value={employeeId}
                        onChange={(event) =>
                            setEmployeeId(event.target.value)
                        }
                        placeholder="Enter Employee ID"
                        required
                    />
                </div>

                <div className="payment-filter-field">
                    <label htmlFor="fromDate">From Date</label>
                    <input
                        id="fromDate"
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(event) =>
                            setFromDate(event.target.value)
                        }
                        required
                    />
                </div>

                <div className="payment-filter-field">
                    <label htmlFor="toDate">To Date</label>
                    <input
                        id="toDate"
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(event) =>
                            setToDate(event.target.value)
                        }
                        required
                    />
                </div>

                <div className="payment-filter-actions">
                    <button
                        type="button"
                        className="btn-reset"
                        onClick={handleReset}
                        disabled={loading || savingPayment}
                    >
                        Reset
                    </button>

                    <button
                        type="submit"
                        className="btn-calculate"
                        disabled={loading || savingPayment}
                    >
                        {loading ? "Searching..." : "Get Payment Summary"}
                    </button>
                </div>
            </form>

            {error && (
                <div className="payment-alert payment-alert-error" role="alert">
                    {error}
                </div>
            )}

            {successMessage && (
                <div
                    className="payment-alert payment-alert-success"
                    role="status"
                >
                    {successMessage}
                </div>
            )}

            {/* Summary */}
            {searched && summary && (
                <>
                    <div className="payment-summary">
                        <div className="payment-summary-item">
                            <span>Employee Name</span>
                            <strong>{summary.employeeName || "—"}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Employee ID</span>
                            <strong>{summary.employeeId ?? employeeId}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Member Type</span>
                            <strong>{summary.memberType || "—"}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Selected Date Range</span>
                            <strong>
                                {formatDate(summary.fromDate)} to{" "}
                                {formatDate(summary.toDate)}
                            </strong>
                        </div>
                    </div>

                    <div className="payment-summary">
                        <div className="payment-summary-item">
                            <span>Half-Day Shift Count</span>
                            <strong>{summary.halfDayShiftCount ?? 0}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Full-Day Shift Count</span>
                            <strong>{summary.fullDayShiftCount ?? 0}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Two Half-Day Count</span>
                            <strong>{summary.twoHalfDayCount ?? 0}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Gross Amount</span>
                            <strong>
                                ₹ {formatAmount(summary.grossAmount)}
                            </strong>
                        </div>
                    </div>

                    {/* Payment Summary Table */}
                    <div className="payment-table-card">
                        <div className="payment-table-heading">
                            <h3>Employee Payment Details</h3>
                            <span>
                                {formatDate(summary.fromDate)} –{" "}
                                {formatDate(summary.toDate)}
                            </span>
                        </div>

                        <div className="payment-table-wrapper">
                            <table className="payment-table">
                                <thead>
                                    <tr>
                                        <th>Sr. No.</th>
                                        <th>Payment Description</th>
                                        <th>Amount (₹)</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {paymentDetails.map((item, index) => (
                                        <tr
                                            key={item.label}
                                            className={
                                                item.highlight
                                                    ? "payment-total-row"
                                                    : ""
                                            }
                                        >
                                            <td>{index + 1}</td>
                                            <td className="employee-name-cell">
                                                {item.label}
                                            </td>
                                            <td className="amount-cell">
                                                ₹ {formatAmount(item.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {!showPaymentForm && (
                        <div className="payment-filter-actions add-payment-actions">
                            <button
                                type="button"
                                className="btn-calculate"
                                onClick={handleOpenPaymentForm}
                                disabled={savingPayment || loading}
                            >
                                Add Payment
                            </button>
                        </div>
                    )}

                    {/* Save Payment Form */}
                    {showPaymentForm && (
                        <form
                            className="payment-table-card employee-payment-form"
                            onSubmit={handleSavePayment}
                        >
                            <div className="payment-table-heading">
                                <h3>Add Employee Payment</h3>
                                <span>
                                    Total Payable: ₹{" "}
                                    {formatAmount(calculatedTotalPayable)}
                                </span>
                            </div>

                            <div className="payment-entry-grid">
                                <div className="payment-filter-field">
                                    <label htmlFor="paymentDate">
                                        Payment Date
                                    </label>
                                    <input
                                        id="paymentDate"
                                        type="date"
                                        value={paymentDate}
                                        onChange={(event) =>
                                            setPaymentDate(event.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="payment-filter-field">
                                    <label htmlFor="openingPendingAmount">
                                        Opening Pending Amount (₹)
                                    </label>
                                    <input
                                        id="openingPendingAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={openingPendingAmount}
                                        onChange={(event) =>
                                            setOpeningPendingAmount(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="payment-filter-field">
                                    <label htmlFor="advanceDeducted">
                                        Advance Deducted (₹)
                                    </label>
                                    <input
                                        id="advanceDeducted"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={advanceDeducted}
                                        onChange={(event) =>
                                            setAdvanceDeducted(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="payment-filter-field">
                                    <label htmlFor="amountPaid">
                                        Amount Paid (₹)
                                    </label>
                                    <input
                                        id="amountPaid"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={amountPaid}
                                        onChange={(event) =>
                                            setAmountPaid(event.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="payment-filter-field">
                                    <label htmlFor="paymentStatus">
                                        Payment Status
                                    </label>
                                    <select
                                        id="paymentStatus"
                                        value={paymentStatus}
                                        onChange={(event) =>
                                            setPaymentStatus(event.target.value)
                                        }
                                        required
                                    >
                                        <option value="Paid">Paid</option>
                                    </select>
                                </div>
                            </div>

                            <div className="payment-filter-actions">
                                <button
                                    type="button"
                                    className="btn-reset"
                                    onClick={handleCancelPayment}
                                    disabled={savingPayment}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-calculate"
                                    disabled={savingPayment}
                                >
                                    {savingPayment
                                        ? "Saving Payment..."
                                        : "Confirm Payment"}
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}

            {!searched && !loading && !error && (
                <div className="payment-table-card">
                    <div className="payment-table-heading">
                        <h3>Employee Payment Summary</h3>
                    </div>

                    <div className="empty-row">
                        Enter an Employee ID, select a date range, and click
                        Get Payment Summary.
                    </div>
                </div>
            )}

            {loading && (
                <div className="payment-table-card">
                    <div className="empty-row">
                        Loading employee payment summary...
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyEmployeePayment;