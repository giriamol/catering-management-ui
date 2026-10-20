// // import { useState } from "react";
// // import "../CSS/ReportsOverview.css";

// // const reportItems = [
// //     {
// //         id: "caterers-payment",
// //         title: "Caterers Payment Statements",
// //         fields: [
// //             { name: "catererName", label: "Caterer Name", type: "text", required: true },
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //             { name: "status", label: "Payment Status", type: "select", options: ["All", "Paid", "Pending"], required: true },
// //         ],
// //     },
// //     {
// //         id: "all-caterers-payment",
// //         title: "All Caterers Payment Statements",
// //         fields: [
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //             { name: "status", label: "Payment Status", type: "select", options: ["All", "Paid", "Pending"], required: true },
// //         ],
// //     },
// //     {
// //         id: "employee-payment",
// //         title: "Employee Payment Statements",
// //         fields: [
// //             { name: "employeeName", label: "Employee Name", type: "text", required: true },
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //             { name: "status", label: "Payment Status", type: "select", options: ["All", "Paid", "Pending"], required: true },
// //         ],
// //     },

// //     {
// //         id: "supplier-payment",
// //         title: "Vendor Payment Statements",
// //         fields: [
// //             { name: "VendorName", label: "Vendor Name", type: "text", required: true },
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //         ],
// //     },
// //     {
// //         id: "all-Vendor-payment",
// //         title: "All Vendor Payment Statements",
// //         fields: [
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //             { name: "status", label: "Payment Status", type: "select", options: ["All", "Paid", "Pending"], required: true },
// //         ],
// //     },
// //     {
// //         id: "all-employee-payment",
// //         title: "All Employee Payment Statements",
// //         fields: [
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //             { name: "status", label: "Payment Status", type: "select", options: ["All", "Paid", "Pending"], required: true },
// //         ],
// //     },
// //     {
// //         id: "caterers-work-employee",
// //         title: "Caterers Work Details (Employee)",
// //         fields: [
// //             { name: "employeeName", label: "Employee Name", type: "text", required: true },
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //         ],
// //     },
// //     {
// //         id: "caterers-work-caterers",
// //         title: "Caterers Work Details (Caterers)",
// //         fields: [
// //             { name: "catererName", label: "Caterer Name", type: "text", required: true },
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //         ],
// //     },
// //     {
// //         id: "employee-work-details",
// //         title: "Employee Work Details",
// //         fields: [
// //             { name: "employeeName", label: "Employee Name", type: "text", required: true },
// //             { name: "fromDate", label: "From Date", type: "date", required: true },
// //             { name: "toDate", label: "To Date", type: "date", required: true },
// //             { name: "assignmentType", label: "Assignment Type", type: "select", options: ["All", "Breakfast", "Lunch", "Dinner"], required: true },
// //         ],
// //     },
// // ];

// // const buildReportRows = (report, formData) => {
// //     const defaultRows = [
// //         { label: "Base Amount", value: "₹ 18,500" },
// //         { label: "Advance", value: "₹ 2,500" },
// //         { label: "Balance", value: "₹ 16,000" },
// //         { label: "Status", value: formData.status || "Paid" },
// //     ];

// //     if (report.id.includes("work")) {
// //         return [
// //             { date: "15 Oct 2026", assignment: "Breakfast", employee: formData.employeeName || "Employee A", amount: "₹ 1,200", status: "Completed" },
// //             { date: "16 Oct 2026", assignment: "Lunch", employee: formData.employeeName || "Employee B", amount: "₹ 1,850", status: "Completed" },
// //             { date: "17 Oct 2026", assignment: "Dinner", employee: formData.employeeName || "Employee C", amount: "₹ 2,100", status: "Pending" },
// //         ];
// //     }

// //     if (report.id.includes("caterers") || report.id.includes("supplier")) {
// //         return [
// //             { date: "01 Oct 2026", party: formData.catererName || formData.supplierName || "Main Caterer", invoice: "INV-1042", amount: "₹ 22,000", status: formData.status || "Paid" },
// //             { date: "08 Oct 2026", party: formData.catererName || formData.supplierName || "Main Caterer", invoice: "INV-1080", amount: "₹ 18,500", status: formData.status || "Pending" },
// //             { date: "15 Oct 2026", party: formData.catererName || formData.supplierName || "Main Caterer", invoice: "INV-1119", amount: "₹ 25,200", status: formData.status || "Paid" },
// //         ];
// //     }

