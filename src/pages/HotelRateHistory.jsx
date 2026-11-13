
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../CSS/HotelRateHistory.css";

import {
    getHotelRates,
    deleteHotelRate
} from "../api/hotelRateHistoryApi";

import { getHotels } from "../api/hotelApi";

const PAGE_SIZE = 20;

const getDateText = (value) => {
    if (!value) return "—";

    const dateValue = String(value).trim();

    // ISO date: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
    const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
        const [, year, month, day] = match;
        return `${day}-${month}-${year}`;
    }

    // Already formatted date: DD-MM-YYYY
    const displayMatch = dateValue.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
    );

    if (displayMatch) {
        const [, day, month, year] = displayMatch;

        return `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
    }

    return dateValue;
};

const HotelRateHistory = () => {
    const navigate = useNavigate();

    const [rates, setRates] = useState([]);
    const [hotels, setHotels] = useState([]);

    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // PAGINATION
    const [pageNumber, setPageNumber] = useState(1);

    // TOTAL PAGES
    const totalRecords = rates.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRecords / PAGE_SIZE)
    );

    // CURRENT PAGE RECORDS
    const startIndex = (pageNumber - 1) * PAGE_SIZE;

    const paginatedRates = rates.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    // ACTIVE RECORDS
    const activeRecords = rates.filter(
        rate =>
            (rate.isActive ?? rate.IsActive) === true
    ).length;

    // LOAD HOTEL RATES
    const loadRates = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getHotelRates();
            const data = response?.data;

            const list = Array.isArray(data)
                ? data
                : data?.items ??
                  data?.Items ??
                  data?.data?.items ??
                  data?.data ??
                  data?.$values ??
                  [];

            setRates(Array.isArray(list) ? list : []);

        } catch (err) {
            console.error(
                "Error loading Caterer rates:",
                err?.response?.data ?? err
            );

            setError(
                err?.response?.data?.message ??
                err?.response?.data?.title ??
                "Unable to load Caterer rate history."
            );

            setRates([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // LOAD HOTELS
    const loadHotels = useCallback(async () => {
        try {
            const response = await getHotels(1, 2000);
            const data = response?.data;

            const list = Array.isArray(data)
                ? data
                : data?.items ??
                  data?.Items ??
                  data?.data?.items ??
                  data?.data ??
                  data?.$values ??
                  [];

            setHotels(Array.isArray(list) ? list : []);

        } catch (err) {
            console.error(
                "Error loading hotels:",
                err?.response?.data ?? err
            );

            setHotels([]);
        }
    }, []);

    // INITIAL LOAD
    useEffect(() => {
        loadRates();
        loadHotels();
    }, [loadRates, loadHotels]);

    // ADJUST PAGE WHEN RECORDS ARE DELETED OR RELOADED
    useEffect(() => {
        if (pageNumber > totalPages) {
            setPageNumber(totalPages);
        }
    }, [pageNumber, totalPages]);

    // GET HOTEL NAME
    const getHotelName = (hotelId) => {
        if (
            hotelId === null ||
            hotelId === undefined ||
            hotelId === ""
        ) {
            return "—";
        }

        const match = hotels.find(item => {
            const id =
                item?.hotelId ??
                item?.HotelId ??
                item?.id ??
                item?.Id;

            return String(id) === String(hotelId);
        });

        if (!match) {
            return `Hotel ${hotelId}`;
        }

        return (
            match?.hotelName ??
            match?.HotelName ??
            match?.name ??
            match?.Name ??
            `Hotel ${hotelId}`
        );
    };

    // SHIFT NAME
    const getShiftName = (shiftId) => {
        switch (Number(shiftId)) {
            case 1:
                return "Half Day";

            case 2:
                return "Full Day";

            default:
                return "—";
        }
    };

    // GET RATE HISTORY ID
    const getRateId = (rate) => {
        return (
            rate.hotelRateHistoryId ??
            rate.HotelRateHistoryId
        );
    };

    // DELETE RATE
    const handleDelete = async (rate) => {
        const id = getRateId(rate);

        if (id === null || id === undefined || id === "") {
            setError("Caterer rate history ID is missing.");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete Caterer rate record ${id}?`
        );

        if (!confirmed) return;

        try {
            setDeletingId(id);
            setError("");
            setMessage("");

            await deleteHotelRate(id);

            setRates(previous =>
                previous.filter(item =>
                    String(getRateId(item)) !== String(id)
                )
            );

            setMessage("Caterer rate deleted successfully.");

        } catch (err) {
            console.error(
                "Error deleting Caterer rate:",
                err?.response?.data ?? err
            );

            setError(
                err?.response?.data?.message ??
                err?.response?.data?.title ??
                "Unable to delete Caterer rate."
            );

        } finally {
            setDeletingId(null);
        }
    };

    // FIRST PAGE
    const handleFirst = () => {
        if (pageNumber > 1 && !loading) {
            setPageNumber(1);
        }
    };

    // PREVIOUS PAGE
    const handlePrevious = () => {
        if (pageNumber > 1 && !loading) {
            setPageNumber(previous => previous - 1);
        }
    };

    // NEXT PAGE
    const handleNext = () => {
        if (pageNumber < totalPages && !loading) {
            setPageNumber(previous => previous + 1);
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
        loadRates();
        loadHotels();
    };

    return (
        <div className="hotel-rate-page">

            {/* HEADER */}
            <div className="hotel-rate-header">
                <div>
                    <h1>Caterer Rate History</h1>
                    <p>Manage Caterer rates and effective dates.</p>
                </div>

                <div className="hotel-rate-header-actions">

                    <button
                        type="button"
                        className="hotel-rate-refresh"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="hotel-rate-add"
                        onClick={() =>
                            navigate("/RateMasters/hotel/add")
                        }
                    >
                        + Add Caterer Rate
                    </button>

                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="hotel-rate-alert error">
                    {error}
                </div>
            )}

            {/* SUCCESS MESSAGE */}
            {message && (
                <div className="hotel-rate-alert success">
                    {message}
                </div>
            )}

            {/* SUMMARY */}
            <div className="hotel-rate-summary">

                <div>
                    <span>Total Records</span>
                    <strong>{totalRecords}</strong>
                </div>

                <div>
                    <span>Active Records</span>
                    <strong>{activeRecords}</strong>
                </div>

            </div>

            {/* TABLE CARD */}
            <div className="hotel-rate-table-card">

                <div className="hotel-rate-table-wrapper">

                    <table className="hotel-rate-table">

                        <thead>
                            <tr>
                                <th>Sr.No</th>
                                <th>Caterer Name</th>
                                <th>Half Shift ID</th>
                                <th>Half Day Rate</th>
                                <th>Full Shift ID</th>
                                <th>Full Day Rate</th>
                                <th>Effective From</th>
                                <th>Effective To</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {loading ? (
                                <tr>
                                    <td colSpan="10" className="empty-row">
                                        Loading Caterer rates...
                                    </td>
                                </tr>

                            ) : paginatedRates.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="empty-row">
                                        No Caterer rate records found.
                                    </td>
                                </tr>

                            ) : (
                                paginatedRates.map((rate, index) => {

                                    const id = getRateId(rate);

                                    const isActive =
                                        rate.isActive ??
                                        rate.IsActive;

                                    return (
                                        <tr key={id ?? index}>

                                            {/* CONTINUOUS SR.NO */}
                                            <td>
                                                {startIndex + index + 1}
                                            </td>

                                            {/* CATERER NAME */}
                                            <td>
                                                {getHotelName(
                                                    rate.hotelId ??
                                                    rate.HotelId
                                                )}
                                            </td>

                                            {/* HALF SHIFT */}
                                            <td>
                                                {getShiftName(
                                                    rate.halfDShiftId ??
                                                    rate.HalfDShiftId
                                                )}
                                            </td>

                                            {/* HALF DAY RATE */}
                                            <td>
                                                {Number(
                                                    rate.halfDayRate ??
                                                    rate.HalfDayRate ??
                                                    0
                                                ).toFixed(2)}
                                            </td>

                                            {/* FULL SHIFT */}
                                            <td>
                                                {getShiftName(
                                                    rate.fullDShiftId ??
                                                    rate.FullDShiftId
                                                )}
                                            </td>

                                            {/* FULL DAY RATE */}
                                            <td>
                                                {Number(
                                                    rate.fullDayRate ??
                                                    rate.FullDayRate ??
                                                    0
                                                ).toFixed(2)}
                                            </td>

                                            {/* EFFECTIVE FROM */}
                                            <td>
                                                {getDateText(
                                                    rate.effectiveFrom ??
                                                    rate.EffectiveFrom
                                                )}
                                            </td>

                                            {/* EFFECTIVE TO */}
                                            <td>
                                                {getDateText(
                                                    rate.effectiveTo ??
                                                    rate.EffectiveTo
                                                )}
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                <span
                                                    className={
                                                        isActive
                                                            ? "hotel-rate-status active"
                                                            : "hotel-rate-status inactive"
                                                    }
                                                >
                                                    {isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td>
                                                <div className="hotel-rate-row-actions">

                                                    <button
                                                        type="button"
                                                        className="hotel-rate-edit"
                                                        onClick={() =>
                                                            navigate(
                                                                `/RateMasters/hotel/edit/${id}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="hotel-rate-delete"
                                                        onClick={() =>
                                                            handleDelete(rate)
                                                        }
                                                        disabled={
                                                            deletingId === id
                                                        }
                                                    >
                                                        {deletingId === id
                                                            ? "Deleting..."
                                                            : "Delete"}
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
                        padding: "10px 15px"
                    }}
                >

                    {/* RECORD INFORMATION */}
                    <div>
                        Showing{" "}
                        <strong>
                            {totalRecords === 0
                                ? 0
                                : startIndex + 1}
                        </strong>
                        {" "}to{" "}
                        <strong>
                            {Math.min(
                                startIndex + PAGE_SIZE,
                                totalRecords
                            )}
                        </strong>
                        {" "}of{" "}
                        <strong>{totalRecords}</strong> records
                    </div>

                    {/* PAGINATION BUTTONS */}
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
                            disabled={
                                pageNumber >= totalPages || loading
                            }
                        >
                            Next
                        </button>

                        <button
                            type="button"
                            onClick={handleLast}
                            disabled={
                                pageNumber >= totalPages || loading
                            }
                        >
                            Last
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default HotelRateHistory;
