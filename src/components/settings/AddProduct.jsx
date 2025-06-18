import React, { useState } from "react";
import { FiArrowLeft, FiSearch, FiPlusCircle } from "react-icons/fi";

const AddProduct = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    colors: "",
    status: "",
    categories: "",
  });

  // Mock search results
  const searchResults = [
    "Shirt for men",
    "Shirt for women",
    "Black Shirt",
    "Shirt combo",
  ];

  const handleSearch = () => {
    setShowSearchResults(true);
  };

  const handleSelectSearchResult = (result) => {
    setSearchTerm(result);
    setShowSearchResults(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Product data:", productData);
    onBack();
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-medium">Product Setting</h2>
      </div>

      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4">Edit Existing Product</h3>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search product"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value.length > 0) {
                setShowSearchResults(true);
              } else {
                setShowSearchResults(false);
              }
            }}
            className="w-full md:w-3/4 pl-4 pr-10 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 text-primary"
          >
            <FiSearch size={20} />
          </button>

          {showSearchResults && (
            <div className="absolute z-10 w-full md:w-3/4 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                  onClick={() => handleSelectSearchResult(result)}
                >
                  <FiSearch className="mr-3 text-gray-500" />
                  <span>{result}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-6 h-40">
            <div className="text-gray-400 mb-2">
              <FiPlusCircle size={24} />
            </div>
            <p className="text-center text-sm text-blue-500">
              Click to Add Product
            </p>
            <p className="text-center text-xs text-gray-500 mt-1">
              Image or Video
            </p>
            <p className="text-center text-xs text-gray-400 mt-2">Format</p>
            <p className="text-center text-xs text-gray-400">
              (JPG, PNG or MP4, Max 5MB)
            </p>
          </div>

          {/* Repeat the same component 3 more times */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-6 h-40"
            >
              <div className="text-gray-400 mb-2">
                <FiPlusCircle size={24} />
              </div>
              <p className="text-center text-sm text-blue-500">
                Click to Add Product
              </p>
              <p className="text-center text-xs text-gray-500 mt-1">
                Image or Video
              </p>
              <p className="text-center text-xs text-gray-400 mt-2">Format</p>
              <p className="text-center text-xs text-gray-400">
                (JPG, PNG or MP4, Max 5MB)
              </p>
            </div>
          ))}
        </div>

        <div className="text-right mb-8">
          <button className="px-4 py-2 text-primary hover:text-primary-dark">
            Add More +
          </button>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-6">General Information</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={productData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                A product name is required and recommended to be unique
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product description
              </label>
              <textarea
                name="description"
                placeholder="Enter product description"
                value={productData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Add detailed information about the product, including usage,
                benefits, and features. This helps users make informed
                decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-6">Addition Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colours
              </label>
              <div className="relative">
                <select
                  name="colors"
                  value={productData.colors}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                >
                  <option value="" disabled>
                    Choose Colours
                  </option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="brown">Brown</option>
                  <option value="blue">Blue</option>
                  <option value="violet">Violet</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="text"
                name="price"
                placeholder="Update price"
                value={productData.price}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={productData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                >
                  <option value="" disabled>
                    Choose status
                  </option>
                  <option value="available">Available</option>
                  <option value="limited">Limited Stock</option>
                  <option value="out">Out Of Stock</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product categories
              </label>
              <div className="relative">
                <select
                  name="categories"
                  value={productData.categories}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                >
                  <option value="" disabled>
                    Choose categories
                  </option>
                  <option value="shirt">Shirt</option>
                  <option value="pant">Pant</option>
                  <option value="sandals">Sandals</option>
                  <option value="trackpants">Track Pants</option>
                  <option value="shorts">Shorts</option>
                  <option value="shoe">Shoe</option>
                  <option value="flipflops">Flip Flops</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded-md hover:bg-pink-700 transition"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
