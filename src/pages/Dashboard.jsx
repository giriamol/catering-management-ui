
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { getHotels } from "../api/hotelApi";
import { getVendors } from "../api/vendorApi";
import { getEmployees } from "../api/employeeApi";
import {
    getAssignmentsByDate,
    getVendorsByDate,
} from "../api/dailyHotelAssignmentApi";
import { getSupplierAssignmentsByDate } from "../api/dailySupplierAssignmentToVendorApi";

import "../CSS/dashboard.css";

// Existing application routes
const DASHBOARD_ROUTES = {
    employees: "/employees",
    vendors: "/vendors",
    caters: "/hotels",
    master: "/master-allocations",
    assignments: "/assignments",
};

// Get local date in YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Extract array from API response
const extractList = (response, possibleKeys = []) => {
    const result = response?.data ?? response;

    if (Array.isArray(result)) {
        return result;
    }

    if (result && typeof result === "object") {
        for (const key of possibleKeys) {
            if (Array.isArray(result[key])) {
                return result[key];
            }
        }

        if (Array.isArray(result.data)) {
            return result.data;
        }
    }

    return [];
};

// Check active status
const isActive = (item) => {
    const value =
        item?.isActive ??
        item?.IsActive ??
        item?.active ??
        item?.Active;

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
        item?.Cancelled ??
        item?.isCanceled ??
        item?.IsCanceled;

    return (
        value === true ||
        value === 1 ||
        String(value).toLowerCase() === "true"
    );
};

const getAssignmentQuantity = (item) => {
    const candidates = [
        item?.emp_Quantity,
        item?.Emp_Quantity,
        item?.employeeCount,
        item?.EmployeeCount,
        item?.employeeQuantity,
        item?.EmployeeQuantity,
        item?.quantity,
        item?.Quantity,
    ];

    for (const candidate of candidates) {
        const parsed = Number(candidate);
        if (Number.isFinite(parsed) && parsed >= 0) {
            return parsed;
        }
    }

    return null;
};

const getTotalAssignmentCount = (items = []) => {
    return items.reduce((total, item) => {
        if (isCancelled(item)) {
            return total;
        }

        const quantity = getAssignmentQuantity(item);

        if (quantity !== null) {
            return total + quantity;
        }

        return total + 1;
    }, 0);
};

