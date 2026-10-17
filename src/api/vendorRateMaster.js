 import axiosClient from "./axiosClient";

export const getVendorRates = ( pageNumber = 1, pageSize = 10 ) => { 
    return axiosClient.get("/VendorRateHistory", { params: { pageNumber, pageSize } }); };

export const getVendorRateById = (vendorId) => {
     return axiosClient.get( `/VendorRateHistory/vendor/${vendorId}` ); 
    };

export const getVendorRateForDate = (vendorId, date) => { 
    return axiosClient.get( `/VendorRateHistory/vendor/${vendorId}/date/${date}` ); 
};
export const createVendorRate = (payload) => { 
    return axiosClient.post( "/VendorRateHistory", payload );
 };

 export const updateVendorRate = (vendorRateHistoryId, data) => {
    return axiosClient.put( `/VendorRateHistory/${vendorRateHistoryId}`, data);
};

export const deleteVendorRate = (vendorRateHistoryId) => {
    return axiosClient.delete(
        `/VendorRateHistory/${vendorRateHistoryId}`
    );
};