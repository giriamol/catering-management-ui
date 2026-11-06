
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../CSS/AddVendor.css";
import DatePicker from "../components/DatePicker";
import { getVendors } from "../api/vendorApi";
import {
    getVendorRateById,
    updateVendorRate,
} from "../api/vendorRateMaster";

const EditVendorRate = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingVendors, setLoadingVendors] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        vendorId: "",
        halfDayRate: "",
        fullDayRate: "",
        fromDate: "",
        toDate: "",
    });

    // Convert API response date into YYYY-MM-DD for DatePicker.
    const formatDateForInput = (value) => {
        if (!value) return "";

        const text = String(value).trim();

        const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);
        if (isoMatch) return isoMatch[1];

        const displayMatch = text.match(
            /^(\d{2})\/(\d{2})\/(\d{4})$/
        );

        if (displayMatch) {
            return `${displayMatch[3]}-${displayMatch[2]}-${displayMatch[1]}`;
        }

        return "";
    };

    // Supports a single record or a paginated API response.
    const extractRateRecord = (response, recordId) => {
        let data = response?.data ?? response;

        if (!data) return null;

        data = data.data ?? data.Data ?? data.item ?? data.Item ?? data;

        const items = data?.items ?? data?.Items;

        if (Array.isArray(items)) {
            return items.find(
                (item) =>
                    String(
                        item.vendorRateHistoryId ??
                        item.VendorRateHistoryId
                    ) === String(recordId)
            ) ?? null;
        }

        if (Array.isArray(data)) {
            return data.find(
                (item) =>
                    String(
                        item.vendorRateHistoryId ??
                        item.VendorRateHistoryId
                    ) === String(recordId)
            ) ?? null;
        }

        return data;
    };

    // Load all vendors so the existing vendor can be displayed.
    useEffect(() => {
        let cancelled = false;

        const loadVendors = async () => {
            try {
                setLoadingVendors(true);

                const response = await getVendors();
                let data = response?.data ?? response;

                if (!Array.isArray(data)) {
                    data =
                        data?.items ??
                        data?.Items ??
                        data?.data ??
                        data?.Data ??
                        [];
                }

                if (!cancelled) {
                    setVendors(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Error loading vendors:", error);
                if (!cancelled) {
                    setErrorMessage("Unable to load vendors.");
                }
            } finally {
                if (!cancelled) setLoadingVendors(false);
            }
        };

        loadVendors();

        return () => {
            cancelled = true;
        };
    }, []);

    // Load the selected rate-history record.
    useEffect(() => {
        if (!id) {
            setErrorMessage("Vendor rate history ID is missing.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadVendorRate = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const response = await getVendorRateById(id);
                const rate = extractRateRecord(response, id);

                if (!rate) {
                    throw new Error("Vendor rate record not found.");
                }

                if (cancelled) return;

                setFormData({
                    vendorId: String(
                        rate.vendorId ?? rate.VendorId ?? ""
                    ),
                    halfDayRate: String(
                        rate.halfDayRate ?? rate.HalfDayRate ?? ""
                    ),
                    fullDayRate: String(
                        rate.fullDayRate ?? rate.FullDayRate ?? ""
                    ),
                    fromDate: formatDateForInput(
                        rate.fromDate ??
                        rate.FromDate ??
                        rate.effectiveFrom ??
                        rate.EffectiveFrom
                    ),
                    toDate: formatDateForInput(
                        rate.toDate ??
                        rate.ToDate ??
                        rate.effectiveTo ??
                        rate.EffectiveTo
                    ),
                });
            } catch (error) {
                console.error(
                    "Error loading vendor rate:",
                    error?.response?.data ?? error
                );

                if (!cancelled) {
                    setErrorMessage(
                        error?.response?.status === 404
                            ? "Vendor rate record not found. Check the GET-by-ID API."
                            : error.message ||
                              "Unable to load vendor rate details."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadVendorRate();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrorMessage("");
    };

    const handleDateChange = (name, value) => {
        setFormData((previous) => ({
            ...previous,
            [name]: value,
            ...(name === "fromDate" &&
            previous.toDate &&
            previous.toDate < value
                ? { toDate: "" }
                : {}),
        }));

        setErrorMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");

        if (!formData.vendorId) {
            setErrorMessage("Please select a vendor.");
            return;
        }

        if (
            formData.halfDayRate === "" ||
            !Number.isFinite(Number(formData.halfDayRate)) ||
            Number(formData.halfDayRate) < 0
        ) {
            setErrorMessage("Enter a valid Half Day Rate.");
            return;
        }

        if (
            formData.fullDayRate === "" ||
            !Number.isFinite(Number(formData.fullDayRate)) ||
            Number(formData.fullDayRate) < 0
        ) {
            setErrorMessage("Enter a valid Full Day Rate.");
            return;
        }

        if (!formData.fromDate) {
            setErrorMessage("Please select the From Date.");
            return;
        }

        if (
            formData.toDate &&
            formData.toDate < formData.fromDate
        ) {
            setErrorMessage("To Date cannot be earlier than From Date.");
            return;
        }

        const payload = {
            vendorId: Number(formData.vendorId),
            halfDShiftId: 1,
            halfDayRate: Number(formData.halfDayRate),
            fullDShiftId: 2,
            fullDayRate: Number(formData.fullDayRate),
            effectiveFrom: formData.fromDate,
            effectiveTo: formData.toDate || null,
        };

        try {
            setSaving(true);

            await updateVendorRate(id, payload);

            navigate("/RateMasters/vendor", {
                state: {
                    message: "Vendor rate updated successfully.",
                },
            });
        } catch (error) {
            console.error(
                "Error updating vendor rate:",
                error?.response?.data ?? error
            );

            const apiError = error?.response?.data;

            setErrorMessage(
                apiError?.message ??
                apiError?.title ??
                (error?.response?.status === 404
                    ? "Vendor rate or update API endpoint not found."
                    : error?.response?.status === 405
                      ? "The backend does not support this update method."
                      : "Unable to update vendor rate.")
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="add-vendor-page">
            <div className="add-vendor-header">
                <h1>Edit Vendor Rate</h1>
                <p>Update the selected vendor rate details.</p>
            </div>

            <div className="vendor-form-card">
                {loading ? (
                    <p>Loading vendor rate details...</p>
                ) : (
                    <form
                        className="vendor-form"
                        onSubmit={handleSubmit}
                    >
                        {errorMessage && (
                            <div
                                className="error-message"
                                role="alert"
                            >
                                {errorMessage}
                            </div>
                        )}

                        <div className="form-group full-width">
                            <label htmlFor="vendorId">
                                Vendor <span className="required">*</span>
                            </label>

                            <select
                                id="vendorId"
                                name="vendorId"
                                value={formData.vendorId}
                                onChange={handleChange}
                                required
                                disabled={
                                    loadingVendors || saving
                                }
                            >
                                <option value="">
                                    {loadingVendors
                                        ? "Loading vendors..."
                                        : "-- Select Vendor --"}
                                </option>

                                {vendors.map((vendor) => {
                                    const vendorId =
                                        vendor.vendorId ??
                                        vendor.VendorId;

                                    const vendorName =
                                        vendor.vendorName ??
                                        vendor.VendorName ??
                                        vendor.name ??
                                        vendor.Name;

                                    return (
                                        <option
                                            key={vendorId}
                                            value={String(vendorId)}
                                        >
                                            {vendorName ||
                                                `Vendor ${vendorId}`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            
                        </div>
                        <div className="form-group">
                            <label htmlFor="halfShiftId">
                                Half Day Shift ID
                            </label>
                            <input
                                id="halfShiftId"
                                type="number"
                                value={1}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="halfDayRate">
                                Half Day Rate{" "}
                                <span className="required">*</span>
                            </label>
                            <input
                                id="halfDayRate"
                                name="halfDayRate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.halfDayRate}
                                onChange={handleChange}
                                required
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullShiftId">
                                Full Day Shift ID
                            </label>
                            <input
                                id="fullShiftId"
                                type="number"
                                value={2}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullDayRate">
                                Full Day Rate{" "}
                                <span className="required">*</span>
                            </label>
                            <input
                                id="fullDayRate"
                                name="fullDayRate"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.fullDayRate}
                                onChange={handleChange}
                                required
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <DatePicker
                                id="fromDate"
                                name="fromDate"
                                label="From Date"
                                value={formData.fromDate}
                                onChange={(value) =>
                                    handleDateChange("fromDate", value)
                                }
                                required
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <DatePicker
                                id="toDate"
                                name="toDate"
                                label="To Date"
                                value={formData.toDate}
                                onChange={(value) =>
                                    handleDateChange("toDate", value)
                                }
                                min={formData.fromDate || undefined}
                                disabled={saving}
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() =>
                                    navigate("/RateMasters/vendor")
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-btn"
                                disabled={
                                    saving ||
                                    loadingVendors ||
                                    loading
                                }
                            >
                                {saving
                                    ? "Updating..."
                                    : "Update Vendor Rate"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditVendorRate;
