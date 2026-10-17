import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../CSS/EmployeeRateMaster.css";
import DatePicker from "../components/DatePicker";

import { GetEmployeesWithoutRateHistory } from "../api/employeeApi";
import {
    createEmployeeRateMaster,
    updateEmployeeRateMaster,
    getEmployeeRateMasterById
} from "../api/employeeRateMasterApi";

// Convert API date values (yyyy-MM-dd, ISO datetime, or dd/MM/yyyy)
// into yyyy-MM-dd, which is the value format used by DatePicker and the API.
const toInputDate = (dateValue) => {
    if (!dateValue) return "";

    const value = String(dateValue).trim();
    const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) return isoMatch[1];

    const displayMatch = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (displayMatch) {
        return `${displayMatch[3]}-${displayMatch[2]}-${displayMatch[1]}`;
    }

    return "";
};

const AddEmployeeRateMaster = () => {
    const navigate = useNavigate();
    const { rateId } = useParams();
    const isEditMode = Boolean(rateId);

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        employeeId: "",
        halfShiftId: 1,
        halfDayRate: "",
        fullShiftId: 2,
        fullDayRate: "",
        twoHalfDayShiftId: 3,
        twoHalfDayRate: "",
        effectiveFrom: "",
        effectiveTo: ""
    });

    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        if (rateId) {
            loadEmployeeRate(rateId);
        }
    }, [rateId]);

    const loadEmployees = async () => {
        try {
            const response = await GetEmployeesWithoutRateHistory(1, 2000);
            const data = response.data;

            if (Array.isArray(data)) {
                setEmployees(data);
            } else if (Array.isArray(data?.items)) {
                setEmployees(data.items);
            } else if (Array.isArray(data?.data)) {
                setEmployees(data.data);
            } else if (Array.isArray(data?.employees)) {
                setEmployees(data.employees);
            } else {
                setEmployees([]);
            }
        } catch (error) {
            console.error(
                "Error loading employees:",
                error.response?.data || error
            );
            setEmployees([]);
            alert("Unable to load employees.");
        }
    };

    const loadEmployeeRate = async (id) => {
        try {
            setLoading(true);

            const response = await getEmployeeRateMasterById(id);
            const data = response.data;

            setForm({
                employeeId: data.employeeId ?? "",
                halfShiftId: data.halfDShiftId ?? 1,
                halfDayRate: data.halfDayRate ?? "",
                fullShiftId: data.fullDShiftId ?? 2,
                fullDayRate: data.fullDayRate ?? "",
                twoHalfDayShiftId: data.twoHDRShiftId ?? 3,
                twoHalfDayRate: data.twoHalfDayRate ?? "",
                effectiveFrom: toInputDate(data.effectiveFrom),
                effectiveTo: toInputDate(data.effectiveTo)
            });
        } catch (error) {
            console.error(
                "EDIT API ERROR:",
                error.response?.data || error
            );
            alert("Unable to load employee rate details.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleDateChange = (name, dateValue) => {
        setForm((previous) => ({
            ...previous,
            [name]: dateValue,
            // Clear Effective To if it would become earlier than Effective From.
            ...(name === "effectiveFrom" &&
            previous.effectiveTo &&
            previous.effectiveTo < dateValue
                ? { effectiveTo: "" }
                : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.employeeId) {
            alert("Please select an employee.");
            return;
        }

        if (form.halfDayRate === "") {
            alert("Please enter Half Day Rate.");
            return;
        }

        if (form.fullDayRate === "") {
            alert("Please enter Full Day Rate.");
            return;
        }

        if (!form.effectiveFrom) {
            alert("Please select Effective From date.");
            return;
        }

        if (
            form.effectiveTo &&
            form.effectiveTo < form.effectiveFrom
        ) {
            alert("Effective To cannot be earlier than Effective From.");
            return;
        }

        // Dates stay in yyyy-MM-dd format in state and in the API payload.
        const payload = {
            employeeId: Number(form.employeeId),
            halfDShiftId: Number(form.halfShiftId),
            halfDayRate: Number(form.halfDayRate),
            fullDShiftId: Number(form.fullShiftId),
            fullDayRate: Number(form.fullDayRate),
            twoHDRShiftId:
                form.twoHalfDayRate !== ""
                    ? Number(form.twoHalfDayShiftId)
                    : null,
            twoHalfDayRate:
                form.twoHalfDayRate !== ""
                    ? Number(form.twoHalfDayRate)
                    : null,
            effectiveFrom: form.effectiveFrom,
            effectiveTo: form.effectiveTo || null
        };

        try {
            setLoading(true);

            if (isEditMode) {
                await updateEmployeeRateMaster(rateId, payload);
                alert("Employee rate updated successfully.");
            } else {
                await createEmployeeRateMaster(payload);
                alert("Employee rate saved successfully.");
            }

            navigate("/RateMasters/employeerate");
        } catch (error) {
            console.error("Employee rate save error:", error);
            console.error("API Response:", error.response?.data);

            alert(
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Unable to save employee rate."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/RateMasters/employeerate");
    };

    return (
        <div className="employee-rate-page">
            <div className="employee-rate-header">
                <div>
                    <h2>
                        {isEditMode ? "Edit Employee Rate" : "Add Employee Rate"}
                    </h2>
                    <p>Enter employee rate details</p>
                </div>
            </div>

            <div className="employee-rate-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="employeeId">Employee</label>
                            <select
                                id="employeeId"
                                name="employeeId"
                                value={form.employeeId}
                                onChange={handleChange}
                                disabled={isEditMode || loading}
                                required
                            >
                                <option value="">-- Select Employee --</option>
                                {employees.map((employee) => (
                                    <option
                                        key={employee.employeeId}
                                        value={employee.employeeId}
                                    >
                                        {employee.fullName || "-"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="halfShiftId">Half Day Shift ID</label>
                            <input
                                id="halfShiftId"
                                type="number"
                                name="halfShiftId"
                                value={form.halfShiftId}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="halfDayRate">Half Day Rate</label>
                            <input
                                id="halfDayRate"
                                type="number"
                                name="halfDayRate"
                                value={form.halfDayRate}
                                onChange={handleChange}
                                placeholder="Enter Half Day Rate"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fullShiftId">Full Day Shift ID</label>
                            <input
                                id="fullShiftId"
                                type="number"
                                name="fullShiftId"
                                value={form.fullShiftId}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullDayRate">Full Day Rate</label>
                            <input
                                id="fullDayRate"
                                type="number"
                                name="fullDayRate"
                                value={form.fullDayRate}
                                onChange={handleChange}
                                placeholder="Enter Full Day Rate"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="twoHalfDayShiftId">
                                Two Half Day Shift ID
                            </label>
                            <input
                                id="twoHalfDayShiftId"
                                type="number"
                                name="twoHalfDayShiftId"
                                value={form.twoHalfDayShiftId}
                                readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="twoHalfDayRate">Two Half Day Rate</label>
                            <input
                                id="twoHalfDayRate"
                                type="number"
                                name="twoHalfDayRate"
                                value={form.twoHalfDayRate}
                                onChange={handleChange}
                                placeholder="Enter Two Half Day Rate"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <DatePicker
                                id="effectiveFrom"
                                name="effectiveFrom"
                                label="Effective From"
                                value={form.effectiveFrom}
                                onChange={(dateValue) =>
                                    handleDateChange("effectiveFrom", dateValue)
                                }
                                required
                                placeholder="DD/MM/YYYY"
                            />
                        </div>

                        {/* <div className="form-group">
                            <DatePicker
                                id="effectiveTo"
                                name="effectiveTo"
                                label="Effective To"
                                value={form.effectiveTo}
                                onChange={(dateValue) =>
                                    handleDateChange("effectiveTo", dateValue)
                                }
                                min={form.effectiveFrom || undefined}
                                placeholder="DD/MM/YYYY"
                            />
                        </div> */}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="save-rate-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : isEditMode
                                    ? "Update"
                                    : "Save"}
                        </button>

                        <button
                            type="button"
                            className="cancel-rate-btn"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeRateMaster;
