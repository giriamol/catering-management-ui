 import axiosClient from "./axiosClient";
 
// // Get vendor rates with pagination
// export const getVendorRates = (
//     pageNumber = 1,
//     pageSize = 10
// ) => {
//     return axiosClient.get("/VendorRateHistory", {
//         params: {
//             pageNumber,
//             pageSize
//         }
//     });
// };

// // Get rates for one vendor
// export const getVendorRatesByVendor = (vendorId) => {
//     return axiosClient.get(
//         `/VendorRateHistory/vendor/${vendorId}`
//     );
// };

// // Get rate for vendor on selected date
// export const getVendorRateForDate = (
//     vendorId,
//     date
// ) => {
//     return axiosClient.get(
//         `/VendorRateHistory/vendor/${vendorId}/date/${date}`
//     );
// };

export const getVendorRates = ( pageNumber = 1, pageSize = 10 ) => { return axiosClient.get("/VendorRateHistory", { params: { pageNumber, pageSize } }); };

export const getVendorRatesByVendor = (vendorId) => { return axiosClient.get( `/VendorRateHistory/vendor/${vendorId}` ); };
export const getVendorRateForDate = (vendorId, date) => { return axiosClient.get( `/VendorRateHistory/vendor/${vendorId}/date/${date}` ); };
export const createVendorRate = (payload) => { 
    return axiosClient.post( "/VendorRateHistory", payload );
 };