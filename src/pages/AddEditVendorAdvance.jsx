
import React, { useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
    getVendorAdvanceById,
    createVendorAdvance,
    updateVendorAdvance
} from "../api/vendorAdvanceApi";

import { getVendors } from "../api/vendorApi";

import DatePicker from "../components/DatePicker";

import "../CSS/EmployeeAdvance.css";

// Get today's date in local YYYY-MM-DD format
const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

function AddEditVendorAdvance() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [vendors, setVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [loading, setLoading] = useState(false);

    const submittingRef = useRef(false);

    const [formData, setFormData] = useState({
        vendorId: "",
        advanceDate: getTodayDate(),
        amount: "",
        description: "",
        isAdjusted: false
    });

    // ---------------------------------------------------------
    // LOAD VENDORS
    // ---------------------------------------------------------

    const loadVendors = async () => {
        try {
            setLoadingVendors(true);

            const response = await getVendors();
            const data = response.data;

            const vendorList = Array.isArray(data)
                ? data
                : data?.items || [];

            setVendors(vendorList);
        } catch (error) {
            console.error(
                "Error loading vendors:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load vendors."
            );
        } finally {
            setLoadingVendors(false);
        }
    };

    // ---------------------------------------------------------
    // LOAD VENDOR ADVANCE FOR EDIT
    // ---------------------------------------------------------

    const loadAdvance = async () => {
        try {
            setLoading(true);

            const response = await getVendorAdvanceById(id);
            const data = response.data;

            setFormData({
                vendorId: data.vendorId ?? "",
                advanceDate: data.advanceDate
                    ? String(data.advanceDate).substring(0, 10)
                    : "",
                amount: data.amount ?? "",
                description: data.description ?? "",
                isAdjusted: data.isAdjusted ?? false
            });
        } catch (error) {
            console.error(
                "Error loading vendor advance:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load vendor advance."
            );

            navigate("/advances/vendor");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // INITIAL LOAD
    // ---------------------------------------------------------

    useEffect(() => {
        loadVendors();

        if (isEdit) {
            loadAdvance();
        }
    }, [id]);

    // ---------------------------------------------------------
    // HANDLE INPUT CHANGE
    // ---------------------------------------------------------

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // ---------------------------------------------------------
    // HANDLE DATE PICKER CHANGE
    // Supports a DatePicker that returns a string or an event.
    // ---------------------------------------------------------

    const handleDateChange = (selectedDate) => {
        const dateValue =
            typeof selectedDate === "string"
                ? selectedDate
                : selectedDate?.target?.value;

        setFormData((prev) => ({
            ...prev,
            advanceDate: dateValue
                ? String(dateValue).substring(0, 10)
                : ""
        }));
    };

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    const validate = () => {
        if (!formData.vendorId) {
            alert("Please select vendor.");
            return false;
        }

        if (
            !formData.advanceDate ||
            !/^\d{4}-\d{2}-\d{2}$/.test(formData.advanceDate)
        ) {
            alert("Please select a valid advance date.");
            return false;
        }

        if (
            !formData.amount ||
            !Number.isFinite(Number(formData.amount)) ||
            Number(formData.amount) <= 0
        ) {
            alert("Please enter a valid advance amount.");
            return false;
        }

        return true;
    };

    // ---------------------------------------------------------
    // SAVE / UPDATE VENDOR ADVANCE
    // ---------------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submittingRef.current) {
            return;
        }

        if (!validate()) {
            return;
        }

        submittingRef.current = true;
        setLoading(true);

        const payload = {
            vendorId: Number(formData.vendorId),

            // Send the date as YYYY-MM-DD
            advanceDate: formData.advanceDate,

            amount: Number(formData.amount),
            description: formData.description.trim() || null,
            isAdjusted: Boolean(formData.isAdjusted)
        };

        console.log("Vendor Advance Payload:", payload);

        try {
            if (isEdit) {
                await updateVendorAdvance(id, payload);

                alert("Vendor advance updated successfully.");
            } else {
                await createVendorAdvance(payload);

                alert("Vendor advance created successfully.");
            }

            navigate("/advances/vendor");
        } catch (error) {
            console.error(
                "Save vendor advance error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save vendor advance."
            );
        } finally {
            setLoading(false);
            submittingRef.current = false;
        }
    };

    // ---------------------------------------------------------
    // CANCEL
    // ---------------------------------------------------------

    const handleCancel = () => {
        if (loading) return;

        navigate("/advances/vendor");
    };

    // ---------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------

    return (
        <div className="employee-advance-page">
            <div className="employee-advance-header">
                <div>
                    <h1>
                        {isEdit
                            ? "Edit Vendor Advance"
                            : "Add Vendor Advance"}
                    </h1>

                    <p>
                        {isEdit
                            ? "Update vendor advance details."
                            : "Create a new vendor advance."}
                    </p>
                </div>
            </div>

            <div className="employee-advance-form-card">
                {loading && isEdit ? (
                    <div className="loading-message">
                        Loading...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* ROW 1 */}
                        <div className="form-row">
                            {/* VENDOR */}
                            <div className="form-group">
                                <label>
                                    Vendor
                                    <span className="required">*</span>
                                </label>

                                <select
                                    name="vendorId"
                                    value={formData.vendorId}
                                    onChange={handleChange}
                                    disabled={loadingVendors || loading}
                                    required
                                >
                                    <option value="">
                                        {loadingVendors
                                            ? "Loading vendors..."
                                            : "Select Vendor"}
                                    </option>

                                    {vendors.map((vendor) => (
                                        <option
                                            key={vendor.vendorId}
                                            value={vendor.vendorId}
                                        >
                                            {vendor.vendorName ||
                                                vendor.name ||
                                                "Unknown Vendor"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ADVANCE DATE PICKER */}
                            <div className="form-group">
                                <label>
                                    Advance Date
                                    <span className="required">*</span>
                                </label>

                                <DatePicker
                                    name="advanceDate"
                                    value={formData.advanceDate}
                                    onChange={handleDateChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* ROW 2 */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>
                                    Advance Amount
                                    <span className="required">*</span>
                                </label>

                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="Enter advance amount"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="form-group" />
                        </div>

                        {/* ROW 3 */}
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label>Description</label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    maxLength="500"
                                    rows="4"
                                    placeholder="Enter description"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-btn"
                                disabled={loading || loadingVendors}
                            >
                                {loading
                                    ? isEdit
                                        ? "Updating..."
                                        : "Saving..."
                                    : isEdit
                                        ? "Update Advance"
                                        : "Save Advance"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default AddEditVendorAdvance;
