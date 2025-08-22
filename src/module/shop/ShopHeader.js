"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ShopHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleAuthAction = () => {
    if (session) {
      // If logged in, show user menu or sign out
      signOut();
    } else {
      // If not logged in, redirect to sign in
      signIn("google");
    }
  };

  const handleCartClick = () => {
    if (session) {
      router.push("/cart");
    } else {
      // Redirect to login first
      router.push("/auth/signin?callbackUrl=/cart");
    }
  };

  return (
    <div className="flex items-center bg-white p-4 pb-2 justify-between border-b border-gray-100">
      <h2 className="text-[#181411] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
        Shop
      </h2>
      
      <div className="flex items-center gap-3">
        {/* User Profile/Login Section */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            // Loading state
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          ) : session ? (
            // Logged in user
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 cursor-pointer" onClick={handleAuthAction}>
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {session.user?.name?.split(" ")[0] || "User"}
                </span>
              </div>
              
              {/* Dropdown menu (optional) */}
              <div className="relative group">
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                </button>
                
                {/* Dropdown content */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <button 
                      onClick={() => router.push("/profile")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/>
                      </svg>
                      Profile
                    </button>
                    <button 
                      onClick={() => router.push("/orders")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,144H32V64H224V192ZM176,88a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,88Zm0,32a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,120Z"/>
                      </svg>
                      Orders
                    </button>
                    <hr className="my-1" />
                    <button 
                      onClick={handleAuthAction}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"/>
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Not logged in
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/>
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>

        {/* Shopping Cart */}
        <button
          onClick={handleCartClick}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-[#181411] gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 relative hover:bg-gray-50 transition-colors"
        >
          <div className="text-[#181411] relative">
            {/* Shopping Bag Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z" />
            </svg>
            
            {/* Cart Badge (optional - you can add cart item count here) */}
            {session && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                0
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}