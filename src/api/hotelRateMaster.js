import axiosClient from "./axiosClient";

export const gethotels = (pageNumber = 1, pageSize = 0) => {
    return axiosClient.get("/Hotels", {
        // params: {
        //     pageNumber,
        //     pageSize
        // }
    });
};

export const createEmployeeRateMaster = (rateMaster) => {
    return axiosClient.post("/Hotels", rateMaster);
};
