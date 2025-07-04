import React, { useState } from "react";
import FilterPanel from "../../src/components/customerInsigth/FilterPanel";
import CustomerList from "../../src/components/customerInsigth/CustomerList";
import * as XLSX from "xlsx";

const CustomerPersonalisation = () => {
  const [filters, setFilters] = useState({
    name: "",
    mobileNumber: "",
    gender: "All",
    firstVisit: "",
    source: "All",
    profession: "All",
    incomeLevel: "All",
    location: "All",
    favoriteProduct: "All",
    favoriteColour: "All",
    favoriteBrand: "All",
    specialDays: "All",
    lifeStyle: "All",
    interest: "All",
    customerLabel: "All",
  });

  const [selectedPeriod, setSelectedPeriod] = useState("Yearly");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const customersPerPage = 10;

  // Mock context - replace with your actual context import
  const customers = [
    {
      id: "1",
      name: "John Doe",
      mobileNumber: "+1234567890",
      gender: "Male",
      firstVisit: "2023-01-01",
      source: "Walk In",
      profession: "Corporate",
      incomeLevel: "High",
      location: "Chennai",
      favoriteProduct: "Jean",
      favoriteColour: "Blue",
      favoriteBrand: "Peter England",
      specialDays: "Birthday",
      lifeStyle: "Fitness",
      interest: "Sports",
      customerLabel: "WhatsApp",
    },
    // Add more customers as needed
  ];

  const handleExport = () => {
    // If customers are selected, export only those, otherwise export all filtered customers
    const dataToExport =
      selectedCustomers.length > 0
        ? filteredCustomers.filter((customer) =>
            selectedCustomers.includes(customer.id)
          )
        : filteredCustomers;

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "customers_export.xlsx");

    // Hide the export option after download
    setShowExport(false);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const appliedFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== "All" && value !== ""
  ).length;

  const clearAllFilters = () => {
    setFilters({
      name: "",
      mobileNumber: "",
      gender: "All",
      firstVisit: "",
      source: "All",
      profession: "All",
      incomeLevel: "All",
      location: "All",
      favoriteProduct: "All",
      favoriteColour: "All",
      favoriteBrand: "All",
      specialDays: "All",
      lifeStyle: "All",
      interest: "All",
      customerLabel: "All",
    });
  };

  const filteredCustomers = customers.filter((customer) => {
    return (
      (!filters.name ||
        customer.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.mobileNumber ||
        customer.mobileNumber.includes(filters.mobileNumber)) &&
      (filters.gender === "All" || customer.gender === filters.gender) &&
      (filters.profession === "All" ||
        customer.profession === filters.profession) &&
      (filters.source === "All" || customer.source === filters.source) &&
      (filters.incomeLevel === "All" ||
        customer.incomeLevel === filters.incomeLevel) &&
      (filters.location === "All" || customer.location === filters.location) &&
      (filters.favoriteProduct === "All" ||
        customer.favoriteProduct === filters.favoriteProduct) &&
      (filters.favoriteColour === "All" ||
        customer.favoriteColour === filters.favoriteColour) &&
      (filters.favoriteBrand === "All" ||
        customer.favoriteBrand === filters.favoriteBrand) &&
      (filters.specialDays === "All" ||
        customer.specialDays === filters.specialDays) &&
      (filters.lifeStyle === "All" ||
        customer.lifeStyle === filters.lifeStyle) &&
      (filters.interest === "All" || customer.interest === filters.interest) &&
      (filters.customerLabel === "All" ||
        customer.customerLabel === filters.customerLabel)
    );
  });

  // Get current customers for pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle customer selection
  const toggleCustomerSelection = (customerId) => {
    setSelectedCustomers((prevSelected) =>
      prevSelected.includes(customerId)
        ? prevSelected.filter((id) => id !== customerId)
        : [...prevSelected, customerId]
    );
  };

  // Toggle all customers on current page
  const toggleAllCustomers = () => {
    const allCurrentPageCustomerIds = currentCustomers.map(
      (customer) => customer.id
    );
    if (
      selectedCustomers.length === currentCustomers.length &&
      selectedCustomers.every((id) => allCurrentPageCustomerIds.includes(id))
    ) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(allCurrentPageCustomerIds);
    }
  };

  return (
    <div className="p-2">
      <div className="grid grid-cols-12 bg-white rounded-[20px]">
        {/* Filters Section */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            appliedFiltersCount={appliedFiltersCount}
            clearAllFilters={clearAllFilters}
          />
        </div>

        {/* Customer List Section */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 p-5">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                Customer List ({filteredCustomers.length})
              </h1>
            </div>
            <div className="flex gap-4 relative">
              <button
                className="px-4 bg-[#3131661A] py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                onClick={() => setShowExport(!showExport)}
              >
                Action
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>

              {showExport && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={handleExport}
                  >
                    {selectedCustomers.length > 0
                      ? "Export Selected"
                      : "Export All"}
                  </div>
                </div>
              )}
            </div>
          </div>
          <CustomerList
            customers={currentCustomers}
            selectedCustomers={selectedCustomers}
            toggleCustomerSelection={toggleCustomerSelection}
            toggleAllCustomers={toggleAllCustomers}
            totalCustomers={filteredCustomers.length}
            customersPerPage={customersPerPage}
            currentPage={currentPage}
            paginate={paginate}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerPersonalisation;
