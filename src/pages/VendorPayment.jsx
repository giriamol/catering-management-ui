import React, { useState } from "react";
import "../CSS/DailyEmployeePayment.css";
import {
    getVendorPaymentSummary,
    SaveVendorPayment,
} from "../api/vendorPaymentApi";

const VendorPayment = () => {
    const [vendorId, setVendorId] = useState("");
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

        const id = Number(vendorId);

        if (!vendorId.trim() || !Number.isSafeInteger(id) || id <= 0) {
            setError("Please enter a valid Vendor ID.");
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

            const response = await getVendorPaymentSummary(
                id,
                fromDate,
                toDate
            );

            if (!response?.data) {
                setError("No vendor payment summary was returned.");
                return;
            }

            setSummary(response.data);
            setSearched(true);
        } catch (err) {
            console.error("Get vendor payment summary failed:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setVendorId("");
        setFromDate("");
        setToDate("");
        setSummary(null);
        setSearched(false);
        setError("");
        setSuccessMessage("");
        setShowPaymentForm(false);
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

        if (savingPayment) return;

        setError("");
        setSuccessMessage("");

        if (!summary) {
            setError("Load the vendor payment summary first.");
            return;
        }

        if (!paymentDate) {
            setError("Please select a payment date.");
            return;
        }

        const resolvedVendorId = Number(summary.vendorId ?? vendorId);
        const grossAmount = Number(summary.grossAmount ?? 0);
        const openingAmount = Number(openingPendingAmount);
        const advanceAmount = Number(advanceDeducted);
        const paidAmount = Number(amountPaid);

        if (!Number.isSafeInteger(resolvedVendorId) || resolvedVendorId <= 0) {
            setError("Invalid Vendor ID.");
            return;
        }

        if (![grossAmount, openingAmount, advanceAmount, paidAmount].every(
            (value) => Number.isFinite(value) && value >= 0
        )) {
            setError("All payment amounts must be valid non-negative numbers.");
            return;
        }

        const totalPayable = openingAmount + grossAmount - advanceAmount;

        if (totalPayable < 0) {
            setError("Advance deducted cannot exceed the total payable.");
            return;
        }

        if (paidAmount > totalPayable) {
            setError("Amount paid cannot exceed the total payable.");
            return;
        }

        const payload = {
            vendorId: resolvedVendorId,
            paymentMonth: `${paymentDate}T00:00:00`,
            openingPendingAmount: openingAmount,
            grossAmount: grossAmount,
            advanceDeducted: advanceAmount,
            amountPaid: paidAmount,
            paymentStatus: paymentStatus,
        };

        try {
            setSavingPayment(true);

            const response = await SaveVendorPayment(payload);

            setSuccessMessage(
                response?.data?.message || "Vendor payment saved successfully."
            );

            setShowPaymentForm(false);
            resetPaymentForm();

            try {
                const refreshedResponse = await getVendorPaymentSummary(
                    resolvedVendorId,
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
            console.error("SaveVendorPayment API failed:", err);
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

    const summaryCards = summary
        ? [
              {
                  label: "Gross Amount",
                  value: `₹ ${formatAmount(summary.grossAmount)}`,
                  accent: false,
              },
              {
                  label: "Opening Pending",
                  value: `₹ ${formatAmount(summary.openingPendingAmount)}`,
                  accent: false,
              },
              {
                  label: "Advance Deducted",
                  value: `₹ ${formatAmount(summary.advanceDeducted)}`,
                  accent: false,
              },
              {
                  label: "Total Payable",
                  value: `₹ ${formatAmount(
                      summary.totalPayable ?? calculatedTotalPayable
                  )}`,
                  accent: true,
              },
          ]
        : [];

    return (
        <div className="daily-payment-page">
            <div className="payment-page-header">
                <div>
                    <h2>Vendor Payment</h2>
                    <p>
                        View vendor payment summary and save vendor payment details
                        for the selected date range.
                    </p>
                </div>
            </div>

            <form
                className="payment-filter-card"
                onSubmit={handleSearch}
            >
                <div className="payment-filter-field">
                    <label htmlFor="vendorId">Vendor ID</label>
                    <input
                        id="vendorId"
                        type="number"
                        min="1"
                        step="1"
                        value={vendorId}
                        onChange={(event) => setVendorId(event.target.value)}
                        placeholder="Enter Vendor ID"
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
                        onChange={(event) => setFromDate(event.target.value)}
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
                        onChange={(event) => setToDate(event.target.value)}
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
                <div className="payment-alert payment-alert-success" role="status">
                    {successMessage}
                </div>
            )}

            {searched && summary && (
                <>
                    <div className="payment-summary payment-summary-card-row">
                        {summaryCards.map((item) => (
                            <div
                                key={item.label}
                                className={
                                    item.accent
                                        ? "payment-summary-item payment-summary-item-accent"
                                        : "payment-summary-item"
                                }
                            >
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                            </div>
                        ))}
                    </div>

                    <div className="payment-summary">
                        <div className="payment-summary-item">
                            <span>Vendor Name</span>
                            <strong>{summary.vendorName || "—"}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Vendor ID</span>
                            <strong>{summary.vendorId ?? vendorId}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Payment Type</span>
                            <strong>{summary.paymentType || "Vendor Payment"}</strong>
                        </div>

                        <div className="payment-summary-item">
                            <span>Selected Date Range</span>
                            <strong>
                                {formatDate(summary.fromDate)} to {formatDate(summary.toDate)}
                            </strong>
                        </div>
                    </div>

                    <div className="payment-table-card">
                        <div className="payment-table-heading">
                            <h3>Vendor Payment Details</h3>
                            <span>
                                {formatDate(summary.fromDate)} – {formatDate(summary.toDate)}
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
                                Make Payment
                            </button>
                        </div>
                    )}

                    {showPaymentForm && (
                        <form
                            className="payment-table-card employee-payment-form"
                            onSubmit={handleSavePayment}
                        >
                            <div className="payment-table-heading">
                                <h3>Add Vendor Payment</h3>
                                <span>
                                    Total Payable: ₹ {formatAmount(calculatedTotalPayable)}
                                </span>
                            </div>

                            <div className="payment-form-note">
                                Live calculation: Opening Pending + Gross Amount - Advance Deducted
                            </div>

                            <div className="payment-entry-grid">
                                <div className="payment-filter-field">
                                    <label htmlFor="paymentDate">Payment Date</label>
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
                                            setOpeningPendingAmount(event.target.value)
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
                                            setAdvanceDeducted(event.target.value)
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
                                    <label htmlFor="paymentStatus">Payment Status</label>
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
                        <h3>Vendor Payment Summary</h3>
                    </div>

                    <div className="empty-row">
                        Enter a Vendor ID, select a date range, and click Get Payment Summary.
                    </div>
                </div>
            )}

            {loading && (
                <div className="payment-table-card">
                    <div className="empty-row">
                        Loading vendor payment summary...
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorPayment;
