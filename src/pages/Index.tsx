
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, BarChart3, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Customer Service
            <span className="text-blue-600"> Dashboard</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your customer support operations with real-time Chatwoot integration, 
            advanced filtering, and comprehensive analytics in one unified dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-4">
              <Link to="/dashboard">
                <MessageSquare className="mr-2 h-5 w-5" />
                Open Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
              <a href="https://www.chatwoot.com/" target="_blank" rel="noopener noreferrer">
                Learn about Chatwoot
              </a>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Real-time Conversations</CardTitle>
              <CardDescription>
                Monitor all customer conversations across multiple channels in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Live conversation updates</li>
                <li>• Multi-channel support</li>
                <li>• Message status tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Get insights into your team performance and conversation metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Conversation statistics</li>
                <li>• Response time tracking</li>
                <li>• Agent performance</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Smart Filtering</CardTitle>
              <CardDescription>
                Filter conversations by status, agent, channel, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Status-based filtering</li>
                <li>• Agent assignment</li>
                <li>• Channel categorization</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Zap className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Multi-Company Support
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Manage multiple companies and accounts from a single dashboard. 
            Switch between different Chatwoot accounts seamlessly and maintain 
            complete visibility across your entire customer service operation.
          </p>
          <Button asChild>
            <Link to="/dashboard">
              Get Started Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
