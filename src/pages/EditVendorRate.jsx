import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../CSS/AddVendor.css";
import DatePicker from "../components/DatePicker";

import { getVendorById } from "../api/vendorApi";

import {
    getVendorRateById,
    updateVendorRate
} from "../api/vendorRateMaster";

const EditVendorRate = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [vendor, setVendor] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingVendor, setLoadingVendor] = useState(false);
    const [saving, setSaving] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [popup, setPopup] = useState(null);

    const [formData, setFormData] = useState({
        vendorId: "",
        halfShiftId: "",
        halfDayRate: "",
        fullShiftId: "",
        fullDayRate: "",
        fromDate: "",
        toDate: ""
    });

    // ------------------------------------------------
    // Date formatting
    // ------------------------------------------------

    const formatDateForInput = (value) => {
        if (!value) return "";

        const text = String(value).trim();

        // Example: 2026-10-12T00:00:00
        const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (isoMatch) {
            return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
        }

        // Example: 12/10/2026
        const displayMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

        if (displayMatch) {
            return `${displayMatch[3]}-${displayMatch[2].padStart(2, "0")}-${displayMatch[1].padStart(2, "0")}`;
        }

        return "";
    };

    // ------------------------------------------------
    // Extract rate record
    // ------------------------------------------------

    const extractRateRecord = (response, recordId) => {
        let data = response?.data ?? response;

        if (!data) return null;

        data =
            data.data ??
            data.Data ??
            data.item ??
            data.Item ??
            data.result ??
            data.Result ??
            data;

        const getId = (item) =>
            item?.vendorRateHistoryId ??
            item?.VendorRateHistoryId;

        if (Array.isArray(data)) {
            return (
                data.find(
                    (item) => String(getId(item)) === String(recordId)
                ) ?? null
            );
        }

        if (Array.isArray(data?.items)) {
            return (
                data.items.find(
                    (item) => String(getId(item)) === String(recordId)
                ) ?? null
            );
        }

        if (Array.isArray(data?.Items)) {
            return (
                data.Items.find(
                    (item) => String(getId(item)) === String(recordId)
                ) ?? null
            );
        }

        if (typeof data === "object") {
            if (
                getId(data) === undefined ||
                String(getId(data)) === String(recordId)
            ) {
                return data;
            }
        }

        return null;
    };

    // ------------------------------------------------
    // Extract particular vendor object
    // ------------------------------------------------

    const extractVendor = (response) => {
        let data = response?.data ?? response;

        if (!data) return null;

        data =
            data.data ??
            data.Data ??
            data.item ??
            data.Item ??
            data.result ??
            data.Result ??
            data;

        // API may return a single object or an array.
        if (Array.isArray(data)) {
            return data[0] ?? null;
        }

        return typeof data === "object" ? data : null;
    };

    // ------------------------------------------------
    // Vendor ID helper
    // ------------------------------------------------

    const getVendorId = (data) =>
        data?.vendorId ??
        data?.VendorId ??
        data?.id ??
        data?.Id;

    // ------------------------------------------------
    // Vendor name helper
    // ------------------------------------------------

    const getVendorName = (data) =>
        data?.vendorName ??
        data?.VendorName ??
        data?.name ??
        data?.Name ??
        "";

    // ------------------------------------------------
    // Load selected vendor rate and vendor
    // ------------------------------------------------

    useEffect(() => {
        if (!id) {
            setErrorMessage("Vendor rate history ID is missing.");
            setLoading(false);
            return;
        }

        // Duplicate effect runs are handled by request cancellation below.
        let cancelled = false;

        const loadVendorRate = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                setVendor(null);

                // STEP 1: Get vendor rate by rate history ID.
                console.log("Loading Vendor Rate ID:", id);

                const rateResponse = await getVendorRateById(id);

                console.log(
                    "Vendor Rate API Response:",
                    rateResponse.data
                );

                const rate = extractRateRecord(rateResponse, id);

                if (!rate) {
                    throw new Error("Vendor rate record not found.");
                }

                if (cancelled) return;

                console.log("Selected Vendor Rate:", rate);

                // STEP 2: Extract vendor ID from rate response.
                const vendorId =
                    rate.vendorId ??
                    rate.VendorId;

                if (!vendorId) {
                    throw new Error(
                        "Vendor ID is missing in vendor rate response."
                    );
                }

                // Populate rate fields.
                setFormData({
                    vendorId: String(vendorId),

                    halfShiftId: String(
                        rate.halfShiftId ??
                        rate.HalfShiftId ??
                        rate.halfDShiftId ??
                        rate.HalfDShiftId ??
                        ""
                    ),

                    halfDayRate: String(
                        rate.halfDayRate ??
                        rate.HalfDayRate ??
                        ""
                    ),

                    fullShiftId: String(
                        rate.fullShiftId ??
                        rate.FullShiftId ??
                        rate.fullDShiftId ??
                        rate.FullDShiftId ??
                        ""
                    ),

                    fullDayRate: String(
                        rate.fullDayRate ??
                        rate.FullDayRate ??
                        ""
                    ),

                    fromDate: formatDateForInput(
                        rate.effectiveFrom ??
                        rate.EffectiveFrom ??
                        rate.fromDate ??
                        rate.FromDate
                    ),

                    toDate: formatDateForInput(
                        rate.effectiveTo ??
                        rate.EffectiveTo ??
                        rate.toDate ??
                        rate.ToDate
                    )
                });

                // STEP 3: Get only the selected vendor.
                try {
                    setLoadingVendor(true);

                    console.log("Loading Particular Vendor ID:", vendorId);

                    const vendorResponse = await getVendorById(vendorId);

                    console.log(
                        "Particular Vendor API Response:",
                        vendorResponse.data
                    );

                    const vendorData = extractVendor(vendorResponse);

                    if (!vendorData) {
                        throw new Error("Vendor details not found.");
                    }

                    if (!cancelled) {
                        setVendor(vendorData);
                    }

                } catch (vendorError) {
                    console.error(
                        "Error loading particular vendor:",
                        vendorError?.response?.data ?? vendorError
                    );

                    if (!cancelled) {
                        setVendor(null);
                        setErrorMessage(
                            "Rate details loaded, but vendor name could not be loaded."
                        );
                    }

                } finally {
                    if (!cancelled) {
                        setLoadingVendor(false);
                    }
                }

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
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadVendorRate();

        return () => {
            cancelled = true;
        };

    }, [id]);

    // ------------------------------------------------
    // Input changes
    // ------------------------------------------------

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrorMessage("");
    };

    // ------------------------------------------------
    // Date changes
    // ------------------------------------------------

    const handleDateChange = (name, value) => {
        setFormData((previous) => ({
            ...previous,
            [name]: value,

            ...(name === "fromDate" &&
                previous.toDate &&
                previous.toDate < value
                ? { toDate: "" }
                : {})
        }));

        setErrorMessage("");
    };

    // ------------------------------------------------
    // Update vendor rate
    // ------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");

        if (!formData.vendorId) {
            setErrorMessage("Vendor ID is missing.");
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
            halfDShiftId: Number(formData.halfShiftId),
            halfDayRate: Number(formData.halfDayRate),
            fullDShiftId: Number(formData.fullShiftId),
            fullDayRate: Number(formData.fullDayRate),
            effectiveFrom: formData.fromDate,
            effectiveTo: formData.toDate || null
        };

        try {
            setSaving(true);

            console.log("Update Vendor Rate Payload:", payload);

            await updateVendorRate(id, payload);

            setPopup({
                title: "Success!",
                message: "Vendor rate updated successfully.",
                onClose: () => navigate("/RateMasters/vendor")
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
                (
                    error?.response?.status === 404
                        ? "Vendor rate or update API endpoint not found."
                        : error?.response?.status === 405
                            ? "The backend does not support this update method."
                            : "Unable to update vendor rate."
                )
            );

        } finally {
            setSaving(false);
        }
    };

    // ------------------------------------------------
    // UI
    // ------------------------------------------------

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

                        {/* Vendor name: read-only */}

                        <div className="form-group full-width">

                            <label htmlFor="vendorName">
                                Vendor
                                <span className="required">*</span>
                            </label>

                            <input
                                id="vendorName"
                                type="text"
                                value={
                                    loadingVendor
                                        ? "Loading vendor..."
                                        : getVendorName(vendor) ||
                                          (
                                              formData.vendorId
                                                  ? `Vendor ${formData.vendorId}`
                                                  : "Vendor not found"
                                          )
                                }
                                readOnly
                            />

                        </div>

                        {/* Vendor ID */}
                        <div className="form-group"></div>
                        {/* <div className="form-group">
                            <label htmlFor="vendorId">
                                Vendor ID
                            </label>

                            <input
                                id="vendorId"
                                type="text"
                                value={formData.vendorId}
                                readOnly
                            />
                        </div> */}

                        {/* Half Day Shift */}

                        <div className="form-group">

                            <label htmlFor="halfShiftId">
                                Half Day Shift ID
                            </label>

                            <input
                                id="halfShiftId"
                                name="halfShiftId"
                                type="number"
                                value={formData.halfShiftId}
                                readOnly
                            />

                        </div>

                        {/* Half Day Rate */}

                        <div className="form-group">

                            <label htmlFor="halfDayRate">
                                Half Day Rate
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

                        {/* Full Day Shift */}

                        <div className="form-group">

                            <label htmlFor="fullShiftId">
                                Full Day Shift ID
                            </label>

                            <input
                                id="fullShiftId"
                                name="fullShiftId"
                                type="number"
                                value={formData.fullShiftId}
                                readOnly
                            />

                        </div>

                        {/* Full Day Rate */}

                        <div className="form-group">

                            <label htmlFor="fullDayRate">
                                Full Day Rate
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

                        {/* From Date */}

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

                        {/* To Date */}

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

                        {/* Buttons */}

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
                                disabled={saving || loading || loadingVendor}
                            >
                                {saving
                                    ? "Updating..."
                                    : "Update Vendor Rate"}
                            </button>

                        </div>

                    </form>

                )}

            </div>

            {/* Success Popup */}

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

export default EditVendorRate;