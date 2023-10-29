import Link from "next/link";
import React from "react";

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-center text-2xl font-semibold">
          Email Successfully Confirmed
        </h1>
        <p className="mb-8 text-center text-gray-600">
          Thank you for confirming your email.
        </p>
        <div className="flex justify-center">
          <a href="/" className="text-blue-500 hover:underline">
            Go to Home Page
          </a>
        </div>
      </div>
    </div>
  );
}
