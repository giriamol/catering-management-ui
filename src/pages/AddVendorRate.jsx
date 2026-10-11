// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import "../CSS/AddVendor.css";

// import { getVendors } from "../api/vendorApi";
// import {
// createVendorRate,
// getVendorRatesByVendor
// } from "../api/vendorRateMaster";

// const AddVendorRate = () => {
// const navigate = useNavigate();
// const { id } = useParams();


// const isEditMode = Boolean(id);

// const [vendors, setVendors] = useState([]);
// const [loadingVendors, setLoadingVendors] = useState(false);
// const [saving, setSaving] = useState(false);
// const [errorMessage, setErrorMessage] = useState("");
// const [successMessage, setSuccessMessage] = useState("");

// const [formData, setFormData] = useState({
//     vendorId: "",
//     halfDayRate: "",
//     fullDayRate: "",
//     fromDate: "",
//     toDate: ""
// });

// // Convert API date values to YYYY-MM-DD for HTML date inputs.
// const formatDateForInput = (value) => {
//     if (!value) return "";

//     if (typeof value === "string") {
//         const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
//         if (match) return match[1];
//     }

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) return "";

//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");

//     return `${year}-${month}-${day}`;
// };

// // Load vendors.
// useEffect(() => {
//     const loadVendors = async () => {
//         try {
//             setLoadingVendors(true);
//             setErrorMessage("");

//             const response = await getVendors(1, 2000);
//             const data = response?.data;

//             const vendorList =
//                 data?.items ??
//                 data?.data ??
//                 data;

//             setVendors(Array.isArray(vendorList) ? vendorList : []);
//         } catch (error) {
//             console.error(
//                 "Error loading vendors:",
//                 error?.response?.data || error
//             );

//             setErrorMessage("Unable to load vendors. Please try again.");
//         } finally {
//             setLoadingVendors(false);
//         }
//     };

//     loadVendors();
// }, []);

// // Load rate details in edit mode.
// useEffect(() => {
//     if (!isEditMode || !id) return;

//     let cancelled = false;

//     const loadVendorRate = async () => {
//         try {
//             setErrorMessage("");

//             const response = await getVendorRatesByVendor(id);
//             const result = response?.data;

//             // The endpoint may return either one record or a list.
//             const rate = Array.isArray(result)
//                 ? result.find(
//                     item =>
//                         String(
//                             item.vendorRateHistoryId ??
//                             item.VendorRateHistoryId
//                         ) === String(id)
//                 ) ?? result[0]
//                 : result?.items
//                     ? result.items[0]
//                     : result;

//             if (!rate) {
//                 if (!cancelled) {
//                     setErrorMessage("Vendor rate record not found.");
//                 }
//                 return;
//             }

//             if (cancelled) return;

//             setFormData({
//                 vendorId: String(
//                     rate.vendorId ?? rate.VendorId ?? ""
//                 ),
//                 halfDayRate: String(
//                     rate.halfDayRate ?? rate.HalfDayRate ?? ""
//                 ),
//                 fullDayRate: String(
//                     rate.fullDayRate ?? rate.FullDayRate ?? ""
//                 ),
//                 fromDate: formatDateForInput(
//                     rate.effectiveFrom ??
//                     rate.EffectiveFrom ??
//                     rate.fromDate ??
//                     rate.FromDate
//                 ),
//                 toDate: formatDateForInput(
//                     rate.effectiveTo ??
//                     rate.EffectiveTo ??
//                     rate.toDate ??
//                     rate.ToDate
//                 )
//             });
//         } catch (error) {
//             console.error(
//                 "Error loading vendor rate:",
//                 error?.response?.data || error
//             );

//             if (!cancelled) {
//                 setErrorMessage("Unable to load the selected vendor rate.");
//             }
//         }
//     };

//     loadVendorRate();

//     return () => {
//         cancelled = true;
//     };
// }, [id, isEditMode]);

// // Handle form changes.
// const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData(previous => ({
//         ...previous,
//         [name]: value
//     }));

