// import React, { useEffect, useState, useCallback } from "react";
// import { useNavigate } from "react-router-dom";

// import { getEmployees } from "../api/employeeApi";
// import { getVendors } from "../api/vendorApi";
// import { getHotels } from "../api/hotelApi";

// import {
//     getAssignmentsByDate,
//     getVendorsByDate,
// } from "../api/dailyHotelAssignmentApi";

// import {
//     getSupplierAssignmentsByDate,
// } from "../api/dailySupplierAssignmentToVendorApi";

// import "../CSS/dashboard.css";

// // Existing application routes
// const DASHBOARD_ROUTES = {
//     employees: "/employees",
//     vendors: "/vendors",
//     caters: "/hotels",
//     master: "/master-allocations",
//     assignments: "/assignments",
// };

// // Get local date in YYYY-MM-DD format
// const getTodayDate = () => {
//     const today = new Date();

//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, "0");
//     const day = String(today.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
// };

// // Extract array from API response
// const extractList = (response) => {
//     let result = response?.data ?? response;

//     if (Array.isArray(result)) return result;

//     if (result && typeof result === "object") {
//         result =
//             result.items ??
//             result.Items ??
//             result.data ??
//             result.Data ??
//             result.employees ??
//             result.Employees ??
//             result.vendors ??
//             result.Vendors ??
//             result.hotels ??
//             result.Hotels ??
//             result.result ??
//             result.Result ??
//             result.$values ??
//             result;

//         if (Array.isArray(result)) return result;

//         if (Array.isArray(result?.$values)) return result.$values;
//     }

//     return [];
// };

// // Check active master record
// const isActive = (item) => {
//     const value =
//         item?.isActive ??
//         item?.IsActive ??
//         item?.active ??
//         item?.Active;

//     // If API does not return IsActive, don't exclude the record.
//     if (value === undefined || value === null) return true;

//     return (
//         value === true ||
//         value === 1 ||
//         String(value).toLowerCase() === "true"
//     );
// };

// // Check cancelled assignment
// const isCancelled = (item) => {
//     const value =
//         item?.isCancelled ??
//         item?.IsCancelled ??
//         item?.cancelled ??
//         item?.Cancelled ??
//         item?.isCanceled ??
//         item?.IsCanceled;

//     return (
//         value === true ||
//         value === 1 ||
//         String(value).toLowerCase() === "true"
//     );
// };

// // Normalize InHouse / Local member type
// const normalizeMemberType = (value) => {
//     const normalized = String(value ?? "")
//         .trim()
//         .toLowerCase()
//         .replace(/[^a-z]/g, "");

//     if (normalized.includes("local")) return "local";

//     if (
//         normalized.includes("inhouse") ||
//         normalized.includes("house")
//     ) {
//         return "inhouse";
//     }

//     return normalized;
// };

// const getMemberType = (record) => {
//     return normalizeMemberType(
//         record?.memberType ??
//         record?.MemberType ??
//         record?.membertype ??
//         record?.type ??
//         record?.Type
//     );
// };

// // Read employee quantity from vendor/supplier assignment
// const getAssignmentQuantity = (item) => {
//     const candidates = [
//         item?.emp_Quantity,
//         item?.Emp_Quantity,
//         item?.employeeCount,
//         item?.EmployeeCount,
//         item?.employeeQuantity,
//         item?.EmployeeQuantity,
//         item?.quantity,
//         item?.Quantity,
//     ];

//     for (const candidate of candidates) {
//         if (candidate === undefined || candidate === null || candidate === "") {
//             continue;
//         }

//         const parsed = Number(candidate);

//         if (Number.isFinite(parsed) && parsed >= 0) {
//             return parsed;
//         }
//     }

//     return 0;
// };

// // Count today's active assignment records
// const countEmployeeAssignments = (items, memberType) => {
//     return items.filter((record) => {
//         return (
//             !isCancelled(record) &&
//             getMemberType(record) === memberType
//         );
//     }).length;
// };

// // Sum employee quantities for vendor/supplier assignments
// const sumAssignmentQuantity = (items) => {
//     return items.reduce((total, record) => {
//         if (isCancelled(record)) return total;

