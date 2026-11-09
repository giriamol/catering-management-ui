
import React, { useEffect, useState } from "react";
import "../CSS/DailyEmployeePayment.css";

import { getHotelPaymentSummary, SaveHotelPayment,} from "../api/hotelAssignmentDataApi";

import { getHotels } from "../api/hotelapi";
import DatePicker from "../components/DatePicker";

const HotelPayment = () => {
    const [hotelId, setHotelId] = useState("");
    const [hotels, setHotels] = useState([]);
    const [loadingHotels, setLoadingHotels] = useState(false);

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

    // Load all hotels when the page opens.
    useEffect(() => {
        let isMounted = true;

        const loadHotels = async () => {
            try {
                setLoadingHotels(true);
                setError("");

                const response = await getHotels(1, 2000);
                const data = response?.data;

                const hotelList = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                      ? data.data
                      : Array.isArray(data?.items)
                        ? data.items
                        : Array.isArray(data?.hotels)
                          ? data.hotels
                          : [];

                const normalizedHotels = hotelList
                    .map((hotel) => ({
                        ...hotel,
                        hotelId:
                            hotel.hotelId ??
                            hotel.HotelId ??
                            hotel.id ??
                            hotel.Id,
                        hotelName:
                            hotel.hotelName ??
                            hotel.HotelName ??
                            hotel.name ??
                            hotel.Name ??
                            "",
                        isActive: hotel.isActive ?? hotel.IsActive,
                    }))
                    .filter((hotel) => hotel.hotelId != null)
                    .filter((hotel) => {
                        if (hotel.isActive == null) return true;

                        return (
                            hotel.isActive === true ||
                            hotel.isActive === 1 ||
                            String(hotel.isActive).toLowerCase() === "true"
                        );
                    })
                    .sort((a, b) =>
                        String(a.hotelName || `Hotel ${a.hotelId}`).localeCompare(
                            String(b.hotelName || `Hotel ${b.hotelId}`)
                        )
                    );

                if (isMounted) {
                    setHotels(normalizedHotels);

                    if (normalizedHotels.length === 0) {
                        setError("No hotels were returned by the Caters API.");
                    }
                }
            } catch (err) {
                console.error("Error loading hotels:", err);

                if (isMounted) {
                    setHotels([]);
                    setError(getErrorMessage(err));
                }
            } finally {
                if (isMounted) setLoadingHotels(false);
            }
        };

        loadHotels();

        return () => {
            isMounted = false;
        };
    }, []);

    const formatAmount = (amount) =>
        Number(amount ?? 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const formatDate = (date) => {
        if (!date || String(date).trim().toLowerCase() === "null") return "—";

        const datePart = String(date).split("T")[0];
        if (datePart === "0001-01-01") return "—";

        const [year, month, day] = datePart.split("-");

        return year && month && day
            ? `${day}/${month}/${year}`
            : datePart;
    };

    function getErrorMessage(err) {
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
    }

    const resetPaymentForm = () => {
        setPaymentDate("");
        setOpeningPendingAmount("0");
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

        const id = Number(hotelId);

        if (!hotelId || !Number.isSafeInteger(id) || id <= 0) {
            setError("Please select a valid hotel.");
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

            const response = await getHotelPaymentSummary(
                id,
                fromDate,
                toDate
            );

            const data = response?.data;
            const result = data?.data ?? data;

            if (!result || typeof result !== "object") {
                setError("No Caters payment summary was returned.");
                return;
            }

            setSummary(result);
            setSearched(true);
        } catch (err) {
            console.error("Get Caters payment summary failed:", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setHotelId("");
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
            setError("Load the Caters payment summary first.");
            return;
        }

        if (!paymentDate) {
            setError("Please select a payment date.");
            return;
        }

        const resolvedHotelId = Number(summary.hotelId ?? hotelId);
        const grossAmount = Number(summary.grossAmount ?? 0);
        const openingAmount = Number(openingPendingAmount);
        const paidAmount = Number(amountPaid);

        if (
            !Number.isSafeInteger(resolvedHotelId) ||
            resolvedHotelId <= 0
        ) {
            setError("Invalid Caters ID.");
            return;
        }

        if (
            ![grossAmount, openingAmount, paidAmount].every(
                (value) => Number.isFinite(value) && value >= 0
            )
        ) {
            setError(
                "All payment amounts must be valid non-negative numbers."
            );
            return;
        }

        // Hotel total payable = opening pending + current gross amount.
        const totalPayable = openingAmount + grossAmount;

        if (paidAmount > totalPayable) {
            setError("Amount paid cannot exceed the total payable.");
            return;
        }

        const payload = {
            hotelId: resolvedHotelId,
            paymentMonth: `${paymentDate}T00:00:00`,
            openingPendingAmount: openingAmount,
            grossAmount,
            amountPaid: paidAmount,
            paymentStatus,
            fromDate: `${fromDate}T00:00:00`,
            toDate: `${toDate}T00:00:00`
        };

        try {
            setSavingPayment(true);

            const response = await SaveHotelPayment(payload);

            setSuccessMessage(
                response?.data?.message ||
                    "Caters payment saved successfully."
            );

            setShowPaymentForm(false);
            resetPaymentForm();

            // Refresh the summary after saving.
            try {
                const refreshedResponse = await getHotelPaymentSummary(
                    resolvedHotelId,
                    fromDate,
                    toDate
                );

                const refreshedData = refreshedResponse?.data;
                const refreshedSummary =
                    refreshedData?.data ?? refreshedData;

                if (
                    refreshedSummary &&
                    typeof refreshedSummary === "object"
                ) {
                    setSummary(refreshedSummary);
                } else {
                    setSuccessMessage(
                        "Payment saved successfully. Search again to reload the summary."
                    );
                }
            } catch (refreshError) {
                console.error("Summary refresh failed:", refreshError);

                setSuccessMessage(
                    "Payment saved successfully, but the summary could not be refreshed. Search again to reload it."
                );
            }
        } catch (err) {
            console.error("Save Caters payment failed:", err);
            setError(getErrorMessage(err));
        } finally {
            setSavingPayment(false);
        }
    };

    const selectedHotel = hotels.find(
        (hotel) =>
            Number(hotel.hotelId) ===
            Number(summary?.hotelId ?? hotelId)
    );

    const hotelInformation = summary
        ? [
              {
                  label: "Caters Name",
                  value:
                      summary.hotelName ||
                      selectedHotel?.hotelName ||
                      "—",
              },
              {
                  label: "Caters ID",
                  value: summary.hotelId ?? hotelId,
              },
              {
                  label: "Half-Day Shift Count",
                  value: summary.halfDayShiftCount ?? 0,
              },
              {
                  label: "Full-Day Shift Count",
                  value: summary.fullDayShiftCount ?? 0,
              },
          ]
        : [];

    const totalPayable =
        Number(openingPendingAmount || 0) +
        Number(summary?.grossAmount || 0);

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
                  label: "Total Payable",
                  amount:
                      summary.totalPayable ??
                      (Number(summary.openingPendingAmount ?? 0) +
                          Number(summary.grossAmount ?? 0)),
                  highlight: true,
              },
              {
                  label: "Amount Paid (Summary)",
                  amount: summary.amountPaid,
              },
              {
                  label: "Closing Pending Amount",
                  amount:
                      summary.closingPendingAmount ??
                      (Number(summary.totalPayable ??
                          (Number(summary.openingPendingAmount ?? 0) +
                              Number(summary.grossAmount ?? 0))) -
                          Number(summary.amountPaid ?? 0)),
                  highlight: true,
              },
          ]
        : [];

    return (
        <div className="daily-payment-page">
            <div className="payment-page-header">
                <div>
                    <h2>Caters Payment</h2>
                    <p>
                        View Caters information and payment details for the
                        selected date range.
                    </p>
                </div>
            </div>

            <form
                className="payment-filter-card"
                onSubmit={handleSearch}
            >
                <div className="payment-filter-field">
                    <label htmlFor="hotelId">Caters Name</label>

                    <select
                        id="hotelId"
                        name="hotelId"
                        value={hotelId}
                        onChange={(event) => {
                            setHotelId(event.target.value);
                            setSummary(null);
                            setSearched(false);
                            setShowPaymentForm(false);
                            setError("");
                            setSuccessMessage("");
                        }}
                        disabled={
                            loadingHotels || loading || savingPayment
                        }
                        required
                    >
                        <option value="">
                            {loadingHotels
                                ? "Loading Caters..."
                                : hotels.length
                                  ? "-- Select Caters Name --"
                                  : "-- No Caters found --"}
                        </option>

                        {hotels.map((hotel) => (
                            <option
                                key={hotel.hotelId}
                                value={String(hotel.hotelId)}
                            >
                                {hotel.hotelName ||
                                    `Hotel ${hotel.hotelId}`}
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
                        disabled={
                            loading ||
                            loadingHotels ||
                            savingPayment
                        }
                    >
                        {loading
                            ? "Searching..."
                            : "Get Payment Summary"}
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
                    <div className="payment-table-card">
                        <div className="payment-table-heading">
                            <h3>Caterers Payment Details</h3>
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
                                            Caters Information
                                        </td>
                                    </tr>

                                    {hotelInformation.map((item, index) => (
                                        <tr key={item.label}>
                                            <td>
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0"
                                                )}
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
                                            key={item.label}
                                            className={
                                                item.highlight
                                                    ? "payment-total-row"
                                                    : ""
                                            }
                                        >
                                            <td>
                                                {String(
                                                    hotelInformation.length +
                                                        index +
                                                        1
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

                    {showPaymentForm && (
                        <form
                            className="payment-table-card employee-payment-form"
                            onSubmit={handleSavePayment}
                        >
                            <div className="payment-table-heading">
                                <h3>Add Caters Payment</h3>
                                <span>
                                    Total Payable: ₹{" "}
                                    {formatAmount(totalPayable)}
                                </span>
                            </div>

                            <div className="payment-form-note">
                                Live calculation: Opening Pending + Gross
                                Amount
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
                        <h3>Caters Payment Summary</h3>
                    </div>

                    <div className="empty-row">
                        Select a Caters, choose a date range, and click Get
                        Payment Summary.
                    </div>
                </div>
            )}

            {loading && (
                <div className="payment-table-card">
                    <div className="empty-row">
                        Loading Caters payment summary...
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelPayment;
