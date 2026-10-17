
import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getEmployeeAdvanceById,
    createEmployeeAdvance,
    updateEmployeeAdvance
} from "../api/employeeAdvanceApi";

import {
    getAllEmployeeRateMasters
} from "../api/employeeRateMasterApi";

import DatePicker from "../components/DatePicker";

import "../CSS/EmployeeAdvance.css";

function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function normalizeDate(dateValue) {
    if (!dateValue) return "";

    // Handles ISO strings such as 2026-10-15T00:00:00
    return String(dateValue).substring(0, 10);
}

function AddEditEmployeeAdvance() {
    const navigate = useNavigate();
    const { id } = useParams();

    const isEdit = Boolean(id);
    const submittingRef = useRef(false);

    const [employees, setEmployees] = useState([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        employeeId: "",
        advanceDate: getTodayDate(),
        amount: "",
        description: "",
        isAdjusted: false
    });

    // ---------------------------------------------------------
    // LOAD EMPLOYEES
    // ---------------------------------------------------------

    const loadEmployees = async () => {
        try {
            setLoadingEmployees(true);

            const response = await getAllEmployeeRateMasters();
            const data = response.data;

            const employeeList = Array.isArray(data)
                ? data
                : data?.items || [];

            setEmployees(employeeList);
        } catch (error) {
            console.error(
                "Error loading employees:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load employees from Employee Rate Master."
            );
        } finally {
            setLoadingEmployees(false);
        }
    };

    // ---------------------------------------------------------
    // LOAD EXISTING ADVANCE FOR EDIT
    // ---------------------------------------------------------

    const loadAdvance = async () => {
        try {
            setLoading(true);

            const response = await getEmployeeAdvanceById(id);
            const data = response.data;

            setFormData({
                employeeId: data.employeeId ?? "",
                advanceDate: normalizeDate(data.advanceDate),
                amount: data.amount ?? "",
                description: data.description ?? "",
                isAdjusted: data.isAdjusted ?? false
            });
        } catch (error) {
            console.error(
                "Error loading employee advance:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load employee advance."
            );

            navigate("/advances/employee");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // INITIAL LOAD
    // ---------------------------------------------------------

    useEffect(() => {
        loadEmployees();

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
    // Supports a DatePicker returning either a string or event.
    // ---------------------------------------------------------

    const handleDateChange = (selectedDate) => {
        const dateValue =
            typeof selectedDate === "string"
                ? selectedDate
                : selectedDate?.target?.value;

        setFormData((prev) => ({
            ...prev,
            advanceDate: normalizeDate(dateValue)
        }));
    };

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    const validate = () => {
        if (!formData.employeeId) {
            alert("Please select employee.");
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
    // SAVE / UPDATE
    // ---------------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submittingRef.current) return;

        if (!validate()) return;

        submittingRef.current = true;
        setLoading(true);

        const payload = {
            employeeId: Number(formData.employeeId),

            // Send a date-only string: YYYY-MM-DD
            advanceDate: formData.advanceDate,

            amount: Number(formData.amount),
            description: formData.description.trim() || null,
            isAdjusted: Boolean(formData.isAdjusted)
        };

        console.log("Employee Advance Payload:", payload);

        try {
            if (isEdit) {
                await updateEmployeeAdvance(id, payload);
                alert("Employee advance updated successfully.");
            } else {
                await createEmployeeAdvance(payload);
                alert("Employee advance created successfully.");
            }

            navigate("/advances/employee");
        } catch (error) {
            console.error(
                "Save employee advance error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to save employee advance."
            );
        } finally {
            submittingRef.current = false;
            setLoading(false);
        }
    };

    // ---------------------------------------------------------
    // CANCEL
    // ---------------------------------------------------------

    const handleCancel = () => {
        if (loading) return;

        navigate("/advances/employee");
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
                            ? "Edit Employee Advance"
                            : "Add Employee Advance"}
                    </h1>

                    <p>
                        {isEdit
                            ? "Update employee advance details."
                            : "Create a new employee advance."}
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
                            <div className="form-group">
                                <label>
                                    Employee
                                    <span className="required">*</span>
                                </label>

                                <select
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    disabled={loadingEmployees || loading}
                                    required
                                >
                                    <option value="">
                                        {loadingEmployees
                                            ? "Loading employees..."
                                            : "Select Employee"}
                                    </option>

                                    {employees.map((employee) => (
                                        <option
                                            key={employee.employeeId}
                                            value={employee.employeeId}
                                        >
                                            {employee.employeeName ||
                                                employee.fullName ||
                                                employee.name ||
                                                "Unknown Employee"}
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
                                disabled={loading || loadingEmployees}
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

export default AddEditEmployeeAdvance;