//         return total + getAssignmentQuantity(record);
//     }, 0);
// };

// function Dashboard() {
//     const navigate = useNavigate();

//     const [dashboardData, setDashboardData] = useState({
//         activeEmployees: 0,
//         activeVendors: 0,
//         activeCaterers: 0,

//         todayAssignedEmployees: 0,
//         todayInHouseEmployees: 0,
//         todayLocalEmployees: 0,
//         todayVendorEmployees: 0,
//         todaySupplierEmployees: 0,
//     });

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     // Load all dashboard data
//     const loadDashboardData = useCallback(async () => {
//         setLoading(true);
//         setError("");

//         try {
//             const today = getTodayDate();

//             // Load master data and today's assignment data
//             const results = await Promise.allSettled([
//                 getEmployees(1, 2000),
//                 getVendors(1, 2000),
//                 getHotels(1, 2000),

//                 getAssignmentsByDate(today),
//                 getVendorsByDate(today),
//                 getSupplierAssignmentsByDate(today),
//             ]);

//             const [
//                 employeeResult,
//                 vendorResult,
//                 catererResult,

//                 employeeAssignmentResult,
//                 vendorAssignmentResult,
//                 supplierAssignmentResult,
//             ] = results;

//             // -----------------------------------------
//             // 1. MASTER COUNTS
//             // -----------------------------------------

//             const employees =
//                 employeeResult.status === "fulfilled"
//                     ? extractList(employeeResult.value)
//                     : [];

//             const vendors =
//                 vendorResult.status === "fulfilled"
//                     ? extractList(vendorResult.value)
//                     : [];

//             const caterers =
//                 catererResult.status === "fulfilled"
//                     ? extractList(catererResult.value)
//                     : [];

//             const activeEmployees = employees.filter(isActive).length;

//             const activeVendors = vendors.filter(isActive).length;

//             const activeCaterers = caterers.filter(isActive).length;

//             // -----------------------------------------
//             // 2. TODAY'S ASSIGNMENT DATA
//             // -----------------------------------------

//             const employeeAssignments =
//                 employeeAssignmentResult.status === "fulfilled"
//                     ? extractList(employeeAssignmentResult.value)
//                     : [];

//             const vendorAssignments =
//                 vendorAssignmentResult.status === "fulfilled"
//                     ? extractList(vendorAssignmentResult.value)
//                     : [];

//             const supplierAssignments =
//                 supplierAssignmentResult.status === "fulfilled"
//                     ? extractList(supplierAssignmentResult.value)
//                     : [];

//             // In-House employee count
//             const todayInHouseEmployees = countEmployeeAssignments(
//                 employeeAssignments,
//                 "inhouse"
//             );

//             // Local employee count
//             const todayLocalEmployees = countEmployeeAssignments(
//                 employeeAssignments,
//                 "local"
//             );

//             // Vendor employee count (sum Emp_Quantity)
//             const todayVendorEmployees = sumAssignmentQuantity(
//                 vendorAssignments
//             );

//             // Supplier employee count (sum Emp_Quantity)
//             const todaySupplierEmployees = sumAssignmentQuantity(
//                 supplierAssignments
//             );

//             // Total employees assigned today
//             const todayAssignedEmployees =
//                 todayInHouseEmployees +
//                 todayLocalEmployees +
//                 todayVendorEmployees +
//                 todaySupplierEmployees;

//             // -----------------------------------------
//             // 3. UPDATE DASHBOARD
//             // -----------------------------------------

//             setDashboardData({
//                 activeEmployees,
//                 activeVendors,
//                 activeCaterers,

//                 todayAssignedEmployees,
//                 todayInHouseEmployees,
//                 todayLocalEmployees,
//                 todayVendorEmployees,
//                 todaySupplierEmployees,
//             });

//             // Log individual API failures
//             results.forEach((result, index) => {
//                 if (result.status === "rejected") {
//                     console.error(
//                         `Dashboard API ${index + 1} failed:`,
//                         result.reason
//                     );
//                 }
//             });

//             if (results.every((result) => result.status === "rejected")) {
//                 setError(
//                     "Unable to load dashboard data. Please try again."
//                 );
//             }
//         } catch (err) {
//             console.error("Dashboard loading error:", err);

