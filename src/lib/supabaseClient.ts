import { supabase as base } from "@/integrations/supabase/client";

// Temporary relaxed-typing wrapper to avoid TS 'never' errors while types regenerate
export const supabase = base as unknown as {
  from: (table: string) => any;
  auth: typeof base.auth;
  channel: typeof base.channel;
  removeChannel: typeof base.removeChannel;
};
