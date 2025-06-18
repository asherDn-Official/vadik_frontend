import React, { useState, useRef } from "react";

const MyProfile = () => {
  const [profile, setProfile] = useState({
    firstName: "Srinivasan",
    lastName: "P",
    mobile: "+91 95522 45418",
    email: "Srini.vasan543@gmail.com",
    storeName: "ABC Textile India",
    role: "Founder",
    address: "1, Raja Annamalai puram, Adyar, Chennai - 600 055.",
    profilePicture: "https://randomuser.me/api/portraits/men/36.jpg",
  });

  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit form data
    console.log("Profile updated:", profile);
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
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={profile.mobile}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-[#313166]"
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
            {/* <p className="text-sm text-gray-500">{profile.email}</p>
            <p className="text-sm text-gray-500">Role: {profile.role}</p> */}
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
              {" "}
              Upload jpg or png{" "}
            </span>
            <br />
            <span className="text-[#EC396F] text-[10px]">
              {" "}
              (max 200x200px, 2MB){" "}
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
