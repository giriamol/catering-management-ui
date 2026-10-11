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

import "../CSS/EmployeeAdvance.css";


function AddEditEmployeeAdvance() {

    const navigate = useNavigate();

    const { id } = useParams();

    const isEdit = Boolean(id);


    // =========================================================
    // EMPLOYEES FROM EMPLOYEE RATE MASTER
    // =========================================================

    const [employees, setEmployees] = useState([]);

    const [loadingEmployees, setLoadingEmployees] =
        useState(false);


    // =========================================================
    // FORM
    // =========================================================

    const [formData, setFormData] = useState({

        employeeId: "",

        advanceDate:
            new Date()
                .toISOString()
                .split("T")[0],

        amount: "",

        description: "",

        isAdjusted: false
    });


    const [loading, setLoading] = useState(false);


    // =========================================================
    // IMPORTANT
    // PREVENT DOUBLE API CALL
    // =========================================================

    const submittingRef = useRef(false);


    // =========================================================
    // LOAD EMPLOYEES
    // ONLY EMPLOYEES AVAILABLE IN EMPLOYEE RATE MASTER
    // =========================================================

    const loadEmployees = async () => {

        try {

            setLoadingEmployees(true);

            const response =
                await getAllEmployeeRateMasters();

            console.log(
                "Employee Rate Master Employees:",
                response.data
            );

            const data = response.data;

            const employeeList =
                Array.isArray(data)
                    ? data
                    : data?.items || [];

            setEmployees(employeeList);

        } catch (error) {

            console.error(
                "Error loading RateMaster employees:",
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


    // =========================================================
    // LOAD EDIT RECORD
    // =========================================================

    const loadAdvance = async () => {

        try {

            setLoading(true);

            const response =
                await getEmployeeAdvanceById(id);

            const data =
                response.data;

            console.log(
                "Employee Advance:",
                data
            );

            setFormData({

                employeeId:
                    data.employeeId ?? "",

                advanceDate:
                    data.advanceDate
                        ? data.advanceDate.substring(0, 10)
                        : "",

                amount:
                    data.amount ?? "",

                description:
                    data.description ?? "",

                isAdjusted:
                    data.isAdjusted ?? false
            });

        } catch (error) {

            console.error(
                "Error loading advance:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load employee advance."
            );

            navigate(
                "/advances/employee"
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadEmployees();

        if (isEdit) {

            loadAdvance();

        }

    }, [id]);


    // =========================================================
    // HANDLE CHANGE
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData((prev) => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));
    };


    // =========================================================
    // VALIDATION
    // =========================================================

    const validate = () => {

        if (!formData.employeeId) {

            alert(
                "Please select employee."
            );

            return false;
        }


        if (!formData.advanceDate) {

            alert(
                "Please select advance date."
            );

            return false;
        }


        if (
            !formData.amount ||
            Number(formData.amount) <= 0
        ) {

            alert(
                "Please enter a valid advance amount."
            );

            return false;
        }


        return true;
    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        // -----------------------------------------------------
        // VERY IMPORTANT
        // If request is already running, don't call API again.
        // -----------------------------------------------------

        if (submittingRef.current) {

            console.log(
                "Duplicate submit ignored."
            );

            return;
        }


        // -----------------------------------------------------
        // VALIDATE
        // -----------------------------------------------------

        if (!validate()) {

            return;
        }


        // -----------------------------------------------------
        // LOCK IMMEDIATELY
        // -----------------------------------------------------

        submittingRef.current = true;

        setLoading(true);


        const payload = {

            employeeId:
                Number(formData.employeeId),

            advanceDate:
                formData.advanceDate,

            amount:
                Number(formData.amount),

            description:
                formData.description.trim() || null,

            isAdjusted:
                Boolean(formData.isAdjusted)
        };


        console.log(
            "Employee Advance Payload:",
            payload
        );


        try {

            // =================================================
            // UPDATE
            // =================================================

            if (isEdit) {

                console.log(
                    "Calling UPDATE Employee Advance API..."
                );

                await updateEmployeeAdvance(
                    id,
                    payload
                );

                alert(
                    "Employee advance updated successfully."
                );

            }

            // =================================================
            // CREATE
            // =================================================

            else {

                console.log(
                    "Calling CREATE Employee Advance API..."
                );

                await createEmployeeAdvance(
                    payload
                );

                alert(
                    "Employee advance created successfully."
                );
            }


            // =================================================
            // NAVIGATE
            // =================================================

            navigate(
                "/advances/employee"
            );

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

            setLoading(false);

            submittingRef.current = false;
        }
    };


    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {

        if (loading) {

            return;
        }

        navigate(
            "/advances/employee"
        );
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="employee-advance-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="employee-advance-header">

                <div>

                    <h1>
                        {
                            isEdit
                                ? "Edit Employee Advance"
                                : "Add Employee Advance"
                        }
                    </h1>

                    <p>
                        {
                            isEdit
                                ? "Update employee advance details."
                                : "Create a new employee advance."
                        }
                    </p>

                </div>

            </div>


            {/* =================================================
                FORM CARD
            ================================================= */}

            <div className="employee-advance-form-card">

                {
                    loading && isEdit ? (

                        <div className="loading-message">
                            Loading...
                        </div>

                    ) : (

                        <form
                            onSubmit={handleSubmit}
                        >


                            {/* =================================================
                                ROW 1
                            ================================================= */}

                            <div className="form-row">


                                {/* EMPLOYEE */}

                                <div className="form-group">

                                    <label>

                                        Employee

                                        <span className="required">
                                            *
                                        </span>

                                    </label>


                                    <select
                                        name="employeeId"
                                        value={
                                            formData.employeeId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            loadingEmployees ||
                                            loading
                                        }
                                    >

                                        <option value="">

                                            {
                                                loadingEmployees
                                                    ? "Loading employees..."
                                                    : "Select Employee"
                                            }

                                        </option>


                                        {
                                            employees.map(
                                                (employee) => (

                                                    <option
                                                        key={
                                                            employee.employeeId
                                                        }
                                                        value={
                                                            employee.employeeId
                                                        }
                                                    >

                                                        {
                                                            employee.employeeName ||
                                                            employee.fullName ||
                                                            employee.name ||
                                                            "Unknown Employee"
                                                        }

                                                    </option>

                                                )
                                            )
                                        }

                                    </select>

                                </div>


                                {/* ADVANCE DATE */}

                                <div className="form-group">

                                    <label>

                                        Advance Date

                                        <span className="required">
                                            *
                                        </span>

                                    </label>


                                    <input
                                        type="date"
                                        name="advanceDate"
                                        value={
                                            formData.advanceDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={loading}
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                ROW 2
                            ================================================= */}

                            <div className="form-row">


                                {/* AMOUNT */}

                                <div className="form-group">

                                    <label>

                                        Advance Amount

                                        <span className="required">
                                            *
                                        </span>

                                    </label>


                                    <input
                                        type="number"
                                        name="amount"
                                        value={
                                            formData.amount
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="0.01"
                                        step="0.01"
                                        placeholder="Enter advance amount"
                                        disabled={loading}
                                    />

                                </div>


                                {/* EMPTY COLUMN */}

                                <div className="form-group">

                                </div>

                            </div>


                            {/* =================================================
                                ROW 3
                            ================================================= */}

                            <div className="form-row">

                                <div className="form-group full-width">

                                    <label>
                                        Description
                                    </label>


                                    <textarea
                                        name="description"
                                        value={
                                            formData.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength="500"
                                        rows="4"
                                        placeholder="Enter description"
                                        disabled={loading}
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                BUTTONS
                            ================================================= */}

                            <div className="form-actions">


                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        handleCancel
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={
                                        loading ||
                                        submittingRef.current
                                    }
                                >

                                    {
                                        loading

                                            ? (
                                                isEdit
                                                    ? "Updating..."
                                                    : "Saving..."
                                            )

                                            : (
                                                isEdit
                                                    ? "Update Advance"
                                                    : "Save Advance"
                                            )
                                    }

                                </button>

                            </div>

                        </form>

                    )
                }

            </div>

        </div>
    );
}

export default AddEditEmployeeAdvance;