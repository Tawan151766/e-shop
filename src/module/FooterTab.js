// src/module/FooterTab.js
"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { motion } from 'framer-motion';

export default function FooterTab() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  
  const isActive = (path) => pathname === path;

  // ดึงจำนวนสินค้าในตะกร้า
  useEffect(() => {
    if (session) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [session]);

  // ฟังการอัปเดต cart
  useEffect(() => {
    const handleCartUpdate = () => {
      if (session) {
        fetchCartCount();
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [session]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart/count");
      const data = await response.json();
      setCartCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };
  
  const handleNavigation = (path) => {
    // ถ้าเป็น cart และ user ยังไม่ login ให้ไปหน้า signin
    if (path === '/cart' && !session) {
      router.push("/auth/signin?callbackUrl=/cart");
    } else {
      router.push(path);
    }
  };

  const tabVariants = {
    inactive: { 
      scale: 1,
      opacity: 0.7
    },
    active: { 
      scale: 1.05,
      opacity: 1
    },
    tap: { 
      scale: 0.95 
    }
  };

  return (
    <div className="sticky bottom-0">
      <div className="flex gap-2 border-t border-[#f4f2f0] bg-white px-4 pb-3 pt-2">
        {/* Home Tab */}
        <motion.button
          className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/') ? 'text-[#181411]' : 'text-[#887563]'}`}
          onClick={() => handleNavigation('/')}
          variants={tabVariants}
          initial="inactive"
          animate={isActive('/') ? "active" : "inactive"}
          whileTap="tap"
          transition={{ duration: 0.2 }}
        >
          <div className={`flex h-8 items-center justify-center ${isActive('/') ? 'text-[#181411]' : 'text-[#887563]'}`} data-icon="House" data-size="24px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.10Z" />
            </svg>
          </div>
          <p className={`text-xs font-medium leading-normal tracking-[0.015em] ${isActive('/') ? 'text-[#181411]' : 'text-[#887563]'}`}>Home</p>
        </motion.button>

        {/* About Me Tab */}
        <motion.button
          className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/about') ? 'text-[#181411]' : 'text-[#887563]'}`}
          onClick={() => handleNavigation('/about')}
          variants={tabVariants}
          initial="inactive"
          animate={isActive('/about') ? "active" : "inactive"}
          whileTap="tap"
          transition={{ duration: 0.2 }}
        >
          <div className={`flex h-8 items-center justify-center ${isActive('/about') ? 'text-[#181411]' : 'text-[#887563]'}`} data-icon="User" data-size="24px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
            </svg>
          </div>
          <p className={`text-xs font-medium leading-normal tracking-[0.015em] ${isActive('/about') ? 'text-[#181411]' : 'text-[#887563]'}`}>About Me</p>
        </motion.button>

        {/* Shopping Cart Tab */}
        <motion.button
          className={`flex flex-1 flex-col items-center justify-end gap-1 relative ${isActive('/cart') ? 'text-[#181411]' : 'text-[#887563]'}`}
          onClick={() => handleNavigation('/cart')}
          variants={tabVariants}
          initial="inactive"
          animate={isActive('/cart') ? "active" : "inactive"}
          whileTap="tap"
          transition={{ duration: 0.2 }}
        >
          <div className={`flex h-8 items-center justify-center relative ${isActive('/cart') ? 'text-[#181411]' : 'text-[#887563]'}`} data-icon="ShoppingCart" data-size="24px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16H34.05l31.1,165.9A24,24,0,0,0,88.1,216h16.51a32,32,0,0,0,63.44,0h16.51a32,32,0,0,0,63.44,0H264a8,8,0,0,0,0-16H216.1A24,24,0,0,0,239.05,184.1L222.14,58.87ZM96,204a8,8,0,1,1-8-8A8,8,0,0,1,96,204Zm128,0a8,8,0,1,1-8-8A8,8,0,0,1,224,204Zm4-32H88.1L69.22,72H209.78Z" />
            </svg>
            {/* Cart Badge with Dynamic Count */}
            {session && cartCount > 0 && (
              <motion.div 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium min-w-[16px]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </motion.div>
            )}
          </div>
          <p className={`text-xs font-medium leading-normal tracking-[0.015em] ${isActive('/cart') ? 'text-[#181411]' : 'text-[#887563]'}`}>Cart</p>
        </motion.button>

        {/* Contact Tab */}
        <motion.button
          className={`flex flex-1 flex-col items-center justify-end gap-1 ${isActive('/contact') ? 'text-[#181411]' : 'text-[#887563]'}`}
          onClick={() => handleNavigation('/contact')}
          variants={tabVariants}
          initial="inactive"
          animate={isActive('/contact') ? "active" : "inactive"}
          whileTap="tap"
          transition={{ duration: 0.2 }}
        >
          <div className={`flex h-8 items-center justify-center ${isActive('/contact') ? 'text-[#181411]' : 'text-[#887563]'}`} data-icon="ChatCircle" data-size="24px" data-weight="regular">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z" />
            </svg>
          </div>
          <p className={`text-xs font-medium leading-normal tracking-[0.015em] ${isActive('/contact') ? 'text-[#181411]' : 'text-[#887563]'}`}>Contact</p>
        </motion.button>

        {/* Profile Tab */}
        <motion.button
          className={`flex flex-1 flex-col items-center justify-end gap-1 rounded-full ${isActive('/profile') ? 'text-[#181411]' : 'text-[#887563]'}`}
          onClick={() => {
            if (!session) {
              router.push("/auth/signin?callbackUrl=/profile");
            } else {
              handleNavigation('/profile');
            }
          }}
          variants={tabVariants}
          initial="inactive"
          animate={isActive('/profile') ? "active" : "inactive"}
          whileTap="tap"
          transition={{ duration: 0.2 }}
        >
          <div className={`flex h-8 items-center justify-center relative ${isActive('/profile') ? 'text-[#181411]' : 'text-[#887563]'}`} data-icon="User" data-size="24px" data-weight="fill">
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z" />
            </svg>
            {/* Login indicator */}
            {session && (
              <motion.div 
                className="absolute -top-1 -right-1 bg-green-500 rounded-full h-3 w-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 500 }}
              />
            )}
          </div>
          <p className={`text-xs font-medium leading-normal tracking-[0.015em] ${isActive('/profile') ? 'text-[#181411]' : 'text-[#887563]'}`}>
            {session ? 'Profile' : 'Login'}
          </p>
        </motion.button>
      </div>
      <div className="h-5 bg-white"></div>
    </div>
  );
}