// //     return [
// //         { date: "10 Oct 2026", employee: formData.employeeName || "John Kumar", payment: "₹ 8,500", status: formData.status || "Paid" },
// //         { date: "12 Oct 2026", employee: formData.employeeName || "John Kumar", payment: "₹ 7,800", status: formData.status || "Pending" },
// //         { date: "18 Oct 2026", employee: formData.employeeName || "John Kumar", payment: "₹ 9,200", status: formData.status || "Paid" },
// //     ];
// // };

// // function ReportsOverview() {
// //     const [selectedReport, setSelectedReport] = useState(null);
// //     const [formData, setFormData] = useState({});
// //     const [generatedReport, setGeneratedReport] = useState(null);

// //     const activeReport = reportItems.find((item) => item.id === selectedReport) || null;

// //     const handleInputChange = (event) => {
// //         const { name, value } = event.target;
// //         setFormData((prev) => ({ ...prev, [name]: value }));
// //     };

// //     const handleGenerateReport = (event) => {
// //         event.preventDefault();

// //         if (!activeReport) {
// //             return;
// //         }

// //         const missingField = activeReport.fields.find(
// //             (field) => field.required && !String(formData[field.name] || "").trim()
// //         );

// //         if (missingField) {
// //             alert(`Please fill the ${missingField.label} field before generating the report.`);
// //             return;
// //         }

// //         const rows = buildReportRows(activeReport, formData);
// //         const summary = [
// //             { title: "Report Name", value: activeReport.title },
// //             { title: "Date Range", value: `${formData.fromDate || "--"} to ${formData.toDate || "--"}` },
// //             { title: "Selected Status", value: formData.status || "All" },
// //         ];

// //         setGeneratedReport({
// //             title: activeReport.title,
// //             summary,
// //             rows,
// //             formData,
// //         });
// //     };

// //     const handleBack = () => {
// //         setSelectedReport(null);
// //         setGeneratedReport(null);
// //         setFormData({});
// //     };

// //     const handleDownloadPdf = () => {
// //         window.print();
// //     };

// //     return (
// //         <div className="reports-overview-page">
// //             <div className="reports-overview-panel">
// //                 {!selectedReport ? (
// //                     <>
// //                         <div className="reports-overview-header">
// //                             <span className="reports-overview-title-icon">☰</span>
// //                             <h1>Application Reports</h1>
// //                         </div>

// //                         <div className="reports-overview-grid">
// //                             {reportItems.map((item) => (
// //                                 <button
// //                                     key={item.id}
// //                                     type="button"
// //                                     className="reports-overview-card"
// //                                     onClick={() => setSelectedReport(item.id)}
// //                                 >
// //                                     <span className="reports-overview-card-icon">⎇</span>
// //                                     <span>{item.title}</span>
// //                                 </button>
// //                             ))}
// //                         </div>
// //                     </>
// //                 ) : (
// //                     <div className="report-builder">
// //                         <div className="report-builder-header">
// //                             <button type="button" className="report-back-button" onClick={handleBack}>
// //                                 ← Back to Reports
// //                             </button>
// //                             <h2>{activeReport.title}</h2>
// //                         </div>

// //                         <form className="report-form" onSubmit={handleGenerateReport}>
// //                             <div className="report-form-grid">
// //                                 {activeReport.fields.map((field) => (
// //                                     <label key={field.name} className="report-form-field">
// //                                         <span>{field.label}</span>
// //                                         {field.type === "select" ? (
// //                                             <select
// //                                                 name={field.name}
// //                                                 value={formData[field.name] || ""}
// //                                                 onChange={handleInputChange}
// //                                                 required={field.required}
// //                                             >
// //                                                 <option value="">Select {field.label}</option>
// //                                                 {field.options.map((option) => (
// //                                                     <option key={option} value={option}>
// //                                                         {option}
// //                                                     </option>
// //                                                 ))}
// //                                             </select>
// //                                         ) : (
// //                                             <input
// //                                                 type={field.type}
// //                                                 name={field.name}
// //                                                 value={formData[field.name] || ""}
// //                                                 onChange={handleInputChange}
// //                                                 required={field.required}
// //                                             />
// //                                         )}
// //                                     </label>
// //                                 ))}
// //                             </div>

