import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/Authcontext';
import { FiPlus, FiTrash2, FiCheck, FiMapPin } from 'react-icons/fi';
import './AddressBook.css';

const AddressBook = ({ onSelectAddress, selectable = false }) => {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '', address: '', city: '', state: '', zip: '', phone: '', altPhone: '', isDefault: false
    });

    useEffect(() => {
        if (user) fetchAddresses();
    }, [user]);

    const fetchAddresses = async () => {
        try {
            if (!user || !user.uid) {
                console.warn("fetchAddresses: No user or uid found", user);
                return;
            }
            console.log("Fetching addresses for", user.uid);
            setLoading(true);
            const res = await axios.get(`https://blissbloomlybackend.onrender.com/api/users/address/${user.uid}`);
            console.log("Address fetch response:", res.data);
            setAddresses(res.data);
        } catch (error) {
            console.error("Error fetching addresses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress({ ...newAddress, [name]: type === 'checkbox' ? checked : value });
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            console.log("Adding address via AddressBook", newAddress);
            const res = await axios.post('https://blissbloomlybackend.onrender.com/api/users/address/add', {
                uid: user.uid,
                address: newAddress
            });
            setAddresses(res.data);
            setShowForm(false);
            setNewAddress({ name: '', address: '', city: '', state: '', zip: '', phone: '', altPhone: '', isDefault: false });
            alert("Address Added Successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to add address: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const res = await axios.delete(`https://blissbloomlybackend.onrender.com/api/users/address/delete/${user.uid}/${addressId}`);
            setAddresses(res.data);
        } catch (error) {
            alert("Failed to delete address");
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const res = await axios.put(`https://blissbloomlybackend.onrender.com/api/users/address/default/${user.uid}/${addressId}`);
            setAddresses(res.data);
        } catch (error) {
            alert("Failed to set default");
        }
    };

    return (
        <div className="address-book">
            <div className="ab-header">
                <h3>My Addresses</h3>
                <button type="button" className="add-btn" onClick={() => setShowForm(!showForm)}>
                    <FiPlus /> {showForm ? 'Cancel' : 'Add New'}
                </button>
            </div>

            {showForm && (
                <div className="address-form">
                    <div className="form-group">
                        <input name="name" placeholder="Full Name" value={newAddress.name} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <input name="address" placeholder="Address (House No, Street)" value={newAddress.address} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <input name="city" placeholder="City" value={newAddress.city} onChange={handleInputChange} />
                        <input name="zip" placeholder="ZIP Code" value={newAddress.zip} onChange={handleInputChange} />
                    </div>
                    <div className="form-row">
                        <input name="state" placeholder="State" value={newAddress.state} onChange={handleInputChange} />
                        <input name="phone" placeholder="Phone" value={newAddress.phone} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <input name="altPhone" placeholder="Alt Phone (Optional)" value={newAddress.altPhone} onChange={handleInputChange} />
                    </div>
                    <div className="form-check">
                        <label>
                            <input type="checkbox" name="isDefault" checked={newAddress.isDefault} onChange={handleInputChange} />
                            Set as default address
                        </label>
                    </div>
                    <button type="button" className="save-btn" onClick={handleAddAddress}>Save Address</button>
                    <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', padding: '8px', cursor: 'pointer' }}>Cancel</button>
                </div>
            )}

            <div className="address-list">
                {loading ? <p>Loading...</p> : addresses.length === 0 ? <p>No addresses saved.</p> : (
                    addresses.map(addr => (
                        <div key={addr._id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                            {addr.isDefault && <span className="default-badge">Default</span>}
                            <p className="addr-name">{addr.name}</p>
                            <p>{addr.address}</p>
                            <p>{addr.city}, {addr.state} - {addr.zip}</p>
                            <p>Phone: {addr.phone}</p>

                            <div className="addr-actions">
                                {selectable ? (
                                    <button type="button" className="select-btn" onClick={() => onSelectAddress(addr)}>Select</button>
                                ) : (
                                    <>
                                        {!addr.isDefault && (
                                            <button type="button" className="action-btn" onClick={() => handleSetDefault(addr._id)}>Set Default</button>
                                        )}
                                        <button type="button" className="delete-btn" onClick={() => handleDelete(addr._id)}><FiTrash2 /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AddressBook;
