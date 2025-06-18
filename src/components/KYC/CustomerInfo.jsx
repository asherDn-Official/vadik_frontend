import React from "react";

const CustomerInfo = ({ customer }) => {
  return (
    <div className="mb-8 bg-white p-4 rounded-lg">
      <h2 className="text-[20px] font-[500] mb-4 text-[#313166]">
        Customer Information
      </h2>
      <div className="bg-white">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-[#313166] mb-1">Name</p>
            <p className="font-medium">{customer.name}</p>
          </div>
          <div>
            <p className="text-[#313166] mb-1">Email</p>
            <p className="font-medium">{customer.email}</p>
          </div>
          <div>
            <p className="text-[#313166] mb-1">Phone</p>
            <p className="font-medium">{customer.phone}</p>
          </div>
          <div>
            <p className="text-[#313166] mb-1">Action</p>
            <a href="#" className="text-[#0043ED] hover:underline">
              View Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfo;
