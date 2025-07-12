import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "../components/ui/use-toast";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await authAPI.resetPassword({ token, newPassword });
      setSuccess(true);
      toast({ title: "Password reset successful!", description: "You can now log in with your new password." });
      setNewPassword("");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to reset password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="bg-card p-8 rounded-lg shadow max-w-md w-full border border-border text-center">
          <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
          <p className="text-muted-foreground">Reset token is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow max-w-md w-full space-y-6 border border-border">
        <h2 className="text-2xl font-bold mb-2">Set New Password</h2>
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Enter your new password"
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !newPassword}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
        {success && (
          <div className="text-green-600 text-sm text-center mt-2">
            Password reset successful! Redirecting to login...
          </div>
        )}
      </form>
    </div>
  );
};

export default ResetPassword; 