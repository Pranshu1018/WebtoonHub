import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UseUserRolesReturn {
  roles: string[];
  hasRole: (role: string) => boolean;
  isPublisher: boolean;
  isAdmin: boolean;
  loading: boolean;
}

export const useUserRoles = (user: User | null): UseUserRolesReturn => {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching roles for user:', user.id);
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) throw error;

        const userRoles = data?.map(item => item.role) || [];
        console.log('User roles fetched:', userRoles);
        setRoles(userRoles);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const isPublisher = hasRole('publisher');
  const isAdmin = hasRole('admin');

  return {
    roles,
    hasRole,
    isPublisher,
    isAdmin,
    loading
  };
};