//             setError(
//                 err?.response?.data?.message ||
//                 err?.message ||
//                 "Unable to load dashboard data."
//             );
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         loadDashboardData();
//     }, [loadDashboardData]);

//     // Navigation
//     const handleNavigation = (path) => {
//         navigate(path);
//     };

//     // -----------------------------------------
//     // DASHBOARD SUMMARY CARDS - 8 CARDS
//     // -----------------------------------------

//     const summaryCards = [
//         // MASTER COUNTS
//         {
//             title: "Active Employees",
//             value: dashboardData.activeEmployees,
//             icon: "👥",
//             color: "employees",
//             description: "Total active employee records",
//         },
//         {
//             title: "Active Vendors",
//             value: dashboardData.activeVendors,
//             icon: "🚚",
//             color: "vendors",
//             description: "Total active vendor records",
//         },
//         {
//             title: "Active Caterers",
//             value: dashboardData.activeCaterers,
//             icon: "🏨",
//             color: "hotels",
//             description: "Total active caterer records",
//         },

//         // TODAY'S ASSIGNMENT COUNTS
//         {
//             title: "Today's Assigned Employees",
//             value: dashboardData.todayAssignedEmployees,
//             icon: "📋",
//             color: "assignments",
//             description: "Total employees allocated today",
//         },
//         {
//             title: "In-House Employees",
//             value: dashboardData.todayInHouseEmployees,
//             icon: "🏠",
//             color: "inhouse",
//             description: "Today's in-house allocation",
//         },
//         {
//             title: "Local Employees",
//             value: dashboardData.todayLocalEmployees,
//             icon: "📍",
//             color: "local",
//             description: "Today's local allocation",
//         },
//         {
//             title: "Vendor Employees",
//             value: dashboardData.todayVendorEmployees,
//             icon: "🚛",
//             color: "vendor-allocation",
//             description: "Employees allocated through vendors",
//         },
//         {
//             title: "Supplier Employees",
//             value: dashboardData.todaySupplierEmployees,
//             icon: "📦",
//             color: "supplier-allocation",
//             description: "Employees allocated through suppliers",
//         },
//     ];

//     // Quick action navigation
//     const quickActions = [
//         {
//             title: "Add Employee",
//             description: "Register a new employee",
//             icon: "👤",
//             color: "action-blue",
//             path: DASHBOARD_ROUTES.employees,
//         },
//         {
//             title: "Add Vendor",
//             description: "Register a new vendor",
//             icon: "🚚",
//             color: "action-purple",
//             path: DASHBOARD_ROUTES.vendors,
//         },
//         {
//             title: "Add Caterer",
//             description: "Manage hotels and caterers",
//             icon: "🏨",
//             color: "action-green",
//             path: DASHBOARD_ROUTES.caters,
//         },
//         {
//             title: "Create Assignment",
//             description: "Assign employees to hotels",
//             icon: "📝",
//             color: "action-orange",
//             path: DASHBOARD_ROUTES.assignments,
//         },
//         {
//             title: "Master Allocation",
//             description: "View daily master allocations",
//             icon: "📊",
//             color: "action-cyan",
//             path: DASHBOARD_ROUTES.master,
//         },
//     ];

//     return (
//         <div className="dashboard">

//             {/* Company Header */}
//             <div className="dashboard-header">

//                 <div className="dashboard-heading">

//                     <h2>WELCOME TO</h2>

//                     <h1>
//                         <span>BALAJI ENTERPRISES</span>
//                     </h1>

//                     <div className="dashboard-title-divider">
//                         <span></span>
//                         <i>✦</i>
//                         <span></span>
//                     </div>

//                     <h2>CATERING MANAGEMENT SYSTEM</h2>

//                     <p className="dashboard-subtitle">
//                         Smart Management • Seamless Operations • Better Services
//                     </p>

//                 </div>

//             </div>

//             {/* Error Message */}
//             {error && (
//                 <div className="dashboard-error">
//                     <span>⚠</span>

//                     <span>{error}</span>

//                     <button onClick={loadDashboardData}>
//                         Retry
//                     </button>
//                 </div>
//             )}

//             {/* Business Overview */}
//             <div className="dashboard-section-heading">

