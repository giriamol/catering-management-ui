
import { useState } from "react";
import { createVendor } from "../api/vendorApi";
import { useNavigate } from "react-router-dom";
import "../CSS/AddVendor.css";

function AddVendor() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        vendorName: "",
        mobileNumber1: "",
        mobileNumber2: "",
        address: ""
    });

    const [error, setError] = useState("");

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        try {

            const vendor = {
                vendorName: formData.vendorName,
                mobileNumber1: formData.mobileNumber1 || null,
                mobileNumber2: formData.mobileNumber2 || null,
                address: formData.address || null
            };

            const response = await createVendor(vendor);

            console.log("Vendor created:", response.data);

            alert("Vendor created successfully!");

            navigate("/vendors");

        } catch (error) {

            console.error("Error creating vendor:", error);

            setError(
                error.response?.data?.message ||
                "Failed to create vendor."
            );
        }
    };

    return (

        <div className="add-vendor-page">

            <div className="add-vendor-header">

                <h1>Add Vendor</h1>

                <p>
                    Create a new vendor record.
                </p>

            </div>

            <div className="vendor-form-card">

                <form
                    className="vendor-form"
                    onSubmit={handleSubmit}
                >

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">

                        <label>
                            Vendor Name
                        </label>

                        <input
                            type="text"
                            name="vendorName"
                            value={formData.vendorName}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Mobile Number 1 
                        </label>

                        <input
                            type="text"
                            id="mobileNumber1"
                            name="mobileNumber1"
                            placeholder="Enter 10 digit number"
                            value={formData.mobileNumber1}
                            onChange={handleChange}
                            maxLength={10}
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Mobile Number 2
                        </label>

                        <input
                            type="text"
                             type="text"
                                id="mobileNumber2"
                                name="mobileNumber2"
                                placeholder="Enter 10 digit number"
                                value={formData.mobileNumber2}
                                onChange={handleChange}
                                maxLength={10}
                        />

                    </div>


                    <div className="form-group full-width">

                        <label>
                            Address
                        </label>

                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate("/vendors")}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                        >
                            Save Vendor
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddVendor;
