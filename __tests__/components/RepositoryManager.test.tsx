import { render, screen, fireEvent } from '@testing-library/react';
import RepositoryManager from '@/components/RepositoryManager';
import { useAuth } from '@/contexts/auth-context';

// Mock the auth context
jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}));

describe('RepositoryManager', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('shows connect buttons when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<RepositoryManager />);

    expect(screen.getByText('Connect GitHub Account')).toBeInTheDocument();
    expect(screen.getByText('Connect GitLab Account')).toBeInTheDocument();
  });

  it('shows repository creation button when user is authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        githubToken: 'github-token',
      },
    });

    render(<RepositoryManager />);

    expect(screen.getByText('Create New Repository')).toBeInTheDocument();
  });

  it('opens repository creation dialog when create button is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        githubToken: 'github-token',
      },
    });

    render(<RepositoryManager />);

    fireEvent.click(screen.getByText('Create New Repository'));
    
    expect(screen.getByText('Create GitHub Repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Repository Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Private Repository')).toBeInTheDocument();
  });
}); 