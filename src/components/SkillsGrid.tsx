import { useState, useEffect } from "react";
import { SkillCard } from "./SkillCard";
import { usersAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface User {
  id: string;
  name: string;
  avatar?: string;
  location?: string;
  rating: number;
  totalSwaps: number;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string;
  isOnline: boolean;
}

const AVAILABILITY_OPTIONS = [
  "All",
  "Flexible",
  "Weekdays",
  "Weekends",
  "Evenings",
  "Weekdays & Evenings",
];

export function SkillsGrid() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("All");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters: any = {
          limit: 3,
          page,
        };
        if (search) filters.search = search;
        if (availability !== "All") filters.availability = availability;
        const response = await usersAPI.getUsers(filters);
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
  }, [isAuthenticated, user?.id, page, search, availability]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // search state is already updated onChange
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Search & Filter Controls */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 mb-6 items-center">
          <Input
            type="text"
            placeholder="Search skills or users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={availability}
            onChange={e => { setAvailability(e.target.value); setPage(1); }}
            className="border rounded px-2 py-2 max-w-xs"
          >
            {AVAILABILITY_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <Button type="submit" className="md:ml-2">Search</Button>
        </form>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Available Skills</h2>
            <p className="text-muted-foreground">
              {users.length > 0 
                ? `Connect with ${users.length} talented people in your area`
                : 'No users found. Be the first to join!'
              }
            </p>
            {isAuthenticated && user && (
              <p className="text-sm text-muted-foreground mt-1">
                Logged in as: {user.name} (your profile is hidden from this list)
              </p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {users.length} results
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-muted rounded-lg p-6 h-64" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-destructive py-12">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
            <p className="text-muted-foreground mb-4">
              {isAuthenticated 
                ? 'Try adjusting your search filters or check back later.'
                : 'Sign up to start connecting with other users!'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <SkillCard
                  key={user.id}
                  user={user}
                  skillsOffered={user.skillsOffered}
                  skillsWanted={user.skillsWanted}
                  availability={user.availability}
                  isOnline={user.isOnline}
                />
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-center mt-8 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}