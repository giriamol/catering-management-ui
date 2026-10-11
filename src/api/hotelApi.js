import axiosClient from "./axiosClient";

// Get all hotels
export const getHotels = (pageNumber = 1, pageSize = 30) => {
    return axiosClient.get("/Hotels", {
        params: {
            pageNumber,
            pageSize
        }
    });
};

// Create hotel
export const createHotel = (hotel) => {
    return axiosClient.post("/Hotels", hotel);
};

// Get hotel by ID
export const getHotelById = (id) => {
    return axiosClient.get(`/Hotels/${id}`);
};

// Update hotel
export const updateHotel = (id, hotel) => {
    return axiosClient.put(`/Hotels/${id}`, hotel);
};

// // Delete hotel
// export const deleteHotel = (id) => {
//     return axiosClient.delete(`/Hotels/${id}`);
// };