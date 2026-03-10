import React, { createContext, useContext, useState, useEffect } from 'react';
import { consumerAPI } from '../services/api';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Get user from localStorage
  useEffect(() => {
    const userString = localStorage.getItem('user');
    const parsedUser = userString ? JSON.parse(userString) : null;
    setUser(parsedUser && parsedUser.id ? parsedUser : null);
  }, []);

  // Fetch wishlist items
  const fetchWishlist = async () => {
    if (!user || !localStorage.getItem('token')) {
      // For non-logged-in users, use localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          setWishlistItems(parsedWishlist);
        } catch (error) {
          console.error('Error parsing localStorage wishlist:', error);
          setWishlistItems([]);
        }
      }
      return;
    }

    setLoading(true);
    try {
      const wishlistData = await consumerAPI.getWishlistItems();
      console.log('WishlistContext - Fetched wishlist data:', wishlistData);
      setWishlistItems(wishlistData);
    } catch (error) {
      // Fallback to localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          setWishlistItems(parsedWishlist);
        } catch (parseError) {
          console.error('Error parsing localStorage wishlist:', parseError);
          setWishlistItems([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist on user change
  useEffect(() => {
    fetchWishlist();
  }, [user]);

  // Add item to wishlist
  const addToWishlist = async (product) => {
    console.log('WishlistContext - Adding to wishlist:', product.id);

    if (user && localStorage.getItem('token')) {
      try {
        await consumerAPI.addToWishlist(product.id);
        await fetchWishlist(); // Refresh the wishlist
        toast.success('Added to wishlist!');
        return true;
      } catch (error) {
        // Fallback to localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        let currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
        const existingIndex = currentWishlist.findIndex(item => item.id === product.id);
        if (existingIndex === -1) {
          currentWishlist = [...currentWishlist, product];
          localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
          setWishlistItems(currentWishlist);
          toast.success('Added to wishlist!');
          return true;
        }
      }
    } else {
      // Use localStorage for non-logged-in users
      const savedWishlist = localStorage.getItem('wishlist');
      let currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      const existingIndex = currentWishlist.findIndex(item => item.id === product.id);
      if (existingIndex === -1) {
        currentWishlist = [...currentWishlist, product];
        localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
        setWishlistItems(currentWishlist);
        toast.success('Added to wishlist!');
        return true;
      }
    }
    return false;
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    console.log('WishlistContext - Removing from wishlist:', productId);

    if (user && localStorage.getItem('token')) {
      try {
        await consumerAPI.removeFromWishlist(productId);
        await fetchWishlist(); // Refresh the wishlist
        toast.success('Removed from wishlist!');
        return true;
      } catch (error) {
        // Fallback to localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        let currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
        currentWishlist = currentWishlist.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
        setWishlistItems(currentWishlist);
        toast.success('Removed from wishlist!');
        return true;
      }
    } else {
      // Use localStorage for non-logged-in users
      const savedWishlist = localStorage.getItem('wishlist');
      let currentWishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
      currentWishlist = currentWishlist.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(currentWishlist));
      setWishlistItems(currentWishlist);
      toast.success('Removed from wishlist!');
      return true;
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => (item.product_id?.id || item.id) === productId);
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};