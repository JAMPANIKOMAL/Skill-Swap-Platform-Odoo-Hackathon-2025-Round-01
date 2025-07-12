import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, Users, BookOpen, Zap, Star, MapPin } from "lucide-react";

export function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
      
      <div className="relative container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Join 10,000+ professionals</span>
      </div>
      
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                {isAuthenticated 
                  ? `Welcome back, ${user?.name}`
                  : "Connect, Learn & Grow Together"
                }
          </h1>
          
              <p className="text-xl text-slate-600 mb-8 max-w-2xl leading-relaxed">
                {isAuthenticated
                  ? "Ready to share your expertise or discover new skills? Start exploring opportunities in your area."
                  : "Join our vibrant community where knowledge flows freely. Teach what you know, learn what you don't."
                }
              </p>
              
              {/* Action Buttons */}
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-8 py-4 text-lg"
                  >
                    See How It Works
                  </Button>
                </div>
              )}

              {isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
              Browse Skills
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-8 py-4 text-lg"
                  >
                    My Profile
            </Button>
                </div>
              )}
            </div>

            {/* Right Content - Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Connect</h3>
                <p className="text-slate-600 text-sm">Find like-minded professionals in your area</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Learn</h3>
                <p className="text-slate-600 text-sm">Master new skills from experienced professionals</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Grow</h3>
                <p className="text-slate-600 text-sm">Build your network and professional reputation</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Local</h3>
                <p className="text-slate-600 text-sm">Connect with people in your local community</p>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">10K+</div>
              <div className="text-slate-600 text-sm">Active Users</div>
              </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">50K+</div>
              <div className="text-slate-600 text-sm">Skills Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">95%</div>
              <div className="text-slate-600 text-sm">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-2">200+</div>
              <div className="text-slate-600 text-sm">Cities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}