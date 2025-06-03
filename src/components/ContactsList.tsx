
import { ContactCard } from "./ContactCard";

interface Contact {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  tag?: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    initials: "CF",
    name: "Carlos Ferreira",
    email: "carlos@cliente.com",
    phone: "+5511988887777",
    createdAt: "01/06/2025",
    tag: "cliente"
  },
  {
    id: "2",
    initials: "RS",
    name: "Roberto Souza",
    email: "roberto@negocio.com",
    phone: "+5511966665555",
    createdAt: "01/06/2025",
    tag: "prospect"
  },
  {
    id: "3",
    initials: "AO",
    name: "Ana Oliveira",
    email: "ana@consultoria.com",
    phone: "+5511955554444",
    createdAt: "01/06/2025",
    tag: "parceiro"
  },
  {
    id: "4",
    initials: "PC",
    name: "Pedro Costa",
    email: "pedro@servicos.com",
    phone: "+5511944443333",
    createdAt: "01/06/2025",
    tag: "cliente"
  },
  {
    id: "5",
    initials: "FF",
    name: "Fernanda Ferreira",
    email: "fernanda@empresa.com",
    phone: "+5511977776666",
    createdAt: "01/06/2025",
    tag: "prospect"
  }
];

interface ContactsListProps {
  searchTerm: string;
  tagFilter: string;
}

export const ContactsList = ({ searchTerm, tagFilter }: ContactsListProps) => {
  const filteredContacts = mockContacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = tagFilter === "all" || contact.tag === tagFilter;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredContacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
};
