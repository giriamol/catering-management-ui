import React, { useState } from "react";
import "../CSS/DailyEmployeePayment.css";
import DatePicker from "../components/DatePicker";
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

    // Payment form state. The form is hidden until Add Payment is clicked.
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentMonth, setPaymentMonth] = useState("");
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
        return `${day}-${month}-${year}`;
    };

    const resetPaymentForm = () => {
        setPaymentMonth("");
        setOpeningPendingAmount("0");
        setAdvanceDeducted("0");
        setAmountPaid("0");
        setPaymentStatus("Draft");
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");
        setSummary(null);
        setSearched(false);
        setShowPaymentForm(false);

        const id = Number(employeeId);

        if (
            !employeeId.trim() ||
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {
            setError("Please enter a valid Employee ID.");
            return;
        }

        if (!fromDate || !toDate) {
            setError("Please select both From Date and To Date.");
            return;
        }

        if (fromDate > toDate) {
            setError("From Date cannot be greater than To Date.");
            return;
        }

        try {
            setLoading(true);
            const response = await getEmployeePaymentSummary(id, fromDate, toDate);
            const data = response.data;

            if (!data) {
                setError("Employee payment summary not found.");
                return;
            }

            setSummary(data);
            setSearched(true);
        } catch (err) {
            console.error("Error loading employee payment summary:", err);
            setError(
                err.response?.data?.message ||
                    "Unable to load employee payment summary."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setEmployeeId("");
        setFromDate("");
        setToDate("");
        setSummary(null);
        setError("");
        setSuccessMessage("");
        setSearched(false);
        setShowPaymentForm(false);
        resetPaymentForm();
    };

    const handleCancelPayment = () => {
        // Cancel only closes the form; it does not call the save API.
        setShowPaymentForm(false);
        setError("");
        resetPaymentForm();
    };

    // const handleSavePayment = async (event) => {
    //     event.preventDefault();
    //     setError("");
    //     setSuccessMessage("");

    //     if (!summary) {
    //         setError("Please load the employee payment summary first.");
    //         return;
    //     }

    //     if (!paymentMonth) {
    //         setError("Please select a payment month.");
    //         return;
    //     }

    //     const resolvedEmployeeId = Number(summary.employeeId ?? employeeId);
    //     const grossAmount = Number(summary.grossAmount ?? 0);
    //     const openingAmount = Number(openingPendingAmount);
    //     const advanceAmount = Number(advanceDeducted);
    //     const paidAmount = Number(amountPaid);

    //     const amountsAreValid = [
    //         grossAmount,
    //         openingAmount,
    //         advanceAmount,
    //         paidAmount,
    //     ].every((amount) => Number.isFinite(amount) && amount >= 0);

    //     if (!Number.isSafeInteger(resolvedEmployeeId) || resolvedEmployeeId <= 0) {
    //         setError("Please provide a valid Employee ID.");
    //         return;
    //     }

    //     if (!amountsAreValid) {
    //         setError("Please enter valid non-negative payment amounts.");
    //         return;
    //     }

    //     const payload = {
    //         employeeId: resolvedEmployeeId,
    //         paymentMonth: `${toDate.slice(0, 7)}-01T00:00:00`,
    //         openingPendingAmount: openingAmount,
    //         grossAmount,
    //         advanceDeducted: advanceAmount,
    //         amountPaid: paidAmount,
    //         paymentStatus,
    //         // Add createdBy: currentUserId here if your application has the logged-in user ID.
    //     };

    //     try {
    //         setSavingPayment(true);
    //         const response = await SaveEmployeePayment(payload);
    //         setSuccessMessage(
    //             response.data?.message || "Employee payment saved successfully."
    //         );
    //         setShowPaymentForm(false);
    //         resetPaymentForm();
    //     } catch (err) {
    //         console.error("Error saving employee payment:", err);
    //         setError(
    //             err.response?.data?.message ||
    //                 "Unable to save employee payment. Please try again."
    //         );
    //     } finally {
    //         setSavingPayment(false);
    //     }
    // };
 const handleSavePayment = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!summary) {
        setError("Please load the employee payment summary first.");
        return;
    }

    const resolvedEmployeeId = Number(summary.employeeId ?? employeeId);
    const grossAmount = Number(summary.grossAmount ?? 0);
    const openingAmount = Number(openingPendingAmount);
    const advanceAmount = Number(advanceDeducted);
    const paidAmount = Number(amountPaid);

    if (
        !Number.isSafeInteger(resolvedEmployeeId) ||
        resolvedEmployeeId <= 0
    ) {
        setError("Please provide a valid Employee ID.");
        return;
    }

    if (
        ![grossAmount, openingAmount, advanceAmount, paidAmount].every(
            (amount) => Number.isFinite(amount) && amount >= 0
        )
    ) {
        setError("Please enter valid non-negative payment amounts.");
        return;
    }

    if (!toDate) {
        setError("Please select a date range and search again.");
        return;
    }

    const payload = {
        employeeId: resolvedEmployeeId,
        paymentMonth: `${toDate.slice(0, 7)}-01T00:00:00`,
        openingPendingAmount: openingAmount,
        grossAmount,
        advanceDeducted: advanceAmount,
        amountPaid: paidAmount,
        paymentStatus: "Paid",
    };

    try {
        setSavingPayment(true);

        const response = await SaveEmployeePayment(payload);

        // Show success only after the API succeeds.
        setSuccessMessage(
            response.data?.message ||
                "Employee payment saved successfully."
        );

        setError("");
        setShowPaymentForm(false);
        resetPaymentForm();
    } catch (err) {
        console.error("Error saving employee payment:", err);
        console.error("API error details:", err.response?.data);

        const validationErrors = err.response?.data?.errors;
        const validationMessage = validationErrors
            ? Object.values(validationErrors).flat().join(" ")
            : "";

        setError(
            validationMessage ||
                err.response?.data?.message ||
                err.response?.data?.title ||
                "Unable to save employee payment. Please try again."
        );

        setSuccessMessage("");
    } finally {
        setSavingPayment(false);
    }
};
    const paymentDetails = summary
        ? [
              { label: "Opening Pending Amount/ Previous Pending Amount", amount: summary.openingPendingAmount },
              { label: "Gross Amount", amount: summary.grossAmount },
              { label: "Advance Deducted", amount: summary.advanceDeducted },
            //   { label: "Total Before Deductions", amount: summary.totalBeforeDeductions },
              { label: "Total Payable", amount: summary.totalPayable, highlight: true },
            //   { label: "Amount Paid", amount: summary.amountPaid },
            //   { label: "Closing Pending Amount", amount: summary.closingPendingAmount, highlight: true },
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
                        View employee shift details and payment summary for the selected date range.
                    </p>
                </div>
            </div>

            <form className="payment-filter-card" onSubmit={handleSearch}>
                <div className="payment-filter-field">
                    <label htmlFor="employeeId">Employee ID</label>
                    <input
                        id="employeeId"
                        type="number"
                        min="1"
                        step="1"
                        value={employeeId}
                        onChange={(event) => setEmployeeId(event.target.value)}
                        placeholder="Enter Employee ID"
                        required
                    />
                </div>

                <div className="payment-filter-field">
                    <label htmlFor="fromDate">From Date</label>
                    <DatePicker
                        id="fromDate"
                        name="fromDate"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={setFromDate}
                        required
                        disabled={loading || savingPayment}
                    />
                </div>

                <div className="payment-filter-field">
                    <label htmlFor="toDate">To Date</label>
                    <DatePicker
                        id="toDate"
                        name="toDate"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={setToDate}
                        required
                        disabled={loading || savingPayment}
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
    <div
        className="payment-alert payment-alert-error"
        role="alert"
    >
        <strong>Payment Failed!</strong>
        <span>{error}</span>
    </div>
)}

