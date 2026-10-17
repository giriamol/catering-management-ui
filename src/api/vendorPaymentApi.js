import axiosClient from "./axiosClient";

export const getVendorPaymentSummary = (vendorId, fromDate, toDate) => {
    return axiosClient.get("/VendorPayments/summary", {
        params: { vendorId, fromDate, toDate },
    });
};

export const SaveVendorPayment = (data) => {
    return axiosClient.post("/VendorPayments", data);
};

export const getAllVendorPaymentSummary = (fromDate, toDate) => {
    return axiosClient.get("/VendorPayments/All", {
        params: { fromDate, toDate },
    });
};
