import { useEffect, useState } from "react";
import { getHotelById, updateHotel } from "../api/hotelApi";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/HotelForm.css";

function EditHotel() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [hotel, setHotel] = useState({
        hotelName: "",
        contactPerson: "",
        mobileNumber1: "",
        mobileNumber2: "",
        address: "",
        isActive: true
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // =========================
    // Load Hotel
    // =========================
    const loadHotel = async () => {

        try {

            setLoading(true);

            const response = await getHotelById(id);

            console.log("Hotel Details:", response.data);

            setHotel({
                hotelName: response.data.hotelName || "",
                contactPerson: response.data.contactPerson || "",
                mobileNumber1: response.data.mobileNumber1 || "",
                mobileNumber2: response.data.mobileNumber2 || "",
                address: response.data.address || "",
                isActive: response.data.isActive ?? true
            });

        } catch (error) {

            console.error(
                "Error loading hotel:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to load hotel."
            );

            navigate("/hotels");

        } finally {

            setLoading(false);

        }
    };

    // =========================
    // Load Hotel When Page Opens
    // =========================
    useEffect(() => {
        loadHotel();
    }, [id]);

    // =========================
    // Handle Input Change
    // =========================
    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setHotel({
            ...hotel,
            [name]: type === "checkbox"
                ? checked
                : value
        });
    };

    // =========================
    // Save Changes
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

        if (!hotel.mobileNumber1.trim()) {
            alert("Please enter mobile number 1.");
            return;
        }

        try {

            setSaving(true);

            console.log(
                "Updating Hotel:",
                hotel
            );

            await updateHotel(id, hotel);

            alert("Hotel updated successfully.");

            navigate("/hotels");

        } catch (error) {

            console.error(
                "Error updating hotel:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update hotel."
            );

        } finally {

            setSaving(false);

        }
    };

    // =========================
    // Cancel
    // =========================
    const handleCancel = () => {
        navigate("/hotels");
    };

    // =========================
    // Loading
    // =========================
    if (loading) {

        return (
            <div className="hotel-form-page">

                <div className="hotel-form-card">

                    <p>
                        Loading hotel...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="hotel-form-page">

            {/* =========================
                Header
            ========================= */}
            <div className="hotel-form-header">

                <div>

                    <h1>
                        Edit Hotel
                    </h1>

                    <p>
                        Update hotel information.
                    </p>

                </div>

            </div>

            {/* =========================
                Form
            ========================= */}
            <div className="hotel-form-card">

                <form onSubmit={handleSubmit}>

                    <div className="hotel-form-grid">

                        {/* =========================
                            Hotel Name
                        ========================= */}
                        <div className="hotel-form-group">

                            <label>
                                Hotel Name <span>*</span>
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
                                placeholder="Enter mobile number"
                                maxLength="20"
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
                                placeholder="Enter alternate mobile number"
                                maxLength="20"
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
                                placeholder="Enter hotel address"
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
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="hotel-save-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Updating..."
                                : "Update Hotel"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default EditHotel;