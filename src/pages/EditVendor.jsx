
import { useEffect, useState } from "react";
import { getVendorById, updateVendor } from "../api/vendorApi";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/AddVendor.css";

function EditVendor() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        vendorName: "",
        mobileNumber1: "",
        mobileNumber2: "",
        address: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadVendor();
    }, [id]);

    const loadVendor = async () => {

        try {

            const response = await getVendorById(id);

            const vendor = response.data;

            setFormData({
                vendorName: vendor.vendorName || "",
                mobileNumber1: vendor.mobileNumber1 || "",
                mobileNumber2: vendor.mobileNumber2 || "",
                address: vendor.address || ""
            });

        } catch (error) {

            console.error("Error loading vendor:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load vendor."
            );

            navigate("/vendors");

        } finally {

            setLoading(false);

        }
    };

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
                mobileNumber1:
                    formData.mobileNumber1 || null,
                mobileNumber2:
                    formData.mobileNumber2 || null,
                address:
                    formData.address || null
            };

            await updateVendor(id, vendor);

            alert("Vendor updated successfully!");

            navigate("/vendors");

        } catch (error) {

            console.error(
                "Error updating vendor:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update vendor."
            );

        }
    };

    if (loading) {
        return <p>Loading vendor...</p>;
    }

    return (

        <div className="add-vendor-page">

            <div className="add-vendor-header">

                <h1>Edit Vendor</h1>

                <p>
                    Update vendor information.
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
                            name="mobileNumber1"
                            value={formData.mobileNumber1}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Mobile Number 2
                        </label>

                        <input
                            type="text"
                            name="mobileNumber2"
                            value={formData.mobileNumber2}
                            onChange={handleChange}
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
                            onClick={() =>
                                navigate("/vendors")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-btn"
                        >
                            Update Vendor
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditVendor;