//     setErrorMessage("");
//     setSuccessMessage("");
// };

// // Validate form values.
// const validateForm = () => {
//     if (!formData.vendorId) {
//         return "Please select a vendor.";
//     }

//     if (
//         formData.halfDayRate === "" ||
//         !Number.isFinite(Number(formData.halfDayRate)) ||
//         Number(formData.halfDayRate) < 0
//     ) {
//         return "Please enter a valid Half Day Rate.";
//     }

//     if (
//         formData.fullDayRate === "" ||
//         !Number.isFinite(Number(formData.fullDayRate)) ||
//         Number(formData.fullDayRate) < 0
//     ) {
//         return "Please enter a valid Full Day Rate.";
//     }

//     if (!formData.fromDate) {
//         return "Please select the From Date.";
//     }

//     // HTML date input provides YYYY-MM-DD.
//     if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fromDate)) {
//         return "From Date must be a valid date.";
//     }

//     if (
//         isEditMode &&
//         formData.toDate &&
//         formData.toDate < formData.fromDate
//     ) {
//         return "To Date cannot be earlier than From Date.";
//     }

//     return "";
// };

// // Create vendor rate.
// const handleSubmit = async (event) => {
//     event.preventDefault();

//     setErrorMessage("");
//     setSuccessMessage("");

//     const validationError = validateForm();

//     if (validationError) {
//         setErrorMessage(validationError);
//         return;
//     }

//     // IMPORTANT:
//     // Use property names expected by CreateVendorRateDto.
//     // Keep dates as YYYY-MM-DD strings; do not convert them
//     // through JavaScript Date, which can introduce timezone shifts.
//     const payload = {
//         vendorId: Number(formData.vendorId),
//         halfDShiftId: 1,
//         halfDayRate: Number(formData.halfDayRate),
//         fullDShiftId: 2,
//         fullDayRate: Number(formData.fullDayRate),
//         effectiveFrom: formData.fromDate,
//         effectiveTo: isEditMode && formData.toDate
//             ? formData.toDate
//             : null
//     };

//     try {
//         setSaving(true);

//         console.log("Vendor rate request payload:", payload);

//         // NOTE: This API creates a record in both modes.
//         // A separate update endpoint is required for true edit functionality.
//         await createVendorRate(payload);

//         setSuccessMessage(
//             isEditMode
//                 ? "Vendor rate submitted successfully."
//                 : "Vendor rate saved successfully."
//         );

//         navigate("/RateMasters/vendor", {
//             state: {
//                 message: isEditMode
//                     ? "Vendor rate submitted successfully."
//                     : "Vendor rate saved successfully."
//             }
//         });
//     } catch (error) {
//         console.error("Vendor rate API error:", {
//             status: error?.response?.status,
//             data: error?.response?.data,
//             payload
//         });

//         const apiError = error?.response?.data;

//         let message =
//             apiError?.message ??
//             apiError?.title ??
//             (typeof apiError === "string" ? apiError : "");

//         // ASP.NET Core validation responses may use an errors object.
//         if (apiError?.errors) {
//             message = Object.entries(apiError.errors)
//                 .map(([field, messages]) =>
//                     `${field}: ${Array.isArray(messages)
//                         ? messages.join(", ")
//                         : messages}`
//                 )
//                 .join(" | ");
//         }

//         setErrorMessage(
//             message || "Unable to save vendor rate. Please check the API."
//         );
//     } finally {
//         setSaving(false);
//     }
// };

// const handleCancel = () => {
//     navigate("/RateMasters/vendor");
// };

// return (
//     <div className="add-vendor-page">
//         <div className="add-vendor-header">
//             <h1>
//                 {isEditMode ? "Edit Vendor Rate" : "Add Vendor Rate"}
//             </h1>

//             <p>
//                 {isEditMode
//                     ? "Update the vendor rate record"
//                     : "Create a new vendor rate record"}
//             </p>
//         </div>

