import { useState } from "react";
import { authAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "../components/ui/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast({ title: "Check your email!", description: "If that email is registered, a reset link has been sent." });
      setEmail("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send reset link.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-lg shadow max-w-md w-full space-y-6 border border-border">
        <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !email}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
        {sent && (
          <div className="text-green-600 text-sm text-center mt-2">
            If that email is registered, a reset link has been sent.
          </div>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword; 