// //                             <div className="report-form-actions">
// //                                 <button type="submit" className="primary-button">
// //                                     Generate Report
// //                                 </button>
// //                             </div>
// //                         </form>

// //                         {generatedReport && (
// //                             <div className="report-output-card">
// //                                 <div className="report-output-header">
// //                                     <div>
// //                                         <p className="report-output-label">Generated Report</p>
// //                                         <h3>{generatedReport.title}</h3>
// //                                     </div>

// //                                     <button type="button" className="download-button" onClick={handleDownloadPdf}>
// //                                         Download PDF
// //                                     </button>
// //                                 </div>

// //                                 <div className="report-summary-grid">
// //                                     {generatedReport.summary.map((item) => (
// //                                         <div key={item.title} className="summary-box">
// //                                             <span>{item.title}</span>
// //                                             <strong>{item.value}</strong>
// //                                         </div>
// //                                     ))}
// //                                 </div>

// //                                 <div className="report-table-wrap">
// //                                     <table className="report-output-table">
// //                                         <thead>
// //                                             <tr>
// //                                                 {generatedReport.rows[0] && Object.keys(generatedReport.rows[0]).includes("date") ? (
// //                                                     <>
// //                                                         <th>Date</th>
// //                                                         <th>Assignment</th>
// //                                                         <th>Employee</th>
// //                                                         <th>Amount</th>
// //                                                         <th>Status</th>
// //                                                     </>
// //                                                 ) : generatedReport.rows[0] && Object.keys(generatedReport.rows[0]).includes("party") ? (
// //                                                     <>
// //                                                         <th>Date</th>
// //                                                         <th>Party</th>
// //                                                         <th>Invoice</th>
// //                                                         <th>Amount</th>
// //                                                         <th>Status</th>
// //                                                     </>
// //                                                 ) : (
// //                                                     <>
// //                                                         <th>Date</th>
// //                                                         <th>Employee</th>
// //                                                         <th>Payment</th>
// //                                                         <th>Status</th>
// //                                                     </>
// //                                                 )}
// //                                             </tr>
// //                                         </thead>
// //                                         <tbody>
// //                                             {generatedReport.rows.map((row, index) => (
// //                                                 <tr key={`${row.date || row.invoice || index}-${index}`}>
// //                                                     {row.date && <td>{row.date}</td>}
// //                                                     {row.assignment && <td>{row.assignment}</td>}
// //                                                     {row.employee && <td>{row.employee}</td>}
// //                                                     {row.party && <td>{row.party}</td>}
// //                                                     {(row.invoice || row.payment || row.amount) && (
// //                                                         <td>{row.invoice || row.payment || row.amount}</td>
// //                                                     )}
// //                                                     {row.amount && row.invoice && <td>{row.amount}</td>}
// //                                                     {row.status && <td>{row.status}</td>}
// //                                                 </tr>
// //                                             ))}
// //                                         </tbody>
// //                                     </table>
// //                                 </div>
// //                             </div>
// //                         )}
// //                     </div>
// //                 )}
// //             </div>
// //         </div>
// //     );
// // }

// // export default ReportsOverview;


// import { useState } from "react";
// import "../CSS/ReportsOverview.css";

