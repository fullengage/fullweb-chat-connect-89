
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Mail, Phone } from "lucide-react";

interface Contact {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  tag?: string;
}

interface ContactCardProps {
  contact: Contact;
}

export const ContactCard = ({ contact }: ContactCardProps) => {
  const getTagColor = (tag?: string) => {
    switch (tag) {
      case "cliente":
        return "bg-green-100 text-green-800";
      case "prospect":
        return "bg-blue-100 text-blue-800";
      case "parceiro":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {contact.initials}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
              {contact.tag && (
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTagColor(contact.tag)}`}>
                  {contact.tag}
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {contact.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {contact.phone}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Criado em {contact.createdAt}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
