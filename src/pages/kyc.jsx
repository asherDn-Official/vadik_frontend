import React, { useState } from "react";
import SearchBar from "../components/KYC/SearchBar";
import CustomerInfo from "../components/KYC/CustomerInfo";
import CouponSearchResults from "../components/KYC/CouponSearchResults";
import PhoneSearchResults from "../components/KYC/PhoneSearchResults";

const mockCustomer = {
  name: "Kiran Ravichandran",
  email: "rkkiran662001@gmail.com",
  phone: "+91 9876543210",
};

const mockCouponHistory = [
  {
    vidNo: "01",
    name: "Dhamaraj mani prakash",
    phoneNumber: "9988776655",
    joinDate: "02/02/2025",
    couponCode: "Dha01ab",
    status: "Verify",
  },
];

const mockPhoneHistory = [
  {
    date: "May 12, 2025",
    product: "Premium Wireless Headphones",
    quantity: 1,
    amount: "€249.99",
  },
  {
    date: "May 5, 2025",
    product: "Smartphone Charging Stand",
    quantity: 2,
    amount: "€59.98",
  },
  {
    date: "April 28, 2025",
    product: "Bluetooth Smart Speaker",
    quantity: 1,
    amount: "€179.99",
  },
  {
    date: "April 15, 2025",
    product: "Wireless Keyboard and Mouse Combo",
    quantity: 2,
    amount: "€349.99",
  },
  {
    date: "April 3, 2025",
    product: "Ultra HD Monitor 27-inch",
    quantity: 1,
    amount: "€159.99",
  },
];

const KYCPage = () => {
  const [searchType, setSearchType] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query, type) => {
    setSearchType(type);
    setSearchQuery(query);
    setShowResults(true);
  };

  const getFilteredResults = () => {
    if (searchType === "coupon") {
      return mockCouponHistory.filter(
        (item) => item.couponCode.toLowerCase() === searchQuery.toLowerCase()
      );
    } else if (searchType === "phone") {
      return mockPhoneHistory.filter(
        () => searchQuery === mockCustomer.phone.replace(/\s/g, "")
      );
    } else if (searchType === "email") {
      return mockPhoneHistory.filter(
        () => searchQuery.toLowerCase() === mockCustomer.email.toLowerCase()
      );
    } else if (searchType === "name") {
      return mockPhoneHistory.filter(
        () => searchQuery.toLowerCase() === mockCustomer.name.toLowerCase()
      );
    }
    return [];
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="p-8">
      <h1 className="text-[#313166] font-[20px] text-[20px] mb-6">KYC</h1>

      <SearchBar onSearch={handleSearch} />

      {showResults && (
        <>
          <CustomerInfo customer={mockCustomer} />

          {searchType === "coupon" && (
            <CouponSearchResults history={filteredResults} />
          )}
          {(searchType === "phone" ||
            searchType === "name" ||
            searchType === "email") && (
            <PhoneSearchResults history={filteredResults} />
          )}
        </>
      )}
    </div>
  );
};

export default KYCPage;
