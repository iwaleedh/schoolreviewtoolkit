import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SSEDataProvider, useSSEData } from '../context/SSEDataContext';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';

vi.mock('convex/react', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../convex/_generated/api', () => ({
    api: {
        schools: { listSchools: 'listSchools' },
        indicatorScores: { getAll: 'getAll', set: 'set', setMultiple: 'setMultiple', clearAll: 'clearAll' },
        ltScores: { getAll: 'getAll', set: 'set', clearAll: 'clearAll' },
        comments: { getAll: 'getAll', set: 'set', clearAll: 'clearAll' },
    }
}));

describe('SSEDataContext Error Handling', () => {
    let mockAlert;
    let mockConsoleError;

    beforeEach(() => {
        mockAlert = vi.fn();
        mockConsoleError = vi.fn();
        window.alert = mockAlert;
        console.error = mockConsoleError;

        useAuth.mockReturnValue({ user: { schoolId: 'school-123', role: 'PRINCIPAL' }, token: 'mock-token' });
        useQuery.mockReturnValue(null);
    });

    it('should fire an alert if setIndicatorComment mutation fails', async () => {
        const mockSetCommentMutation = vi.fn().mockRejectedValue(new Error('Network error'));

        // Mocking various mutations from useMutation
        useMutation.mockImplementation((mutationFn) => {
            if (mutationFn === 'set') {
                return mockSetCommentMutation;
            }
            return vi.fn().mockResolvedValue({});
        });

        const { result } = renderHook(() => useSSEData(), {
            wrapper: SSEDataProvider
        });

        await act(async () => {
            // Act: fire and forget mutation
            result.current.setIndicatorComment('indicator1', 'test comment');
        });

        // The catch block should call alert. Wait for the rejected promise to be caught.
        await new Promise(r => setTimeout(r, 0));

        expect(mockSetCommentMutation).toHaveBeenCalled();
        expect(mockAlert).toHaveBeenCalledWith('Failed to sync comment to server. Please check your connection.');
        expect(mockConsoleError).toHaveBeenCalled();
    });
});
