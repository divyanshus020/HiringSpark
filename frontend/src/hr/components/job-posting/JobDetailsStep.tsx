import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useJobPosting } from '../../context/JobPostingContext';
import { ArrowRight, Briefcase, MapPin, Clock, Users, Plus, X, Sparkles } from 'lucide-react';
import { createJobDraft, updateJobStep1, generateAIJobDescription } from '../../../api/hr/jobs.api';
import { toast } from 'react-toastify';
import { Loader2 as Spinner } from 'lucide-react';


const JobDetailsStep = () => {
  const { state, setJobDetails, setCurrentStep, setJobId } = useJobPosting();
  const [formData, setFormData] = useState(state.jobDetails);
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);


  // Create draft on component mount if no jobId exists
  useEffect(() => {
    const initializeDraft = async () => {
      if (!state.jobId) {
        try {
          const response = await createJobDraft();
          if (response.data.success) {
            setJobId(response.data.job._id);
          }
        } catch (error: any) {
          console.error('Error creating draft:', error);
          toast.error('Failed to initialize job posting');
        }
      }
    };
    initializeDraft();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update job step 1 with details
      const response = await updateJobStep1(state.jobId!, {
        jobTitle: formData.title,
        companyName: formData.company,
        location: formData.location,
        jobType: formData.jobType,
        minExp: formData.minExperience,
        maxExp: formData.maxExperience,
        openings: formData.openings,
        minSalary: formData.minSalary,
        maxSalary: formData.maxSalary,
        description: formData.description,
        requirements: formData.requirements,
        skills: formData.skills,
      });

      if (response.data.success) {
        setJobDetails(formData);
        toast.success('Job details saved!');
        setTimeout(() => {
          setCurrentStep(2);
          setIsLoading(false);
        }, 400);
      }
    } catch (error: any) {
      console.error('Error saving job details:', error);
      toast.error(error.response?.data?.message || 'Failed to save job details');
      setIsLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.title) {
      toast.warning('Please enter a job title first!');
      return;
    }

    setIsAiGenerating(true);
    try {
      const response = await generateAIJobDescription({
        jobTitle: formData.title,
        companyName: formData.company,
        location: formData.location,
        jobType: formData.jobType
      });

      if (response.data.success) {
        const { description, requirements, skills } = response.data.data;

        setFormData({
          ...formData,
          description: description || formData.description,
          requirements: Array.isArray(requirements) ? requirements.join('\n') : (requirements || formData.requirements),
          skills: Array.isArray(skills) ? [...new Set([...formData.skills, ...skills])] : formData.skills
        });

        toast.success('Job details generated successfully! ✨');
      }
    } catch (error: any) {
      console.error('Error generating AI job description:', error);
      toast.error(error.response?.data?.message || 'Failed to generate job details');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(skill => skill !== skillToRemove) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center z-50">
          <style>
            {`
              .loader {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100px;
                height: 100px;
                perspective: 780px;
              }
              .text {
                font-size: 20px;
                font-weight: 700;
                color: #6366f1;
                z-index: 10;
              }
              .load-inner {
                position: absolute;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 50%;
              }
              .load-inner.load-one {
                left: 0%;
                top: 0%;
                border-bottom: 3px solid #5c5edc;
                animation: rotate1 1.5s ease-in-out infinite;
              }
              .load-inner.load-two {
                right: 0%;
                top: 0%;
                border-right: 3px solid #9147ff;
                animation: rotate2 1.5s 0.15s ease-in-out infinite;
              }
              .load-inner.load-three {
                right: 0%;
                bottom: 0%;
                border-top: 3px solid #3b82f6;
                animation: rotate3 1.5s 0.3s ease-in-out infinite;
              }
              @keyframes rotate1 {
                0% {
                  transform: rotateX(45deg) rotateY(-45deg) rotateZ(0deg);
                }
                100% {
                  transform: rotateX(45deg) rotateY(-45deg) rotateZ(360deg);
                }
              }
              @keyframes rotate2 {
                0% {
                  transform: rotateX(45deg) rotateY(45deg) rotateZ(0deg);
                }
                100% {
                  transform: rotateX(45deg) rotateY(45deg) rotateZ(360deg);
                }
              }
              @keyframes rotate3 {
                0% {
                  transform: rotateX(-60deg) rotateY(0deg) rotateZ(0deg);
                }
                100% {
                  transform: rotateX(-60deg) rotateY(0deg) rotateZ(360deg);
                }
              }
            `}
          </style>
          <div className="loader">
            <div className="load-inner load-one"></div>
            <div className="load-inner load-two"></div>
            <div className="load-inner load-three"></div>
            <span className="text">Loading...</span>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-40 -mr-48 -mt-48"></div>

          <CardHeader className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
                Job Details
              </CardTitle>
            </div>
            <CardDescription className="text-base text-gray-600">
              Fill in the details for your job posting. Be specific to attract the right candidates.
            </CardDescription>
          </CardHeader>

          <CardContent className="relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Job Title & Company Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title" className="text-base font-semibold text-gray-700">Job Title *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGenerateAI}
                      disabled={isAiGenerating || !formData.title}
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2 h-8 px-3"
                    >
                      {isAiGenerating ? (
                        <Spinner className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                      {isAiGenerating ? 'Generating...' : 'Auto-Generate with AI ✨'}
                    </Button>
                  </div>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-base font-semibold text-gray-700">Company Name *</Label>
                  <Input
                    id="company"
                    placeholder="Your company name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Row 2: Location & Job Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2 text-base font-semibold text-gray-700">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    Location *
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Mumbai, Remote, Hybrid"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobType" className="flex items-center gap-2 text-base font-semibold text-gray-700">
                    <Clock className="h-4 w-4 text-indigo-600" />
                    Job Type *
                  </Label>
                  <Select
                    value={formData.jobType}
                    onValueChange={(value) => setFormData({ ...formData, jobType: value })}
                  >
                    <SelectTrigger className="h-12 border-gray-200 shadow-sm">
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Experience & Openings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minExperience" className="text-base font-semibold text-gray-700">Min Experience (years)</Label>
                  <Input
                    id="minExperience"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.minExperience || ''}
                    onChange={(e) => setFormData({ ...formData, minExperience: parseInt(e.target.value) || 0 })}
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxExperience" className="text-base font-semibold text-gray-700">Max Experience (years)</Label>
                  <Input
                    id="maxExperience"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.maxExperience || ''}
                    onChange={(e) => setFormData({ ...formData, maxExperience: parseInt(e.target.value) || 0 })}
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openings" className="flex items-center gap-2 text-base font-semibold text-gray-700">
                    <Users className="h-4 w-4 text-indigo-600" />
                    No. of Openings
                  </Label>
                  <Input
                    id="openings"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.openings || ''}
                    onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) || 1 })}
                    className="h-12 border-indigo-300 bg-indigo-50 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Row 4: Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minSalary" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                    <span className="text-emerald-600 font-bold text-lg">₹</span>
                    Min Salary (₹/year)
                  </Label>
                  <Input
                    id="minSalary"
                    placeholder="e.g., 500000"
                    value={formData.minSalary}
                    onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSalary" className="text-base font-semibold text-gray-700">Max Salary (₹/year)</Label>
                  <Input
                    id="maxSalary"
                    placeholder="e.g., 1000000"
                    value={formData.maxSalary}
                    onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-700">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                  className="min-h-[140px] border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-base font-semibold text-gray-700">Requirements *</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the qualifications, education, and experience required..."
                  className="min-h-[140px] border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm resize-none"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                />
              </div>

              {/* Required Skills */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Required Skills
                </Label>
                <div className="flex gap-3">
                  <Input
                    placeholder="Add a skill (e.g., React, Python)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addSkill} className="h-12 w-12 border-indigo-200 hover:bg-indigo-50">
                    <Plus className="h-5 w-5 text-indigo-600" />
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {formData.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-indigo-200 rounded-full p-1 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <Button type="submit" size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all px-8 h-14 text-base">
                  Continue to Plan Selection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default JobDetailsStep;