// const reportItems = [
//     {
//         id: "employee-payment",
//         title: "Employee Payment Statements",
//         fields: [
//             {
//                 name: "employeeName",
//                 label: "Employee Name",
//                 type: "text",
//                 required: true,
//             },
//             {
//                 name: "fromDate",
//                 label: "From Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "toDate",
//                 label: "To Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "status",
//                 label: "Payment Status",
//                 type: "select",
//                 options: ["All", "Paid", "Pending"],
//                 required: true,
//             },
//         ],
//     },
//     {
//         id: "all-employee-payment",
//         title: "All Employee Payment Statements",
//         fields: [
//             {
//                 name: "fromDate",
//                 label: "From Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "toDate",
//                 label: "To Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "status",
//                 label: "Payment Status",
//                 type: "select",
//                 options: ["All", "Paid", "Pending"],
//                 required: true,
//             },
//         ],
//     },
//     {
//         id: "caterers-payment",
//         title: "Caterers Payment Statements",
//         fields: [
//             {
//                 name: "catererName",
//                 label: "Caterer Name",
//                 type: "text",
//                 required: true,
//             },
//             {
//                 name: "fromDate",
//                 label: "From Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "toDate",
//                 label: "To Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "status",
//                 label: "Payment Status",
//                 type: "select",
//                 options: ["All", "Paid", "Pending"],
//                 required: true,
//             },
//         ],
//     },
//     {
//         id: "all-caterers-payment",
//         title: "All Caterers Payment Statements",
//         fields: [
//             {
//                 name: "fromDate",
//                 label: "From Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "toDate",
//                 label: "To Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "status",
//                 label: "Payment Status",
//                 type: "select",
//                 options: ["All", "Paid", "Pending"],
//                 required: true,
//             },
//         ],
//     },
//     {
//         id: "vendor-payment",
//         title: "Vendor Payment Statements",
//         fields: [
//             {
//                 name: "vendorName",
//                 label: "Vendor Name",
//                 type: "text",
//                 required: true,
//             },
//             {
//                 name: "fromDate",
//                 label: "From Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "toDate",
//                 label: "To Date",
//                 type: "date",
//                 required: true,
//             },
//         ],
//     },
//     {
//         id: "all-vendor-payment",
//         title: "All Vendor Payment Statements",
//         fields: [
//             {
//                 name: "fromDate",
//                 label: "From Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "toDate",
//                 label: "To Date",
//                 type: "date",
//                 required: true,
//             },
//             {
//                 name: "status",
//                 label: "Payment Status",
//                 type: "select",
//                 options: ["All", "Paid", "Pending"],
//                 required: true,
//             },
//         ],
//     },
// ];

// // Sample rows for UI demonstration only.
// // Replace this function with your actual API calls to retrieve database records.
// const buildReportRows = (report, formData) => {
//     const status = formData.status || "Paid";

//     if (
//         report.id === "employee-payment" ||
//         report.id === "all-employee-payment"
//     ) {
//         return [
//             {
//                 date: "10 Oct 2026",
//                 party: formData.employeeName || "Employee A",
//                 payment: "₹ 8,500",
//                 status,
//             },
//             {
//                 date: "12 Oct 2026",
//                 party: formData.employeeName || "Employee B",
//                 payment: "₹ 7,800",
//                 status,
//             },
//             {
//                 date: "18 Oct 2026",
//                 party: formData.employeeName || "Employee C",
//                 payment: "₹ 9,200",
//                 status,
//             },
//         ];
//     }

//     if (
//         report.id === "caterers-payment" ||
//         report.id === "all-caterers-payment"
//     ) {
//         return [
//             {
//                 date: "01 Oct 2026",
//                 party: formData.catererName || "Caterer A",
//                 invoice: "INV-1042",
//                 amount: "₹ 22,000",
//                 status,
//             },
//             {
//                 date: "08 Oct 2026",
//                 party: formData.catererName || "Caterer B",
//                 invoice: "INV-1080",
//                 amount: "₹ 18,500",
//                 status,
//             },
//             {
//                 date: "15 Oct 2026",
//                 party: formData.catererName || "Caterer C",
//                 invoice: "INV-1119",
//                 amount: "₹ 25,200",
//                 status,
//             },
//         ];
//     }

//     if (
//         report.id === "vendor-payment" ||
//         report.id === "all-vendor-payment"
//     ) {
//         return [
//             {
//                 date: "05 Oct 2026",
//                 party: formData.vendorName || "Vendor A",
//                 payment: "₹ 12,500",
//                 status,
//             },
//             {
//                 date: "12 Oct 2026",
//                 party: formData.vendorName || "Vendor B",
//                 payment: "₹ 15,000",
//                 status,
//             },
//             {
//                 date: "18 Oct 2026",
//                 party: formData.vendorName || "Vendor C",
//                 payment: "₹ 9,500",
//                 status,
//             },
//         ];
//     }

//     return [];
// };

// function ReportsOverview() {
//     const [selectedReport, setSelectedReport] = useState(null);
//     const [formData, setFormData] = useState({});
//     const [generatedReport, setGeneratedReport] = useState(null);

//     const activeReport =
//         reportItems.find((item) => item.id === selectedReport) || null;

//     const handleSelectReport = (reportId) => {
//         setSelectedReport(reportId);
//         setFormData({});
//         setGeneratedReport(null);
//     };

//     const handleInputChange = (event) => {
//         const { name, value } = event.target;

//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleGenerateReport = (event) => {
//         event.preventDefault();

//         if (!activeReport) return;

