import React, { useEffect, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import "../CSS/EditEmployeeRate.css";

import DatePicker from "../components/DatePicker";

import {

    getEmployeeRateMasterById,

    updateEmployeeRateMaster

} from "../api/employeeRateMasterApi";

import { getEmployeeById } from "../api/employeeApi";

// Convert API date values to YYYY-MM-DD without timezone shifting.

const toISODate = (dateValue) => {

    if (!dateValue) return "";

    const value = String(dateValue).trim();

    // Handles YYYY-MM-DD and YYYY-MM-DDTHH:mm:ss

    const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);

    if (isoMatch) {

        return isoMatch[1];

    }

    // Handles DD/MM/YYYY

    const displayMatch = value.match(

        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

    );

    if (displayMatch) {

        const [, day, month, year] = displayMatch;

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    }

    return "";

};

const EditEmployeeRateMaster = () => {

    const navigate = useNavigate();

    const { rateId } = useParams();

    const location = useLocation();

    // =========================================================

    // FORM STATE

    // =========================================================

    const [form, setForm] = useState({

        employeeId: "",

        halfDShiftId: 1,

        halfDayRate: "",

        fullDShiftId: 2,

        fullDayRate: "",

        twoHDRShiftId: 3,

        twoHalfDayRate: "",

        effectiveFrom: "",

        effectiveTo: ""

    });

    // =========================================================

    // EMPLOYEE NAME

    // =========================================================

    const [employeeName, setEmployeeName] = useState("");

    // =========================================================

    // LOADING AND SAVING

    // =========================================================

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [popup, setPopup] = useState(null);

    // =========================================================

    // LOAD EMPLOYEE RATE

    // =========================================================

    useEffect(() => {

        if (!rateId) {

            console.error(

                "EmployeeRateHistoryId not found in URL."

            );

            setLoading(false);

            return;

        }

        // Initialize form with router-state rate data, if available.

        const state = location.state;

        if (state && (state.rateData || state.rateRecord)) {

            const rateData = state.rateData ?? state.rateRecord;

            // -------------------------------------------------

            // EMPLOYEE ID

            // -------------------------------------------------

            const employeeId =

                rateData.employeeId ??

                rateData.EmployeeId ??

                rateData.fkEmployeeId ??

                rateData.FkEmployeeId ??

                rateData.fk_EmployeeId ??

                rateData.FK_EmployeeId ??

                "";

            // -------------------------------------------------

            // RATE VALUES

            // -------------------------------------------------

            const halfDayRate =

                rateData.halfDayRate ??

                rateData.HalfDayRate ??

                "";

            const fullDayRate =

                rateData.fullDayRate ??

                rateData.FullDayRate ??

                "";

            const twoHalfDayRate =

                rateData.twoHalfDayRate ??

                rateData.TwoHalfDayRate ??

                "";

            // -------------------------------------------------

            // EFFECTIVE FROM

            // Normalize API date for DatePicker state.

            // State format must be YYYY-MM-DD.

            // -------------------------------------------------

            const effectiveFrom = toISODate(

                rateData.effectiveFrom ??

                rateData.EffectiveFrom ??

                rateData.fromDate ??

                rateData.FromDate ??

                ""

            );

            // -------------------------------------------------

            // EFFECTIVE TO

            // -------------------------------------------------

            const effectiveTo = toISODate(

                rateData.effectiveTo ??

                rateData.EffectiveTo ??

                rateData.toDate ??

                rateData.ToDate ??

                ""

            );

            console.log("EMPLOYEE ID:", employeeId);

            console.log("HALF DAY RATE:", halfDayRate);

            console.log("FULL DAY RATE:", fullDayRate);

            console.log("TWO HALF DAY RATE:", twoHalfDayRate);

            console.log("EFFECTIVE FROM:", effectiveFrom);

            console.log("EFFECTIVE TO:", effectiveTo);

            // -------------------------------------------------

            // SET FORM

            // -------------------------------------------------

            setForm({

                employeeId,

                halfDShiftId: 1,

                halfDayRate,

                fullDShiftId: 2,

                fullDayRate,

                twoHDRShiftId: 3,

                twoHalfDayRate,

                effectiveFrom,

                effectiveTo

            });

            // -------------------------------------------------

            // LOAD EMPLOYEE NAME

            // -------------------------------------------------

            const embeddedEmployeeName =

                rateData.employeeName ??

                rateData.EmployeeName ??

                rateData.fullName ??

                rateData.FullName ??

                rateData.employee?.fullName ??

                rateData.employee?.FullName ??

                rateData.employee?.employeeName ??

                rateData.employee?.EmployeeName ??

                "";

            if (embeddedEmployeeName) {

                setEmployeeName(embeddedEmployeeName);

            }

            if (employeeId) {

                loadEmployee(employeeId);

            }

            setLoading(false);

            return;

        }

        loadRate();

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [rateId]);

    // =========================================================

    // GET RATE BY EmployeeRateHistoryId

    // =========================================================

    const loadRate = async () => {

        const selectedRecord = location.state?.rateRecord;

        if (selectedRecord) {

            const employeeId =
                selectedRecord.employeeId ??
                selectedRecord.EmployeeId ??
                selectedRecord.fkEmployeeId ??
                selectedRecord.FkEmployeeId ??
                selectedRecord.fk_EmployeeId ??
                "";

            setForm({

                employeeId,

                halfDShiftId: selectedRecord.halfDShiftId ?? selectedRecord.HalfDShiftId ?? 1,

                halfDayRate: selectedRecord.halfDayRate ?? selectedRecord.HalfDayRate ?? "",

                fullDShiftId: selectedRecord.fullDShiftId ?? selectedRecord.FullDShiftId ?? 2,

                fullDayRate: selectedRecord.fullDayRate ?? selectedRecord.FullDayRate ?? "",

                twoHDRShiftId: selectedRecord.twoHDRShiftId ?? selectedRecord.TwoHDRShiftId ?? 3,

                twoHalfDayRate: selectedRecord.twoHalfDayRate ?? selectedRecord.TwoHalfDayRate ?? "",

                effectiveFrom: toISODate(
                    selectedRecord.effectiveFrom ??
                    selectedRecord.EffectiveFrom ??
                    selectedRecord.fromDate ??
                    selectedRecord.FromDate
                ),

                effectiveTo: toISODate(
                    selectedRecord.effectiveTo ??
                    selectedRecord.EffectiveTo ??
                    selectedRecord.toDate ??
                    selectedRecord.ToDate
                )

            });

            const selectedName =
                selectedRecord.employeeName ??
                selectedRecord.EmployeeName ??
                selectedRecord.fullName ??
                selectedRecord.FullName ??
                "";

            if (selectedName) setEmployeeName(selectedName);

            if (employeeId) await loadEmployee(employeeId);

            setLoading(false);

        }

        try {

            console.log(

                "GET EMPLOYEE RATE - EmployeeRateHistoryId:",

                rateId

            );

            const response = await getEmployeeRateMasterById(

                Number(rateId)

            );

            console.log("FULL API RESPONSE:", response);

            let data = response.data;

            // APIs may wrap the record or return it directly.

            for (let depth = 0; depth < 3 && data; depth++) {

                if (Array.isArray(data)) {

                    data = data[0];

                    continue;

                }

                if (data?.data && typeof data.data === "object") {

                    data = data.data;

                    continue;

                }

                if (data?.result && typeof data.result === "object") {

                    data = data.result;

                    continue;

                }

                break;

            }

           // console.log("FINAL RATE RECORD:", data);

            if (!data) {

                alert("Employee rate record not found.");

                return;

            }

            // -------------------------------------------------

            // EMPLOYEE ID

            // -------------------------------------------------

            const employeeId =

                data.employeeId ??

                data.EmployeeId ??

                data.fkEmployeeId ??

                data.FkEmployeeId ??

                data.fk_EmployeeId ??

                data.FK_EmployeeId ??

                "";

            // -------------------------------------------------

            // RATE VALUES

            // -------------------------------------------------

            const halfDayRate =

                data.halfDayRate ??

                data.HalfDayRate ??

                "";

            const fullDayRate =

                data.fullDayRate ??

                data.FullDayRate ??

                "";

            const twoHalfDayRate =

                data.twoHalfDayRate ??

                data.TwoHalfDayRate ??

                "";

            // -------------------------------------------------

            // EFFECTIVE FROM

            // Normalize API date for DatePicker state.

            // State format must be YYYY-MM-DD.

            // -------------------------------------------------

            const effectiveFrom = toISODate(

                data.effectiveFrom ??

                data.EffectiveFrom ??

                data.fromDate ??

                data.FromDate ??

                ""

            );

            // -------------------------------------------------

            // EFFECTIVE TO

            // -------------------------------------------------

            const effectiveTo = toISODate(

                data.effectiveTo ??

                data.EffectiveTo ??

                data.toDate ??

                data.ToDate ??

                ""

            );

            console.log("EMPLOYEE ID:", employeeId);

            console.log("HALF DAY RATE:", halfDayRate);

            console.log("FULL DAY RATE:", fullDayRate);

            console.log("TWO HALF DAY RATE:", twoHalfDayRate);

            console.log("EFFECTIVE FROM:", effectiveFrom);

            console.log("EFFECTIVE TO:", effectiveTo);

            // -------------------------------------------------

            // SET FORM

            // -------------------------------------------------

            setForm({

                employeeId,

                halfDShiftId: 1,

                halfDayRate,

                fullDShiftId: 2,

                fullDayRate,

                twoHDRShiftId: 3,

                twoHalfDayRate,

                effectiveFrom,

                effectiveTo

            });

            // -------------------------------------------------

            // LOAD EMPLOYEE NAME

            // -------------------------------------------------

            const embeddedEmployeeName =

                data.employeeName ??

                data.EmployeeName ??

                data.fullName ??

                data.FullName ??

                data.employee?.fullName ??

                data.employee?.FullName ??

                data.employee?.employeeName ??

                data.employee?.EmployeeName ??

                "";

            if (embeddedEmployeeName) {

                setEmployeeName(embeddedEmployeeName);

            }

            if (employeeId) {

                await loadEmployee(employeeId);

            }

        } catch (error) {

            console.error("GET EMPLOYEE RATE ERROR:", error);

            console.error(

                "SERVER RESPONSE:",

                error.response?.data

            );

            alert("Unable to load employee rate.");

        } finally {

            setLoading(false);

        }

    };

    // =========================================================

    // GET EMPLOYEE NAME

    // =========================================================

    const loadEmployee = async (employeeId) => {

        try {

            const response = await getEmployeeById(

                Number(employeeId)

            );

            let employee = response.data;

            // Handle { data: {...} }

            if (employee?.data) {

                employee = employee.data;

            }

            // Handle { result: {...} }

            if (employee?.result) {

                employee = employee.result;

            }

            // Handle array response

            if (Array.isArray(employee)) {

                employee = employee[0];

            }

            const name =

                employee?.employeeName ||

                employee?.EmployeeName ||

                employee?.memberName ||

                employee?.MemberName ||

                employee?.fullName ||

                employee?.FullName ||

                employee?.name ||

                employee?.Name ||

                "";

            setEmployeeName(name);

        } catch (error) {

            console.error("GET EMPLOYEE ERROR:", error);

            console.error(

                "EMPLOYEE API ERROR:",

                error.response?.data

            );

            setEmployeeName((currentName) => currentName || "Employee name unavailable");

        }

    };

    // =========================================================

    // HANDLE NORMAL FORM INPUTS

    // =========================================================

    const showPopup = (title, message, onClose) => {

        setPopup({ title, message, onClose });

    };

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({

            ...prev,

            [name]: value

        }));

    };

    // =========================================================

    // HANDLE SHARED DATE PICKER

    //

    // DatePicker returns a YYYY-MM-DD string.

    // It does not return a DOM event.

    // =========================================================

    const handleDateChange = (name, value) => {

        setForm((prev) => ({

            ...prev,

            [name]: value || ""

        }));

    };

    // =========================================================

    // UPDATE EMPLOYEE RATE

    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        // Validate Effective From

        if (!form.effectiveFrom) {

            alert("Please select an Effective From date.");

            return;

        }

        // Validate date range

        if (

            form.effectiveTo &&

            form.effectiveTo < form.effectiveFrom

        ) {

            alert(

                "Effective To date cannot be earlier than Effective From date."

            );

            return;

        }

        try {

            setSaving(true);

            // -------------------------------------------------

            // UPDATE PAYLOAD

            // Dates remain YYYY-MM-DD for the API.

            // -------------------------------------------------

            const payload = {

                employeeId: Number(form.employeeId),

                halfDShiftId: 1,

                halfDayRate: Number(form.halfDayRate),

                fullDShiftId: 2,

                fullDayRate: Number(form.fullDayRate),

                twoHDRShiftId:

                    form.twoHalfDayRate !== ""

                        ? 3

                        : null,

                twoHalfDayRate:

                    form.twoHalfDayRate !== ""

                        ? Number(form.twoHalfDayRate)

                        : null,

                effectiveFrom: form.effectiveFrom,              

                effectiveTo: form.effectiveTo || null

            };

            // console.log("================================");

            // console.log("UPDATE EMPLOYEE RATE");

            // console.log("EmployeeRateHistoryId:", rateId);

            // console.log("UPDATE PAYLOAD:", payload);

            // console.log("================================");

            const response = await updateEmployeeRateMaster(

                Number(rateId),

                payload

            );

            console.log("UPDATE RESPONSE:", response);

            showPopup("Success!", "Employee rate updated successfully.", () => {

                navigate("/RateMasters/employeerate");

            });

        } catch (error) {

            console.error("UPDATE ERROR:", error);

            console.error(

                "UPDATE RESPONSE ERROR:",

                error.response?.data

            );

            showPopup(

                "Error",

                error.response?.data?.message ||

                "Update failed."

            );

        } finally {

            setSaving(false);

        }

    };

    // =========================================================

    // CANCEL

    // =========================================================

    const handleCancel = () => {

        navigate("/RateMasters/employeerate");

    };

    // =========================================================

    // LOADING SCREEN

    // =========================================================

    if (loading) {

        return (

            <div className="employee-rate-container">

                <div className="employee-rate-form">

                    <h2>Edit Employee Rate</h2>

                    <p>Loading employee rate...</p>

                </div>

            </div>

        );

    }

    // =========================================================

    // FORM UI

    // =========================================================

    return (

        <div className="employee-rate-container">

            <div className="employee-rate-form">

                <h2>Edit Employee Rate</h2>

                <form onSubmit={handleSubmit}>

                    {/* EMPLOYEE */}

                    <div className="form-group">

                        <label>Employee</label>

                        <input

                            type="text"

                            value={employeeName}

                            readOnly

                        />

                    </div>

                    <div className="form-group">

                    </div>

                    {/* HALF DAY SHIFT ID */}

                    <div className="form-group">

                        <label>Half Day Shift ID</label>

                        <input

                            type="number"

                            value={form.halfDShiftId}

                            readOnly

                        />

                    </div>

                    {/* HALF DAY RATE */}

                    <div className="form-group">

                        <label>Half Day Rate</label>

                        <input

                            type="number"

                            name="halfDayRate"

                            value={form.halfDayRate}

                            onChange={handleChange}

                            step="0.01"

                            min="0"

                            required

                        />

                    </div>

                    {/* FULL DAY SHIFT ID */}

                    <div className="form-group">

                        <label>Full Day Shift ID</label>

                        <input

                            type="number"

                            value={form.fullDShiftId}

                            readOnly

                        />

                    </div>

                    {/* FULL DAY RATE */}

                    <div className="form-group">

                        <label>Full Day Rate</label>

                        <input

                            type="number"

                            name="fullDayRate"

                            value={form.fullDayRate}

                            onChange={handleChange}

                            step="0.01"

                            min="0"

                            required

                        />

                    </div>

                    {/* EFFECTIVE FROM */}

                    <div className="form-group">

                        <DatePicker

                            label="Effective From"

                            name="effectiveFrom"

                            value={form.effectiveFrom}

                            onChange={(value) =>

                                handleDateChange(

                                    "effectiveFrom",

                                    value

                                )

                            }

                            required

                            max={form.effectiveTo || undefined}

                            placeholder="DD/MM/YYYY"

                        />

                    </div>

                    {/* EFFECTIVE TO */}

                    <div className="form-group">

                        <DatePicker

                            label="Effective To"

                            name="effectiveTo"

                            value={form.effectiveTo}

                            onChange={(value) =>

                                handleDateChange(

                                    "effectiveTo",

                                    value

                                )

                            }

                            min={form.effectiveFrom || undefined}

                            placeholder="DD/MM/YYYY"

                        />

                    </div>

                    {/* BUTTONS */}

                    <div className="form-buttons">

                        <button

                            type="submit"

                            className="save-btn"

                            disabled={saving}

                        >

                            {saving ? "Updating..." : "Update"}

                        </button>

                        <button

                            type="button"

                            className="cancel-btn"

                            onClick={handleCancel}

                            disabled={saving}

                        >

                            Cancel

                        </button>

                    </div>

                </form>

            </div>

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

export default EditEmployeeRateMaster;