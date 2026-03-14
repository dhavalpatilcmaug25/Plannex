import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load from local storage if available
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        // Save to local storage whenever cart changes
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (service) => {
        setCartItems(prevItems => {
            // Check if item already exists to avoid duplicates
            if (prevItems.find(item => item.id === service.id)) {
                return prevItems;
            }
            return [...prevItems, service];
        });
    };

    const removeFromCart = (serviceId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== serviceId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            // Parse price string to number (e.g., "₹15,000" -> 15000)
            const priceString = item.price.toString().replace(/[^0-9]/g, '');
            const price = parseInt(priceString, 10) || 0;
            return total + price;
        }, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
