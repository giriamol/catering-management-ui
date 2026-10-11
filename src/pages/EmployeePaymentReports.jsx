
import React, { useState } from "react";
import DailyEmployeePayment from "../pages/DailyEmployeePayment";
import AllEmployeePaymentReport from "../pages/AllEmployeePaymentReport";
import "../CSS/EmployeePaymentReports.css";

const EmployeePaymentReports = () => {
    const [activeReport, setActiveReport] = useState(null);

    return (
        <div className="employee-reports-page">
            {!activeReport ? (
                <>
                    <div className="employee-reports-header">
                        <div className="employee-reports-header-icon">
                            ₹
                        </div>

                        <div>
                            <h1>Employee Payment Reports</h1>
                            <p>
                                View individual employee payments or
                                payment details for all employees.
                            </p>
                        </div>
                    </div>

                    <div className="employee-reports-section-title">
                        <h2>Choose a Report</h2>
                        <p>Select the report you want to view.</p>
                    </div>

                    <div className="employee-report-cards">
                        <button
                            type="button"
                            className="employee-report-card"
                            onClick={() => setActiveReport("single")}
                        >
                            <span className="employee-report-icon single">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                                </svg>
                            </span>

                            <span className="employee-report-card-content">
                                <strong>Get Employee Payment</strong>
                                <span>
                                    View one employee's shift details,
                                    gross amount, payments and pending balance.
                                </span>
                                <span className="employee-report-link">
                                    View Employee Report →
                                </span>
                            </span>
                        </button>

                        <button
                            type="button"
                            className="employee-report-card"
                            onClick={() => setActiveReport("all")}
                        >
                            <span className="employee-report-icon all">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <circle cx="9" cy="8" r="3.5" />
                                    <path d="M2 20v-2a7 7 0 0 1 14 0v2" />
                                    <path d="M16 5.5a3.5 3.5 0 0 1 0 6.8M18 15a5 5 0 0 1 4 5" />
                                </svg>
                            </span>

                            <span className="employee-report-card-content">
                                <strong>
                                    Get All Employee Payment Details
                                </strong>
                                <span>
                                    View payment summaries for all employees
                                    within a selected date range.
                                </span>
                                <span className="employee-report-link">
                                    View All Employees →
                                </span>
                            </span>
                        </button>
                    </div>
                </>
            ) : (
                <div className="employee-report-active">
                    <button
                        type="button"
                        className="employee-report-back"
                        onClick={() => setActiveReport(null)}
                    >
                        ← Back to Employee Reports
                    </button>

                    {activeReport === "single" && (
                        <DailyEmployeePayment />
                    )}

                    {activeReport === "all" && (
                        <AllEmployeePaymentReport />
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeePaymentReports;
