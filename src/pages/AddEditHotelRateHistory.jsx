
// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import "../CSS/HotelRateHistory.css";

// import { getHotels } from "../api/hotelApi";

// import {
//     getHotelRateById,
//     createHotelRate,
//     updateHotelRate
// } from "../api/hotelRateHistoryApi";

// const initialForm = {
//     hotelId: "",
//     halfDayRate: "",
//     fullDayRate: "",
//     effectiveFrom: "",
//     effectiveTo: "",
//     isActive: true
// };

// const formatDateForInput = (value) => {
//     if (!value) return "";

//     const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);

//     if (match) return match[1];

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) return "";

//     return [
//         date.getFullYear(),
//         String(date.getMonth() + 1).padStart(2, "0"),
//         String(date.getDate()).padStart(2, "0")
//     ].join("-");
// };

// const unwrapList = (response) => {
//     const data = response?.data ?? response;

//     if (Array.isArray(data)) return data;

//     return (
//         data?.items ??
//         data?.Items ??
//         data?.data ??
//         data?.$values ??
//         []
//     );
// };

// const AddEditHotelRateHistory = () => {
//     const navigate = useNavigate();
//     const { id } = useParams();

//     const isEditMode = Boolean(id);

//     const [hotels, setHotels] = useState([]);
//     const [formData, setFormData] = useState(initialForm);

//     const [loading, setLoading] = useState(false);
//     const [loadingHotels, setLoadingHotels] = useState(false);
//     const [saving, setSaving] = useState(false);

//     const [error, setError] = useState("");

//     // Load hotels for the dropdown.
//     useEffect(() => {
//         let cancelled = false;

//         const loadHotels = async () => {
//             try {
//                 setLoadingHotels(true);

//                 const response = await getHotels();
//                 const list = unwrapList(response);

//                 if (!cancelled) {
//                     setHotels(Array.isArray(list) ? list : []);
//                 }
//             } catch (err) {
//                 console.error(
//                     "Error loading hotels:",
//                     err?.response?.data ?? err
//                 );

//                 if (!cancelled) {
//                     setError("Unable to load hotels.");
//                 }
//             } finally {
//                 if (!cancelled) {
//                     setLoadingHotels(false);
//                 }
//             }
//         };

//         loadHotels();

//         return () => {
//             cancelled = true;
//         };
//     }, []);

//     // Load the selected rate in Edit mode.
//     useEffect(() => {
//         if (!isEditMode || !id) return;

//         let cancelled = false;

//         const loadRate = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 const response = await getHotelRateById(id);
//                 const rate = response?.data;

//                 if (!rate) {
//                     if (!cancelled) {
//                         setError("Hotel rate record was not found.");
//                     }
//                     return;
//                 }

//                 if (cancelled) return;

//                 setFormData({
//                     hotelId: String(
//                         rate.hotelId ??
//                         rate.HotelId ??
//                         ""
//                     ),

//                     halfDayRate: String(
//                         rate.halfDayRate ??
//                         rate.HalfDayRate ??
//                         ""
//                     ),

//                     fullDayRate: String(
//                         rate.fullDayRate ??
//                         rate.FullDayRate ??
//                         ""
//                     ),

//                     effectiveFrom: formatDateForInput(
//                         rate.effectiveFrom ??
//                         rate.EffectiveFrom
//                     ),

//                     effectiveTo: formatDateForInput(
//                         rate.effectiveTo ??
//                         rate.EffectiveTo
//                     ),

//                     isActive:
//                         rate.isActive ??
//                         rate.IsActive ??
//                         true
//                 });
//             } catch (err) {
//                 console.error(
//                     "Error loading hotel rate:",
//                     err?.response?.data ?? err
//                 );

//                 if (!cancelled) {
//                     setError(
//                         "Unable to load this hotel rate. Check the GET-by-ID endpoint."
//                     );
//                 }
//             } finally {
//                 if (!cancelled) {
//                     setLoading(false);
//                 }
//             }
//         };

//         loadRate();

//         return () => {
//             cancelled = true;
//         };
//     }, [id, isEditMode]);

//     const handleChange = (event) => {
//         const { name, value, type, checked } = event.target;

//         setFormData(previous => ({
//             ...previous,
//             [name]: type === "checkbox" ? checked : value
//         }));

//         setError("");
//     };

//     const validate = () => {
//         if (!formData.hotelId) {
//             return "Please select a hotel.";
//         }

