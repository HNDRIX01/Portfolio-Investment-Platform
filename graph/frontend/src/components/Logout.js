"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // or wherever you import your Button
import api from "@/api"; // Adjust the path if needed

const Logout = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // This POST call sends cookies automatically because `api` is configured withCredentials
      await api.post("/logout/");
      // After logout, redirect the user
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
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
