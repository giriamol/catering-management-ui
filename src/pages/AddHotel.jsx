import { useState } from "react";
import { createHotel } from "../api/hotelApi";
import { useNavigate } from "react-router-dom";
import "../CSS/HotelForm.css";

function AddHotel() {

    const navigate = useNavigate();

    const [hotel, setHotel] = useState({
        hotelName: "",
        contactPerson: "",
        mobileNumber1: "",
        mobileNumber2: "",
        address: "",
        isActive: true
    });

    const [loading, setLoading] = useState(false);

    // =========================
    // Handle Input Change
    // =========================
    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setHotel({
            ...hotel,
            [name]: type === "checkbox"
                ? checked
                : value
        });
    };

    // =========================
    // Submit
    // =========================
    const handleSubmit = async (e) => {

        e.preventDefault();

        // =========================
        // Validation
        // =========================

        if (!hotel.hotelName.trim()) {
            alert("Please enter hotel name.");
            return;
        }

        if (!hotel.contactPerson.trim()) {
            alert("Please enter contact person.");
            return;
        }

        if (!hotel.mobileNumber1.trim()) {
            alert("Please enter mobile number 1.");
            return;
        }

        try {

            setLoading(true);

            console.log("Creating Hotel:", hotel);

            await createHotel(hotel);

            alert("Hotel created successfully.");

            navigate("/hotels");

        } catch (error) {

            console.error(
                "Error creating hotel:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to create hotel."
            );

        } finally {

            setLoading(false);

        }
    };

    // =========================
    // Cancel
    // =========================
    const handleCancel = () => {
        navigate("/hotels");
    };

    return (
        <div className="hotel-form-page">

            {/* =========================
                Header
            ========================= */}
            <div className="hotel-form-header">

                <div>

                    <h1>Add New Caterer</h1>

                    <p>
                        Add a new Caterer to the catering system.
                    </p>

                </div>

            </div>

            {/* =========================
                Form Card
            ========================= */}
            <div className="hotel-form-card">

                <form onSubmit={handleSubmit}>

                    <div className="hotel-form-grid">

                        {/* =========================
                            Hotel Name
                        ========================= */}
                        <div className="hotel-form-group">

                            <label>
                                Caterer Name <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="hotelName"
                                value={hotel.hotelName}
                                onChange={handleChange}
                                placeholder="Enter hotel name"
                                maxLength="200"
                            />

                        </div>

                        {/* =========================
                            Contact Person
                        ========================= */}
                        <div className="hotel-form-group">

                            <label>
                                Contact Person
                            </label>

                            <input
                                type="text"
                                name="contactPerson"
                                value={hotel.contactPerson}
                                onChange={handleChange}
                                placeholder="Enter contact person"
                                maxLength="150"
                            />

                        </div>

                        {/* =========================
                            Mobile Number 1
                        ========================= */}
                        <div className="hotel-form-group">

                            <label>
                                Mobile Number 1 <span>*</span>
                            </label>

                            <input
                                type="text"
                                name="mobileNumber1"
                                value={hotel.mobileNumber1}
                                onChange={handleChange}
                                placeholder="Enter 10  digit Mobile number"
                               maxLength={10}
                            />
                                    

                        </div>

                        {/* =========================
                            Mobile Number 2
                        ========================= */}
                        <div className="hotel-form-group">

                            <label>
                                Mobile Number 2
                            </label>

                            <input
                                type="text"
                                name="mobileNumber2"
                                value={hotel.mobileNumber2}
                                onChange={handleChange}
                                 placeholder="Enter 10  digit Mobile number"
                               maxLength={10}
                            />

                        </div>

                        {/* =========================
                            Address
                        ========================= */}
                        <div className="hotel-form-group full-width">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={hotel.address}
                                onChange={handleChange}
                                placeholder="Enter Caterers address"
                                rows="4"
                                maxLength="500"
                            />

                        </div>

                        {/* =========================
                            Active
                        ========================= */}
                        <div className="hotel-form-group full-width">

                            <label className="hotel-checkbox-label">

                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={hotel.isActive}
                                    onChange={handleChange}
                                />

                                <span>
                                    Active
                                </span>

                            </label>

                        </div>

                    </div>

                    {/* =========================
                        Buttons
                    ========================= */}
                    <div className="hotel-form-actions">

                        <button
                            type="button"
                            className="hotel-cancel-btn"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="hotel-save-btn"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Save Caterer"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddHotel;