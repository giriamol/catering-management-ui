
import React, { useEffect, useState } from "react";
import "../CSS/DailyEmployeePayment.css";
import DatePicker from "../components/DatePicker";
import { getEmployees } from "../api/employeeApi";

import { getEmployeePaymentSummary, SaveEmployeePayment } from "../api/dailyEmployeePaymentApi";

const DailyEmployeePayment = () => {
    const [employeeId, setEmployeeId] = useState("");
    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searched, setSearched] = useState(false);

    // Payment form state
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentMonth, setPaymentMonth] = useState("");
    const [openingPendingAmount, setOpeningPendingAmount] = useState("0");
    const [advanceDeducted, setAdvanceDeducted] = useState("0");
    const [amountPaid, setAmountPaid] = useState("0");
    const [paymentStatus, setPaymentStatus] = useState("Paid");
    const [savingPayment, setSavingPayment] = useState(false);

    const loadEmployees = async () => {
        try {
            setLoadingEmployees(true);
            const response = await getEmployees(1, 1000);
            const data = response?.data;
            const employeeList = Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                    ? data.items
                    : Array.isArray(data?.data)
                        ? data.data
                        : Array.isArray(data?.employees)
                            ? data.employees
                            : Array.isArray(data?.result)
                                ? data.result
                                : [];

            const normalizedEmployees = employeeList
                .map((employee) => ({
                    employeeId:
                        employee.employeeId ??
                        employee.EmployeeId ??
                        employee.id ??
                        employee.Id,
                    fullName:
                        employee.fullName ??
                        employee.FullName ??
                        employee.employeeName ??
                        employee.EmployeeName ??
                        employee.name ??
                        employee.Name ??
                        "",
                    memberType: employee.memberType ?? employee.MemberType,
                }))
                .filter((employee) => employee.employeeId != null)
                .map((employee) => ({
                    ...employee,
                    fullName: employee.fullName || `Employee ${employee.employeeId}`,
                }))
                .sort((a, b) =>
                    String(a.fullName || `Employee ${a.employeeId}`).localeCompare(
                        String(b.fullName || `Employee ${b.employeeId}`)
                    )
                );

            setEmployees(normalizedEmployees);
            if (normalizedEmployees.length > 0 && !employeeId) {
                setEmployeeId(String(normalizedEmployees[0].employeeId));
            }
        } catch (err) {
            console.error("Error loading employees:", err);
            setEmployees([]);
            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.data?.detail ||
                "Unable to load employees."
            );
        } finally {
            setLoadingEmployees(false);
        }
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const getValue = (obj, ...keys) => {
        if (!obj || typeof obj !== "object") return undefined;

        for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
                return obj[key];
            }

            const lowerKey = key.toLowerCase();
            const directMatch = Object.keys(obj).find(
                (item) => item.toLowerCase() === lowerKey
            );

            if (directMatch !== undefined && obj[directMatch] !== undefined && obj[directMatch] !== null && obj[directMatch] !== "") {
                return obj[directMatch];
            }
        }

        return undefined;
    };

    const normalizeReportData = (response) => {
        const data = response?.data ?? response;

        if (Array.isArray(data)) return data[0] || {};
        if (Array.isArray(data?.data)) return data.data[0] || {};
        if (Array.isArray(data?.items)) return data.items[0] || {};
        if (Array.isArray(data?.records)) return data.records[0] || {};
        if (data && typeof data === "object") return data;

        return {};
    };

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
        setPaymentStatus("Paid");
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");
        setSummary(null);
        setSearched(false);
        setShowPaymentForm(false);

        const selectedEmployeeId = Number(employeeId);
        if (!employeeId || !Number.isSafeInteger(selectedEmployeeId) || selectedEmployeeId <= 0) {
            setError("Please select a valid employee.");
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
            const response = await getEmployeePaymentSummary(
                selectedEmployeeId,
                fromDate,
                toDate,
                "All"
            );

            const employeeReport = normalizeReportData(response);

            if (!employeeReport || Object.keys(employeeReport).length === 0) {
                setError("No employee payment report found for the selected employee and date range.");
                return;
            }

            setSummary(employeeReport);
            setSearched(true);
        } catch (err) {
            console.error("Get employee payment report failed:", err);
            setError(
                err.response?.data?.message ||
                err.response?.data?.title ||
                err.response?.data?.detail ||
                "Unable to load employee payment report."
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
        setShowPaymentForm(false);
        setError("");
        resetPaymentForm();
    };

    const handleSavePayment = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        if (!summary) {
            setError("Please load the employee payment summary first.");
            return;
        }

        if (!paymentMonth) {
            setError("Please select a payment date.");
            return;
        }

        const resolvedEmployeeId = Number(
            getValue(
                summary,
                "employeeId",
                "EmployeeId",
                "id",
                "Id"
            ) ?? employeeId
        );

        const grossAmount = Number(
            getValue(
                summary,
                "grossAmount",
                "GrossAmount",
                "totalGross",
                "TotalGross"
            ) ?? 0
        );
        const openingAmount = Number(openingPendingAmount);
        const advanceAmount = Number(advanceDeducted);
        const paidAmount = Number(amountPaid);

        if (
            !Number.isSafeInteger(resolvedEmployeeId) ||
            resolvedEmployeeId <= 0
        ) {
            setError("Please select a valid employee.");
            return;
        }

        if (
            !employees.some(
                (employee) =>
                    Number(employee.employeeId) === resolvedEmployeeId
            )
        ) {
            setError(
                "The selected employee is not in the eligible employee list."
            );
            return;
        }

        if (
            ![
                grossAmount,
                openingAmount,
                advanceAmount,
                paidAmount,
            ].every(
                (amount) => Number.isFinite(amount) && amount >= 0
            )
        ) {
            setError("Please enter valid non-negative payment amounts.");
            return;
        }

        const totalPayable =
            openingAmount + grossAmount - advanceAmount;

        if (advanceAmount > openingAmount + grossAmount) {
            setError(
                "Advance deducted cannot exceed the total available amount."
            );
            return;
        }

        if (paidAmount > totalPayable) {
            setError("Amount paid cannot exceed the total payable amount.");
            return;
        }

        const payload = {
            employeeId: resolvedEmployeeId,
            paymentMonth: `${paymentMonth}T00:00:00`,
            openingPendingAmount: openingAmount,
            grossAmount,
            advanceDeducted: advanceAmount,
            amountPaid: paidAmount,
            paymentStatus,
        };

        console.log("Employee payment save payload:", payload);

        try {
            setSavingPayment(true);

            const response = await SaveEmployeePayment(payload);

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

    const resolvedSummary = summary || {};

    const paymentDetails = summary
        ? [
              {
                  label: "Opening Pending Amount / Previous Pending Amount",
                  amount:
                      Number(
                          getValue(
                              resolvedSummary,
                              "openingPendingAmount",
                              "OpeningPendingAmount",
                              "previousPendingAmount",
                              "PreviousPendingAmount",
                              "pendingAmount",
                              "PendingAmount"
                          ) ?? 0
                      ),
              },
              {
                  label: "Gross Amount",
                  amount:
                      Number(
                          getValue(
                              resolvedSummary,
                              "grossAmount",
                              "GrossAmount",
                              "totalGross",
                              "TotalGross"
                          ) ?? 0
                      ),
              },
              {
                  label: "Advance Deducted",
                  amount:
                      Number(
                          getValue(
                              resolvedSummary,
                              "advanceDeducted",
                              "AdvanceDeducted",
                              "advanceAmount",
                              "AdvanceAmount"
                          ) ?? 0
                      ),
              },
              {
                  label: "Total Payable",
                  amount:
                      Number(
                          getValue(
                              resolvedSummary,
                              "totalPayable",
                              "TotalPayable",
                              "totalBeforeDeductions",
                              "TotalBeforeDeductions"
                          ) ??
                          (
                              Number(
                                  getValue(
                                      resolvedSummary,
                                      "openingPendingAmount",
                                      "OpeningPendingAmount",
                                      "previousPendingAmount",
                                      "PreviousPendingAmount"
                                  ) ?? 0
                              ) +
                              Number(
                                  getValue(
                                      resolvedSummary,
                                      "grossAmount",
                                      "GrossAmount",
                                      "totalGross",
                                      "TotalGross"
                                  ) ?? 0
                              ) -
                              Number(
                                  getValue(
                                      resolvedSummary,
                                      "advanceDeducted",
                                      "AdvanceDeducted",
                                      "advanceAmount",
                                      "AdvanceAmount"
                                  ) ?? 0
                              )
                          )
                      ),
                  highlight: true,
              },
          ]
        : [];

    const calculatedTotalPayable =
        Number(openingPendingAmount || 0) +
        Number(
            getValue(
                summary,
                "grossAmount",
                "GrossAmount",
                "totalGross",
                "TotalGross"
            ) ?? 0
        ) -
        Number(advanceDeducted || 0);

    return (
        <div className="daily-payment-page">
            <div className="payment-page-header">
                <div>
                    <h2>Employee Payment</h2>
                    <p>
                        Select an employee, review the payment summary,
                        and record the payment for the chosen period.
                    </p>
                </div>
            </div>

            <form
                className="payment-filter-card"
                onSubmit={handleSearch}
            >
                
              <div className="payment-filter-field">
                    <label htmlFor="employeeId">Employee Name</label>

                    <select
                        id="employeeId"
                        name="employeeId"
                        value={employeeId}
                        onChange={(event) => {
                            setEmployeeId(event.target.value);
                            setSummary(null);
                            setSearched(false);
                            setShowPaymentForm(false);
                            setError("");
                            setSuccessMessage("");
                        }}
                        disabled={loadingEmployees || loading || savingPayment}
                        required
                    >
                        <option value="">
                            {loadingEmployees
                                ? "Loading employees..."
                                : employees.length > 0
                                    ? "-- Select Employee Name --"
                                    : "-- No employees found --"}
                        </option>

                        {employees.map((employee) => (
                            <option
                                key={employee.employeeId}
                                value={String(employee.employeeId)}
                            >
                                {employee.fullName || `Employee ${employee.employeeId}`}
                            </option>
                        ))}
                    </select>

                    {/* <small>
                        {loadingEmployees
                            ? "Loading employee list..."
                            : `${employees.length} active employee(s) available`}
                    </small> */}
                </div>

                <div className="payment-filter-field">
                    <label htmlFor="fromDate">From Date</label>

                    <DatePicker
                        id="fromDate"
                        name="fromDate"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(value) => {
                            setFromDate(value);
                            setSummary(null);
                            setSearched(false);
                        }}
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
                        onChange={(value) => {
                            setToDate(value);
                            setSummary(null);
                            setSearched(false);
                        }}
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
                        disabled={
                            loading ||
                            loadingEmployees ||
                            savingPayment ||
                            !employeeId
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
                    <strong>Error!</strong>
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

            {loadingEmployees && (
                <div className="payment-table-card">
                    <div className="empty-row">
                        Loading employee list for the selected date range...
                    </div>
                </div>
            )}

            {searched && summary && (
                <>
                    <div className="payment-table-card employee-info-table-card">
                        <div className="payment-table-heading">
                            <h3>Employee Payment Details</h3>

                            <span>
                                {formatDate(summary.fromDate)} –{" "}
                                {formatDate(summary.toDate)}
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
                                        <td colSpan="3">
                                            <center>
                                                Employee Information
                                            </center>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="number-cell">1</td>
                                        <td className="employee-name-cell">
                                            Employee Name
                                        </td>
                                        <td>
                                            {getValue(
                                                summary,
                                                "employeeName",
                                                "EmployeeName",
                                                "fullName",
                                                "FullName",
                                                "name",
                                                "Name"
                                            ) || "—"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="number-cell">2</td>
                                        <td className="employee-name-cell">
                                            Employee ID
                                        </td>
                                        <td>
                                            {getValue(
                                                summary,
                                                "employeeId",
                                                "EmployeeId",
                                                "id",
                                                "Id"
                                            ) ?? employeeId}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="number-cell">3</td>
                                        <td className="employee-name-cell">
                                            Member Type
                                        </td>
                                        <td>
                                            {getValue(
                                                summary,
                                                "memberType",
                                                "MemberType",
                                                "employeeType",
                                                "EmployeeType"
                                            ) || "—"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="number-cell">4</td>
                                        <td className="employee-name-cell">
                                            Half-Day Shift Count
                                        </td>
                                        <td>
                                            {getValue(
                                                summary,
                                                "halfDayShiftCount",
                                                "HalfDayShiftCount"
                                            ) ?? 0}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="number-cell">5</td>
                                        <td className="employee-name-cell">
                                            Full-Day Shift Count
                                        </td>
                                        <td>
                                            {getValue(
                                                summary,
                                                "fullDayShiftCount",
                                                "FullDayShiftCount"
                                            ) ?? 0}
                                        </td>
                                    </tr>

                                    <tr className="payment-section-row">
                                        <td colSpan="3">
                                            <center>
                                                Payment Breakdown
                                            </center>
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
                                            <td className="number-cell">
                                                {index + 6}
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
                                onClick={() => {
                                    setError("");
                                    setSuccessMessage("");

                                    setOpeningPendingAmount(
                                        String(
                                            getValue(
                                                summary,
                                                "openingPendingAmount",
                                                "OpeningPendingAmount",
                                                "previousPendingAmount",
                                                "PreviousPendingAmount",
                                                "pendingAmount",
                                                "PendingAmount"
                                            ) ?? 0
                                        )
                                    );

                                    setAdvanceDeducted(
                                        String(
                                            getValue(
                                                summary,
                                                "advanceDeducted",
                                                "AdvanceDeducted",
                                                "advanceAmount",
                                                "AdvanceAmount"
                                            ) ?? 0
                                        )
                                    );

                                    setAmountPaid(
                                        String(
                                            getValue(
                                                summary,
                                                "amountPaid",
                                                "AmountPaid",
                                                "paidAmount",
                                                "PaidAmount"
                                            ) ?? 0
                                        )
                                    );

                                    setShowPaymentForm(true);
                                }}
                            >
                                Add Payment
                            </button>
                        </div>
                    )}

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
                                    <label htmlFor="paymentMonth">
                                        Payment Date
                                    </label>

                                     <DatePicker
                                        id="paymentMonth"
                                        name="paymentMonth"
                                        value={paymentMonth}
                                        onChange={setPaymentMonth}
                                        required
                                        placeholder="DD/MM/YYYY"
                                        disabled={savingPayment}
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
                                        disabled={savingPayment}
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
                                        disabled={savingPayment}
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
                                        disabled={savingPayment}
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
                                        disabled={savingPayment}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Paid">Paid</option>
                                        <option value="PartiallyPaid">
                                            Partially Paid
                                        </option>
                                        <option value="Finalized">
                                            Finalized
                                        </option>
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
                                        ? "Saving..."
                                        : "Save Payment"}
                                </button>
                            </div>
                        </form>
                    )}
                </>
            )}

            {!searched && !loading && !loadingEmployees && !error && (
                <div className="payment-table-card">
                    <div className="payment-table-heading">
                        <h3>Employee Payment Summary</h3>
                    </div>

                    <div className="empty-row">
                        Select an eligible employee, choose a date range,
                        and click Get Payment Summary.
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
