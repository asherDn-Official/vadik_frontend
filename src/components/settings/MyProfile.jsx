import { useState, useRef, useEffect } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import api from "../../api/apiconfig";
import { useAuth } from "../../context/AuthContext";

const MyProfile = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    storeName: "",
    role: "Retailer",
    address: "",
    profilePicture: "https://randomuser.me/api/portraits/men/36.jpg",
  });

  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const {auth} =useAuth();

  useEffect(() => {

    const fetchProfileData = async () => {
      try {
        const response = await api.get(
          `api/retailer/${auth?._id}`
        );
        
        if (response.data.status === "success") {
          const retailerData = response.data.data;
          
          // Split full name into first and last name
          const nameParts = retailerData.fullName.split(' ');
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(' ');
          
          setProfile({
            firstName: firstName || "",
            lastName: lastName || "",
            phone: `${retailerData.phoneCode}${retailerData.phone}`,
            email: retailerData.email,
            storeName: retailerData.storeName,
            role: "Retailer",
            address: retailerData.storeAddress,
            profilePicture: profile.profilePicture
          });
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching profile data:", err);
      }
    };

    if(auth?._id){
      fetchProfileData();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value, country) => {
    setProfile((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Extract country code and phone number
      const phoneCode = profile.phone.slice(0, 2);
      const phoneNumber = profile.phone.slice(2);
      
      const updatedData = {
        fullName: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
        phoneCode: `+${phoneCode}`,
        phone: phoneNumber,
        storeName: profile.storeName,
        storeAddress: profile.address,
      };

      const response = await axios.put(
        "http://13.60.19.134:5000/api/retailer/6856350030bcee9b82be4c17",
        updatedData
      );

      if (response.data.status === "success") {
        console.log("Profile updated successfully:", response.data);
        // You might want to show a success message to the user
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      // You might want to show an error message to the user
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match("image.*")) {
      setUploadError("Please upload an image file (jpg, png)");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("File size too large (max 2MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfile((prev) => ({
        ...prev,
        profilePicture: event.target.result,
      }));
      setUploadError("");
    };
    reader.onerror = () => {
      setUploadError("Error reading file");
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return <div className="px-10 py-3 mx-auto">Loading profile context...</div>;
  }

  if (error) {
    return <div className="px-10 py-3 mx-auto text-red-500">Error: {error}</div>;
  }

  return (
    <div className="px-10 py-3 mx-auto">
      <h2 className="text-[#313166] text-[14px] font-medium mb-6">
        Admin Profile
      </h2>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Left side - Form fields */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Phone Number
                </label>
                <PhoneInput
                  country={'in'}
                  value={profile.phone}
                  onChange={handlePhoneChange}
                  inputClass="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  inputStyle={{ width: '100%' }}
                  dropdownClass="text-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Mail Id
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">
                  Store Name
                </label>
                <input
                  type="text"
                  name="storeName"
                  value={profile.storeName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-[#31316680]">Role</label>
                <input
                  type="text"
                  name="role"
                  value={profile.role}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-[#31316680]">
                Store Address
              </label>
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-[#313166]"
              />
            </div>

            <div>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded hover:bg-pink-700 transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Profile picture */}
        <div className="md:w-64 flex flex-col items-center bg-[#F4F5F9] p-5 rounded-[10px] justify-evenly h-[315px]">
          <div className="text-center mb-4">
            <h3 className="font-medium mb-1 text-[#313166] text-[14px]">
              Profile Picture
            </h3>
          </div>
          <div className="w-34 h-34 rounded-full overflow-hidden mb-4 border-2 border-gray-200">
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="w-[134px] h-[134px] object-cover"
            />
          </div>
          <div className="text-center text-xs text-gray-500 mb-2">
            <span className="text-[#31316680] text-[10px]">
              Upload jpg or png
            </span>
            <br />
            <span className="text-[#EC396F] text-[10px]">
              (max 200x200px, 2MB)
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={triggerFileInput}
            className="px-4 py-2 border border-1 border-[#313166] rounded hover:bg-gray-50 w-full"
          >
            Upload Photo
          </button>

          {uploadError && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
