import { supabase } from "@/integrations/supabase/client";

type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'unpublish'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout'
  | 'settings_change';

type EntityType = 
  | 'article'
  | 'flash_news'
  | 'player'
  | 'coach'
  | 'match'
  | 'video'
  | 'photo'
  | 'comment'
  | 'user_role'
  | 'settings'
  | 'kit';

interface AuditLogParams {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  details?: Record<string, unknown>;
}

/**
 * Log an admin action to the audit trail.
 * This should be called after successful admin operations.
 */
export const logAdminAction = async ({
  action,
  entityType,
  entityId,
  details,
}: AuditLogParams): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_admin_action', {
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId || null,
      p_details: details ? JSON.stringify(details) : null,
    });

    if (error) {
      console.error('Failed to log admin action:', error);
    }
  } catch (error) {
    // Don't throw - logging failures shouldn't break the app
    console.error('Error logging admin action:', error);
  }
};

/**
 * Generate a simple device fingerprint for login tracking.
 * This is a basic implementation - for production, consider using a library like FingerprintJS.
 */
export const generateDeviceFingerprint = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
  ];
  
  // Simple hash function
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};