//         if (
//             formData.halfDayRate === "" ||
//             !Number.isFinite(Number(formData.halfDayRate)) ||
//             Number(formData.halfDayRate) < 0
//         ) {
//             return "Enter a valid Half Day Rate.";
//         }

//         if (
//             formData.fullDayRate === "" ||
//             !Number.isFinite(Number(formData.fullDayRate)) ||
//             Number(formData.fullDayRate) < 0
//         ) {
//             return "Enter a valid Full Day Rate.";
//         }

//         if (!formData.effectiveFrom) {
//             return "Please select the Effective From date.";
//         }

//         if (
//             formData.effectiveTo &&
//             formData.effectiveTo < formData.effectiveFrom
//         ) {
//             return "Effective To cannot be earlier than Effective From.";
//         }

//         return "";
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         setError("");

//         const validationError = validate();

//         if (validationError) {
//             setError(validationError);
//             return;
//         }

//         const payload = {
//             hotelId: Number(formData.hotelId),
//             halfDShiftId: 1,
//             halfDayRate: Number(formData.halfDayRate),
//             fullDShiftId: 2,
//             fullDayRate: Number(formData.fullDayRate),
//             effectiveFrom: formData.effectiveFrom,
//             effectiveTo: formData.effectiveTo || null,
//             isActive: formData.isActive
//         };

//         try {
//             setSaving(true);

//             console.log("Hotel rate payload:", {
//                 id,
//                 isEditMode,
//                 payload
//             });

//             if (isEditMode) {
//                 await updateHotelRate(id, {
//                     ...payload,
//                     updatedBy: null
//                 });
//             } else {
//                 await createHotelRate(payload);
//             }

//             navigate("/RateMasters/hotel", {
//                 state: {
//                     message: isEditMode
//                         ? "Hotel rate updated successfully."
//                         : "Hotel rate created successfully."
//                 }
//             });
//         } catch (err) {
//             console.error(
//                 "Hotel rate save error:",
//                 err?.response?.data ?? err
//             );

//             const apiError = err?.response?.data;

//             let message =
//                 apiError?.message ??
//                 apiError?.title ??
//                 (typeof apiError === "string" ? apiError : "");

//             if (apiError?.errors) {
//                 message = Object.entries(apiError.errors)
//                     .map(([field, messages]) =>
//                         `${field}: ${
//                             Array.isArray(messages)
//                                 ? messages.join(", ")
//                                 : messages
//                         }`
//                     )
//                     .join(" | ");
//             }

//             setError(
//                 message ||
//                 (err?.response?.status === 404
//                     ? "Hotel rate record or endpoint was not found."
//                     : err?.response?.status === 405
//                         ? "The configured endpoint does not support this HTTP method."
//                         : "Unable to save hotel rate. Check the API response.")
//             );
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <div className="hotel-rate-page">
//             <div className="hotel-rate-header">
//                 <div>
//                     <h1>
//                         {isEditMode
//                             ? "Edit Hotel Rate"
//                             : "Add Hotel Rate"}
//                     </h1>

//                     <p>
//                         {isEditMode
//                             ? `Update rate history record ${id}`
//                             : "Create a new hotel rate record"}
//                     </p>
//                 </div>
//             </div>

//             <div className="hotel-rate-form-card">
//                 {error && (
//                     <div className="hotel-rate-alert error">
//                         {error}
//                     </div>
//                 )}

//                 {loading ? (
//                     <p>Loading hotel rate details...</p>
//                 ) : (
//                     <form
//                         className="hotel-rate-form"
//                         onSubmit={handleSubmit}
//                     >
//                         <div className="hotel-rate-form-grid">
//                             <div className="hotel-rate-field full-width">
//                                 <label htmlFor="hotelId">
//                                     Hotel <span>*</span>
//                                 </label>

//                                 <select
//                                     id="hotelId"
//                                     name="hotelId"
//                                     value={formData.hotelId}
//                                     onChange={handleChange}
//                                     required
//                                     disabled={loadingHotels || saving}
//                                 >
//                                     <option value="">
//                                         {loadingHotels
//                                             ? "Loading hotels..."
//                                             : "-- Select Hotel --"}
//                                     </option>

//                                     {hotels.map(hotel => {
//                                         const hotelId =
//                                             hotel.hotelId ??
//                                             hotel.HotelId;

//                                         const hotelName =
//                                             hotel.hotelName ??
//                                             hotel.HotelName ??
//                                             hotel.name ??
//                                             hotel.Name;