//                 <div>
//                     <h2>Business Overview</h2>
//                     <p>Current summary of your business operations</p>
//                 </div>

//                 <span className="dashboard-live-status">
//                     <span className="live-dot"></span>
//                     Live Overview
//                 </span>

//             </div>

//             {/* Dashboard Summary Cards */}
//             <div className="dashboard-cards">

//                 {summaryCards.map((card) => (
//                     <div
//                         className={`dashboard-card ${card.color}`}
//                         key={card.title}
//                     >

//                         <div className="dashboard-card-top">

//                             <div className="dashboard-card-icon">
//                                 {card.icon}
//                             </div>

//                             <span className="dashboard-card-menu">
//                                 •••
//                             </span>

//                         </div>

//                         <div className="dashboard-card-details">

//                             <h3>{card.title}</h3>

//                             <p className="dashboard-card-value">
//                                 {loading
//                                     ? "..."
//                                     : card.value.toLocaleString("en-IN")}
//                             </p>

//                             <span className="dashboard-card-description">
//                                 {card.description}
//                             </span>

//                         </div>

//                     </div>
//                 ))}

//             </div>

//             {/* Quick Actions */}
//             <div className="quick-actions">

//                 <div className="quick-actions-header">

//                     <div>
//                         <h2>Quick Actions</h2>
//                         <p>
//                             Quick access to frequently used modules
//                         </p>
//                     </div>

//                 </div>

//                 <div className="action-buttons">

//                     {quickActions.map((action) => (
//                         <button
//                             key={action.title}
//                             className={`action-card ${action.color}`}
//                             onClick={() =>
//                                 handleNavigation(action.path)
//                             }
//                         >

//                             <div className="action-card-icon">
//                                 {action.icon}
//                             </div>

//                             <div className="action-card-content">
//                                 <h3>{action.title}</h3>
//                                 <p>{action.description}</p>
//                             </div>

//                             <span className="action-arrow">
//                                 →
//                             </span>

//                         </button>
//                     ))}

//                 </div>

//             </div>

//         </div>
//     );
// }

// export default Dashboard;


import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEmployees } from "../api/employeeApi";
import { getVendors } from "../api/vendorApi";
import { getHotels } from "../api/hotelApi";

import {
    getAssignmentsByDate,
    getVendorsByDate,
} from "../api/dailyHotelAssignmentApi";

import {
    getSupplierAssignmentsByDate,
} from "../api/dailySupplierAssignmentToVendorApi";

import "../CSS/dashboard.css";

const DASHBOARD_ROUTES = {
    employees: "/employees",
    vendors: "/vendors",
    caters: "/hotels",
    assignments: "/assignments",
    master: "/master-allocations",
};

const getTodayDate = () => {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
};

const getDisplayDate = () => {
    return new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const extractList = (response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;

    const possibleLists = [
        data?.items,
        data?.Items,
        data?.data,
        data?.Data,
        data?.employees,
        data?.Employees,
        data?.vendors,
        data?.Vendors,
        data?.hotels,
        data?.Hotels,
        data?.assignments,
        data?.Assignments,
    ];

    return possibleLists.find(Array.isArray) ?? [];
};

const isActive = (item) => {
    const value =
        item?.isActive ??
        item?.IsActive ??
        item?.active ??
        item?.Active;

    // If the API does not return a status field, include the record.
    if (value === undefined || value === null) return true;

    return (
        value === true ||
        value === 1 ||
        String(value).toLowerCase() === "true"
    );
};

const isCancelled = (item) => {
    const value =
        item?.isCancelled ??
        item?.IsCancelled ??
        item?.cancelled ??
        item?.Cancelled;

    return (
        value === true ||
        value === 1 ||
        String(value).toLowerCase() === "true"
    );
};

const getMemberType = (record) => {
    const value =
        record?.memberType ??
        record?.MemberType ??
        record?.membertype ??
        record?.type ??
        record?.Type ??
        "";

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, "");
};

const getQuantity = (record) => {
    const value =
        record?.emp_Quantity ??
        record?.Emp_Quantity ??
        record?.employeeCount ??
        record?.EmployeeCount ??
        record?.employeeQuantity ??
        record?.EmployeeQuantity ??
        record?.quantity ??
        record?.Quantity;

    const quantity = Number(value);

    return Number.isFinite(quantity) && quantity >= 0
        ? quantity
        : 0;
};

