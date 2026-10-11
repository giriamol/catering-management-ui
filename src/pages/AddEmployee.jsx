
import { useState } from "react";
import { createEmployee } from "../api/employeeApi";
import { useNavigate } from "react-router-dom";
import "../CSS/AddEmployee.css";

function AddEmployee() {
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        fullName: "",
        emailId: "",
        gender: "",
        aadhaarNumber: "",
        mobileNumber: "",
        panNo: "",
        address: "",
        memberType: "",
        joiningDate: "",
        isActive: true
    });

    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Full Name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full Name is required.";
        }

        // Gender validation
        if (!formData.gender) {
            newErrors.gender = "Please select Gender.";
        }

        // Aadhaar Number validation
        if (!formData.aadhaarNumber.trim()) {
            newErrors.aadhaarNumber = "Aadhaar Number is required.";
        } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
            newErrors.aadhaarNumber =
                "Aadhaar Number must contain exactly 12 digits.";
        }

        // Mobile Number validation
        if (!formData.mobileNumber.trim()) {
            newErrors.mobileNumber = "Mobile Number is required.";
        } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber =
                "Mobile Number must contain exactly 10 digits.";
        }

        // Member Type validation
        if (!formData.memberType) {
            newErrors.memberType = "Please select Member Type.";
        }

        // Joining Date validation
        if (!formData.joiningDate) {
            newErrors.joiningDate = "Joining Date is required.";
        }

        // Email validation removed
        // PAN validation removed

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const employee = {
                fullName: formData.fullName.trim(),

                // Email is optional and has no validation
                emailId: formData.emailId.trim() || null,

                gender: formData.gender,

                aadhaarNumber: formData.aadhaarNumber.trim(),

                mobileNumber: formData.mobileNumber.trim(),

                // PAN is optional and has no validation
                panNo: formData.panNo.trim() || null,

                address: formData.address.trim() || null,

                memberType: formData.memberType,

                joiningDate: formData.joiningDate,

                isActive: formData.isActive
            };

            const response = await createEmployee(employee);

            console.log("Employee created:", response.data);

            alert("Employee created successfully!");

            navigate("/employees");
        } catch (error) {
            console.error("Error creating employee:", error);

            alert(
                error.response?.data?.message ||
                "Failed to create employee."
            );
        }
    };

    return (
        <div className="add-employee-page">

            <div className="add-employee-header">
                <h1>Add Employee</h1>

                <p>
                    Create a new employee record.
                </p>
            </div>

            <div className="employee-form-card">

                <form
                    className="employee-form"
                    onSubmit={handleSubmit}
                >

                    {/* Full Name */}
                    <div className="form-group">
                        <label>Full Name</label>

                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            maxLength={200}
                        />

                        {errors.fullName && (
                            <span className="error-message">
                                {errors.fullName}
                            </span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="text"
                            name="emailId"
                            value={formData.emailId}
                            onChange={handleChange}
                            maxLength={50}
                        />
                    </div>

                    {/* Gender */}
                    <div className="form-group">
                        <label>Gender</label>

                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select Gender
                            </option>

                            <option value="Male">
                                Male
                            </option>

                            <option value="Female">
                                Female
                            </option>

                            <option value="Other">
                                Other
                            </option>
                        </select>

                        {errors.gender && (
                            <span className="error-message">
                                {errors.gender}
                            </span>
                        )}
                    </div>

                    {/* Aadhaar Number */}
                    <div className="form-group">
                        <label>Aadhaar Number</label>

                        <input
                            type="text"
                            name="aadhaarNumber"
                            value={formData.aadhaarNumber}
                            onChange={handleChange}
                            maxLength={12}
                            inputMode="numeric"
                        />

                        {errors.aadhaarNumber && (
                            <span className="error-message">
                                {errors.aadhaarNumber}
                            </span>
                        )}
                    </div>

                    {/* Mobile Number */}
                    <div className="form-group">
                        <label>Mobile Number</label>

                        <input
                            type="text"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            maxLength={10}
                            inputMode="numeric"
                        />

                        {errors.mobileNumber && (
                            <span className="error-message">
                                {errors.mobileNumber}
                            </span>
                        )}
                    </div>

                    {/* PAN Number */}
                    <div className="form-group">
                        <label>PAN Number</label>

                        <input
                            type="text"
                            name="panNo"
                            value={formData.panNo}
                            onChange={handleChange}
                            maxLength={10}
                            style={{
                                textTransform: "uppercase"
                            }}
                        />
                    </div>

                    {/* Address */}
                    <div className="form-group full-width">
                        <label>Address</label>

                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Member Type */}
                    <div className="form-group">
                        <label>Member Type</label>

                        <select
                            name="memberType"
                            value={formData.memberType}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select Member Type
                            </option>

                            <option value="InHouse">
                                InHouse Member
                            </option>

                            <option value="Vendor">
                                Vendor
                            </option>

                            <option value="Local">
                                Local Member
                            </option>
                        </select>

                        {errors.memberType && (
                            <span className="error-message">
                                {errors.memberType}
                            </span>
                        )}
                    </div>

                    {/* Joining Date */}
                    <div className="form-group">
                        <label>Joining Date</label>

                        <input
                            type="date"
                            name="joiningDate"
                            value={formData.joiningDate}
                            onChange={handleChange}
                        />

                        {errors.joiningDate && (
                            <span className="error-message">
                                {errors.joiningDate}
                            </span>
                        )}
                    </div>

                    {/* Active Status */}
                    <div className="form-group">
                        <label>Active Status</label>

                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />

                                {" "}
                                Active
                            </label>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate("/employees")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                        >
                            Save Employee
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default AddEmployee;
