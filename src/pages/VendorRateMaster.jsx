
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../CSS/EmployeeRateMaster.css";
import { getVendors } from "../api/vendorApi";
import {
    deleteVendorRate,
    getVendorRates
} from "../api/vendorRateMaster";

const PAGE_SIZE = 20;

// Format API dates as DD/MM/YYYY without timezone conversion.
const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const value = String(dateValue).trim();

    const displayMatch = value.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

    if (displayMatch) {
        const [, day, month, year] = displayMatch;
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }

    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return `${day}/${month}/${year}`;
    }

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
    const location = useLocation();

    const [popup, setPopup] = useState(null);

    // VENDORS
    const [vendors, setVendors] = useState([]);
    const [vendorLoading, setVendorLoading] = useState(false);

    // VENDOR RATES
    const [rateMasters, setRateMasters] = useState([]);
    const [loading, setLoading] = useState(false);

    // PAGINATION
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const showPopup = (title, message, onClose) => {
        setPopup({ title, message, onClose });
    };

    // SUCCESS MESSAGE AFTER NAVIGATION
    useEffect(() => {
        if (location.state?.message) {
            showPopup("Success!", location.state.message, () => {
                navigate(location.pathname, {
                    replace: true,
                    state: {}
                });
            });
        }
    }, [location.key]);

    // INITIAL LOAD
    useEffect(() => {
        loadVendors();
    }, []);

    // LOAD RATES WHEN PAGE CHANGES
    useEffect(() => {
        loadRateMasters();
    }, [pageNumber]);

    // LOAD VENDORS
    const loadVendors = async () => {
        try {
            setVendorLoading(true);

            const response = await getVendors(1, 2000);

            const data = response.data;
            const vendorList =
                data?.items ??
                data?.data?.items ??
                data?.data ??
                data ??
                [];

            setVendors(
                Array.isArray(vendorList) ? vendorList : []
            );
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

            const response = await getVendorRates(
                pageNumber,
                PAGE_SIZE
            );

            console.log("Vendor Rate API Response:", response.data);

            const responseData = response.data;
            const data = responseData?.data ?? responseData;

            const rateList =
                data?.items ??
                data?.records ??
                data?.data ??
                data ??
                [];

            const validRateList = Array.isArray(rateList)
                ? rateList
                : [];

            const count = Number(
                data?.totalCount ??
                data?.totalItems ??
                data?.totalRecords ??
                data?.count ??
                responseData?.totalCount ??
                responseData?.totalItems ??
                responseData?.totalRecords ??
                0
            );

            const pages = Math.max(
                1,
                Number(
                    data?.totalPages ??
                    responseData?.totalPages ??
                    (count > 0
                        ? Math.ceil(count / PAGE_SIZE)
                        : 1)
                )
            );

            setTotalCount(count);
            setTotalPages(pages);

            // If the current page becomes invalid after deletion,
            // move to the previous available page.
            if (pageNumber > pages) {
                setRateMasters([]);
                setPageNumber(pages);
                return;
            }

            setRateMasters(validRateList);

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

    // GET RATE ID
    const getRateId = (item) => {
        return (
            item.vendorRateHistoryId ??
            item.VendorRateHistoryId ??
            item.rateHistoryId ??
            item.id
        );
    };

    // EDIT VENDOR RATE
    const handleEdit = (item) => {
        const id = getRateId(item);

        if (id == null || id === "") {
            alert("Vendor rate ID not found.");
            return;
        }

        navigate(`/RateMasters/vendor/edit/${id}`, {
            state: { rateMaster: item }
        });
    };

    // DELETE VENDOR RATE
    const handleDelete = async (item) => {
        const id = getRateId(item);

        if (id == null || id === "") {
            alert("Vendor rate ID not found.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete vendor rate ${id}?`
        );

        if (!confirmed) return;

        try {
            await deleteVendorRate(id);

            showPopup(
                "Success!",
                "Vendor rate deleted successfully.",
                () => {
                    loadRateMasters();
                }
            );
        } catch (error) {
            console.error("Error deleting vendor rate:", error);

            showPopup(
                "Error",
                "Unable to delete vendor rate."
            );
        }
    };

    // PREVIOUS PAGE
    const handlePrevious = () => {
        if (pageNumber > 1 && !loading) {
            setPageNumber((previous) => previous - 1);
        }
    };

    // NEXT PAGE
    const handleNext = () => {
        if (pageNumber < totalPages && !loading) {
            setPageNumber((previous) => previous + 1);
        }
    };

    // FIRST PAGE
    const handleFirst = () => {
        if (pageNumber > 1 && !loading) {
            setPageNumber(1);
        }
    };

    // LAST PAGE
    const handleLast = () => {
        if (pageNumber < totalPages && !loading) {
            setPageNumber(totalPages);
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
                    className="add-btn"
                    onClick={handleAddVendorRate}
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
                        {loading || vendorLoading
                            ? "Loading..."
                            : "Refresh"}
                    </button>
                </div>

                {/* TABLE */}
                <div className="table-container">
                    <table className="employee-rate-table">

                        <thead>
                            <tr>
                                <th>Sr.No</th>
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
                                    const id = getRateId(item);

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
                                        <tr key={id ?? index}>

                                            {/* CONTINUOUS SR.NO */}
                                            <td>
                                                {(pageNumber - 1) * PAGE_SIZE + index + 1}
                                            </td>

                                            <td>
                                                {getVendorName(vendorId)}
                                            </td>

                                            <td>
                                                {halfShiftId != null
                                                    ? getShiftName(halfShiftId)
                                                    : "-"}
                                            </td>

                                            <td>
                                                {halfDayRate ?? "-"}
                                            </td>

                                            <td>
                                                {fullShiftId != null
                                                    ? getShiftName(fullShiftId)
                                                    : "-"}
                                            </td>

                                            <td>
                                                {fullDayRate ?? "-"}
                                            </td>

                                            <td>
                                                {formatDate(fromDate)}
                                            </td>

                                            <td>
                                                {formatDate(toDate)}
                                            </td>

                                            <td>
                                                <div className="employee-rate-row-actions">

                                                    <button
                                                        type="button"
                                                        className="edit-btn"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(item)}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
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
                        flexWrap: "wrap",
                        gap: "12px",
                        marginTop: "20px",
                        padding: "10px 0"
                    }}
                >
                    <div>
                        Showing{" "}
                        <strong>
                            {totalCount === 0
                                ? 0
                                : (pageNumber - 1) * PAGE_SIZE + 1}
                        </strong>
                        {" "}to{" "}
                        <strong>
                            {Math.min(
                                pageNumber * PAGE_SIZE,
                                totalCount
                            )}
                        </strong>
                        {" "}of{" "}
                        <strong>{totalCount}</strong> records
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap"
                        }}
                    >
                        <button
                            type="button"
                            onClick={handleFirst}
                            disabled={pageNumber === 1 || loading}
                        >
                            First
                        </button>

                        <button
                            type="button"
                            onClick={handlePrevious}
                            disabled={pageNumber === 1 || loading}
                        >
                            Previous
                        </button>

                        <span>
                            Page <strong>{pageNumber}</strong> of{" "}
                            <strong>{totalPages}</strong>
                        </span>

                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={pageNumber >= totalPages || loading}
                        >
                            Next
                        </button>

                        <button
                            type="button"
                            onClick={handleLast}
                            disabled={pageNumber >= totalPages || loading}
                        >
                            Last
                        </button>
                    </div>
                </div>
            </div>

            {/* POPUP */}
            {popup && (
                <div
                    className="screen-popup-backdrop"
                    onClick={() => {
                        setPopup(null);
                        popup.onClose?.();
                    }}
                >
                    <div
                        className="screen-popup-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3>{popup.title}</h3>
                        <p>{popup.message}</p>

                        <button
                            type="button"
                            className="screen-popup-ok"
                            onClick={() => {
                                setPopup(null);
                                popup.onClose?.();
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VendorRateMaster;
