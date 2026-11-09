
import React, { useEffect, useState } from "react";
import "../CSS/SupplierPayment.css";

import {
    getSupplierPaymentSummary, SaveSupplierPayment } from "../api/dailySupplierAssignmentToVendorApi";

import { getVendors } from "../api/vendorApi";
import DatePicker from "../components/DatePicker";

const SupplierPayment = () => {
    const [vendorId, setVendorId] = useState("");
    const [vendors, setVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(false);

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
    const [amountPaid, setAmountPaid] = useState("0");
    const [paymentStatus, setPaymentStatus] = useState("Paid");
    const [savingPayment, setSavingPayment] = useState(false);

    // Load vendors for the supplier dropdown.
    useEffect(() => {
        let isMounted = true;

        const loadVendors = async () => {
            try {
                setLoadingVendors(true);

                const response = await getVendors(1, 2000);
                const data = response?.data;

                const vendorList = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : Array.isArray(data?.items)
                            ? data.items
                            : Array.isArray(data?.vendors)
                                ? data.vendors
                                : [];

                const normalizedVendors = vendorList
                    .map((vendor) => ({
                        ...vendor,
                        vendorId:
                            vendor.vendorId ??
                            vendor.VendorId ??
                            vendor.fk_VendorId,
                        vendorName:
                            vendor.vendorName ??
                            vendor.VendorName ??
                            vendor.companyName ??
                            vendor.CompanyName ??
                            vendor.businessName ??
                            vendor.BusinessName ??
                            "",
                        isActive: vendor.isActive ?? vendor.IsActive,
                    }))
                    .filter((vendor) => vendor.vendorId != null)
                    .filter((vendor) => {
                        if (vendor.isActive == null) return true;

                        return (
                            vendor.isActive === true ||
                            vendor.isActive === 1 ||
                            String(vendor.isActive).toLowerCase() === "true"
                        );
                    })
                    .sort((a, b) =>
                        String(a.vendorName || `Vendor ${a.vendorId}`).localeCompare(
                            String(b.vendorName || `Vendor ${b.vendorId}`)
                        )
                    );

                if (isMounted) {
                    setVendors(normalizedVendors);

                    if (normalizedVendors.length === 0) {
                        setError("No vendors were returned by the vendor API.");
                    }
                }
            } catch (err) {
                console.error("Error loading supplier vendors:", err);

                if (isMounted) {
                    setVendors([]);
                    setError(
                        err?.response?.data?.message ||
                        err?.response?.data?.title ||
                        "Unable to load vendors. Please check the vendor API."
                    );
                }
            } finally {
                if (isMounted) setLoadingVendors(false);
            }
        };

        loadVendors();

        return () => {
            isMounted = false;
        };
    }, []);

    const normalizeNullValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return 0;
        }

        if (typeof value === "string") {
            const trimmed = value.trim();

            if (trimmed === "" || trimmed.toLowerCase() === "null") {
                return 0;
            }
        }

        return value;
    };

    const formatAmount = (amount) => {
        const normalized = normalizeNullValue(amount);
        const numeric = Number(normalized);

        return Number.isFinite(numeric)
            ? numeric.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            : "0.00";
    };

    const formatDate = (date) => {
        if (!date || String(date).trim().toLowerCase() === "null") return "—";

        const rawValue = String(date).trim();
        const datePart = rawValue.split("T")[0];

        if (datePart === "0001-01-01") return "—";

        const [year, month, day] = datePart.split("-");

        return year && month && day
            ? `${day}/${month}/${year}`
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
        setAmountPaid("0");
        setPaymentStatus("Paid");
    };

    const extractSummaryRecord = (response) => {
        const raw = response?.data ?? response;

        if (Array.isArray(raw)) {
            return raw[0] ?? null;
        }

        if (raw && typeof raw === "object") {
            if (Array.isArray(raw.data)) return raw.data[0] ?? null;
            if (Array.isArray(raw.items)) return raw.items[0] ?? null;
            if (Array.isArray(raw.result)) return raw.result[0] ?? null;
            if (Array.isArray(raw.results)) return raw.results[0] ?? null;
        }

        return raw ?? null;
    };

    const handleSearch = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");
        setSummary(null);
        setSearched(false);
        setShowPaymentForm(false);

        const id = Number(vendorId);

        if (!vendorId || !Number.isSafeInteger(id) || id <= 0) {
            setError("Please select a valid supplier.");
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

            const response = await getSupplierPaymentSummary(
                id,
                fromDate,
                toDate
            );

            const record = extractSummaryRecord(response);

            if (!record) {
                setError("No supplier payment summary was returned.");
                return;
            }

            setSummary(record);
            setSearched(true);
        } catch (err) {
            console.error("Get supplier payment summary failed:", err);
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
            setError("Load the supplier payment summary first.");
            return;
        }

        if (!paymentDate) {
            setError("Please select a payment date.");
            return;
        }

        const resolvedVendorId = Number(summary.vendorId ?? vendorId);
        const grossAmount = Number(summary.grossAmount ?? 0);
        const openingAmount = Number(openingPendingAmount);
        const paidAmount = Number(amountPaid);

        if (!Number.isSafeInteger(resolvedVendorId) || resolvedVendorId <= 0) {
            setError("Invalid Supplier ID.");
            return;
        }

        if (
            ![grossAmount, openingAmount, paidAmount].every(
                (value) => Number.isFinite(value) && value >= 0
            )
        ) {
            setError("All payment amounts must be valid non-negative numbers.");
            return;
        }

        // Supplier payment has NO advance deduction.
        const totalPayable = openingAmount + grossAmount;

        if (paidAmount > totalPayable) {
            setError("Amount paid cannot exceed the total payable amount.");
            return;
        }

        const payload = {
            vendorId: resolvedVendorId,
            paymentDate: paymentDate,
            openingPendingAmount: openingAmount,
            grossAmount: grossAmount,
            amountPaid: paidAmount,
            paymentStatus: paymentStatus,
            fromDate: fromDate,
            toDate: toDate,
        };

        try {
            setSavingPayment(true);
            console.log("Submitting supplier payment payload:", payload);
            const response = await SaveSupplierPayment(payload);

            setSuccessMessage(
                response?.data?.message ||
                "Supplier payment saved successfully."
            );

            setShowPaymentForm(false);
            resetPaymentForm();

            // Refresh supplier summary after successful payment.
            try {
                const refreshedResponse = await getSupplierPaymentSummary(
                    resolvedVendorId,
                    fromDate,
                    toDate
                );

                const refreshedSummary = extractSummaryRecord(refreshedResponse);

                if (refreshedSummary) {
                    setSummary(refreshedSummary);
                }
            } catch (refreshError) {
                console.error("Supplier summary refresh failed:", refreshError);

                setSuccessMessage(
                    "Payment saved successfully, but the summary could not be refreshed. Search again to reload it."
                );
            }
        } catch (err) {
            console.error("SaveSupplierPayment API failed:", err);
            console.error("Server response:", err?.response?.data);

            setError(getErrorMessage(err));
        } finally {
            setSavingPayment(false);
        }
    };

    const selectedVendor = vendors.find(
        (vendor) =>
            Number(vendor.vendorId) ===
            Number(summary?.vendorId ?? vendorId)
    );

    const vendorInformation = summary
        ? [
            {
                label: "Vendor Name",
                value:
                    summary.vendorName ||
                    selectedVendor?.vendorName ||
                    "—",
            },
            {
                label: "Vendor ID",
                value: summary.vendorId ?? vendorId,
            },
            {
                label: "Half-Day Quantity",
                value:
                    summary.halfDayShiftCount ??
                    summary.halfDayCount ??
                    0,
            },
            {
                label: "Full-Day Quantity",
                value:
                    summary.fullDayShiftCount ??
                    summary.fullDayCount ??
                    0,
            },
        ]
        : [];

    const paymentDetails = summary
        ? [
            {
                label: "Opening Pending Amount / Previous Pending Amount",
                amount: summary.openingPendingAmount ?? 0,
            },
            {
                label: "Gross Amount",
                amount: summary.grossAmount ?? 0,
            },
            {
                label: "Total Payable",
                amount:
                    summary.totalPayable ??
                    summary.totalBeforeDeductions ??
                    (
                        Number(summary.openingPendingAmount ?? 0) +
                        Number(summary.grossAmount ?? 0)
                    ),
                highlight: true,
            },
            // {
            //     label: "Amount Paid",
            //     amount: summary.amountPaid ?? 0,
            // },
            // {
            //     label: "Closing Pending Amount",
            //     amount:
            //         summary.closingPendingAmount ??
            //         (
            //             Number(summary.openingPendingAmount ?? 0) +
            //             Number(summary.grossAmount ?? 0) -
            //             Number(summary.amountPaid ?? 0)
            //         ),
            //     highlight: true,
            // },
        ]
        : [];

    const calculatedTotalPayable =
        Number(openingPendingAmount || 0) +
        Number(summary?.grossAmount || 0);

    return (
        <div className="daily-payment-page">
            <div className="payment-page-header">
                <div>
                    <h2>Supplier Payment</h2>
                    <p>
                        View supplier information and payment breakdown for
                        the selected date range.
                    </p>
                </div>
            </div>

            {/* Supplier and date filters */}
            <form className="payment-filter-card" onSubmit={handleSearch}>
                <div className="payment-filter-field">
                    <label htmlFor="vendorId">Vendor Name</label>

                    <select
                        id="vendorId"
                        name="vendorId"
                        value={vendorId}
                        onChange={(event) => {
                            setVendorId(event.target.value);
                            setSummary(null);
                            setSearched(false);
                            setShowPaymentForm(false);
                            setError("");
                            setSuccessMessage("");
                        }}
                        disabled={loadingVendors || loading || savingPayment}
                        required
                    >
                        <option value="">
                            {loadingVendors
                                ? "Loading vendors..."
                                : vendors.length
                                    ? "-- Select Vendor Name --"
                                    : "-- No vendors found --"}
                        </option>

                        {vendors.map((vendor) => (
                            <option
                                key={vendor.vendorId}
                                value={String(vendor.vendorId)}
                            >
                                {vendor.vendorName ||
                                    `Vendor ${vendor.vendorId}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="payment-filter-field">
                    <label htmlFor="fromDate">From Date</label>

                    <DatePicker
                        id="fromDate"
                        name="fromDate"
                        value={fromDate}
                        onChange={setFromDate}
                        max={toDate || undefined}
                        required
                        placeholder="DD/MM/YYYY"
                    />
                </div>

                <div className="payment-filter-field">
                    <label htmlFor="toDate">To Date</label>

                    <DatePicker
                        id="toDate"
                        name="toDate"
                        value={toDate}
                        onChange={setToDate}
                        min={fromDate || undefined}
                        required
                        placeholder="DD/MM/YYYY"
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
                        disabled={loading || loadingVendors || savingPayment}
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

            {searched && summary && (
                <>
                    {/* Supplier payment statement */}
                    <div className="payment-table-card">
                        <div className="payment-table-heading">
                            <h3>Supplier Payment Details</h3>

                            <span>
                                {formatDate(summary.fromDate || fromDate)}
                                {" – "}
                                {formatDate(summary.toDate || toDate)}
                            </span>
                        </div>

                        <div className="payment-table-wrapper">
                            <table className="payment-table">
                                <thead>
                                    <tr>
                                        <th>Sr. No.</th>
                                        <th>Payment Description</th>
                                        <th>Amount / Details</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr className="payment-section-row">
                                        <td colSpan="3">
                                            Supplier Information
                                        </td>
                                    </tr>

                                    {vendorInformation.map((item, index) => (
                                        <tr key={`supplier-info-${item.label}`}>
                                            <td>
                                                {String(index + 1).padStart(2, "0")}
                                            </td>

                                            <td className="employee-name-cell">
                                                {item.label}
                                            </td>

                                            <td>{item.value}</td>
                                        </tr>
                                    ))}

                                    <tr className="payment-section-row">
                                        <td colSpan="3">
                                            Payment Breakdown
                                        </td>
                                    </tr>

                                    {paymentDetails.map((item, index) => (
                                        <tr
                                            key={`payment-${item.label}`}
                                            className={
                                                item.highlight
                                                    ? "payment-total-row"
                                                    : ""
                                            }
                                        >
                                            <td>
                                                {String(
                                                    vendorInformation.length +
                                                    index + 1
                                                ).padStart(2, "0")}
                                            </td>

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

                    {/* Supplier payment entry */}
                    {showPaymentForm && (
                        <form
                            className="payment-table-card employee-payment-form"
                            onSubmit={handleSavePayment}
                        >
                            <div className="payment-table-heading">
                                <h3>Add Supplier Payment</h3>

                                <span>
                                    Total Payable: ₹{" "}
                                    {formatAmount(calculatedTotalPayable)}
                                </span>
                            </div>

                            <div className="payment-form-note">
                                Live calculation: Opening Pending Amount +
                                Gross Amount
                            </div>

                            <div className="payment-entry-grid">
                                <div className="payment-filter-field">
                                    <label htmlFor="paymentDate">
                                        Payment Date
                                    </label>

                                    <DatePicker
                                        id="paymentDate"
                                        name="paymentDate"
                                        value={paymentDate}
                                        onChange={setPaymentDate}
                                        required
                                        placeholder="DD/MM/YYYY"
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
                                    <label htmlFor="grossAmount">
                                        Gross Amount (₹)
                                    </label>

                                    <input
                                        id="grossAmount"
                                        type="number"
                                        value={Number(
                                            summary?.grossAmount ?? 0
                                        ).toFixed(2)}
                                        disabled
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
                        <h3>Supplier Payment Summary</h3>
                    </div>

                    <div className="empty-row">
                        Select a supplier, choose a date range, and click
                        Get Payment Summary.
                    </div>
                </div>
            )}

            {loading && (
                <div className="payment-table-card">
                    <div className="empty-row">
                        Loading supplier payment summary...
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierPayment;