function Dashboard() {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        activeEmployees: 0,
        activeVendors: 0,
        activeCaterers: 0,
        todayAssigned: 0,
        inHouse: 0,
        local: 0,
        vendorEmployees: 0,
        supplierEmployees: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const today = getTodayDate();

            const results = await Promise.allSettled([
                getEmployees(1, 2000),
                getVendors(1, 2000),
                getHotels(1, 2000),
                getAssignmentsByDate(today),
                getVendorsByDate(today),
                getSupplierAssignmentsByDate(today),
            ]);

            const [
                employeesResult,
                vendorsResult,
                hotelsResult,
                assignmentsResult,
                vendorAssignmentsResult,
                supplierAssignmentsResult,
            ] = results;

            const employees =
                employeesResult.status === "fulfilled"
                    ? extractList(employeesResult.value)
                    : [];

            const vendors =
                vendorsResult.status === "fulfilled"
                    ? extractList(vendorsResult.value)
                    : [];

            const hotels =
                hotelsResult.status === "fulfilled"
                    ? extractList(hotelsResult.value)
                    : [];

            const assignments =
                assignmentsResult.status === "fulfilled"
                    ? extractList(assignmentsResult.value)
                    : [];

            const vendorAssignments =
                vendorAssignmentsResult.status === "fulfilled"
                    ? extractList(vendorAssignmentsResult.value)
                    : [];

            const supplierAssignments =
                supplierAssignmentsResult.status === "fulfilled"
                    ? extractList(supplierAssignmentsResult.value)
                    : [];

            // Master counts
            const activeEmployees = employees.filter(isActive).length;
            const activeVendors = vendors.filter(isActive).length;
            const activeCaterers = hotels.filter(isActive).length;

            // Today's employee assignments
            const activeAssignments = assignments.filter(
                (item) => !isCancelled(item)
            );

            const inHouse = activeAssignments.filter((item) => {
                const type = getMemberType(item);
                return type === "inhouse" || type === "house";
            }).length;

            const local = activeAssignments.filter((item) => {
                return getMemberType(item) === "local";
            }).length;

            // Vendor employee quantity
            const activeVendorAssignments = vendorAssignments.filter(
                (item) => !isCancelled(item)
            );

            const vendorEmployees = activeVendorAssignments.reduce(
                (total, item) => total + getQuantity(item),
                0
            );

            // Supplier employee quantity
            const activeSupplierAssignments = supplierAssignments.filter(
                (item) => !isCancelled(item)
            );

            const supplierEmployees = activeSupplierAssignments.reduce(
                (total, item) => total + getQuantity(item),
                0
            );

            // Total today's allocation
            const todayAssigned =
                inHouse +
                local +
                vendorEmployees +
                supplierEmployees;

            setDashboardData({
                activeEmployees,
                activeVendors,
                activeCaterers,
                todayAssigned,
                inHouse,
                local,
                vendorEmployees,
                supplierEmployees,
            });

            const failedRequests = results.filter(
                (result) => result.status === "rejected"
            );

            if (failedRequests.length > 0) {
                console.error(
                    "Some dashboard API requests failed:",
                    failedRequests
                );

                if (failedRequests.length === results.length) {
                    setError(
                        "Unable to load dashboard information. Please try again."
                    );
                }
            }
        } catch (err) {
            console.error("Dashboard loading error:", err);
            setError("Unable to load dashboard information.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const summaryCards = [
        {
            title: "Active Employees",
            value: dashboardData.activeEmployees,
            description: "Total active employee records",
            icon: "👥",
            color: "blue",
        },
        {
            title: "Active Vendors",
            value: dashboardData.activeVendors,
            description: "Total active vendor records",
            icon: "🚚",
            color: "green",
        },
        {
            title: "Active Caterers",
            value: dashboardData.activeCaterers,
            description: "Total active caterer records",
            icon: "🍽️",
            color: "orange",
        },
        {
            title: "Today's Assigned Employees",
            value: dashboardData.todayAssigned,
            description: "Total employees allocated today",
            icon: "📋",
            color: "purple",
        },
        {
            title: "In-House Employees",
            value: dashboardData.inHouse,
            description: "Today's in-house allocation",
            icon: "🏠",
            color: "cyan",
        },
        {
            title: "Local Employees",
            value: dashboardData.local,
            description: "Today's local allocation",
            icon: "📍",
            color: "pink",
        },
        {
            title: "Vendor Employees",
            value: dashboardData.vendorEmployees,
            description: "Employees allocated through vendors",
            icon: "🚛",
            color: "lime",
        },
        {
            title: "Supplier Employees",
            value: dashboardData.supplierEmployees,
            description: "Employees allocated through suppliers",
            icon: "📦",
            color: "indigo",
        },
    ];

    const quickActions = [
        {
            title: "Add Employee",
            description: "Register a new employee",
            icon: "👤",
            color: "action-blue",
            path: DASHBOARD_ROUTES.employees,
        },
        {
            title: "Add Vendor",
            description: "Register a new vendor",
            icon: "🚚",
            color: "action-purple",
            path: DASHBOARD_ROUTES.vendors,
        },
        {
            title: "Add Caterer",
            description: "Manage hotels and caterers",
            icon: "🍽️",
            color: "action-green",
            path: DASHBOARD_ROUTES.caters,
        },
        {
            title: "Create Assignment",
            description: "Assign employees to hotels",
            icon: "📝",
            color: "action-orange",
            path: DASHBOARD_ROUTES.assignments,
        },
        {
            title: "Master Allocation",
            description: "View daily allocations",
            icon: "📊",
            color: "action-cyan",
            path: DASHBOARD_ROUTES.master,
        },
    ];

    return (
        <div className="dashboard">

            {/* Company Header */}
            <header className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-welcome">
                        <span className="welcome-label">
                            WELCOME TO
                        </span>

                        <h1>Balaji Enterprises</h1>

                        <div className="header-divider">
                            <span />
                            <i>✦</i>
                            <span />
                        </div>

                        <h2>Catering Management System</h2>

                        <p>
                            Smart Management • Seamless Operations • Better Services
                        </p>
                    </div>

                    <div className="dashboard-header-right">
                        <div className="dashboard-date">
                            <span>📅</span>
                            {getDisplayDate()}
                        </div>

                        <div className="dashboard-header-icon">
                            🍽️
                        </div>
                    </div>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <div className="dashboard-error">
                    <span>⚠️ {error}</span>

                    <button onClick={loadDashboardData}>
                        Retry
                    </button>
                </div>
            )}

            {/* Business Overview */}
            <section className="dashboard-overview">

                <div className="dashboard-section-heading">
                    <div className="section-title">
                        <span className="section-title-icon">📊</span>

                        <div>
                            <h2>Business Overview</h2>
                            <p>
                                Current summary of your business operations
                            </p>
                        </div>
                    </div>

                    <span className="dashboard-live-status">
                        <span className="live-dot" />
                        Live Overview
                    </span>
                </div>

                <div className="dashboard-cards">
                    {summaryCards.map((card) => (
                        <div
                            className={`dashboard-card card-${card.color}`}
                            key={card.title}
                        >
                            <div className="dashboard-card-icon">
                                {card.icon}
                            </div>

                            <div className="dashboard-card-details">
                                <h3>{card.title}</h3>

                                <p className="dashboard-card-value">
                                    {loading
                                        ? "..."
                                        : card.value.toLocaleString("en-IN")}
                                </p>

                                <span className="dashboard-card-description">
                                    {card.description}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions">

                <div className="quick-actions-header">
                    <div className="section-title">
                        <span className="section-title-icon">⚡</span>

                        <div>
                            <h2>Quick Actions</h2>
                            <p>
                                Quick access to frequently used modules
                            </p>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    {quickActions.map((action) => (
                        <button
                            type="button"
                            key={action.title}
                            className={`action-card ${action.color}`}
                            onClick={() => navigate(action.path)}
                        >
                            <div className="action-card-icon">
                                {action.icon}
                            </div>

                            <div className="action-card-content">
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </div>

                            <span className="action-arrow">
                                →
                            </span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
