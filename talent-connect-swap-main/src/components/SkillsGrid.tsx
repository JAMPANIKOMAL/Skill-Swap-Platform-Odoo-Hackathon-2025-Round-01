import { useState, useEffect } from "react";
import { SkillCard } from "./SkillCard";
import { usersAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Users, TrendingUp, Sparkles, Filter } from "lucide-react";

interface User {
  id: string;
  name: string;
  avatar?: string;
  location: string;
  bio?: string;
  rating: number;
  averageRating?: number;
  totalSwaps: number;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  isOnline: boolean;
  lastSeen: string;
}

export function SkillsGrid() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters: any = {
          limit: 9,
          page,
        };
        if (search) filters.search = search;
        const response = await usersAPI.getUsers(filters);
        // Debug: print all user ids and current user id
        if (isAuthenticated && user) {
          console.log('Current user id:', user.id);
          console.log('Fetched user ids:', response.data.users.map((u: User) => u.id));
        }
        // Double-check: filter out current user on frontend as well
        const filteredUsers = response.data.users.filter((u: User) => {
          if (isAuthenticated && user && u.id === user.id) return false;
          return true;
        });
        setUsers(filteredUsers);
        setTotalPages(response.data.pagination.pages || 1);
      } catch (err: any) {
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [isAuthenticated, user?.id, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // search state is already updated onChange
  };

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Enhanced Search Section */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Discover Amazing Skills</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Find Your Perfect Skill Match
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Connect with talented people in your area who are ready to share their expertise
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search for skills, users, or locations..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl shadow-lg focus:shadow-xl transition-all duration-300"
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Stats and Info */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{users.length}</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">95%</div>
                <div className="text-sm text-slate-600">Success Rate</div>
              </div>
            </div>
          </div>
          
          {isAuthenticated && user && (
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 font-medium">
                Logged in as: {user.name} (your profile is hidden)
              </span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-2xl p-6 h-80 shadow-lg border border-slate-200">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-red-500 mb-6">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Something went wrong</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Try Again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-slate-400 mb-6">
              <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">No users found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {isAuthenticated 
                ? 'Try adjusting your search or check back later for new users.'
                : 'Be the first to join our community and start sharing your skills!'
              }
            </p>
            {!isAuthenticated && (
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold text-lg">
                Join Now
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {users.map((user) => {
                console.log('Rendering user:', user.id, user.name);
                return (
                  <div key={user.id} className="transform hover:scale-105 transition-all duration-300">
                    <SkillCard
                      user={user}
                      skillsOffered={user.skillsOffered}
                      skillsWanted={user.skillsWanted}
                      availability={user.availability}
                      isOnline={user.isOnline}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl hover:bg-slate-100 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-2 rounded-xl ${
                          page === i + 1 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl hover:bg-slate-100 disabled:opacity-50"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}