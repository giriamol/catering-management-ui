
import axiosClient from "./axiosClient";

export const getHotelAllocationDetails = async (date) => {
    const response = await axiosClient.get("/HotelAssignmentData", {
        params: { date },
    });

    return response.data;
};
export const getHotelPaymentSummary = (hotelId, fromDate, toDate, status = null) => {
    return axiosClient.get("/HotelAssignmentData/summaryReport", {
        params: {
            hotelId,
            fromDate,
            toDate,
            status
        },
    });
};

export const getAllHotelPaymentSummary = (fromDate, toDate, status = null) => {
    return axiosClient.get("/HotelAssignmentData/AllReport", {
        params: {
            fromDate,
            toDate,
            status
        },
    });
};
export const SaveHotelPayment = (data) => {
    return axiosClient.post("/HotelAssignmentData", data);
};


export const GetemployeeReportwork = ( employeeId,fromDate, toDate) => {
    return axiosClient.get(`/DailyHotelAssignment/employee-report/${employeeId}`,
        {
            params: {
                fromDate: fromDate,
                toDate: toDate
            }
        }
    );
};

//--
export const getCaterersPaymentReport = (hotelId, fromDate, toDate, status = null) => {
    return axiosClient.get("/HotelAssignmentData/summaryReport", {
        params: { hotelId, fromDate, toDate, status },
    });
};

// Get all hotels/caterers payment report
export const getAllCaterersPaymentReport = (fromDate, toDate, status = null) => {
    return axiosClient.get("/HotelAssignmentData/AllReport", {
        params: { fromDate, toDate, status },
    });
};