//         <div className="vendor-form-card">
//             <form className="vendor-form" onSubmit={handleSubmit}>
//                 {errorMessage && (
//                     <div className="error-message" role="alert">
//                         {errorMessage}
//                     </div>
//                 )}

//                 {successMessage && (
//                     <div className="success-message" role="status">
//                         {successMessage}
//                     </div>
//                 )}
//                  <div className="form-group full-width">
                    
                    
//                 </div>
//                 <div className="form-group full-width">
//                     <label htmlFor="vendorId">
//                         Vendor <span className="required">*</span>
//                     </label>

//                     <select
//                         id="vendorId"
//                         name="vendorId"
//                         value={formData.vendorId}
//                         onChange={handleChange}
//                         required
//                         disabled={loadingVendors || saving}
//                     >
//                         <option value="">
//                             {loadingVendors
//                                 ? "Loading vendors..."
//                                 : "-- Select Vendor --"}
//                         </option>

//                         {vendors.map(vendor => {
//                             const vendorId =
//                                 vendor.vendorId ?? vendor.VendorId;

//                             const vendorName =
//                                 vendor.vendorName ??
//                                 vendor.VendorName ??
//                                 vendor.name ??
//                                 vendor.Name;

//                             return (
//                                 <option key={vendorId} value={vendorId}>
//                                     {vendorName || `Vendor ${vendorId}`}
//                                 </option>
//                             );
//                         })}
//                     </select>
//                 </div>

//                 <div className="form-group">
//                     <label htmlFor="HalfDShiftId">
//                         Half Day Shift ID
//                     </label>
//                     <input
//                         id="HalfDShiftId"
//                         type="number"
//                         value={1}
//                         readOnly
//                     />
//                 </div>

//                 <div className="form-group">
//                     <label htmlFor="halfDayRate">
//                         Half Day Rate <span className="required">*</span>
//                     </label>
//                     <input
//                         id="halfDayRate"
//                         name="halfDayRate"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.halfDayRate}
//                         onChange={handleChange}
//                         placeholder="Enter Half Day Rate"
//                         required
//                         disabled={saving}
//                     />
//                 </div>

//                 <div className="form-group">
//                     <label htmlFor="FullDShiftId">
//                         Full Day Shift ID
//                     </label>
//                     <input
//                         id="FullDShiftId"
//                         type="number"
//                         value={2}
//                         readOnly
//                     />
//                 </div>

//                 <div className="form-group">
//                     <label htmlFor="fullDayRate">
//                         Full Day Rate <span className="required">*</span>
//                     </label>
//                     <input
//                         id="fullDayRate"
//                         name="fullDayRate"
//                         type="number"
//                         min="0"
//                         step="0.01"
//                         value={formData.fullDayRate}
//                         onChange={handleChange}
//                         placeholder="Enter Full Day Rate"
//                         required
//                         disabled={saving}
//                     />
//                 </div>

//                 <div className="form-group">
//                     <label htmlFor="fromDate">
//                         From Date <span className="required">*</span>
//                     </label>
//                     <input
//                         id="fromDate"
//                         name="fromDate"
//                         type="date"
//                         value={formData.fromDate}
//                         onChange={handleChange}
//                         required
//                         disabled={saving}
//                     />
//                 </div>

//                 {isEditMode && (
//                     <div className="form-group">
//                         <label htmlFor="toDate">To Date</label>
//                         <input
//                             id="toDate"
//                             name="toDate"
//                             type="date"
//                             min={formData.fromDate || undefined}
//                             value={formData.toDate}
//                             onChange={handleChange}
//                             disabled={saving}
//                         />
//                         <small>
//                             Select the end date for this vendor rate.
//                         </small>
//                     </div>
//                 )}

//                 <div className="form-actions">
//                     <button
//                         type="button"
//                         className="cancel-btn"
//                         onClick={handleCancel}
//                         disabled={saving}
//                     >
//                         Cancel
//                     </button>

