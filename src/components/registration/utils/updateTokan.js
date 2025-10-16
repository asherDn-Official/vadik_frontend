import api from "../../../api/apiconfig";

export const updateToken = async (password, email) => {
  try {
    const response = await api.post("api/auth/retailerLogin", {
      email,
      password,
    });

    // Save token (or tokan) to localStorage
    if (response?.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("retailerId", response.data.retailer._id);
      localStorage.setItem("email", response.data.retailer.email);
    } else if (response?.data?.tokan) {
      localStorage.setItem("tokan", response.data.tokan);
      console.log("Tokan updated successfully");
    } else {
      throw new Error("Token not found in response");
    }

    return response.data; // return data if needed
  } catch (error) {
    console.error("Error updating token:", error);
    throw error;
  }
};
