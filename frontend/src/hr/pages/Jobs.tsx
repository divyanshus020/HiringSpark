import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
    Briefcase,
    Users,
    Eye,
    Loader2,
    Trash2,
    Plus,
    Search,
    Pencil,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllJobs, deleteJob } from "../../api/hr/jobs.api";
import { toast } from "react-toastify";
import { Input } from "../components/ui/input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../components/ui/alert-dialog";

const Jobs = (): JSX.Element => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [jobToDelete, setJobToDelete] = useState<{ id: string, title: string } | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const navigate = useNavigate();

    const fetchJobs = async () => {
        try {
            setIsLoading(true);
            const jobsResponse = await getAllJobs();
            if (jobsResponse.data.success) {
                // Filter out draft jobs WITHOUT jobTitle, but keep others
                const allJobs = (jobsResponse.data.jobs || []).filter((job: any) =>
                    job.status !== 'draft' || (job.jobTitle && job.jobTitle.trim() !== '')
                );
                setJobs(allJobs);
                setFilteredJobs(allJobs);
            }
        } catch (error: any) {
            console.error("Error fetching jobs:", error);
            toast.error("Failed to load jobs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        let result = jobs;

        // Search filter
        if (searchTerm) {
            result = result.filter(job =>
                job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (activeFilter !== "all") {
            if (activeFilter === "posted") {
                result = result.filter(job =>
                    job.status?.toLowerCase() === "posted" ||
                    job.status?.toLowerCase() === "active"
                );
            } else {
                result = result.filter(job => job.status?.toLowerCase() === activeFilter.toLowerCase());
            }
        }

        setFilteredJobs(result);
    }, [searchTerm, activeFilter, jobs]);

    const handleDeleteJob = async (jobId: string, jobTitle: string) => {
        setJobToDelete({ id: jobId, title: jobTitle });
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!jobToDelete) return;

        setIsDeleteDialogOpen(false);
        setDeletingJobId(jobToDelete.id);
        try {
            const response = await deleteJob(jobToDelete.id);
            if (response.data.success) {
                toast.success("Job deleted successfully!");
                await fetchJobs();
            }
        } catch (error: any) {
            console.error("Error deleting job:", error);
            toast.error(error.response?.data?.message || "Failed to delete job");
        } finally {
            setDeletingJobId(null);
            setJobToDelete(null);
        }
    };

    const handleViewCandidates = (jobId: string) => {
        navigate(`/hr/candidates?jobId=${jobId}`);
    };

    const getStatusVariant = (
        status: string
    ): "default" | "secondary" | "outline" | "destructive" => {
        switch (status?.toLowerCase()) {
            case "active":
            case "posted":
                return "default";
            case "draft":
                return "secondary";
            case "pending":
                return "outline";
            case "rejected":
                return "destructive";
            default:
                return "default";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toLowerCase()) {
            case "posted": return "Active";
            case "pending": return "Pending Review";
            default: return status?.charAt(0).toUpperCase() + status?.slice(1);
        }
    };

    const filters = [
        { label: "All Jobs", value: "all" },
        { label: "Active", value: "posted" },
        { label: "Pending", value: "pending" },
        { label: "Drafts", value: "draft" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <Header />

            <main className="container py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">
                            My Job Postings
                        </h1>
                        <p className="text-gray-600 mt-1">Manage all your vacancies and applications</p>
                    </div>
                    <Link to="/hr/create-job">
                        <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                            <Plus className="h-5 w-5" />
                            Create New Job
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="grid gap-6 mb-8">
                    <Card className="border-0 shadow-xl">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    {filters.map((filter) => (
                                        <Button
                                            key={filter.value}
                                            variant={activeFilter === filter.value ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setActiveFilter(filter.value)}
                                            className={activeFilter === filter.value
                                                ? "bg-indigo-600 hover:bg-indigo-700"
                                                : "text-gray-600 hover:text-indigo-600 border-gray-200"
                                            }
                                        >
                                            {filter.label}
                                        </Button>
                                    ))}
                                </div>
                                <div className="relative w-full md:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search jobs..."
                                        className="pl-10 border-gray-200 focus:border-indigo-300 transition-colors"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Jobs List */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredJobs.length === 0 ? (
                            <Card className="border-0 shadow-lg border-dashed bg-white/50">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                                        <Briefcase className="h-10 w-10 text-indigo-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">No jobs found</h3>
                                    <p className="text-gray-500 mt-2 max-w-xs">
                                        We couldn't find any job postings matching your current filters.
                                    </p>
                                    <Button
                                        variant="link"
                                        className="mt-2 text-indigo-600"
                                        onClick={() => { setActiveFilter("all"); setSearchTerm(""); }}
                                    >
                                        Clear all filters
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredJobs.map((job) => (
                                <motion.div
                                    key={job._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    layout
                                >
                                    <Card className="border-0 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                    <Briefcase className="h-8 w-8 text-indigo-600" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-xl font-bold text-gray-900 truncate">
                                                        {job.jobTitle || 'Untitled Job'}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-1 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-semibold text-gray-900">{job.companyName}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            {job.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {job.jobType}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="flex flex-col items-end mr-4">
                                                        <Badge variant={getStatusVariant(job.status)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                                                            {getStatusLabel(job.status)}
                                                        </Badge>
                                                        <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">
                                                            {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
                                                        {job.status === 'draft' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => navigate(`/hr/create-job?id=${job._id}`)}
                                                                className="gap-2 border-amber-100 hover:border-amber-200 hover:bg-amber-50 text-amber-600"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Edit Draft
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewCandidates(job._id)}
                                                                className="gap-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 text-indigo-600"
                                                            >
                                                                <Users className="h-4 w-4" />
                                                                Candidates
                                                                <Badge className="ml-1 bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-100">
                                                                    {job.applications || 0}
                                                                </Badge>
                                                            </Button>
                                                        )}

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteJob(job._id, job.jobTitle)}
                                                            disabled={deletingJobId === job._id}
                                                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            {deletingJobId === job._id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </main>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the job posting for "{jobToDelete?.title}" and remove all associated candidate data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete Job
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Jobs;
