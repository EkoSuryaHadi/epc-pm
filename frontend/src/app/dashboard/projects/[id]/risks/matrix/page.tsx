'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { Risk } from '@/lib/validations/risk';
import { createApiMethods } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskMatrixChart } from '@/components/risks/RiskMatrixChart';
import { useToast } from '@/hooks/use-toast';

export default function RiskMatrixPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { data: session } = useSession();
  const { toast } = useToast();

  const [risks, setRisks] = useState<Risk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRisks = async () => {
      if (!session?.user?.accessToken) return;

      setIsLoading(true);
      try {
        const api = createApiMethods(session.user.accessToken);
        const response = await api.risks.getAll(projectId);
        setRisks(response.data);
      } catch (error) {
        console.error('Error fetching risks:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load risks',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRisks();
  }, [session, projectId]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/projects/${projectId}/risks`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Risks
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Risk Matrix</h1>
            <p className="text-gray-600 mt-1">Visual representation of project risks</p>
          </div>
        </div>
      </div>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>5×5 Risk Assessment Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Loading risk matrix...</div>
          ) : risks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">No risks to display</p>
              <p className="text-sm mb-4">Add risks to see them in the matrix</p>
              <Button onClick={() => router.push(`/dashboard/projects/${projectId}/risks`)}>
                Go to Risk Register
              </Button>
            </div>
          ) : (
            <RiskMatrixChart risks={risks} />
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Read the Matrix</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Probability Scale (1-5):</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>1 - Very Low:</strong> 0-10% chance of occurring</li>
                <li><strong>2 - Low:</strong> 10-30% chance of occurring</li>
                <li><strong>3 - Medium:</strong> 30-50% chance of occurring</li>
                <li><strong>4 - High:</strong> 50-70% chance of occurring</li>
                <li><strong>5 - Very High:</strong> 70-100% chance of occurring</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Impact Scale (1-5):</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>1 - Insignificant:</strong> Minimal impact on project</li>
                <li><strong>2 - Minor:</strong> Small delays or cost increases</li>
                <li><strong>3 - Moderate:</strong> Noticeable delays or overruns</li>
                <li><strong>4 - Major:</strong> Significant delays or budget issues</li>
                <li><strong>5 - Catastrophic:</strong> Project failure possible</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm">
              <strong>Risk Score = Probability × Impact</strong><br />
              Risks with scores ≥15 require immediate attention and mitigation planning.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
