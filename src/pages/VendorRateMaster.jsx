import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../CSS/EmployeeRateMaster.css";
import { getVendors } from "../api/vendorApi";
import { getVendorRates } from "../api/vendorRateMaster";

// Format API dates as DD/MM/YYYY without timezone conversion.
const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const value = String(dateValue).trim();

    // Already formatted as DD/MM/YYYY.
    const displayMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (displayMatch) {
        const [, day, month, year] = displayMatch;
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    // ISO date or ISO datetime: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return `${day}/${month}/${year}`;
    }

    // Handle common SQL datetime format: M/D/YYYY or MM/DD/YYYY.
    // This fallback is only used when the value is not ISO.
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
        const day = String(parsed.getDate()).padStart(2, "0");
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const year = parsed.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return value;
};

const VendorRateMaster = () => {
    const navigate = useNavigate();

    // VENDORS
    const [vendors, setVendors] = useState([]);
    const [vendorLoading, setVendorLoading] = useState(false);

    // VENDOR RATES
    const [rateMasters, setRateMasters] = useState([]);
    const [loading, setLoading] = useState(false);

    // PAGINATION
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // INITIAL LOAD
    useEffect(() => {
        loadVendors();
    }, []);

    useEffect(() => {
        loadRateMasters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNumber]);

    // LOAD VENDORS
    const loadVendors = async () => {
        try {
            setVendorLoading(true);

            const response = await getVendors(1, 2000);
            console.log("Vendor API Response:", response.data);

            const data = response.data;
            const vendorList = data?.items ?? data?.data ?? data ?? [];

            setVendors(Array.isArray(vendorList) ? vendorList : []);
        } catch (error) {
            console.error("Error loading vendors:", error);
            setVendors([]);
        } finally {
            setVendorLoading(false);
        }
    };

    // LOAD VENDOR RATES
    const loadRateMasters = async () => {
        try {
            setLoading(true);

            console.log("Loading Vendor Rates...", pageNumber, pageSize);

            const response = await getVendorRates(pageNumber, pageSize);
            console.log("Vendor Rate API Response:", response.data);

            const data = response.data;
            const rateList = data?.items ?? data?.data ?? data ?? [];

            setRateMasters(Array.isArray(rateList) ? rateList : []);

            const count = Number(
                data?.totalCount ??
                data?.totalItems ??
                data?.count ??
                0
            );

            setTotalCount(count);

            const pages = Number(
                data?.totalPages ??
                (count > 0 ? Math.ceil(count / pageSize) : 1)
            );

            setTotalPages(pages || 1);
        } catch (error) {
            console.error("Error loading vendor rates:", error);
            console.error("Response:", error?.response?.data);
            setRateMasters([]);
            setTotalCount(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    // GET VENDOR NAME
    const getVendorName = (vendorId) => {
        if (vendorId == null || vendorId === "") return "-";

        const vendor = vendors.find((item) =>
            Number(
                item.vendorId ??
                item.VendorId ??
                item.fk_VendorId
            ) === Number(vendorId)
        );

        if (!vendor) return `Vendor ID: ${vendorId}`;

        return (
            vendor.vendorName ??
            vendor.VendorName ??
            vendor.name ??
            vendor.Name ??
            "-"
        );
    };

    // SHIFT NAME
    const getShiftName = (shiftId) => {
        switch (Number(shiftId)) {
            case 1:
                return "Morning";
            case 2:
                return "Evening";
            default:
                return "-";
        }
    };

    // ADD VENDOR RATE
    const handleAddVendorRate = () => {
        navigate("/RateMasters/vendor/add");
    };

    // EDIT VENDOR RATE
    const handleEdit = (item) => {
        const id =
            item.vendorRateHistoryId ??
            item.VendorRateHistoryId ??
            item.rateHistoryId ??
            item.id;

        if (id == null || id === "") {
            alert("Vendor rate ID not found.");
            return;
        }

        navigate(`/RateMasters/vendor/edit/${id}`, {
            state: { rateMaster: item }
        });
    };

    // PAGINATION
    const handlePrevious = () => {
        if (pageNumber > 1 && !loading) {
            setPageNumber((previous) => previous - 1);
        }
    };

    const handleNext = () => {
        if (pageNumber < totalPages && !loading) {
            setPageNumber((previous) => previous + 1);
        }
    };

    // REFRESH
    const handleRefresh = () => {
        loadRateMasters();
        loadVendors();
    };

    return (
        <div className="employee-rate-page">
            {/* HEADER */}
            <div className="employee-rate-header">
                <div>
                    <h2>Vendor Rate Master</h2>
                    <p>Manage Vendor Rates</p>
                </div>

                <button
                    type="button"
                    className="save-btn"
                    onClick={handleAddVendorRate}
                    style={{
                        position: "relative",
                        zIndex: 10,
                        cursor: "pointer",
                        pointerEvents: "auto"
                    }}
                >
                    + Add Vendor Rate
                </button>
            </div>

            {/* TABLE CARD */}
            <div className="employee-rate-card">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px"
                    }}
                >
                    <div>
                        <strong>Vendor Rates</strong>
                        <span style={{ marginLeft: "10px" }}>
                            Total: {totalCount}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading || vendorLoading}
                    >
                        {loading || vendorLoading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                <div className="table-container">
                    <table className="employee-rate-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Vendor</th>
                                <th>Half Day Shift</th>
                                <th>Half Day Rate</th>
                                <th>Full Day Shift</th>
                                <th>Full Day Rate</th>
                                <th>From Date</th>
                                <th>To Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="no-data">
                                        Loading vendor rates...
                                    </td>
                                </tr>
                            ) : rateMasters.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="no-data">
                                        No vendor rates found.
                                    </td>
                                </tr>
                            ) : (
                                rateMasters.map((item, index) => {
                                    const id =
                                        item.vendorRateHistoryId ??
                                        item.VendorRateHistoryId ??
                                        item.rateHistoryId ??
                                        item.id ??
                                        index;

                                    const vendorId =
                                        item.vendorId ??
                                        item.VendorId ??
                                        item.fk_VendorId;

                                    const halfShiftId =
                                        item.halfDShiftId ??
                                        item.HalfDShiftId ??
                                        item.halfDayShiftId ??
                                        item.HalfDayShiftId;

                                    const fullShiftId =
                                        item.fullDShiftId ??
                                        item.FullDShiftId ??
                                        item.fullDayShiftId ??
                                        item.FullDayShiftId;

                                    const halfDayRate =
                                        item.halfDayRate ??
                                        item.HalfDayRate;

                                    const fullDayRate =
                                        item.fullDayRate ??
                                        item.FullDayRate;

                                    const fromDate =
                                        item.fromDate ??
                                        item.FromDate ??
                                        item.effectiveFrom ??
                                        item.EffectiveFrom;

                                    const toDate =
                                        item.toDate ??
                                        item.ToDate ??
                                        item.effectiveTo ??
                                        item.EffectiveTo;

                                    return (
                                        <tr key={id}>
                                            <td>{id}</td>

                                            <td>{getVendorName(vendorId)}</td>

                                            <td>
                                                {halfShiftId != null
                                                    ? `${getShiftName(halfShiftId)}`
                                                    : "-"}
                                            </td>

                                            <td>{halfDayRate ?? "-"}</td>

                                            <td>
                                                {fullShiftId != null
                                                    ? `${getShiftName(fullShiftId)}`
                                                    : "-"}
                                            </td>

                                            <td>{fullDayRate ?? "-"}</td>

                                            <td>{formatDate(fromDate)}</td>

                                            <td>{formatDate(toDate)}</td>

                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/RateMasters/vendor/edit/${item.vendorRateHistoryId}`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "20px",
                        padding: "10px 0"
                    }}
                >
                    <div>
                        Showing page <strong>{pageNumber}</strong> of{" "}
                        <strong>{totalPages}</strong>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >
                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={pageNumber === 1 || loading}
                        >
                            Previous
                        </button>

                        <span>
                            Page <strong>{pageNumber}</strong>
                        </span>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={pageNumber >= totalPages || loading}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorRateMaster;
