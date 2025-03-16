"use client";
import { useState } from "react";
import api from "@/api"; // Adjust the alias/path if needed
import { Button } from "@/components/ui/button";

const Logout = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post("/logout/");
      // After logout, redirect to login page using plain JavaScript
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleLogout} disabled={loading}>
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
};

export default Logout;