function Dashboard() {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        totalEmployees: 0,
        activeVendors: 0,
        activeHotels: 0,
        todayAssignments: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load dashboard data
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
                employeeResult,
                vendorResult,
                hotelResult,
                assignmentResult,
                vendorAssignmentResult,
                supplierAssignmentResult,
            ] = results;

            // Employees
            const employees =
                employeeResult.status === "fulfilled"
                    ? extractList(employeeResult.value, [
                        "employees",
                        "Employees",
                        "items",
                        "Items",
                    ])
                    : [];

            // Vendors
            const vendors =
                vendorResult.status === "fulfilled"
                    ? extractList(vendorResult.value, [
                        "vendors",
                        "Vendors",
                        "items",
                        "Items",
                    ])
                    : [];

            // Hotels
            const hotels =
                hotelResult.status === "fulfilled"
                    ? extractList(hotelResult.value, [
                        "hotels",
                        "Hotels",
                        "items",
                        "Items",
                    ])
                    : [];

            // Today's assignments across employee, vendor and supplier allocation types
            const assignments =
                assignmentResult.status === "fulfilled"
                    ? extractList(assignmentResult.value, [
                        "assignments",
                        "Assignments",
                        "items",
                        "Items",
                    ])
                    : [];

            const vendorAssignments =
                vendorAssignmentResult.status === "fulfilled"
                    ? extractList(vendorAssignmentResult.value, [
                        "assignments",
                        "Assignments",
                        "items",
                        "Items",
                    ])
                    : [];

            const supplierAssignments =
                supplierAssignmentResult.status === "fulfilled"
                    ? extractList(supplierAssignmentResult.value, [
                        "assignments",
                        "Assignments",
                        "items",
                        "Items",
                    ])
                    : [];

            const todayAssignmentTotal =
                getTotalAssignmentCount(assignments) +
                getTotalAssignmentCount(vendorAssignments) +
                getTotalAssignmentCount(supplierAssignments);

            // Update dashboard values
            setDashboardData({
                totalEmployees: employees.length,
                activeVendors: vendors.filter(isActive).length,
                activeHotels: hotels.filter(isActive).length,
                todayAssignments: todayAssignmentTotal,
            });

            const failedRequests = results.filter(
                result => result.status === "rejected"
            );

            if (failedRequests.length === results.length) {
                setError(
                    "Unable to load dashboard data. Please try again."
                );
            }

            // Log individual API errors
            results.forEach((result, index) => {
                if (result.status === "rejected") {
                    console.error(
                        `Dashboard API ${index + 1} failed:`,
                        result.reason
                    );
                }
            });

        } catch (err) {
            console.error("Dashboard loading error:", err);
            setError("Unable to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Navigation
    const handleNavigation = (path) => {
        navigate(path);
    };

    // Summary cards
    const summaryCards = [
        {
            title: "Total Employees",
            value: dashboardData.totalEmployees,
            icon: "👥",
            color: "employees",
            description: "Registered employees",
        },
        {
            title: "Active Vendors",
            value: dashboardData.activeVendors,
            icon: "🚚",
            color: "vendors",
            description: "Currently active vendors",
        },
        {
            title: "Active Hotels",
            value: dashboardData.activeHotels,
            icon: "🏨",
            color: "hotels",
            description: "Registered active Caterers",
        },
        {
            title: "Today's Assignments",
            value: dashboardData.todayAssignments,
            icon: "📋",
            color: "assignments",
            description: "Today's Caterers assignments",
        },
    ];

    // Quick action navigation
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
            icon: "🏨",
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
            description: "View daily master allocations",
            icon: "📊",
            color: "action-cyan",
            path: DASHBOARD_ROUTES.master,
        },
    ];

    return (
        <div className="dashboard">

            {/* Premium Company Header */}
            <div className="dashboard-header">

                <div className="dashboard-heading">
                    <h2> WELCOME TO </h2>
                    {/* <span className="dashboard-brand-line">
                        WELCOME TO
                    </span> */}

                    <h1>
                         <span> BALAJI ENTERPRISES</span>
                    </h1>

                    <div className="dashboard-title-divider">
                        <span></span>
                        <i>✦</i>
                        <span></span>
                    </div>

                    <h2>CATERING MANAGEMENT SYSTEM</h2>

                    <p className="dashboard-subtitle">
                        Smart Management • Seamless Operations • Better Services
                    </p>

                </div>

                

            </div>

            {/* Error Message */}
            {error && (
                <div className="dashboard-error">
                    <span>⚠</span>

                    <span>{error}</span>

                    <button onClick={loadDashboardData}>
                        Retry
                    </button>
                </div>
            )}

            {/* Business Overview */}
            <div className="dashboard-section-heading">

                <div>
                    <h2>Business Overview</h2>
                    <p>Current summary of your business operations</p>
                </div>

                <span className="dashboard-live-status">
                    <span className="live-dot"></span>
                    Live Overview
                </span>

            </div>

            {/* Dashboard Summary Cards */}
            <div className="dashboard-cards">

                {summaryCards.map((card) => (
                    <div
                        className={`dashboard-card ${card.color}`}
                        key={card.title}
                    >

                        <div className="dashboard-card-top">

                            <div className="dashboard-card-icon">
                                {card.icon}
                            </div>

                            <span className="dashboard-card-menu">
                                •••
                            </span>

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

            {/* Quick Actions */}
            <div className="quick-actions">

                <div className="quick-actions-header">

                    <div>
                        <h2>Quick Actions</h2>
                        <p>
                            Quick access to frequently used modules
                        </p>
                    </div>

                </div>

                <div className="action-buttons">

                    {quickActions.map((action) => (
                        <button
                            key={action.title}
                            className={`action-card ${action.color}`}
                            onClick={() =>
                                handleNavigation(action.path)
                            }
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

            </div>

        </div>
    );
}

export default Dashboard;
