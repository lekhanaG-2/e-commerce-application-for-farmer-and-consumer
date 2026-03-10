import React, { useState } from 'react';
import AddressSelection from './AddressSelection';

const AddressSelectionPage = () => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'LEKHANA G',
      pincode: '560103',
      houseNumber: '35',
      locality: 'Sdm Ladies Pg, Reddy Layout, Kadubeesanahalli',
      city: 'Bangalore',
      state: 'Karnataka',
      mobile: '8088473253',
      isDefault: true,
      type: 'HOME',
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses.length > 0 ? addresses[0].id : null);

  const handleSelectAddress = (newAddress) => {
    setSelectedAddressId(newAddress.id);
    setAddresses(prevAddresses => {
      const exists = prevAddresses.find(addr => addr.id === newAddress.id);
      if (exists) {
        return prevAddresses;
      } else {
        return [...prevAddresses, newAddress];
      }
    });
  };

  return (
    <div>
      <h1>Select Delivery Address</h1>
      <AddressSelection
        onClose={() => { /* Implement navigation or modal close */ }}
        onSelectAddress={handleSelectAddress}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        setAddresses={setAddresses}
        setSelectedAddressId={setSelectedAddressId}
      />
    </div>
  );
};

export default AddressSelectionPage;
