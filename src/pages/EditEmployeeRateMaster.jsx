

import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import "../CSS/EditEmployeeRate.css";

import {
    getEmployeeRateMasterById,
    updateEmployeeRateMaster
} from "../api/employeeRateMasterApi";

import {
    getEmployeeById
} from "../api/employeeApi";


const EditEmployeeRateMaster = () => {

    const navigate = useNavigate();

    // =========================================================
    // URL PARAMETER
    //
    // rateId = EmployeeRateHistoryId
    //
    // Example:
    // /RateMasters/employeerate/edit/10
    //
    // rateId = 10
    // EmployeeRateHistoryId = 10
    // =========================================================

    const {
        rateId
    } = useParams();


    console.log("================================");
    console.log("EDIT EMPLOYEE RATE COMPONENT");
    console.log(
        "EmployeeRateHistoryId:",
        rateId
    );
    console.log("================================");


    // =========================================================
    // FORM
    // =========================================================

    const [
        form,
        setForm
    ] = useState({

        employeeId: "",

        // Fixed shift IDs
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

    const [
        employeeName,
        setEmployeeName
    ] = useState("");


    // =========================================================
    // LOADING
    // =========================================================

    const [
        loading,
        setLoading
    ] = useState(true);


    // =========================================================
    // SAVING
    // =========================================================

    const [
        saving,
        setSaving
    ] = useState(false);


    // =========================================================
    // LOAD RATE RECORD
    // =========================================================

    useEffect(() => {

        if (!rateId) {

            console.error(
                "EmployeeRateHistoryId not found in URL."
            );

            setLoading(false);

            return;
        }


        loadRate();

    }, [rateId]);


    // =========================================================
    // GET RATE BY EmployeeRateHistoryId
    // =========================================================

    const loadRate = async () => {
    try {
        console.log("================================");
        console.log("GET EMPLOYEE RATE");
        console.log("EmployeeRateHistoryId:", rateId);
        console.log("================================");

        const response = await getEmployeeRateMasterById(
            Number(rateId)
        );

        console.log("FULL API RESPONSE:", response);
        console.log("API RESPONSE DATA:", response.data);

        // --------------------------------------------------
        // HANDLE DIFFERENT API RESPONSE STRUCTURES
        // --------------------------------------------------

        let data = response.data;

        // If API returns:
        // { data: { employeeId: 1, ... } }
        if (data?.data) {
            data = data.data;
        }

        // If API returns:
        // { result: { employeeId: 1, ... } }
        if (data?.result) {
            data = data.result;
        }

        // If API returns array
        if (Array.isArray(data)) {
            data = data[0];
        }

        console.log("FINAL RECORD USED FOR FORM:", data);

        if (!data) {
            console.error("No employee rate record found.");
            alert("Employee rate record not found.");
            return;
        }

        // --------------------------------------------------
        // GET VALUES
        // --------------------------------------------------

        const employeeId =
            data.employeeId ??
            data.EmployeeId ??
            data.fk_EmployeeId ??
            "";

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

        const effectiveFrom =
            data.effectiveFrom ??
            data.EffectiveFrom ??
            "";

        const effectiveTo =
            data.effectiveTo ??
            data.EffectiveTo ??
            "";

        console.log("EMPLOYEE ID:", employeeId);
        console.log("HALF DAY RATE:", halfDayRate);
        console.log("FULL DAY RATE:", fullDayRate);
        console.log("TWO HALF DAY RATE:", twoHalfDayRate);
        console.log("EFFECTIVE FROM:", effectiveFrom);
        console.log("EFFECTIVE TO:", effectiveTo);

        // --------------------------------------------------
        // SET FORM
        // --------------------------------------------------

        setForm({
            employeeId: employeeId,

            // Fixed values
            halfDShiftId: 1,

            halfDayRate: halfDayRate,

            fullDShiftId: 2,

            fullDayRate: fullDayRate,

            twoHDRShiftId: 3,

            twoHalfDayRate: twoHalfDayRate,

            effectiveFrom: effectiveFrom
                ? String(effectiveFrom).substring(0, 10)
                : "",

            effectiveTo: effectiveTo
                ? String(effectiveTo).substring(0, 10)
                : ""
        });

        // --------------------------------------------------
        // LOAD ONLY THIS EMPLOYEE
        // --------------------------------------------------

        if (employeeId) {
            console.log(
                "Loading employee:",
                employeeId
            );

            await loadEmployee(employeeId);
        }

    } catch (error) {

        console.error(
            "GET EMPLOYEE RATE ERROR:",
            error
        );

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
    // GET EMPLOYEE BY EmployeeId
    // Only used to display employee name
    // =========================================================

   const loadEmployee = async (employeeId) => {
    try {
        console.log("================================");
        console.log("GET EMPLOYEE");
        console.log("EmployeeId:", employeeId);
        console.log("================================");

        const response = await getEmployeeById(Number(employeeId));

        console.log("FULL EMPLOYEE RESPONSE:", response);
        console.log("EMPLOYEE RESPONSE DATA:", response.data);

        let employee = response.data;

        // Handle:
        // { data: {...} }
        if (employee?.data) {
            employee = employee.data;
        }

        // Handle:
        // { result: {...} }
        if (employee?.result) {
            employee = employee.result;
        }

        // Handle array response
        if (Array.isArray(employee)) {
            employee = employee[0];
        }

        console.log("FINAL EMPLOYEE OBJECT:", employee);

        // Get employee name
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

        console.log("FINAL EMPLOYEE NAME:", name);

        setEmployeeName(name);

    } catch (error) {

        console.error("GET EMPLOYEE ERROR:", error);
        console.error(
            "EMPLOYEE API ERROR:",
            error.response?.data
        );

        setEmployeeName("");
    }
};

    // =========================================================
    // HANDLE FORM CHANGE
    // =========================================================

    const handleChange = (
        e
    ) => {

        const {
            name,
            value
        } = e.target;


        setForm(
            prev => ({
                ...prev,
                [name]: value
            })
        );

    };


    // =========================================================
    // UPDATE
    // =========================================================

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();


        try {

            setSaving(true);


            // =====================================================
            // UPDATE PAYLOAD
            //
            // EmployeeRateHistoryId is NOT sent in payload.
            //
            // It is passed separately in URL:
            //
            // PUT /EmployeeRateHistory/{id}
            // =====================================================

            const payload = {

                employeeId:
                    Number(
                        form.employeeId
                    ),


                // Fixed
                halfDShiftId: 1,


                halfDayRate:
                    Number(
                        form.halfDayRate
                    ),


                // Fixed
                fullDShiftId: 2,


                fullDayRate:
                    Number(
                        form.fullDayRate
                    ),


                // Fixed
                twoHDRShiftId:
                    form.twoHalfDayRate !== ""
                        ? 3
                        : null,


                twoHalfDayRate:
                    form.twoHalfDayRate !== ""
                        ? Number(
                            form.twoHalfDayRate
                        )
                        : null,


                effectiveFrom:
                    form.effectiveFrom,


                effectiveTo:
                    form.effectiveTo || null
            };


            console.log("================================");
            console.log(
                "UPDATE EMPLOYEE RATE"
            );
            console.log(
                "EmployeeRateHistoryId:",
                rateId
            );
            console.log(
                "UPDATE PAYLOAD:",
                payload
            );
            console.log("================================");


            // =====================================================
            // IMPORTANT
            //
            // rateId = EmployeeRateHistoryId
            //
            // PUT:
            // /api/EmployeeRateHistory/{EmployeeRateHistoryId}
            // =====================================================

            const response =
                await updateEmployeeRateMaster(
                    Number(rateId),
                    payload
                );


            console.log(
                "UPDATE RESPONSE:",
                response
            );


            alert(
                "Employee rate updated successfully."
            );


            navigate(
                "/RateMasters/employeerate"
            );

        }
        catch (error) {

            console.error(
                "UPDATE ERROR:",
                error
            );


            console.error(
                "UPDATE RESPONSE ERROR:",
                error.response?.data
            );


            alert(
                error.response?.data?.message ||
                "Update failed."
            );

        }
        finally {

            setSaving(false);

        }

    };


    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {

        navigate(
            "/RateMasters/employeerate"
        );

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="employee-rate-container">

                <div className="employee-rate-form">

                    <h2>
                        Edit Employee Rate
                    </h2>

                    <p>
                        Loading employee rate...
                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // FORM
    // =========================================================

    return (

        <div className="employee-rate-container">

            <div className="employee-rate-form">

                <h2>
                    Edit Employee Rate
                </h2>


                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="form-group">

                        <label>
                            -
                        </label>                        

                    </div>
                    {/* ==========================================
                        EMPLOYEE
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Employee
                        </label>


                        <input
                            type="text"
                            value={
                                employeeName 
                            }
                            readOnly
                        />

                    </div>


                    {/* ==========================================
                        HALF DAY SHIFT
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Half Day Shift ID
                        </label>


                        <input
                            type="number"
                            value={
                                form.halfDShiftId
                            }
                            readOnly
                        />

                    </div>


                    {/* ==========================================
                        HALF DAY RATE
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Half Day Rate
                        </label>


                        <input
                            type="number"
                            name="halfDayRate"
                            value={
                                form.halfDayRate
                            }
                            onChange={
                                handleChange
                            }
                            step="0.01"
                            required
                        />

                    </div>


                    {/* ==========================================
                        FULL DAY SHIFT
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Full Day Shift ID
                        </label>


                        <input
                            type="number"
                            value={
                                form.fullDShiftId
                            }
                            readOnly
                        />

                    </div>


                    {/* ==========================================
                        FULL DAY RATE
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Full Day Rate
                        </label>


                        <input
                            type="number"
                            name="fullDayRate"
                            value={
                                form.fullDayRate
                            }
                            onChange={
                                handleChange
                            }
                            step="0.01"
                            required
                        />

                    </div>


                    {/* ==========================================
                        TWO HALF DAY SHIFT
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Two Half Day Shift ID
                        </label>


                        <input
                            type="number"
                            value={
                                form.twoHDRShiftId
                            }
                            readOnly
                        />

                    </div>


                    {/* ==========================================
                        TWO HALF DAY RATE
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Two Half Day Rate
                        </label>


                        <input
                            type="number"
                            name="twoHalfDayRate"
                            value={
                                form.twoHalfDayRate
                            }
                            onChange={
                                handleChange
                            }
                            step="0.01"
                        />

                    </div>


                    {/* ==========================================
                        EFFECTIVE FROM
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Effective From
                        </label>


                        <input
                            type="date"
                            name="effectiveFrom"
                            value={
                                form.effectiveFrom
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                    </div>


                    {/* ==========================================
                        EFFECTIVE TO
                    ========================================== */}

                    <div className="form-group">

                        <label>
                            Effective To
                        </label>


                        <input
                            type="date"
                            name="effectiveTo"
                            value={
                                form.effectiveTo
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>


                    {/* ==========================================
                        BUTTONS
                    ========================================== */}

                    <div className="form-buttons">

                        <button
                            type="submit"
                            className="save-btn"
                            disabled={saving}
                        >

                            {
                                saving
                                    ? "Updating..."
                                    : "Update"
                            }

                        </button>


                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={
                                handleCancel
                            }
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};


export default EditEmployeeRateMaster;