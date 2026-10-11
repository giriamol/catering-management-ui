
import axiosClient from "./axiosClient";

// Get all hotel rate history records
export const getHotelRates = () =>
    axiosClient.get("/HotelRateHistory/all");

// Get one record by HotelRateHistoryId
export const getHotelRateById = (id) =>
    axiosClient.get(`/HotelRateHistory/${id}`);

// Get rate history for a particular hotel
export const getHotelRatesByHotel = (hotelId) =>
    axiosClient.get(`/HotelRateHistory/hotel/${hotelId}`);

// Create a hotel rate
export const createHotelRate = (payload) =>
    axiosClient.post("/HotelRateHistory", payload);

// Update a specific rate-history record
export const updateHotelRate = (id, payload) =>
    axiosClient.put(`/HotelRateHistory/${id}`, payload);

// Delete a specific rate-history record
export const deleteHotelRate = (id) =>
    axiosClient.delete(`/HotelRateHistory/${id}`);
