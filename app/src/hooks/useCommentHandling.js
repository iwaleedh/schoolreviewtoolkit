import { useState, useCallback } from 'react';

/**
 * useCommentHandling - Shared hook for comment popup logic
 * Eliminates duplicate comment handling code across checklist components
 * 
 * @param {Function} getComment - Function to get comment from context
 * @param {Function} setComment - Function to save comment to context
 * @returns {Object} Comment state and handlers
 */
export function useCommentHandling(getComment, setComment) {
    const [expandedComments, setExpandedComments] = useState({});
    const [commentDrafts, setCommentDrafts] = useState({});

    const toggleComment = useCallback((indicatorCode) => {
        setExpandedComments(prev => {
            if (prev[indicatorCode]) {
                // Closing - clear the draft
                setCommentDrafts(drafts => {
                    const newDrafts = { ...drafts };
                    delete newDrafts[indicatorCode];
                    return newDrafts;
                });
                const { [indicatorCode]: _, ...rest } = prev;
                return rest;
            } else {
                // Opening - load current comment
                const currentComment = getComment ? getComment(indicatorCode) : '';
                setCommentDrafts(drafts => ({ ...drafts, [indicatorCode]: currentComment || '' }));
                return { ...prev, [indicatorCode]: true };
            }
        });
    }, [getComment]);

    const saveComment = useCallback((indicatorCode) => {
        const draftComment = commentDrafts[indicatorCode] || '';
        if (setComment) {
            setComment(indicatorCode, draftComment);
        }
        setExpandedComments(prev => {
            const { [indicatorCode]: _, ...rest } = prev;
            return rest;
        });
        setCommentDrafts(prev => {
            const { [indicatorCode]: _, ...rest } = prev;
            return rest;
        });
    }, [setComment, commentDrafts]);

    const updateCommentDraft = useCallback((indicatorCode, value) => {
        setCommentDrafts(prev => ({ ...prev, [indicatorCode]: value }));
    }, []);

    const isCommentOpen = useCallback((indicatorCode) => {
        return !!expandedComments[indicatorCode];
    }, [expandedComments]);

    const getCommentDraft = useCallback((indicatorCode) => {
        return commentDrafts[indicatorCode] || '';
    }, [commentDrafts]);

    return {
        expandedComments,
        commentDrafts,
        toggleComment,
        saveComment,
        updateCommentDraft,
        isCommentOpen,
        getCommentDraft,
    };
}

export default useCommentHandling;
