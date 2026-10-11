
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../CSS/HotelRateHistory.css";

import {
    getHotelRates,
    deleteHotelRate
} from "../api/hotelRateHistoryApi";

const getDateText = (value) => {
    if (!value) return "—";

    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) {
        const [year, month, day] = match[1].split("-");
        return `${day}-${month}-${year}`;
    }

    return String(value);
};

const HotelRateHistory = () => {
    const navigate = useNavigate();

    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    const handleDelete = async (rate) => {
        const id =
            rate.hotelRateHistoryId ??
            rate.HotelRateHistoryId;

        if (!id) {
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
                    String(
                        item.hotelRateHistoryId ??
                        item.HotelRateHistoryId
                    ) !== String(id)
                )
            );

            setMessage("Hotel rate deleted successfully.");
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

    return (
        <div className="hotel-rate-page">
            <div className="hotel-rate-header">
                <div>
                    <h1>Caterer Rate History</h1>
                    <p>Manage Caterer rates and effective dates.</p>
                </div>

                <div className="hotel-rate-header-actions">
                    <button
                        type="button"
                        className="hotel-rate-refresh"
                        onClick={loadRates}
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

            {error && (
                <div className="hotel-rate-alert error">
                    {error}
                </div>
            )}

            {message && (
                <div className="hotel-rate-alert success">
                    {message}
                </div>
            )}

            <div className="hotel-rate-summary">
                <div>
                    <span>Total Records</span>
                    <strong>{rates.length}</strong>
                </div>

                <div>
                    <span>Active Records</span>
                    <strong>
                        {rates.filter(rate =>
                            (rate.isActive ?? rate.IsActive) === true
                        ).length}
                    </strong>
                </div>
            </div>

            <div className="hotel-rate-table-card">
                <div className="hotel-rate-table-wrapper">
                    <table className="hotel-rate-table">
                        <thead>
                            <tr>
                                <th>Rate ID</th>
                                <th>Caterer ID</th>
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
                            ) : rates.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="empty-row">
                                        No Caterer rate records found.
                                    </td>
                                </tr>
                            ) : (
                                rates.map(rate => {
                                    const id =
                                        rate.hotelRateHistoryId ??
                                        rate.HotelRateHistoryId;

                                    const isActive =
                                        rate.isActive ??
                                        rate.IsActive;

                                    return (
                                        <tr key={id}>
                                            <td>{id}</td>

                                            <td>
                                                {rate.hotelId ??
                                                    rate.HotelId}
                                            </td>

                                            <td>
                                                {rate.halfDShiftId ??
                                                    rate.HalfDShiftId}
                                            </td>

                                            <td>
                                                {Number(
                                                    rate.halfDayRate ??
                                                    rate.HalfDayRate ??
                                                    0
                                                ).toFixed(2)}
                                            </td>

                                            <td>
                                                {rate.fullDShiftId ??
                                                    rate.FullDShiftId}
                                            </td>

                                            <td>
                                                {Number(
                                                    rate.fullDayRate ??
                                                    rate.FullDayRate ??
                                                    0
                                                ).toFixed(2)}
                                            </td>

                                            <td>
                                                {getDateText(
                                                    rate.effectiveFrom ??
                                                    rate.EffectiveFrom
                                                )}
                                            </td>

                                            <td>
                                                {getDateText(
                                                    rate.effectiveTo ??
                                                    rate.EffectiveTo
                                                )}
                                            </td>

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
            </div>
        </div>
    );
};

export default HotelRateHistory;
