import React, { useEffect, useState } from "react";
import {
    getHotels,
    //deleteHotel
} from "../api/hotelApi";

import { useNavigate } from "react-router-dom";

import "../CSS/Hotel.css";

function Hotels() {
    const [hotels, setHotels] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // =========================
    // Load Hotels
    // =========================
    const loadHotels = async () => {
        try {
            setLoading(true);

            const response = await getHotels();

            console.log("Hotel API Response:", response.data);

            setHotels(response.data || []);

        } catch (error) {
            console.error("Error loading hotels:", error);

            alert(
                error.response?.data?.message ||
                "Failed to load hotels."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Load Hotels on Page Load
    // =========================
    useEffect(() => {
        loadHotels();
    }, []);

    // =========================
    // Add Hotel
    // =========================
    const handleAdd = () => {
        navigate("/hotels/add");
    };

    // =========================
    // Edit Hotel
    // =========================
    const handleEdit = (hotelId) => {
        navigate(`/hotels/edit/${hotelId}`);
    };

    // =========================
    // Delete Hotel
    // =========================
    const handleDelete = async (hotelId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this hotel?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteHotel(hotelId);

            alert("Hotel deleted successfully.");

            await loadHotels();

        } catch (error) {
            console.error("Error deleting hotel:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete hotel."
            );
        }
    };

    // =========================
    // Search Hotels
    // =========================
    const filteredHotels = hotels.filter((hotel) => {

        const search = searchText.trim().toLowerCase();

        const hotelName =
            hotel.hotelName?.toLowerCase() || "";

        const contactPerson =
            hotel.contactPerson?.toLowerCase() || "";

        const mobileNumber1 =
            hotel.mobileNumber1?.toLowerCase() || "";

        const mobileNumber2 =
            hotel.mobileNumber2?.toLowerCase() || "";

        const address =
            hotel.address?.toLowerCase() || "";

        return (
            hotelName.includes(search) ||
            contactPerson.includes(search) ||
            mobileNumber1.includes(search) ||
            mobileNumber2.includes(search) ||
            address.includes(search)
        );
    });

    return (
        <div className="hotels-page">

            {/* =========================
                Page Header
            ========================= */}
            <div className="hotels-header">

                {/* Title */}
                <div>
                    <h1>Caterers List</h1>

                    <p>
                        Manage all caterers in the catering system.
                    </p>
                </div>

                {/* Search */}
                <div className="add-hotel-header">

                    <h2>Search</h2>

                    <input
                        type="text"
                        placeholder="Search by caterer name, contact person or mobile"
                        value={searchText}
                        onChange={(e) =>
                            setSearchText(e.target.value)
                        }
                    />

                </div>

                {/* Add Hotel */}
                <button
                    type="button"
                    className="add-hotel-btn"
                    onClick={handleAdd}
                >
                    + Add Caterer
                </button>

            </div>

            {/* =========================
                Hotel Table
            ========================= */}
            <div className="hotels-card">

                <div className="table-container">

                    {loading ? (

                        <p>Loading hotels...</p>

                    ) : (

                        <table className="hotels-table">

                            <thead>
                                <tr>

                                    <th>Id</th>

                                    <th>Caterer Name</th>

                                    <th>Contact Person</th>

                                    <th>Mobile 1</th>

                                    <th>Mobile 2</th>

                                    <th>Address</th>

                                    <th>Status</th>

                                    <th>Action</th>

                                </tr>
                            </thead>

                            <tbody>

                                {filteredHotels.length > 0 ? (

                                    filteredHotels.map((hotel) => (

                                        <tr
                                            key={hotel.hotelId}
                                        >

                                            {/* ID */}
                                            <td>
                                                {hotel.hotelId}
                                            </td>

                                            {/* Hotel Name */}
                                            <td>
                                                {hotel.hotelName}
                                            </td>

                                            {/* Contact Person */}
                                            <td>
                                                {hotel.contactPerson || "-"}
                                            </td>

                                            {/* Mobile 1 */}
                                            <td>
                                                {hotel.mobileNumber1 || "-"}
                                            </td>

                                            {/* Mobile 2 */}
                                            <td>
                                                {hotel.mobileNumber2 || "-"}
                                            </td>

                                            {/* Address */}
                                            <td>
                                                {hotel.address || "-"}
                                            </td>

                                            {/* Status */}
                                            <td>

                                                {hotel.isActive ? (
                                                    <span className="active-status">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inactive-status">
                                                        Inactive
                                                    </span>
                                                )}

                                            </td>

                                            {/* Actions */}
                                            <td>

                                                <button
                                                    type="button"
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleEdit(
                                                            hotel.hotelId
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            hotel.hotelId
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td colSpan="8">
                                            No hotels found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </div>
    );
}

export default Hotels;