//         if (
//             formData.fromDate &&
//             formData.toDate &&
//             formData.fromDate > formData.toDate
//         ) {
//             alert("To Date must be greater than or equal to From Date.");
//             return;
//         }

//         const missingField = activeReport.fields.find(
//             (field) =>
//                 field.required &&
//                 !String(formData[field.name] || "").trim()
//         );

//         if (missingField) {
//             alert(
//                 `Please fill the ${missingField.label} field before generating the report.`
//             );
//             return;
//         }

//         const rows = buildReportRows(activeReport, formData);

//         const summary = [
//             {
//                 title: "Report Name",
//                 value: activeReport.title,
//             },
//             {
//                 title: "Date Range",
//                 value: `${formData.fromDate || "--"} to ${
//                     formData.toDate || "--"
//                 }`,
//             },
//             {
//                 title: "Selected Status",
//                 value: formData.status || "All",
//             },
//         ];

//         setGeneratedReport({
//             title: activeReport.title,
//             summary,
//             rows,
//         });
//     };

//     const handleBack = () => {
//         setSelectedReport(null);
//         setGeneratedReport(null);
//         setFormData({});
//     };

//     const handleDownloadPdf = () => {
//         window.print();
//     };

//     const isAllReport =
//         activeReport &&
//         activeReport.id.startsWith("all-");

//     return (
//         <div className="reports-overview-page">
//             <div className="reports-overview-panel">
//                 {!selectedReport ? (
//                     <>
//                         <div className="reports-overview-header">
//                             <span className="reports-overview-title-icon">
//                                 ☰
//                             </span>

//                             <div>
//                                 <h1>Application Reports</h1>
//                                 <p>
//                                     Select a report to view payment details.
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="reports-overview-grid">
//                             {reportItems.map((item, index) => (
//                                 <button
//                                     key={item.id}
//                                     type="button"
//                                     className="reports-overview-card"
//                                     onClick={() =>
//                                         handleSelectReport(item.id)
//                                     }
//                                 >
//                                     <span className="reports-overview-card-icon">
                                        
//                                     </span>

//                                     <span className="reports-overview-card-title">
//                                         {item.title}
//                                     </span>

//                                     <span className="reports-overview-card-arrow">
//                                         →
//                                     </span>
//                                 </button>
//                             ))}
//                         </div>
//                     </>
//                 ) : (
//                     <div className="report-builder">
//                         <div className="report-builder-header">
//                             <button
//                                 type="button"
//                                 className="report-back-button"
//                                 onClick={handleBack}
//                             >
//                                 ← Back to Reports
//                             </button>

//                             <h2>{activeReport?.title}</h2>

//                             <p>
//                                 Enter the details below to generate your
//                                 payment report.
//                             </p>
//                         </div>

//                         <form
//                             className="report-form"
//                             onSubmit={handleGenerateReport}
//                         >
//                             <div className="report-form-grid">
//                                 {activeReport.fields.map((field) => (
//                                     <label
//                                         key={field.name}
//                                         className="report-form-field"
//                                     >
//                                         <span>{field.label}</span>

//                                         {field.type === "select" ? (
//                                             <select
//                                                 name={field.name}
//                                                 value={
//                                                     formData[field.name] || ""
//                                                 }
//                                                 onChange={handleInputChange}
//                                                 required={field.required}
//                                             >
//                                                 <option value="">
//                                                     Select {field.label}
//                                                 </option>

//                                                 {field.options.map(
//                                                     (option) => (
//                                                         <option
//                                                             key={option}
//                                                             value={option}
//                                                         >
//                                                             {option}
//                                                         </option>
//                                                     )
//                                                 )}
//                                             </select>
//                                         ) : (
//                                             <input
//                                                 type={field.type}
//                                                 name={field.name}
//                                                 value={
//                                                     formData[field.name] || ""
//                                                 }
//                                                 onChange={handleInputChange}
//                                                 required={field.required}
//                                                 max={
//                                                     field.name === "fromDate"
//                                                         ? formData.toDate ||
//                                                           undefined
//                                                         : undefined
//                                                 }
//                                                 min={
//                                                     field.name === "toDate"
//                                                         ? formData.fromDate ||
//                                                           undefined
//                                                         : undefined
//                                                 }
//                                             />
//                                         )}
//                                     </label>
//                                 ))}
//                             </div>