//                     <button
//                         type="submit"
//                         className="save-btn"
//                         disabled={saving || loadingVendors}
//                     >
//                         {saving
//                             ? "Saving..."
//                             : isEditMode
//                                 ? "Update Vendor Rate"
//                                 : "Save Vendor Rate"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     </div>
// );


// };

// export default AddVendorRate;

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../CSS/AddVendor.css";

import { getVendors } from "../api/vendorApi";

import {
    createVendorRate,
    getVendorRatesByVendor
    //updateVendorRate
} from "../api/vendorRateMaster";

const AddVendorRate = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEditMode = Boolean(id);

    const [vendors, setVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [loadingRate, setLoadingRate] = useState(false);
    const [saving, setSaving] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        vendorId: "",
        halfDayRate: "",
        fullDayRate: "",
        fromDate: "",
        toDate: ""
    });

    // Convert API date values to YYYY-MM-DD for HTML date inputs.
    const formatDateForInput = (value) => {
        if (!value) return "";

        if (typeof value === "string") {
            const match = value.match(/^(\d{4}-\d{2}-\d{2})/);

            if (match) {
                return match[1];
            }
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    };

    // Handle API responses that return either a record or wrapped data.
    const unwrapResponse = (response) => {
        let data = response?.data ?? response;

        // Handle common API response wrappers.
        if (
            data &&
            !Array.isArray(data) &&
            data.data !== undefined
        ) {
            data = data.data;
        }

        return data;
    };

    // Load vendors without changing existing Add functionality.
    useEffect(() => {
        let cancelled = false;

        const loadVendors = async () => {
            try {
                setLoadingVendors(true);

                const response = await getVendors(1, 2000);
                const data = response?.data;

                const vendorList =
                    data?.items ??
                    data?.Items ??
                    data?.data ??
                    data?.Data ??
                    data;

                if (!cancelled) {
                    setVendors(
                        Array.isArray(vendorList) ? vendorList : []
                    );
                }
            } catch (error) {
                console.error(
                    "Error loading vendors:",
                    error?.response?.data || error
                );

                if (!cancelled) {
                    setErrorMessage(
                        "Unable to load vendors. Please try again."
                    );
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

    // Load the exact rate-history record when editing.
    useEffect(() => {
        if (!isEditMode || !id) return;

        let cancelled = false;

        const loadVendorRate = async () => {
            try {
                setLoadingRate(true);
                setErrorMessage("");

                // This endpoint must fetch by VendorRateHistoryId,
                // not by VendorId.
                const response = await getVendorRatesByVendor(id);
                const result = unwrapResponse(response);

                const rate = Array.isArray(result)
                    ? result.find(
                        item =>
                            String(
                                item.vendorRateHistoryId ??
                                item.VendorRateHistoryId ??
                                item.id ??
                                item.Id
                            ) === String(id)
                    )
                    : result?.items
                        ? result.items.find(
                            item =>
                                String(
                                    item.vendorRateHistoryId ??
                                    item.VendorRateHistoryId
                                ) === String(id)
                        )
                        : result;

                if (!rate) {
                    if (!cancelled) {
                        setErrorMessage(
                            "Vendor rate record not found."
                        );
                    }

                    return;
                }

                if (cancelled) return;

                setFormData({
                    vendorId: String(
                        rate.vendorId ??
                        rate.VendorId ??
                        ""
                    ),

                    halfDayRate: String(
                        rate.halfDayRate ??
                        rate.HalfDayRate ??
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
            } catch (error) {
                console.error(
                    "Error loading vendor rate:",
                    error?.response?.data || error
                );

                if (!cancelled) {
                    setErrorMessage(
                        "Unable to load the selected vendor rate. " +
                        "Check the GET-by-ID API endpoint."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingRate(false);
                }
            }
        };

        loadVendorRate();

        return () => {
            cancelled = true;
        };
    }, [id, isEditMode]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));

        setErrorMessage("");
        setSuccessMessage("");
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

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(formData.fromDate)
        ) {
            return "From Date must be a valid date.";
        }

        if (
            isEditMode &&
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
        setSuccessMessage("");

        const validationError = validateForm();

        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        // Keep the shift IDs fixed as in the original functionality.
        const payload = {
            vendorId: Number(formData.vendorId),
            halfDShiftId: 1,
            halfDayRate: Number(formData.halfDayRate),
            fullDShiftId: 2,
            fullDayRate: Number(formData.fullDayRate),
            effectiveFrom: formData.fromDate,
            effectiveTo: formData.toDate || null
        };

        try {
            setSaving(true);

            console.log(
                isEditMode
                    ? "Updating vendor rate:"
                    : "Creating vendor rate:",
                { id, payload }
            );

            if (isEditMode) {
                // Update the specific rate-history record.
                await updateVendorRate(id, payload);

                setSuccessMessage(
                    "Vendor rate updated successfully."
                );
            } else {
                // Preserve the existing create operation.
                await createVendorRate(payload);

                setSuccessMessage(
                    "Vendor rate saved successfully."
                );
            }

            navigate("/RateMasters/vendor", {
                state: {
                    message: isEditMode
                        ? "Vendor rate updated successfully."
                        : "Vendor rate saved successfully."
                }
            });
        } catch (error) {
            console.error("Vendor rate save/update error:", {
                status: error?.response?.status,
                data: error?.response?.data,
                id,
                payload
            });

            const apiError = error?.response?.data;

            let message =
                apiError?.message ??
                apiError?.title ??
                (typeof apiError === "string" ? apiError : "");

            if (apiError?.errors) {
                message = Object.entries(apiError.errors)
                    .map(([field, messages]) => {
                        const details = Array.isArray(messages)
                            ? messages.join(", ")
                            : messages;

                        return `${field}: ${details}`;
                    })
                    .join(" | ");
            }

            setErrorMessage(
                message ||
                (
                    error?.response?.status === 404
                        ? "Vendor rate record or API endpoint was not found."
                        : error?.response?.status === 405
                            ? "The backend does not support this HTTP method on the configured route."
                            : "Unable to save vendor rate. Please check the API and backend response."
                )
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
                <h1>
                    {isEditMode
                        ? "Edit Vendor Rate"
                        : "Add Vendor Rate"}
                </h1>

                <p>
                    {isEditMode
                        ? "Update the vendor rate record"
                        : "Create a new vendor rate record"}
                </p>
            </div>

            <div className="vendor-form-card">
                {loadingRate ? (
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

                        {successMessage && (
                            <div
                                className="success-message"
                                role="status"
                            >
                                {successMessage}
                            </div>
                        )}

                        <div className="form-group full-width">
                            <label htmlFor="vendorId">
                                Vendor{" "}
                                <span className="required">*</span>
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

                                {vendors.map(vendor => {
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
                                            value={vendorId}
                                        >
                                            {vendorName ||
                                                `Vendor ${vendorId}`}
                                        </option>
                                    );
                                })}
                            </select>
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
                                placeholder="Enter Full Day Rate"
                                required
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fromDate">
                                From Date{" "}
                                <span className="required">*</span>
                            </label>

                            <input
                                id="fromDate"
                                name="fromDate"
                                type="date"
                                value={formData.fromDate}
                                onChange={handleChange}
                                required
                                disabled={saving}
                            />
                        </div>

                        {isEditMode && (
                            <div className="form-group">
                                <label htmlFor="toDate">
                                    To Date
                                </label>

                                <input
                                    id="toDate"
                                    name="toDate"
                                    type="date"
                                    min={formData.fromDate || undefined}
                                    value={formData.toDate}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                                <small>
                                    Select the end date for this vendor rate.
                                </small>
                            </div>
                        )}

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
                                disabled={
                                    saving ||
                                    loadingVendors ||
                                    loadingRate
                                }
                            >
                                {saving
                                    ? "Saving..."
                                    : isEditMode
                                        ? "Update Vendor Rate"
                                        : "Save Vendor Rate"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddVendorRate;
