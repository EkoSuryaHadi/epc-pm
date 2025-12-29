'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModernCard } from '@/components/ui/modern-card';
import { 
  Plus, 
  Search, 
  Building2, 
  Calendar,
  DollarSign,
  MapPin,
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutDashboard,
  Layers,
  BarChart3,
  CalendarDays,
  TrendingUpIcon,
  FileText,
  AlertTriangle,
  Flag,
  Activity,
  TrendingDown,
  GitPullRequest,
  MoreHorizontal,
  ChevronDown,
  Pencil,
  Trash2
} from 'lucide-react';
import { createApiMethods } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

export default function ModernProjectsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.projects.getAll();
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [session, toast]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'ACTIVE').length,
    totalBudget: projects.reduce((sum, p) => {
      const budget = Number(p.totalBudget) || 0;
      console.log(`Adding budget: ${budget}, Running sum: ${sum + budget}`);
      return sum + budget;
    }, 0),
  };

  console.log('Final Total Budget:', stats.totalBudget);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-10 w-64 bg-white/50 rounded-lg animate-pulse" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Manage your EPC project portfolio
            </p>
          </div>
          <Link href="/dashboard/projects/new">
            <Button size="lg" className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-primary">
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <ModernCard
            title="Total Projects"
            value={stats.total}
            subtitle="All projects"
            icon={Building2}
            gradient="blue"
          />
          <ModernCard
            title="Active Projects"
            value={stats.active}
            subtitle="Currently running"
            icon={TrendingUp}
            gradient="green"
            trend={{ value: "12%", isPositive: true }}
          />
          <ModernCard
            title="Total Budget"
            value={`$${(stats.totalBudget / 1000000).toFixed(2)}M`}
            subtitle="Combined budget"
            icon={DollarSign}
            gradient="purple"
          />
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg rounded-2xl border-2 focus:border-primary-500 shadow-lg"
          />
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-2 flex items-center gap-2">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {project.description || 'No description'}
                          </p>
                        </div>
                        <div className="flex gap-2 items-start">
                          <Link 
                            href={`/dashboard/projects/${project.id}/edit`} 
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Edit Project"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-primary">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{project.location || 'Location not set'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold">
                            ${(project.totalBudget / 1000000).toFixed(2)}M
                          </span>
                          <span className="text-gray-400">Budget</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          project.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {project.status}
                        </span>
                      </div>

                      {/* Module Quick Links */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Access</p>
                        <div className="grid grid-cols-3 gap-2">
                          <Link href={`/dashboard/projects/${project.id}/dashboard`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300">
                              <LayoutDashboard className="h-3 w-3 mr-1" />
                              Dashboard
                            </Button>
                          </Link>
                          <Link href={`/dashboard/projects/${project.id}/wbs`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                              <Layers className="h-3 w-3 mr-1" />
                              WBS
                            </Button>
                          </Link>
                          <Link href={`/dashboard/projects/${project.id}/cost-codes`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-green-50 hover:text-green-700 hover:border-green-300">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Cost
                            </Button>
                          </Link>
                          <Link href={`/dashboard/projects/${project.id}/schedule`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300">
                              <CalendarDays className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          </Link>
                          <Link href={`/dashboard/projects/${project.id}/milestones`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300">
                              <Flag className="h-3 w-3 mr-1" />
                              Milestones
                            </Button>
                          </Link>
                          <Link href={`/dashboard/projects/${project.id}/progress`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300">
                              <TrendingUpIcon className="h-3 w-3 mr-1" />
                              Progress
                            </Button>
                          </Link>
                          <Link href={`/dashboard/projects/${project.id}/documents`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300">
                              <FileText className="h-3 w-3 mr-1" />
                              Docs
                            </Button>
                          </Link>
                          <Link href={`/dashboard/projects/${project.id}/risks`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Risks
                            </Button>
                          </Link>
                          <Link href={`/dashboard/projects/${project.id}/gantt`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Gantt
                            </Button>
                          </Link>
                        </div>

                        {/* More Modules Dropdown */}
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 flex items-center justify-between"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedProject(expandedProject === project.id ? null : project.id);
                            }}
                          >
                            <span className="flex items-center gap-2">
                              <MoreHorizontal className="h-3 w-3" />
                              More Modules (5)
                            </span>
                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`} />
                          </Button>

                          {expandedProject === project.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="grid grid-cols-1 gap-2 mt-2 pt-2 border-t border-gray-100"
                            >
                              <Link href={`/dashboard/projects/${project.id}/kpi`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 justify-start">
                                  <Activity className="h-3 w-3 mr-2" />
                                  KPI Dashboard
                                </Button>
                              </Link>
                              <Link href={`/dashboard/projects/${project.id}/evm`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 justify-start">
                                  <TrendingDown className="h-3 w-3 mr-2" />
                                  EVM Analysis
                                </Button>
                              </Link>
                              <Link href={`/dashboard/projects/${project.id}/change-orders`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-pink-50 hover:text-pink-700 hover:border-pink-300 justify-start">
                                  <GitPullRequest className="h-3 w-3 mr-2" />
                                  Change Orders
                                </Button>
                              </Link>
                              <Link href={`/dashboard/projects/${project.id}/cost-entries`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-green-50 hover:text-green-700 hover:border-green-300 justify-start">
                                  <DollarSign className="h-3 w-3 mr-2" />
                                  Cost Entries
                                </Button>
                              </Link>
                              <Link href={`/dashboard/projects/${project.id}/cost-analysis`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 justify-start">
                                  <BarChart3 className="h-3 w-3 mr-2" />
                                  Cost Analysis
                                </Button>
                              </Link>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom accent line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-purple-500 origin-left"
                    />
                  </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first project'
              }
            </p>
            {!searchQuery && (
              <Link href="/dashboard/projects/new">
                <Button size="lg" className="bg-gradient-to-r from-primary-600 to-primary-700">
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Project
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
