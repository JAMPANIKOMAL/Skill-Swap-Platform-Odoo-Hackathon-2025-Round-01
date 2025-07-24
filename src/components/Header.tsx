import { useState } from "react";
import { Search, User, Menu, Bell, LogOut, Settings, User as UserIcon, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  SkillSwap
                </span>
                <span className="text-xs text-slate-500 -mt-1">Connect & Learn</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search skills, users, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all duration-200"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-xl transition-all duration-200">
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </Button>
              
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative p-2 hover:bg-slate-100 rounded-xl transition-all duration-200">
                      <Avatar className="h-9 w-9 ring-2 ring-slate-200">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-xl border-slate-200">
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold leading-none text-slate-900">{user.name}</p>
                            <p className="text-xs leading-none text-slate-500 mt-1">{user.email}</p>
                          </div>
                        </div>
                        {user.isOnline && (
                          <div className="flex items-center space-x-2 text-xs text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Online</span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <UserIcon className="mr-3 h-4 w-4 text-slate-600" />
                      <span className="font-medium text-slate-700">Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/swaps')} className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <MessageCircle className="mr-3 h-4 w-4 text-slate-600" />
                      <span className="font-medium text-slate-700">Swap Requests</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <Settings className="mr-3 h-4 w-4 text-slate-600" />
                      <span className="font-medium text-slate-700">Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="p-3 rounded-lg hover:bg-red-50 cursor-pointer text-red-600">
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAuthModal(true)}
                  className="hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  <User className="h-5 w-5 text-slate-600" />
                </Button>
              )}
              
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-slate-100 rounded-xl transition-all duration-200">
                <Menu className="h-5 w-5 text-slate-600" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}