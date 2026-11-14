
import React, { useEffect, useState } from "react";
import {
    getHotels,
    deleteHotel
} from "../api/hotelApi";

import { useNavigate } from "react-router-dom";
import "../CSS/Hotel.css";

const PAGE_SIZE = 20;

function Hotels() {
    const [hotels, setHotels] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const navigate = useNavigate();

    const showPopup = (title, message, onClose) => {
        setPopup({ title, message, onClose });
    };

    // =========================
    // Load All Hotels
    // =========================
    const loadHotels = async () => {
        try {
            setLoading(true);

            const response = await getHotels();

            console.log("Hotel API Response:", response.data);

            const data = response.data?.data ?? response.data;

            setHotels(Array.isArray(data) ? data : data?.items ?? []);

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

            showPopup(
                "Success!",
                "Hotel deleted successfully.",
                async () => {
                    await loadHotels();
                }
            );

        } catch (error) {
            console.error("Error deleting hotel:", error);

            alert(
                error.response?.data?.message ||
                "Failed to delete hotel."
            );
        }
    };

    // =========================
    // Search Hotels - All Records
    // =========================
    const filteredHotels = hotels.filter((hotel) => {
        const search = searchText.trim().toLowerCase();

        const hotelName =
            hotel.hotelName?.toLowerCase() || "";

        const contactPerson =
            hotel.contactPerson?.toLowerCase() || "";

        const mobileNumber1 =
            String(hotel.mobileNumber1 ?? "").toLowerCase();

        const mobileNumber2 =
            String(hotel.mobileNumber2 ?? "").toLowerCase();

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

    // =========================
    // Pagination Calculation
    // =========================
    const totalRecords = filteredHotels.length;

    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const paginatedHotels = filteredHotels.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    // Keep current page valid after searching or deleting
    useEffect(() => {
        if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        } else if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // =========================
    // Search Change
    // =========================
    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    // =========================
    // Pagination Handlers
    // =========================
    const handleFirst = () => {
        setCurrentPage(1);
    };

    const handlePrevious = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage((prev) =>
            Math.min(prev + 1, totalPages)
        );
    };

    const handleLast = () => {
        setCurrentPage(totalPages);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="hotels-page">

            {/* =========================
                Page Header
            ========================= */}
            <div className="hotels-header">

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
                            handleSearch(e.target.value)
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

                                {paginatedHotels.length > 0 ? (

                                    paginatedHotels.map((hotel) => (

                                        <tr key={hotel.hotelId}>

                                            <td>
                                                {hotel.hotelId}
                                            </td>

                                            <td>
                                                {hotel.hotelName}
                                            </td>

                                            <td>
                                                {hotel.contactPerson || "-"}
                                            </td>

                                            <td>
                                                {hotel.mobileNumber1 || "-"}
                                            </td>

                                            <td>
                                                {hotel.mobileNumber2 || "-"}
                                            </td>

                                            <td>
                                                {hotel.address || "-"}
                                            </td>

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

                                            <td>

                                                <button
                                                    type="button"
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        handleEdit(hotel.hotelId)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDelete(hotel.hotelId)
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td
                                            colSpan="8"
                                            style={{ textAlign: "center" }}
                                        >
                                            No hotels found.
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    )}

                </div>

                {/* =========================
                    Pagination
                ========================= */}
                {!loading && (
                    <div className="pagination">

                        <div className="pagination-info">
                            Showing{" "}
                            {totalRecords === 0 ? 0 : startIndex + 1}
                            {" - "}
                            {Math.min(startIndex + PAGE_SIZE, totalRecords)}
                            {" of "}
                            {totalRecords} caterers

                            {" | "}

                            Page {totalPages === 0 ? 0 : currentPage}
                            {" of "}
                            {totalPages}
                        </div>

                        <div className="pagination-buttons">

                            <button
                                type="button"
                                onClick={handleFirst}
                                disabled={currentPage === 1 || totalPages === 0}
                            >
                                First
                            </button>

                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={currentPage === 1 || totalPages === 0}
                            >
                                Previous
                            </button>

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((page) => (

                                <button
                                    type="button"
                                    key={page}
                                    className={
                                        page === currentPage
                                            ? "active-page"
                                            : ""
                                    }
                                    onClick={() =>
                                        handlePageChange(page)
                                    }
                                >
                                    {page}
                                </button>

                            ))}

                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={
                                    currentPage === totalPages ||
                                    totalPages === 0
                                }
                            >
                                Next
                            </button>

                            <button
                                type="button"
                                onClick={handleLast}
                                disabled={
                                    currentPage === totalPages ||
                                    totalPages === 0
                                }
                            >
                                Last
                            </button>

                        </div>

                    </div>
                )}

            </div>

            {/* =========================
                Success Popup
            ========================= */}
            {popup && (
                <div
                    className="screen-popup-backdrop"
                    onClick={() => {
                        setPopup(null);
                        popup.onClose?.();
                    }}
                >
                    <div
                        className="screen-popup-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3>{popup.title}</h3>
                        <p>{popup.message}</p>

                        <button
                            type="button"
                            className="screen-popup-ok"
                            onClick={() => {
                                setPopup(null);
                                popup.onClose?.();
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Hotels;