//                             <div className="report-form-actions">
//                                 <button
//                                     type="submit"
//                                     className="primary-button"
//                                 >
//                                     Generate Report
//                                 </button>

//                                 <button
//                                     type="button"
//                                     className="report-reset-button"
//                                     onClick={() => {
//                                         setFormData({});
//                                         setGeneratedReport(null);
//                                     }}
//                                 >
//                                     Reset
//                                 </button>
//                             </div>
//                         </form>

//                         {generatedReport && (
//                             <div className="report-output-card">
//                                 <div className="report-output-header">
//                                     <div>
//                                         <p className="report-output-label">
//                                             Generated Report
//                                         </p>

//                                         <h3>{generatedReport.title}</h3>
//                                     </div>

//                                     <button
//                                         type="button"
//                                         className="download-button"
//                                         onClick={handleDownloadPdf}
//                                     >
//                                         Download / Print PDF
//                                     </button>
//                                 </div>

//                                 <div className="report-summary-grid">
//                                     {generatedReport.summary.map((item) => (
//                                         <div
//                                             key={item.title}
//                                             className="summary-box"
//                                         >
//                                             <span>{item.title}</span>
//                                             <strong>{item.value}</strong>
//                                         </div>
//                                     ))}
//                                 </div>

//                                 <div className="report-table-wrap">
//                                     <table className="report-output-table">
//                                         <thead>
//                                             <tr>
//                                                 <th>Sr. No.</th>
//                                                 <th>Date</th>
//                                                 <th>
//                                                     {activeReport.id.includes(
//                                                         "employee"
//                                                     )
//                                                         ? "Employee"
//                                                         : activeReport.id.includes(
//                                                               "caterers"
//                                                           )
//                                                         ? "Caterer"
//                                                         : "Vendor"}
//                                                 </th>

//                                                 {activeReport.id.includes(
//                                                     "caterers"
//                                                 ) && <th>Invoice</th>}

//                                                 <th>Payment Amount</th>
//                                                 <th>Status</th>
//                                             </tr>
//                                         </thead>

//                                         <tbody>
//                                             {generatedReport.rows.length > 0 ? (
//                                                 generatedReport.rows.map(
//                                                     (row, index) => (
//                                                         <tr
//                                                             key={`${row.date}-${index}`}
//                                                         >
//                                                             <td>{index + 1}</td>
//                                                             <td>{row.date}</td>
//                                                             <td>{row.party}</td>

//                                                             {activeReport.id.includes(
//                                                                 "caterers"
//                                                             ) && (
//                                                                 <td>
//                                                                     {row.invoice}
//                                                                 </td>
//                                                             )}

//                                                             <td>
//                                                                 {row.payment ||
//                                                                     row.amount}
//                                                             </td>

//                                                             <td>
//                                                                 <span
//                                                                     className={`report-status ${
//                                                                         row.status
//                                                                             ?.toLowerCase() ||
//                                                                         ""
//                                                                     }`}
//                                                                 >
//                                                                     {row.status}
//                                                                 </span>
//                                                             </td>
//                                                         </tr>
//                                                     )
//                                                 )
//                                             ) : (
//                                                 <tr>
//                                                     <td
//                                                         colSpan={
//                                                             activeReport.id.includes(
//                                                                 "caterers"
//                                                             )
//                                                                 ? 6
//                                                                 : 5
//                                                         }
//                                                     >
//                                                         No records found.
//                                                     </td>
//                                                 </tr>
//                                             )}
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <p className="report-demo-note">
//                                     {isAllReport
//                                         ? "Showing all-records report preview."
//                                         : "Showing individual-record report preview."}
//                                     {" "}
//                                     Connect your payment API to display actual
//                                     database records.
//                                 </p>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default ReportsOverview;

import { useEffect, useState } from "react";
import "../CSS/ReportsOverview.css";

import { getEmployees } from "../api/employeeApi";
import {
    getReportEmployee,
    getAllReportEmployee,
} from "../api/dailyEmployeePaymentApi";

const reportItems = [
    {
        id: "employee-payment",
        title: "Employee Payment Statements",
        description: "View payment details for one employee.",
    },
    {
        id: "all-employee-payment",
        title: "All Employee Payment Statements",
        description: "View payment details for all employees.",
    },
];

const getEmployeeId = (employee) =>
    employee?.employeeId ??
    employee?.EmployeeId ??
    employee?.employeeID ??
    employee?.id;

