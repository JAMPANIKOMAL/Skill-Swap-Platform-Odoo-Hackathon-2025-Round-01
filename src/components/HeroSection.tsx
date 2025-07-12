import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";

export function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {isAuthenticated 
              ? `Welcome back, ${user?.name}!`
              : "Connect, Learn, and Grow Together"
            }
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {isAuthenticated
              ? "Ready to share your skills or learn something new? Start exploring!"
              : "Join our community of skill-swappers and discover amazing opportunities to learn and teach."
            }
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Learn More
              </Button>
            </div>
          )}

          {isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Browse Skills
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                My Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}