//                                         return (
//                                             <option
//                                                 key={hotelId}
//                                                 value={hotelId}
//                                             >
//                                                 {hotelName ||
//                                                     `Hotel ${hotelId}`}
//                                             </option>
//                                         );
//                                     })}
//                                 </select>
//                             </div>

//                             <div className="hotel-rate-field">
//                                 <label htmlFor="halfDShiftId">
//                                     Half Day Shift ID
//                                 </label>

//                                 <input
//                                     id="halfDShiftId"
//                                     type="number"
//                                     value={1}
//                                     readOnly
//                                 />
//                             </div>

//                             <div className="hotel-rate-field">
//                                 <label htmlFor="halfDayRate">
//                                     Half Day Rate <span>*</span>
//                                 </label>

//                                 <input
//                                     id="halfDayRate"
//                                     name="halfDayRate"
//                                     type="number"
//                                     min="0"
//                                     step="0.01"
//                                     value={formData.halfDayRate}
//                                     onChange={handleChange}
//                                     placeholder="Enter Half Day Rate"
//                                     required
//                                     disabled={saving}
//                                 />
//                             </div>

//                             <div className="hotel-rate-field">
//                                 <label htmlFor="fullDShiftId">
//                                     Full Day Shift ID
//                                 </label>

//                                 <input
//                                     id="fullDShiftId"
//                                     type="number"
//                                     value={2}
//                                     readOnly
//                                 />
//                             </div>

//                             <div className="hotel-rate-field">
//                                 <label htmlFor="fullDayRate">
//                                     Full Day Rate <span>*</span>
//                                 </label>

//                                 <input
//                                     id="fullDayRate"
//                                     name="fullDayRate"
//                                     type="number"
//                                     min="0"
//                                     step="0.01"
//                                     value={formData.fullDayRate}
//                                     onChange={handleChange}
//                                     placeholder="Enter Full Day Rate"
//                                     required
//                                     disabled={saving}
//                                 />
//                             </div>

//                             <div className="hotel-rate-field">
//                                 <label htmlFor="effectiveFrom">
//                                     Effective From <span>*</span>
//                                 </label>

//                                 <input
//                                     id="effectiveFrom"
//                                     name="effectiveFrom"
//                                     type="date"
//                                     value={formData.effectiveFrom}
//                                     onChange={handleChange}
//                                     required
//                                     disabled={saving}
//                                 />
//                             </div>

//                             <div className="hotel-rate-field">
//                                 {/* <label htmlFor="effectiveTo">
//                                     Effective To
//                                 </label> */}

//                                 {/* <input
//                                     id="effectiveTo"
//                                     name="effectiveTo"
//                                     type="date"
//                                     min={
//                                         formData.effectiveFrom || undefined
//                                     }
//                                     value={formData.effectiveTo}
//                                     onChange={handleChange}
//                                     disabled={saving}
//                                 /> */}
//                             </div>

//                             <div className="hotel-rate-field checkbox-field">
//                                 <label>
//                                     <input
//                                         type="checkbox"
//                                         name="isActive"
//                                         checked={formData.isActive}
//                                         onChange={handleChange}
//                                         disabled={saving}
//                                     />
//                                     Active
//                                 </label>
//                             </div>
//                         </div>

//                         <div className="hotel-rate-form-actions">
//                             <button
//                                 type="button"
//                                 className="hotel-rate-cancel"
//                                 onClick={() =>
//                                     navigate("/RateMasters/hotel")
//                                 }
//                                 disabled={saving}
//                             >
//                                 Cancel
//                             </button>

//                             <button
//                                 type="submit"
//                                 className="hotel-rate-add"
//                                 disabled={saving || loadingHotels}
//                             >
//                                 {saving
//                                     ? "Saving..."
//                                     : isEditMode
//                                         ? "Update Hotel Rate"
//                                         : "Save Hotel Rate"}
//                             </button>
//                         </div>
//                     </form>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AddEditHotelRateHistory;


import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../CSS/HotelRateHistory.css";

import { getHotels } from "../api/hotelApi";

import {
    getHotelRateById,
    createHotelRate,
    updateHotelRate
} from "../api/hotelRateHistoryApi";

const initialForm = {
    hotelId: "",
    halfDayRate: "",
    fullDayRate: "",
    effectiveFrom: "",
    effectiveTo: "",
    isActive: true
};