{successMessage && (
    <div
        className="payment-alert payment-alert-success"
        role="status"
    >
        <strong>Success!</strong>
        <span>{successMessage}</span>
    </div>
)}

            {searched && summary && (
                <>
                    <div className="payment-table-card employee-info-table-card">
                        <div className="payment-table-heading">
                            <h3>Employee Payment Details</h3>
                            <span>
                                {formatDate(summary.fromDate)} – {formatDate(summary.toDate)}
                            </span>
                        </div>
                        <div className="payment-table-wrapper">
                            <table className="payment-table combined-payment-table">
                                <thead>
                                    <tr>
                                        <th>Sr. No.</th>
                                        <th>Payment Description</th>
                                        <th>Amount / Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="payment-section-row">
                                        <td colSpan="3"><center>Employee Information</center></td>
                                    </tr>
                                    <tr>
                                        <td className="number-cell">1</td>
                                        <td className="employee-name-cell">Employee Name</td>
                                        <td>{summary.employeeName || "—"}</td>
                                    </tr>
                                    {/* <tr>
                                        <td className="number-cell">2</td>
                                        <td className="employee-name-cell">Employee Id</td>
                                        <td>{summary.employeeId ?? employeeId}</td>
                                    </tr>
                                    <tr>
                                        <td className="number-cell">3</td>
                                        <td className="employee-name-cell">Selected Date Range</td>
                                        <td>{formatDate(summary.fromDate)} – {formatDate(summary.toDate)}</td>
                                    </tr> */}
                                    <tr>
                                        <td className="number-cell">4</td>
                                        <td className="employee-name-cell">Member Type</td>
                                        <td>{summary.memberType || "—"}</td>
                                    </tr>
                                    <tr>
                                        <td className="number-cell">5</td>
                                        <td className="employee-name-cell">Half-Day Shift Count</td>
                                        <td>{summary.halfDayShiftCount ?? 0}</td>
                                    </tr>
                                    <tr>
                                        <td className="number-cell">6</td>
                                        <td className="employee-name-cell">Full-Day Shift Count</td>
                                        <td>{summary.fullDayShiftCount ?? 0}</td>
                                    </tr>
                                    <tr className="payment-section-row">
                                        <td colSpan="3"><center>Payment Breakdown</center></td>
                                    </tr>
                                    {paymentDetails.map((item, index) => (
                                        <tr
                                            key={item.label}
                                            className={item.highlight ? "payment-total-row" : ""}
                                        >
                                            <td className="number-cell">{index + 7}</td>
                                            <td className="employee-name-cell">{item.label}</td>
                                            <td className="amount-cell">₹ {formatAmount(item.amount)}</td>
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
                                onClick={() => {
                                    setError("");
                                    setSuccessMessage("");
                                    setOpeningPendingAmount(
                                        String(summary.openingPendingAmount ?? 0)
                                    );
                                    setAdvanceDeducted(String(summary.advanceDeducted ?? 0));
                                    setAmountPaid(String(summary.amountPaid ?? 0));
                                    setShowPaymentForm(true);
                                }}
                            >
                                Add Payment
                            </button>
                        </div>
                    )}

                    {showPaymentForm && (
                        <form className="payment-table-card employee-payment-form" onSubmit={handleSavePayment}>
                            <div className="payment-table-heading">
                                <h3>Add Employee Payment</h3>
                                <span>
                                    Total Payable: ₹ {formatAmount(calculatedTotalPayable)}
                                </span>
                            </div>

                            <div className="payment-entry-grid">
                                <div className="payment-filter-field">
                                    <label htmlFor="paymentMonth">Payment Date</label>
                                    <input
                                        id="paymentMonth"
                                        type="date"
                                        value={paymentMonth}
                                        onChange={(event) => setPaymentMonth(event.target.value)}
                                        required
                                    />
                                </div>

                                <div className="payment-filter-field">
                                    <label htmlFor="openingPendingAmount">Opening Pending Amount (₹)</label>
                                    <input
                                        id="openingPendingAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={openingPendingAmount}
                                        onChange={(event) => setOpeningPendingAmount(event.target.value)}
                                        required
                                    />
                                </div>

                                {/* <div className="payment-filter-field">
                                    <label htmlFor="advanceDeducted">Advance Deducted (₹)</label>
                                    <input
                                        id="advanceDeducted"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={advanceDeducted}
                                        onChange={(event) => setAdvanceDeducted(event.target.value)}
                                        required
                                    />
                                </div> */}

                                <div className="payment-filter-field">
                                    <label htmlFor="amountPaid">Amount Paid (₹)</label>
                                    <input
                                        id="amountPaid"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={amountPaid}
                                        onChange={(event) => setAmountPaid(event.target.value)}
                                        required
                                    />
                                </div>

                                <div className="payment-filter-field">
                                    <label htmlFor="paymentStatus">Payment Status</label>
                                    <select
                                        id="paymentStatus"
                                        value={paymentStatus}
                                        onChange={(event) => setPaymentStatus(event.target.value)}
                                        required
                                    >
                                        {/* <option value="Draft">Draft</option>
                                        <option value="Finalized">Finalized</option>
                                        <option value="PartiallyPaid">Partially Paid</option> */}
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
                                    {savingPayment ? "Saving..." : "Payment"}
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
                        Enter an Employee ID, select a date range, and click Get Payment Summary.
                    </div>
                </div>
            )}

            {loading && (
                <div className="payment-table-card">
                    <div className="empty-row">Loading employee payment summary...</div>
                </div>
            )}
        </div>
    );
};

export default DailyEmployeePayment;