const getEmployeeName = (employee) =>
      employee?.fullName ?? employee?.FullName ?? "";
    

const getResponseRows = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.data?.$values)) return data.data.$values;
    return data ? [data] : [];
};

const getField = (row, ...names) => {
    for (const name of names) {
        if (row?.[name] !== undefined && row?.[name] !== null) {
            return row[name];
        }
    }
    return "";
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

const formatDate = (value) => {
    if (!value) return "--";

    const parts = String(value).slice(0, 10).split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return value;
};

const getErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    "Unable to generate the report. Please try again.";

function ReportsOverview() {
    const [selectedReport, setSelectedReport] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: "",
        fromDate: "",
        toDate: "",
        status: "All",
    });

    const [generatedReport, setGeneratedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const activeReport =
        reportItems.find((item) => item.id === selectedReport) || null;

    const isAllReport = selectedReport === "all-employee-payment";

    useEffect(() => {
        if (selectedReport !== "employee-payment") return;

        let cancelled = false;

        const loadEmployees = async () => {
            setEmployeesLoading(true);
            setError("");

            try {
                const response = await getEmployees(1, 2000);
                const rows = getResponseRows(response?.data ?? response);

                const validEmployees = rows.filter(
                    (employee) =>
                        getEmployeeId(employee) !== undefined &&
                        getEmployeeId(employee) !== null
                );

                if (!cancelled) setEmployees(validEmployees);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        `${getErrorMessage(err)} Please check the employee list API.`
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
    }, [selectedReport]);

    const handleSelectReport = (reportId) => {
        setSelectedReport(reportId);
        setFormData({
            employeeId: "",
            fromDate: "",
            toDate: "",
            status: "All",
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

        if (!isAllReport && !formData.employeeId) {
            setError("Please select an employee.");
            return;
        }

        const status = formData.status === "All" ? "" : formData.status;

        setLoading(true);

        try {
            let response;

            if (selectedReport === "employee-payment") {
                response = await getReportEmployee(
                    Number(formData.employeeId),
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else if (selectedReport === "all-employee-payment") {
                response = await getAllReportEmployee(
                    formData.fromDate,
                    formData.toDate,
                    status
                );
            } else {
                setError("Please select a valid report.");
                return;
            }

            const rows = getResponseRows(response?.data ?? response);

            setGeneratedReport({
                title: activeReport.title,
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                status: status || "All",
                rows,
            });

            if (rows.length === 0) {
                setError("No payment records were found for the selected filters.");
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            employeeId: "",
            fromDate: "",
            toDate: "",
            status: "All",
        });
        setGeneratedReport(null);
        setError("");
    };

    const handleBack = () => {
        setSelectedReport(null);
        setGeneratedReport(null);
        setError("");
        handleReset();
    };

    const handlePrint = () => {
        window.print();
    };

    const selectedEmployee = employees.find(
        (employee) =>
            String(getEmployeeId(employee)) === String(formData.employeeId)
    );

    return (
        <div className="reports-overview-page">
            <div className="reports-overview-panel">
                {!selectedReport ? (
                    <>
                        <div className="reports-overview-header">
                            <span className="reports-overview-title-icon">₹</span>
                            <div>
                                <h1>Employee Payment Reports</h1>
                                <p>
                                    Select a report to view employee payment details.
                                </p>
                            </div>
                        </div>

                        <div className="reports-overview-grid">
                            {reportItems.map((report) => (
                                <button
                                    key={report.id}
                                    type="button"
                                    className="reports-overview-card"
                                    onClick={() => handleSelectReport(report.id)}
                                >
                                    <span className="reports-overview-card-icon">₹</span>
                                    <span className="reports-overview-card-title">
                                        {report.title}
                                    </span>
                                    <span className="reports-overview-card-description">
                                        {report.description}
                                    </span>
                                    <span className="reports-overview-card-arrow">→</span>
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
                            <p>Select the required filters and generate your report.</p>
                        </div>

                        {/* Filters are visible on screen, but hidden in the PDF */}
                        <form
                            className="report-form no-print"
                            onSubmit={handleGenerateReport}
                        >
                            <div className="report-form-grid">
                                {!isAllReport && (
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

                                            {employees.map((employee) => (
                                                <option
                                                    key={getEmployeeId(employee)}
                                                    value={getEmployeeId(employee)}
                                                >
                                                    {getEmployeeName(employee) ||
                                                        `Employee ${getEmployeeId(employee)}`}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                <label className="report-form-field">
                                    <span>From Date</span>
                                    <input
                                        type="date"
                                        name="fromDate"
                                        value={formData.fromDate}
                                        onChange={handleInputChange}
                                        max={formData.toDate || undefined}
                                        required
                                    />
                                </label>

                                <label className="report-form-field">
                                    <span>To Date</span>
                                    <input
                                        type="date"
                                        name="toDate"
                                        value={formData.toDate}
                                        onChange={handleInputChange}
                                        min={formData.fromDate || undefined}
                                        required
                                    />
                                </label>

                                <label className="report-form-field">
                                    <span>Payment Status</span>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="All">All</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </label>
                            </div>

                            {error && (
                                <div className="report-error" role="alert">
                                    {error}
                                </div>
                            )}

                            <div className="report-form-actions">
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={loading || employeesLoading}
                                >
                                    {loading ? "Generating..." : "Generate Report"}
                                </button>

                                <button
                                    type="button"
                                    className="report-reset-button"
                                    onClick={handleReset}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>

                        {generatedReport && (
                            <section className="report-output-card">
                                <div className="report-company-header">
                                    <h1>BP Enterprises</h1>
                                    <p>
                                        Address: Godhale Nagar, Near Gadital,
                                        Hadapsar, Pune - 412300
                                    </p>
                                    <p>GSTIN: 789ABDYDH457KO45621</p>
                                    <p>Mobile: 456125464545, 789456125</p>
                                </div>

                                <div className="report-output-heading">
                                    <h2>{generatedReport.title}</h2>
                                    <p>
                                        Period: {formatDate(generatedReport.fromDate)}
                                        {" - "}
                                        {formatDate(generatedReport.toDate)}
                                    </p>
                                    <p>Payment Status: {generatedReport.status}</p>

                                    {!isAllReport && (
                                        <p>
                                            Employee:{" "}
                                            {getEmployeeName(selectedEmployee) ||
                                                `Employee ${formData.employeeId}`}
                                        </p>
                                    )}
                                </div>

                                {generatedReport.rows.length > 0 && (
                                    <div className="report-table-wrapper">
                                        <table className="report-results-table">
                                            <thead>
                                                <tr>
                                                    <th>Sr. No.</th>
                                                    <th>Employee ID</th>
                                                    <th>Employee Name</th>
                                                    <th>Member Type</th>
                                                    <th>Half Day</th>
                                                    <th>Full Day</th>
                                                    <th>Two Half Day</th>
                                                    <th>Opening Pending</th>
                                                    <th>Gross Amount</th>
                                                    <th>Advance Deducted</th>
                                                    <th>Total Payable</th>
                                                    <th>Amount Paid</th>
                                                    <th>Closing Pending</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {generatedReport.rows.map((row, index) => (
                                                    <tr
                                                        key={`${getField(row, "EmployeeId", "employeeId")}-${index}`}
                                                    >
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            {getField(row, "EmployeeId", "employeeId") || "--"}
                                                        </td>
                                                        <td>
                                                            {getField(row, "EmployeeName", "employeeName") || "--"}
                                                        </td>
                                                        <td>
                                                            {getField(row, "MemberType", "memberType") || "--"}
                                                        </td>
                                                        <td>
                                                            {getField(row, "HalfDayShiftCount", "halfDayShiftCount") || 0}
                                                        </td>
                                                        <td>
                                                            {getField(row, "FullDayShiftCount", "fullDayShiftCount") || 0}
                                                        </td>
                                                        <td>
                                                            {getField(row, "TwoHalfDayCount", "twoHalfDayCount") || 0}
                                                        </td>
                                                        <td>
                                                            {formatAmount(getField(row, "OpeningPendingAmount", "openingPendingAmount"))}
                                                        </td>
                                                        <td>
                                                            {formatAmount(getField(row, "GrossAmount", "grossAmount"))}
                                                        </td>
                                                        <td>
                                                            {formatAmount(getField(row, "AdvanceDeducted", "advanceDeducted"))}
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
                                                            {formatAmount(getField(row, "AmountPaid", "amountPaid"))}
                                                        </td>
                                                        <td>
                                                            {formatAmount(getField(row, "ClosingPendingAmount", "closingPendingAmount"))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportsOverview;