// Convert API date values to YYYY-MM-DD for HTML date inputs.
const formatDateForInput = (value) => {
    if (!value) return "";

    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);

    if (match) return match[1];

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
};

// Handle different API response formats.
const unwrapList = (response) => {
    const data = response?.data ?? response;

    if (Array.isArray(data)) return data;

    return (
        data?.items ??
        data?.Items ??
        data?.data ??
        data?.$values ??
        []
    );
};

const AddEditHotelRateHistory = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // The presence of an ID means Edit mode.
    const isEditMode = Boolean(id);

    const [hotels, setHotels] = useState([]);
    const [formData, setFormData] = useState(initialForm);

    const [loading, setLoading] = useState(false);
    const [loadingHotels, setLoadingHotels] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    // Load hotels for the dropdown.
    useEffect(() => {
        let cancelled = false;

        const loadHotels = async () => {
            try {
                setLoadingHotels(true);

                const response = await getHotels();
                const list = unwrapList(response);

                if (!cancelled) {
                    setHotels(Array.isArray(list) ? list : []);
                }
            } catch (err) {
                console.error(
                    "Error loading hotels:",
                    err?.response?.data ?? err
                );

                if (!cancelled) {
                    setError("Unable to load hotels.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingHotels(false);
                }
            }
        };

        loadHotels();

        return () => {
            cancelled = true;
        };
    }, []);

    // Load the selected hotel rate only in Edit mode.
    useEffect(() => {
        if (!isEditMode || !id) return;

        let cancelled = false;

        const loadRate = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getHotelRateById(id);

                // Supports Axios response and direct object responses.
                const rate = response?.data ?? response;

                if (!rate || typeof rate !== "object") {
                    if (!cancelled) {
                        setError("Hotel rate record was not found.");
                    }
                    return;
                }

                if (cancelled) return;

                setFormData({
                    hotelId: String(
                        rate.hotelId ??
                        rate.HotelId ??
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

                    effectiveFrom: formatDateForInput(
                        rate.effectiveFrom ??
                        rate.EffectiveFrom
                    ),

                    effectiveTo: formatDateForInput(
                        rate.effectiveTo ??
                        rate.EffectiveTo
                    ),

                    isActive:
                        rate.isActive ??
                        rate.IsActive ??
                        true
                });
            } catch (err) {
                console.error(
                    "Error loading hotel rate:",
                    err?.response?.data ?? err
                );

                if (!cancelled) {
                    setError(
                        "Unable to load this hotel rate. Check the GET-by-ID endpoint."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadRate();

        return () => {
            cancelled = true;
        };
    }, [id, isEditMode]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }));

        setError("");
    };

    const validate = () => {
        if (!formData.hotelId) {
            return "Please select a hotel.";
        }

        if (
            formData.halfDayRate === "" ||
            !Number.isFinite(Number(formData.halfDayRate)) ||
            Number(formData.halfDayRate) < 0
        ) {
            return "Enter a valid Half Day Rate.";
        }

        if (
            formData.fullDayRate === "" ||
            !Number.isFinite(Number(formData.fullDayRate)) ||
            Number(formData.fullDayRate) < 0
        ) {
            return "Enter a valid Full Day Rate.";
        }

        if (!formData.effectiveFrom) {
            return "Please select the Effective From date.";
        }

        // Validate Effective To only when editing.
        if (
            isEditMode &&
            formData.effectiveTo &&
            formData.effectiveTo < formData.effectiveFrom
        ) {
            return "Effective To cannot be earlier than Effective From.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const validationError = validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        const payload = {
            hotelId: Number(formData.hotelId),

            // Fixed shift IDs.
            halfDShiftId: 1,
            halfDayRate: Number(formData.halfDayRate),

            fullDShiftId: 2,
            fullDayRate: Number(formData.fullDayRate),

            effectiveFrom: formData.effectiveFrom,

            // Do not send an Effective To date when creating a new rate.
            effectiveTo: isEditMode
                ? formData.effectiveTo || null
                : null,

            isActive: formData.isActive
        };

        try {
            setSaving(true);

            console.log("Hotel rate payload:", {
                id,
                isEditMode,
                payload
            });

            if (isEditMode) {
                await updateHotelRate(id, {
                    ...payload,
                    updatedBy: null
                });
            } else {
                await createHotelRate(payload);
            }

            navigate("/RateMasters/hotel", {
                state: {
                    message: isEditMode
                        ? "Hotel rate updated successfully."
                        : "Hotel rate created successfully."
                }
            });
        } catch (err) {
            console.error(
                "Hotel rate save error:",
                err?.response?.data ?? err
            );

            const apiError = err?.response?.data;

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

            setError(
                message ||
                (err?.response?.status === 404
                    ? "Hotel rate record or endpoint was not found."
                    : err?.response?.status === 405
                        ? "The configured endpoint does not support this HTTP method."
                        : "Unable to save hotel rate. Check the API response.")
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="hotel-rate-page">
            <div className="hotel-rate-header">
                <div>
                    <h1>
                        {isEditMode
                            ? "Edit Hotel Rate"
                            : "Add Hotel Rate"}
                    </h1>

                    <p>
                        {isEditMode
                            ? `Update rate history record ${id}`
                            : "Create a new hotel rate record"}
                    </p>
                </div>
            </div>

            <div className="hotel-rate-form-card">
                {error && (
                    <div className="hotel-rate-alert error">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p>Loading hotel rate details...</p>
                ) : (
                    <form
                        className="hotel-rate-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="hotel-rate-form-grid">
                            {/* Hotel */}
                            <div className="hotel-rate-field full-width">
                                <label htmlFor="hotelId">
                                    Hotel <span>*</span>
                                </label>

                                <select
                                    id="hotelId"
                                    name="hotelId"
                                    value={formData.hotelId}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingHotels || saving}
                                >
                                    <option value="">
                                        {loadingHotels
                                            ? "Loading hotels..."
                                            : "-- Select Hotel --"}
                                    </option>

                                    {hotels.map((hotel) => {
                                        const hotelId =
                                            hotel.hotelId ??
                                            hotel.HotelId;

                                        const hotelName =
                                            hotel.hotelName ??
                                            hotel.HotelName ??
                                            hotel.name ??
                                            hotel.Name;

                                        return (
                                            <option
                                                key={hotelId}
                                                value={hotelId}
                                            >
                                                {hotelName ||
                                                    `Hotel ${hotelId}`}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Half Day Shift ID */}
                            <div className="hotel-rate-field">
                                <label htmlFor="halfDShiftId">
                                    Half Day Shift ID
                                </label>

                                <input
                                    id="halfDShiftId"
                                    type="number"
                                    value={1}
                                    readOnly
                                />
                            </div>

                            {/* Half Day Rate */}
                            <div className="hotel-rate-field">
                                <label htmlFor="halfDayRate">
                                    Half Day Rate <span>*</span>
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

                            {/* Full Day Shift ID */}
                            <div className="hotel-rate-field">
                                <label htmlFor="fullDShiftId">
                                    Full Day Shift ID
                                </label>

                                <input
                                    id="fullDShiftId"
                                    type="number"
                                    value={2}
                                    readOnly
                                />
                            </div>

                            {/* Full Day Rate */}
                            <div className="hotel-rate-field">
                                <label htmlFor="fullDayRate">
                                    Full Day Rate <span>*</span>
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

                            {/* Effective From: visible in Add and Edit */}
                            <div className="hotel-rate-field">
                                <label htmlFor="effectiveFrom">
                                    Effective From <span>*</span>
                                </label>

                                <input
                                    id="effectiveFrom"
                                    name="effectiveFrom"
                                    type="date"
                                    value={formData.effectiveFrom}
                                    onChange={handleChange}
                                    required
                                    disabled={saving}
                                />
                            </div>

                            {/* Effective To: visible only in Edit mode */}
                            {isEditMode && (
                                <div className="hotel-rate-field">
                                    <label htmlFor="effectiveTo">
                                        Effective To
                                    </label>

                                    <input
                                        id="effectiveTo"
                                        name="effectiveTo"
                                        type="date"
                                        min={
                                            formData.effectiveFrom ||
                                            undefined
                                        }
                                        value={formData.effectiveTo}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                </div>
                            )}

                            {/* Active status */}
                            <div className="hotel-rate-field checkbox-field">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                    Active
                                </label>
                            </div>
                        </div>

                        {/* Form buttons */}
                        <div className="hotel-rate-form-actions">
                            <button
                                type="button"
                                className="hotel-rate-cancel"
                                onClick={() =>
                                    navigate("/RateMasters/hotel")
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="hotel-rate-add"
                                disabled={saving || loadingHotels}
                            >
                                {saving
                                    ? "Saving..."
                                    : isEditMode
                                        ? "Update Hotel Rate"
                                        : "Save Hotel Rate"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AddEditHotelRateHistory;
