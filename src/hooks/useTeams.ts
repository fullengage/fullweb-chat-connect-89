
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

export interface Team {
  id: string
  name: string
  department: string
  description?: string
  leader_id?: string
  member_ids: string[]
  account_id: number
  performance_score: number
  is_active: boolean
  created_at: string
  updated_at: string
  leader?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  members?: Array<{
    id: string
    name: string
    email: string
    avatar_url?: string
  }>
}

export interface CreateTeamData {
  name: string
  department: string
  description?: string
  leader_id?: string
  member_ids?: string[]
}

export const useTeams = (account_id: number) => {
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useQuery({
    queryKey: ['teams', account_id, authUser?.id],
    queryFn: async () => {
      console.log('Fetching teams for account:', account_id)
      
      if (!authUser) {
        throw new Error('User not authenticated')
      }

      const { data: teamsData, error } = await supabase
        .from('teams')
        .select(`
          *,
          leader:leader_id (
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('account_id', account_id)
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching teams:', error)
        toast({
          title: "Erro ao buscar equipes",
          description: error.message,
          variant: "destructive",
        })
        throw error
      }

      // Buscar membros para cada equipe
      const teamsWithMembers = await Promise.all(teamsData.map(async (team) => {
        if (team.member_ids && team.member_ids.length > 0) {
          const { data: membersData, error: membersError } = await supabase
            .from('users')
            .select('id, name, email, avatar_url')
            .in('id', team.member_ids)

          if (!membersError) {
            return {
              ...team,
              members: membersData || []
            }
          }
        }
        
        return {
          ...team,
          members: []
        }
      }))

      console.log('Teams fetched successfully:', teamsWithMembers.length)
      return teamsWithMembers as Team[]
    },
    enabled: !!authUser && !!account_id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user: authUser } = useAuth()

  return useMutation({
    mutationFn: async (teamData: CreateTeamData & { account_id: number }) => {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: teamData.name,
          department: teamData.department,
          description: teamData.description,
          leader_id: teamData.leader_id,
          member_ids: teamData.member_ids || [],
          account_id: teamData.account_id,
          performance_score: 0,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast({
        title: "Equipe criada",
        description: "A equipe foi criada com sucesso.",
      })
    },
    onError: (error: any) => {
      console.error('Error creating team:', error)
      toast({
        title: "Erro ao criar equipe",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

export const useUpdateTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (teamData: Partial<Team> & { id: string }) => {
      const { id, ...updateData } = teamData
      
      const { data, error } = await supabase
        .from('teams')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast({
        title: "Equipe atualizada",
        description: "As informações da equipe foram atualizadas com sucesso.",
      })
    },
    onError: (error: any) => {
      console.error('Error updating team:', error)
      toast({
        title: "Erro ao atualizar equipe",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}

export const useDeleteTeam = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('teams')
        .update({ is_active: false })
        .eq('id', teamId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast({
        title: "Equipe desativada",
        description: "A equipe foi desativada com sucesso.",
      })
    },
    onError: (error: any) => {
      console.error('Error deleting team:', error)
      toast({
        title: "Erro ao desativar equipe",
        description: error.message,
        variant: "destructive",
      })
    }
  })
}
