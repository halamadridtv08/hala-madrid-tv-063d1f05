import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type ActionType = 
  | 'article_published' 
  | 'flash_news_published' 
  | 'comment_approved' 
  | 'comment_rejected' 
  | 'player_updated' 
  | 'match_updated';

interface LogActionParams {
  actionType: ActionType;
  entityType: string;
  entityId?: string;
  entityTitle?: string;
  details?: Record<string, unknown>;
  sendNotification?: boolean;
}

export const useModeratorActions = () => {
  const { userRole, user } = useAuth();
  const { toast } = useToast();

  const logAction = useCallback(async ({
    actionType,
    entityType,
    entityId,
    entityTitle,
    details = {},
    sendNotification = false
  }: LogActionParams) => {
    // Only log for moderators and admins
    if (!userRole || (userRole !== 'moderator' && userRole !== 'admin')) {
      console.log('User is not a moderator/admin, skipping action log');
      return null;
    }

    try {
      // Log the action in the database
      const { data: actionId, error } = await supabase.rpc('log_moderator_action', {
        p_action_type: actionType,
        p_entity_type: entityType,
        p_entity_id: entityId || null,
        p_entity_title: entityTitle || null,
        p_details: JSON.parse(JSON.stringify(details))
      });

      if (error) {
        console.error('Error logging moderator action:', error);
        return null;
      }

      console.log(`Moderator action logged: ${actionType} for ${entityType}`);

      // Send notification for content publications (only for moderators, not admins)
      if (sendNotification && userRole === 'moderator' && 
          (actionType === 'article_published' || actionType === 'flash_news_published')) {
        try {
          const { error: notifyError } = await supabase.functions.invoke('notify-moderator-action', {
            body: {
              action_type: actionType,
              entity_id: entityId,
              entity_title: entityTitle,
              moderator_email: user?.email
            }
          });

          if (notifyError) {
            console.error('Error sending notification:', notifyError);
          } else {
            console.log('Admin notification sent successfully');
          }
        } catch (notifyErr) {
          console.error('Error invoking notification function:', notifyErr);
        }
      }

      return actionId;
    } catch (err) {
      console.error('Error in logAction:', err);
      return null;
    }
  }, [userRole, user?.email]);

  const logArticlePublished = useCallback((articleId: string, title: string) => {
    return logAction({
      actionType: 'article_published',
      entityType: 'article',
      entityId: articleId,
      entityTitle: title,
      sendNotification: true
    });
  }, [logAction]);

  const logFlashNewsPublished = useCallback((flashNewsId: string, content: string) => {
    const title = content.length > 50 ? content.substring(0, 50) + '...' : content;
    return logAction({
      actionType: 'flash_news_published',
      entityType: 'flash_news',
      entityId: flashNewsId,
      entityTitle: title,
      sendNotification: true
    });
  }, [logAction]);

  const logCommentModerated = useCallback((commentId: string, approved: boolean, articleTitle?: string) => {
    return logAction({
      actionType: approved ? 'comment_approved' : 'comment_rejected',
      entityType: 'comment',
      entityId: commentId,
      entityTitle: articleTitle,
      details: { approved }
    });
  }, [logAction]);

  const logPlayerUpdated = useCallback((playerId: string, playerName: string) => {
    return logAction({
      actionType: 'player_updated',
      entityType: 'player',
      entityId: playerId,
      entityTitle: playerName
    });
  }, [logAction]);

  const logMatchUpdated = useCallback((matchId: string, matchTitle: string) => {
    return logAction({
      actionType: 'match_updated',
      entityType: 'match',
      entityId: matchId,
      entityTitle: matchTitle
    });
  }, [logAction]);

  return {
    logAction,
    logArticlePublished,
    logFlashNewsPublished,
    logCommentModerated,
    logPlayerUpdated,
    logMatchUpdated
  };
};
