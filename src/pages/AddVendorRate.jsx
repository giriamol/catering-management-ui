import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../CSS/AddVendor.css";
import DatePicker from "../components/DatePicker";
import { GetVendorsWithoutRateHistory } from "../api/vendorApi";
import { createVendorRate } from "../api/vendorRateMaster";

const AddVendorRate = () => {
    const navigate = useNavigate();

    const [vendors, setVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [formData, setFormData] = useState({
        vendorId: "",
        halfDayRate: "",
        fullDayRate: "",
        fromDate: "",
        toDate: "",
    });

    // Extract vendor list from API response.
    const unwrapList = (response) => {
        let data = response?.data ?? response;

        if (!Array.isArray(data)) {
            data =
                data?.items ??
                data?.Items ??
                data?.data ??
                data?.Data ??
                [];
        }

        return Array.isArray(data) ? data : [];
    };

    // Load vendors that do not have rate history.
    useEffect(() => {
        let cancelled = false;

        const loadVendors = async () => {
            try {
                setLoadingVendors(true);

                const response = await GetVendorsWithoutRateHistory();
                const vendorList = unwrapList(response);

                if (!cancelled) {
                    setVendors(vendorList);
                }
            } catch (error) {
                console.error(
                    "Error loading vendors:",
                    error?.response?.data ?? error
                );

                if (!cancelled) {
                    setVendors([]);
                    setErrorMessage("Unable to load vendors. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingVendors(false);
                }
            }
        };

        loadVendors();

        return () => {
            cancelled = true;
        };
    }, []);

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

    const validateForm = () => {
        if (!formData.vendorId) {
            return "Please select a vendor.";
        }

        if (
            formData.halfDayRate === "" ||
            !Number.isFinite(Number(formData.halfDayRate)) ||
            Number(formData.halfDayRate) < 0
        ) {
            return "Please enter a valid Half Day Rate.";
        }

        if (
            formData.fullDayRate === "" ||
            !Number.isFinite(Number(formData.fullDayRate)) ||
            Number(formData.fullDayRate) < 0
        ) {
            return "Please enter a valid Full Day Rate.";
        }

        if (!formData.fromDate) {
            return "Please select the From Date.";
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fromDate)) {
            return "From Date must be a valid date.";
        }

        if (
            formData.toDate &&
            !/^\d{4}-\d{2}-\d{2}$/.test(formData.toDate)
        ) {
            return "To Date must be a valid date.";
        }

        if (
            formData.toDate &&
            formData.toDate < formData.fromDate
        ) {
            return "To Date cannot be earlier than From Date.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");

        const validationError = validateForm();

        if (validationError) {
            setErrorMessage(validationError);
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

            await createVendorRate(payload);

            navigate("/RateMasters/vendor", {
                state: {
                    message: "Vendor rate saved successfully.",
                },
            });
        } catch (error) {
            console.error(
                "Error saving vendor rate:",
                error?.response?.data ?? error
            );

            const apiError = error?.response?.data;

            let message =
                apiError?.message ??
                apiError?.title ??
                (typeof apiError === "string" ? apiError : "");

            if (apiError?.errors) {
                message = Object.entries(apiError.errors)
                    .map(([field, messages]) =>
                        `${field}: ${
                            Array.isArray(messages)
                                ? messages.join(", ")
                                : messages
                        }`
                    )
                    .join(" | ");
            }

            setErrorMessage(
                message ||
                    (error?.response?.status === 409
                        ? "A rate history already exists for this vendor."
                        : "Unable to save vendor rate. Please check the API response.")
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate("/RateMasters/vendor");
    };

    return (
        <div className="add-vendor-page">
            <div className="add-vendor-header">
                <h1>Add Vendor Rate</h1>
                <p>Create a new vendor rate record.</p>
            </div>

            <div className="vendor-form-card">
                <form className="vendor-form" onSubmit={handleSubmit}>
                    {errorMessage && (
                        <div className="error-message" role="alert">
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
                            disabled={loadingVendors || saving}
                        >
                            <option value="">
                                {loadingVendors
                                    ? "Loading vendors..."
                                    : "-- Select Vendor --"}
                            </option>

                            {vendors.map((vendor) => {
                                const vendorId =
                                    vendor.vendorId ?? vendor.VendorId;

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
                                        {vendorName || `Vendor ${vendorId}`}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    

                    <div  className="form-group">
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
                            Half Day Rate <span className="required">*</span>
                        </label>
                        <input
                            id="halfDayRate"
                            name="halfDayRate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.halfDayRate}
                            onChange={handleChange}
                            placeholder="Enter Half Day Rate"
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
                            Full Day Rate <span className="required">*</span>
                        </label>
                        <input
                            id="fullDayRate"
                            name="fullDayRate"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fullDayRate}
                            onChange={handleChange}
                            placeholder="Enter Full Day Rate"
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
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={saving || loadingVendors}
                        >
                            {saving ? "Saving..." : "Save Vendor Rate"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVendorRate;
