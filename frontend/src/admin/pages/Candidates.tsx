import Header from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Filter, Mail, Phone, MapPin, Briefcase, Users as UsersIcon } from 'lucide-react';

const Candidates = () => {
  const candidates = [
    {
      id: 1,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 98765 43210',
      location: 'Mumbai',
      appliedFor: 'Senior Software Engineer',
      experience: '5 years',
      status: 'Shortlisted',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 2,
      name: 'Rahul Verma',
      email: 'rahul.verma@email.com',
      phone: '+91 87654 32109',
      location: 'Bangalore',
      appliedFor: 'Product Manager',
      experience: '7 years',
      status: 'Interview Scheduled',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 3,
      name: 'Anjali Patel',
      email: 'anjali.patel@email.com',
      phone: '+91 76543 21098',
      location: 'Delhi',
      appliedFor: 'UI/UX Designer',
      experience: '3 years',
      status: 'Under Review',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Shortlisted':
        return 'default';
      case 'Interview Scheduled':
        return 'secondary';
      case 'Under Review':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <main className="container py-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent flex items-center gap-3">
              <UsersIcon className="h-10 w-10 text-indigo-600" />
              Candidates
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage and review all your job applicants
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search candidates by name, email, or position..." 
              className="pl-12 h-14 border-0 shadow-lg bg-white focus:ring-2 focus:ring-indigo-500 text-lg"
            />
          </div>
          <Button variant="outline" className="gap-2 h-14 px-6 border-0 shadow-lg bg-white hover:bg-gray-50">
            <Filter className="h-5 w-5" />
            Filters
          </Button>
        </div>

        {/* Candidates List */}
        <div className="space-y-4">
          {candidates.map((candidate, index) => (
            <Card 
              key={candidate.id} 
              className="border-0 shadow-xl transition-all duration-300 overflow-hidden group hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${candidate.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              <CardContent className="p-6 relative">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${candidate.color} text-white font-bold text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{candidate.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4 text-indigo-500" />
                          {candidate.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4 text-indigo-500" />
                          {candidate.phone}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          {candidate.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                          <Briefcase className="h-4 w-4" />
                          {candidate.appliedFor}
                        </span>
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
                          {candidate.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    <Badge variant={getStatusVariant(candidate.status)} className="shadow-sm text-sm py-1.5 px-4">
                      {candidate.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm font-medium transition-all duration-300"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State Message (if needed later) */}
        {candidates.length === 0 && (
          <Card className="border-0 shadow-xl mt-12">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <UsersIcon className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No candidates yet</h3>
              <p className="text-gray-600 mb-6">
                Start posting jobs to receive applications from talented candidates.
              </p>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                Create Your First Job Post
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Candidates;
