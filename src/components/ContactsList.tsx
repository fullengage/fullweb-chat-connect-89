
import { ContactCard } from "./ContactCard";
import { useContacts, useUsers } from "@/hooks/useSupabaseData";
import type { User } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";

interface ContactsListProps {
  searchTerm: string;
  tagFilter: string;
}

export const ContactsList = ({ searchTerm, tagFilter }: ContactsListProps) => {
  const { user: authUser } = useAuth();
  
  // Get the user data from our users table to access account_id
  const { data: users = [] } = useUsers(0); // We'll filter this properly
  const currentUser = users.find((u: User) => u.auth_user_id === authUser?.id);
  
  const { data: contacts = [], isLoading, error } = useContacts(currentUser?.account_id || 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar contatos: {error.message}</p>
      </div>
    );
  }

  // Filtrar contatos baseado na busca
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (filteredContacts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          {searchTerm ? "Nenhum contato encontrado para sua busca." : "Nenhum contato cadastrado ainda."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContacts.map((contact) => {
        // Gerar iniciais do nome
        const initials = contact.name ? 
          contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 
          'SC'; // "Sem Contato"
        
        // Formatar data de criação
        const createdAt = contact.created_at ? 
          new Date(contact.created_at).toLocaleDateString('pt-BR') : 
          'Data não disponível';

        const contactForCard = {
          id: contact.id.toString(),
          initials,
          name: contact.name || 'Nome não informado',
          email: contact.email || 'Email não informado',
          phone: contact.phone || 'Telefone não informado',
          createdAt,
          tag: undefined // O banco não tem campo tag ainda
        };

        return <ContactCard key={contact.id} contact={contactForCard} />;
      })}
    </div>
  );
};
