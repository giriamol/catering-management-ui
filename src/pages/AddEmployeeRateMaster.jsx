import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import "../CSS/EmployeeRateMaster.css";

import {
    getEmployees
} from "../api/employeeApi";

import {
    createEmployeeRateMaster,
    updateEmployeeRateMaster,
    getEmployeeRateMasterById
} from "../api/employeeRateMasterApi";


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

            const response =
                await getEmployees(1, 2000);

            const data = response.data;

            if (Array.isArray(data)) {

                setEmployees(data);

            }
            else if (Array.isArray(data?.items)) {

                setEmployees(data.items);

            }
            else if (Array.isArray(data?.data)) {

                setEmployees(data.data);

            }
            else if (Array.isArray(data?.employees)) {

                setEmployees(data.employees);

            }
            else {

                setEmployees([]);

            }

        }
        catch (error) {

            console.error(
                "Error loading employees:",
                error.response?.data || error
            );

            setEmployees([]);

            alert(
                "Unable to load employees."
            );

        }

    };


    const loadEmployeeRate = async (id) => {
    try {
        setLoading(true);

        const response = await getEmployeeRateMasterById(id);

        console.log("EDIT API RESPONSE:", response.data);

        const data = response.data;

        setForm({
            employeeId: data.employeeId ?? "",
            halfShiftId: data.halfDShiftId ?? 1,
            halfDayRate: data.halfDayRate ?? "",
            fullShiftId: data.fullDShiftId ?? 2,
            fullDayRate: data.fullDayRate ?? "",
            twoHalfDayShiftId: data.twoHDRShiftId ?? 3,
            twoHalfDayRate: data.twoHalfDayRate ?? "",
            effectiveFrom: data.effectiveFrom
                ? String(data.effectiveFrom).substring(0, 10)
                : "",
            effectiveTo: data.effectiveTo
                ? String(data.effectiveTo).substring(0, 10)
                : ""
        });

    } catch (error) {
        console.error(
            "EDIT API ERROR:",
            error.response?.data || error
        );
    } finally {
        setLoading(false);
    }
};


    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm(
            previous => ({

                ...previous,

                [name]: value

            })
        );

    };


    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!form.employeeId) {

            alert(
                "Please select an employee."
            );

            return;

        }


        if (form.halfDayRate === "") {

            alert(
                "Please enter Half Day Rate."
            );

            return;

        }


        if (form.fullDayRate === "") {

            alert(
                "Please enter Full Day Rate."
            );

            return;

        }


        if (!form.effectiveFrom) {

            alert(
                "Please select Effective From date."
            );

            return;

        }


        if (
            form.effectiveTo &&
            form.effectiveTo < form.effectiveFrom
        ) {

            alert(
                "Effective To cannot be earlier than Effective From."
            );

            return;

        }


        const payload = {

            employeeId:
                Number(
                    form.employeeId
                ),

            halfDShiftId:
                Number(
                    form.halfShiftId
                ),

            halfDayRate:
                Number(
                    form.halfDayRate
                ),

            fullDShiftId:
                Number(
                    form.fullShiftId
                ),

            fullDayRate:
                Number(
                    form.fullDayRate
                ),

            twoHDRShiftId:
                form.twoHalfDayRate !== ""
                    ? Number(
                        form.twoHalfDayShiftId
                    )
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


        console.log(
            "Employee Rate Payload:",
            payload
        );


        try {

            setLoading(true);


            if (isEditMode) {

                await updateEmployeeRateMaster(
                    rateId,
                    payload
                );

                alert(
                    "Employee rate updated successfully."
                );

            }
            else {

                await createEmployeeRateMaster(
                    payload
                );

                alert(
                    "Employee rate saved successfully."
                );

            }


            navigate(
                "/RateMasters/employeerate"
            );

        }
        catch (error) {

            console.error(
                "Employee rate save error:",
                error
            );

            console.error(
                "API Response:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Unable to save employee rate."
            );

        }
        finally {

            setLoading(false);

        }

    };


    const handleCancel = () => {

        navigate(
            "/RateMasters/employeerate"
        );

    };


    return (

        <div className="employee-rate-page">

            <div className="employee-rate-header">

                <div>

                    <h2>

                        {
                            isEditMode
                                ? "Edit Employee Rate"
                                : "Add Employee Rate"
                        }

                    </h2>

                    <p>
                        Enter employee rate details
                    </p>

                </div>

            </div>


            <div className="employee-rate-form-card">

                <form
                    onSubmit={handleSubmit}
                >

                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Employee
                            </label>

                            <select
                                name="employeeId"
                                value={
                                    form.employeeId
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    isEditMode
                                }
                            >

                                <option value="">
                                    -- Select Employee --
                                </option>

                                {employees.map(
                                    employee => (

                                        <option
                                            key={
                                                employee.employeeId
                                            }
                                            value={
                                                employee.employeeId
                                            }
                                        >
                                            {
                                                employee.fullName ||
                                                "-"
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Half Day Shift ID
                            </label>

                            <input
                                type="number"
                                name="halfShiftId"
                                value={
                                    form.halfShiftId
                                }
                                readOnly
                            />

                        </div>


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
                                placeholder="Enter Half Day Rate"
                                min="0"
                                step="0.01"
                            />

                        </div>

                    </div>


                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Full Day Shift ID
                            </label>

                            <input
                                type="number"
                                name="fullShiftId"
                                value={
                                    form.fullShiftId
                                }
                                readOnly
                            />

                        </div>


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
                                placeholder="Enter Full Day Rate"
                                min="0"
                                step="0.01"
                            />

                        </div>

                    </div>


                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Two Half Day Shift ID
                            </label>

                            <input
                                type="number"
                                name="twoHalfDayShiftId"
                                value={
                                    form.twoHalfDayShiftId
                                }
                                readOnly
                            />

                        </div>


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
                                placeholder="Enter Two Half Day Rate"
                                min="0"
                                step="0.01"
                            />

                        </div>

                    </div>


                    <div className="form-row">

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
                            />

                        </div>


                        {/* <div className="form-group">

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

                        </div> */}

                    </div>


                    <div className="form-actions">

                        <button
                            type="submit"
                            className="save-rate-btn"
                            disabled={loading}
                        >

                            {
                                loading
                                    ? "Saving..."
                                    : isEditMode
                                        ? "Update"
                                        : "Save"
                            }

                        </button>


                        <button
                            type="button"
                            className="cancel-rate-btn"
                            onClick={
                                handleCancel
                            }
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