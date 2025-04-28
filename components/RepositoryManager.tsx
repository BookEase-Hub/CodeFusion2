"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Repository {
  id: number;
  name: string;
  full_name?: string;
  description: string;
  html_url: string;
  default_branch: string;
  private: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string;
  web_url: string;
  default_branch: string;
  visibility: string;
}

export default function RepositoryManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [githubRepos, setGithubRepos] = useState<Repository[]>([]);
  const [gitlabProjects, setGitlabProjects] = useState<Project[]>([]);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (user?.githubToken) {
      fetchGithubRepositories();
    }
    if (user?.gitlabToken) {
      fetchGitlabProjects();
    }
  }, [user]);

  const fetchGithubRepositories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vcs/github/repositories');
      setGithubRepos(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch GitHub repositories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGitlabProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/vcs/gitlab/projects');
      setGitlabProjects(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch GitLab projects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGithubRepo = async () => {
    try {
      setLoading(true);
      await axios.post('/api/vcs/github/repositories', {
        name: newRepoName,
        description: newRepoDescription,
        private: isPrivate
      });
      toast({
        title: 'Success',
        description: 'GitHub repository created successfully'
      });
      fetchGithubRepositories();
      setNewRepoName('');
      setNewRepoDescription('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create GitHub repository',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGitlabProject = async () => {
    try {
      setLoading(true);
      await axios.post('/api/vcs/gitlab/projects', {
        name: newRepoName,
        description: newRepoDescription,
        visibility: isPrivate ? 'private' : 'public'
      });
      toast({
        title: 'Success',
        description: 'GitLab project created successfully'
      });
      fetchGitlabProjects();
      setNewRepoName('');
      setNewRepoDescription('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create GitLab project',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const connectGithub = () => {
    window.location.href = `/api/vcs/github/connect`;
  };

  const connectGitlab = () => {
    window.location.href = `/api/vcs/gitlab/connect`;
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="github" className="space-y-4">
        <TabsList>
          <TabsTrigger value="github">GitHub</TabsTrigger>
          <TabsTrigger value="gitlab">GitLab</TabsTrigger>
        </TabsList>

        <TabsContent value="github" className="space-y-4">
          {!user?.githubToken ? (
            <Button onClick={connectGithub}>Connect GitHub Account</Button>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create New Repository</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create GitHub Repository</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Repository Name</Label>
                      <Input
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        placeholder="my-awesome-project"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={newRepoDescription}
                        onChange={(e) => setNewRepoDescription(e.target.value)}
                        placeholder="Project description..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                      />
                      <Label htmlFor="private">Private Repository</Label>
                    </div>
                    <Button onClick={handleCreateGithubRepo} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Repository'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {githubRepos.map((repo) => (
                  <Card key={repo.id} className="p-4">
                    <h3 className="font-semibold">{repo.name}</h3>
                    <p className="text-sm text-gray-500">{repo.description}</p>
                    <div className="mt-4 flex justify-between">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                          View Repository
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="gitlab" className="space-y-4">
          {!user?.gitlabToken ? (
            <Button onClick={connectGitlab}>Connect GitLab Account</Button>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create New Project</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create GitLab Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        placeholder="my-awesome-project"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={newRepoDescription}
                        onChange={(e) => setNewRepoDescription(e.target.value)}
                        placeholder="Project description..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                      />
                      <Label htmlFor="private">Private Project</Label>
                    </div>
                    <Button onClick={handleCreateGitlabProject} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {gitlabProjects.map((project) => (
                  <Card key={project.id} className="p-4">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.description}</p>
                    <div className="mt-4 flex justify-between">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {project.visibility}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.web_url} target="_blank" rel="noopener noreferrer">
                          View Project
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
} 