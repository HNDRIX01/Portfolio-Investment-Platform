"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
  const [identifiant, setIdentifiant] = useState("");
  const [flowToken, setFlowToken] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const router = useRouter();

  // Ensure that axios sends cookies with requests
  axios.defaults.withCredentials = true;

  const handleStepOne = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/step-one-auth/", {
        identifiant,
        recaptcha: recaptchaValue,
      });
      if (response.data.flow_token) {
        setFlowToken(response.data.flow_token);
        setStep(2);
      }
    } catch (error) {
      setError("Step 1 Error: Authentication failed. Please check your credentials and try again.");
    }
    setLoading(false);
  };

  const handleStepTwo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:8000/step-two-auth/", {
        identifiant,
        password,
        flow_token: flowToken,
      });
      if (response.data.user) {
        // Tokens are now stored in HttpOnly cookies. Use user info to redirect.
        const role = response.data.user.role;
        if (role === "Investor") {
          router.push("/home/investor");
        } else if (role === "Manager") {
          router.push("/dashboard/gestionnaire");
        } else if (role === "Admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/login"); // fallback
        }
      }
    } catch (error) {
      setError("Step 2 Error: Login failed. Please check your password and try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            {step === 1
              ? "Enter your identifiant and solve the captcha"
              : "Enter your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {step === 1 ? (
            <form onSubmit={handleStepOne} className="space-y-4">
              <Input
                type="text"
                placeholder="Identifiant"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                required
              />
              <ReCAPTCHA
                sitekey="6LfPsc0qAAAAAC0U-uag9eVNSQQ4xSJP6GZ4pwKM"
                onChange={(value) => setRecaptchaValue(value)}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : "Next"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleStepTwo} className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
