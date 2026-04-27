import { useState } from 'react';
import { AutomationDashboard } from './components/AutomationDashboard';
import { AutomationBuilder } from './components/AutomationBuilder';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'builder'>('dashboard');
  const [editingAutomation, setEditingAutomation] = useState<string | null>(null);

  const handleCreateNew = () => {
    setEditingAutomation(null);
    setView('builder');
  };

  const handleEdit = (id: string) => {
    setEditingAutomation(id);
    setView('builder');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setEditingAutomation(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F5F9' }}>
      {view === 'dashboard' ? (
        <AutomationDashboard onCreateNew={handleCreateNew} onEdit={handleEdit} />
      ) : (
        <AutomationBuilder 
          automationId={editingAutomation} 
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  BarChart3,
  MessageCircle,
  Tag,
  UserPlus,
  Calendar,
  CheckCircle2,
  Webhook,
  Activity
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Automation {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  triggerType: string;
  audience: number;
  sent: number;
  delivered: number;
  read: number;
  lastRun?: string;
  created: string;
}

interface AutomationDashboardProps {
  onCreateNew: () => void;
  onEdit: (id: string) => void;
}

const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Welcome New Customers',
    status: 'active',
    trigger: 'New Customer',
    triggerType: 'customer',
    audience: 1250,
    sent: 1180,
    delivered: 1165,
    read: 892,
    lastRun: '2 hours ago',
    created: 'Mar 10, 2026'
  },
  {
    id: '2',
    name: 'Birthday Wishes',
    status: 'active',
    trigger: 'Scheduled Time',
    triggerType: 'time',
    audience: 450,
    sent: 445,
    delivered: 442,
    read: 380,
    lastRun: 'Today at 9:00 AM',
    created: 'Feb 28, 2026'
  },
  {
    id: '3',
    name: 'Price Inquiry Auto-Reply',
    status: 'active',
    trigger: 'Keyword Match',
    triggerType: 'whatsapp',
    audience: 2100,
    sent: 2050,
    delivered: 2040,
    read: 1850,
    lastRun: '15 minutes ago',
    created: 'Mar 5, 2026'
  },
  {
    id: '4',
    name: 'Loyalty Points Update',
    status: 'paused',
    trigger: 'Customer Activity',
    triggerType: 'customer',
    audience: 890,
    sent: 120,
    delivered: 118,
    read: 95,
    lastRun: 'Yesterday',
    created: 'Mar 1, 2026'
  },
  {
    id: '5',
    name: 'Weekend Sale Reminder',
    status: 'draft',
    trigger: 'Scheduled Time',
    triggerType: 'time',
    audience: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    created: 'Apr 15, 2026'
  }
];

const triggerIcons = {
  'customer': UserPlus,
  'time': Calendar,
  'whatsapp': MessageCircle,
  'event': CheckCircle2,
  'webhook': Webhook,
  'activity': Activity
};

export function AutomationDashboard({ onCreateNew, onEdit }: AutomationDashboardProps) {
  const [automations, setAutomations] = useState(mockAutomations);
  const [selectedView, setSelectedView] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

  const filteredAutomations = selectedView === 'all' 
    ? automations 
    : automations.filter(a => a.status === selectedView);

  const stats = {
    total: automations.length,
    active: automations.filter(a => a.status === 'active').length,
    paused: automations.filter(a => a.status === 'paused').length,
    draft: automations.filter(a => a.status === 'draft').length,
  };

  const handleToggleStatus = (id: string) => {
    setAutomations(automations.map(a => 
      a.id === id 
        ? { ...a, status: a.status === 'active' ? 'paused' : 'active' as 'active' | 'paused' | 'draft' }
        : a
    ));
  };

  const handleDelete = (id: string) => {
    setAutomations(automations.filter(a => a.id !== id));
  };

  const handleDuplicate = (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation) {
      const newAutomation = {
        ...automation,
        id: Date.now().toString(),
        name: `${automation.name} (Copy)`,
        status: 'draft' as const,
        sent: 0,
        delivered: 0,
        read: 0,
        lastRun: undefined,
        created: 'Today'
      };
      setAutomations([newAutomation, ...automations]);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div style={{ backgroundColor: '#313166' }} className="text-white px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">WhatsApp Automation</h1>
              <p className="text-white/80">Build trigger-based flows that send the right WhatsApp message at the right time.</p>
            </div>
            <Button 
              onClick={onCreateNew}
              className="text-white border-0"
              style={{ 
                background: 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)',
                fontSize: '15px',
                padding: '0 24px',
                height: '44px'
              }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Automation
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div 
              className="rounded-lg p-4 cursor-pointer transition-all"
              style={{ 
                backgroundColor: selectedView === 'all' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                border: selectedView === 'all' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
              }}
              onClick={() => setSelectedView('all')}
            >
              <div className="text-white/70 text-sm mb-1">Total Automations</div>
              <div className="text-3xl font-semibold">{stats.total}</div>
            </div>
            <div 
              className="rounded-lg p-4 cursor-pointer transition-all"
              style={{ 
                backgroundColor: selectedView === 'active' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                border: selectedView === 'active' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
              }}
              onClick={() => setSelectedView('active')}
            >
              <div className="text-white/70 text-sm mb-1">Active</div>
              <div className="text-3xl font-semibold text-green-300">{stats.active}</div>
            </div>
            <div 
              className="rounded-lg p-4 cursor-pointer transition-all"
              style={{ 
                backgroundColor: selectedView === 'paused' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                border: selectedView === 'paused' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
              }}
              onClick={() => setSelectedView('paused')}
            >
              <div className="text-white/70 text-sm mb-1">Paused</div>
              <div className="text-3xl font-semibold text-yellow-300">{stats.paused}</div>
            </div>
            <div 
              className="rounded-lg p-4 cursor-pointer transition-all"
              style={{ 
                backgroundColor: selectedView === 'draft' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                border: selectedView === 'draft' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
              }}
              onClick={() => setSelectedView('draft')}
            >
              <div className="text-white/70 text-sm mb-1">Drafts</div>
              <div className="text-3xl font-semibold text-gray-300">{stats.draft}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Automation List */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="space-y-3">
          {filteredAutomations.map((automation) => {
            const TriggerIcon = triggerIcons[automation.triggerType as keyof typeof triggerIcons] || Activity;
            
            return (
              <div 
                key={automation.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                onClick={() => onEdit(automation.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: '#F4F5F9' }}
                    >
                      <TriggerIcon className="w-6 h-6" style={{ color: '#313166' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold" style={{ color: '#313166' }}>
                          {automation.name}
                        </h3>
                        <Badge 
                          variant="secondary"
                          style={{
                            backgroundColor: 
                              automation.status === 'active' ? '#16A34A15' :
                              automation.status === 'paused' ? '#D9770615' :
                              '#31316615',
                            color:
                              automation.status === 'active' ? '#16A34A' :
                              automation.status === 'paused' ? '#D97706' :
                              '#313166',
                            border: 'none'
                          }}
                        >
                          {automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <TriggerIcon className="w-4 h-4" />
                          {automation.trigger}
                        </span>
                        <span>•</span>
                        <span>Created {automation.created}</span>
                        {automation.lastRun && (
                          <>
                            <span>•</span>
                            <span>Last run {automation.lastRun}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Performance Metrics */}
                      {automation.status !== 'draft' && (
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-xs text-gray-500">Audience</div>
                            <div className="text-lg font-semibold" style={{ color: '#313166' }}>
                              {automation.audience.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Sent</div>
                            <div className="text-lg font-semibold" style={{ color: '#313166' }}>
                              {automation.sent.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Delivered</div>
                            <div className="text-lg font-semibold text-green-600">
                              {automation.delivered.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Read</div>
                            <div className="text-lg font-semibold" style={{ color: '#CB376D' }}>
                              {automation.read.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Read Rate</div>
                            <div className="text-lg font-semibold" style={{ color: '#313166' }}>
                              {automation.sent > 0 ? Math.round((automation.read / automation.sent) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(automation.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {automation.status === 'active' ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(automation.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(automation.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAutomations.length === 0 && (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#313166' }}>
                No {selectedView !== 'all' ? selectedView : ''} automations found
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedView === 'all' 
                  ? 'Create your first automation to get started.'
                  : `You don't have any ${selectedView} automations yet.`
                }
              </p>
              <Button 
                onClick={onCreateNew}
                style={{ 
                  background: 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)',
                  color: 'white',
                  border: 'none'
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Automation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { ArrowLeft, Play, Save, TestTube } from 'lucide-react';
import { Button } from './ui/button';
import { AudienceSelector } from './automation/AudienceSelector';
import { TriggerSelector } from './automation/TriggerSelector';
import { FlowBuilder } from './automation/FlowBuilder';
import { AutomationPreview } from './automation/AutomationPreview';
import { AutomationAnalytics } from './automation/AutomationAnalytics';

interface AutomationBuilderProps {
  automationId: string | null;
  onBack: () => void;
}

export type BuilderStep = 'audience' | 'trigger' | 'flow' | 'preview' | 'analytics';

export interface TriggerConfig {
  id: string;
  category: string;
  name: string;
  icon: string;
}

export interface ConditionConfig {
  id: string;
  field: string;
  operator: string;
  value: any;
}

export interface ActionConfig {
  id: string;
  type: string;
  templateId?: string;
  message?: string;
  delay?: string;
}

export function AutomationBuilder({ automationId, onBack }: AutomationBuilderProps) {
  const [currentStep, setCurrentStep] = useState<BuilderStep>('audience');
  const [automationName, setAutomationName] = useState('Untitled Automation');
  const [selectedAudience, setSelectedAudience] = useState<any>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerConfig | null>(null);
  const [conditions, setConditions] = useState<ConditionConfig[]>([]);
  const [actions, setActions] = useState<ActionConfig[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const steps = [
    { id: 'audience' as BuilderStep, label: 'Select Audience', number: 1 },
    { id: 'trigger' as BuilderStep, label: 'Choose Trigger', number: 2 },
    { id: 'flow' as BuilderStep, label: 'Build Flow', number: 3 },
    { id: 'preview' as BuilderStep, label: 'Preview & Test', number: 4 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSave = () => {
    console.log('Saving automation...');
    // Save logic here
  };

  const handleActivate = () => {
    console.log('Activating automation...');
    // Activate logic here
  };

  const canProceed = () => {
    if (currentStep === 'audience') return selectedAudience !== null;
    if (currentStep === 'trigger') return selectedTrigger !== null;
    if (currentStep === 'flow') return actions.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div style={{ backgroundColor: '#313166' }} className="text-white px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Button>
              <div className="w-px h-6 bg-white/20" />
              <input
                type="text"
                value={automationName}
                onChange={(e) => setAutomationName(e.target.value)}
                className="bg-transparent border-none text-2xl font-semibold text-white focus:outline-none focus:ring-0"
                placeholder="Enter automation name"
              />
            </div>
            <div className="flex items-center gap-3">
              {automationId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="text-white hover:bg-white/10"
                >
                  {showAnalytics ? 'Hide Analytics' : 'View Analytics'}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Test Flow
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-white hover:bg-white/10"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleActivate}
                className="text-white border-0"
                style={{ 
                  background: 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)',
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Activate
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          {!showAnalytics && (
            <div className="flex items-center gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-4 flex-1">
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all"
                      style={{
                        backgroundColor: 
                          currentStep === step.id 
                            ? 'rgba(203, 55, 109, 0.2)'
                            : index < currentStepIndex
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(255, 255, 255, 0.1)',
                        color: 
                          currentStep === step.id || index < currentStepIndex
                            ? '#FFFFFF'
                            : 'rgba(255, 255, 255, 0.5)',
                        border: currentStep === step.id ? '2px solid #CB376D' : '2px solid transparent'
                      }}
                    >
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <div 
                        className="text-sm font-medium transition-all"
                        style={{
                          color: 
                            currentStep === step.id 
                              ? '#FFFFFF'
                              : index < currentStepIndex
                              ? 'rgba(255, 255, 255, 0.9)'
                              : 'rgba(255, 255, 255, 0.5)'
                        }}
                      >
                        {step.label}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className="h-px flex-1"
                      style={{
                        backgroundColor: 
                          index < currentStepIndex
                            ? 'rgba(255, 255, 255, 0.3)'
                            : 'rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-8">
        {showAnalytics ? (
          <AutomationAnalytics />
        ) : (
          <>
            {currentStep === 'audience' && (
              <AudienceSelector
                selectedAudience={selectedAudience}
                onAudienceChange={setSelectedAudience}
              />
            )}

            {currentStep === 'trigger' && (
              <TriggerSelector
                selectedTrigger={selectedTrigger}
                onTriggerChange={setSelectedTrigger}
              />
            )}

            {currentStep === 'flow' && selectedTrigger && (
              <FlowBuilder
                trigger={selectedTrigger}
                conditions={conditions}
                actions={actions}
                onConditionsChange={setConditions}
                onActionsChange={setActions}
              />
            )}

            {currentStep === 'preview' && (
              <AutomationPreview
                automationName={automationName}
                audience={selectedAudience}
                trigger={selectedTrigger}
                conditions={conditions}
                actions={actions}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                style={{ color: '#313166', borderColor: '#313166' }}
              >
                Previous
              </Button>
              <div className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || currentStepIndex === steps.length - 1}
                style={{ 
                  background: canProceed() && currentStepIndex < steps.length - 1
                    ? 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)'
                    : '#E5E7EB',
                  color: canProceed() && currentStepIndex < steps.length - 1 ? 'white' : '#9CA3AF',
                  border: 'none'
                }}
              >
                Next Step
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Users, Filter, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface AudienceSelectorProps {
  selectedAudience: any;
  onAudienceChange: (audience: any) => void;
}

const audiencePresets = [
  {
    id: 'all',
    name: 'All Customers',
    description: 'All customers in your database',
    count: 5420,
    icon: Users
  },
  {
    id: 'opted_in',
    name: 'Opted-In Customers',
    description: 'Customers who have opted in to WhatsApp',
    count: 4180,
    icon: Users
  },
  {
    id: 'active',
    name: 'Active Customers',
    description: 'Customers who visited in the last 30 days',
    count: 2340,
    icon: Users
  },
  {
    id: 'new',
    name: 'New Customers',
    description: 'Customers added in the last 7 days',
    count: 125,
    icon: Users
  },
  {
    id: 'loyalty',
    name: 'Loyalty Members',
    description: 'Customers with loyalty points > 100',
    count: 1850,
    icon: Users
  }
];

const filterOptions = {
  gender: ['Male', 'Female', 'Other'],
  source: ['Walk-in', 'Online', 'Referral', 'Social Media'],
  loyaltyTier: ['Bronze', 'Silver', 'Gold', 'Platinum']
};

export function AudienceSelector({ selectedAudience, onAudienceChange }: AudienceSelectorProps) {
  const [customMode, setCustomMode] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleSelectPreset = (preset: typeof audiencePresets[0]) => {
    onAudienceChange({
      type: 'preset',
      preset: preset,
      count: preset.count
    });
  };

  const handleAddFilter = (filterType: string, value: any) => {
    const newFilters = { ...filters };
    if (!newFilters[filterType]) {
      newFilters[filterType] = [];
    }
    newFilters[filterType].push(value);
    setFilters(newFilters);
    
    // Calculate estimated count (mock)
    const estimatedCount = Math.floor(Math.random() * 1000) + 500;
    onAudienceChange({
      type: 'custom',
      filters: newFilters,
      count: estimatedCount
    });
  };

  const handleRemoveFilter = (filterType: string, value: any) => {
    const newFilters = { ...filters };
    newFilters[filterType] = newFilters[filterType].filter((v: any) => v !== value);
    if (newFilters[filterType].length === 0) {
      delete newFilters[filterType];
    }
    setFilters(newFilters);
    
    const estimatedCount = Math.floor(Math.random() * 1000) + 500;
    onAudienceChange({
      type: 'custom',
      filters: newFilters,
      count: estimatedCount
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: '#313166' }}>
          Select Your Audience
        </h2>
        <p className="text-gray-600">
          Choose who should receive this automation. You can select a preset audience or create custom filters.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-3 mb-6">
        <Button
          variant={!customMode ? 'default' : 'outline'}
          onClick={() => setCustomMode(false)}
          style={!customMode ? {
            background: 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)',
            color: 'white',
            border: 'none'
          } : { color: '#313166', borderColor: '#313166' }}
        >
          Preset Audiences
        </Button>
        <Button
          variant={customMode ? 'default' : 'outline'}
          onClick={() => setCustomMode(true)}
          style={customMode ? {
            background: 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)',
            color: 'white',
            border: 'none'
          } : { color: '#313166', borderColor: '#313166' }}
        >
          <Filter className="w-4 h-4 mr-2" />
          Custom Filters
        </Button>
      </div>

      {!customMode ? (
        /* Preset Audiences */
        <div className="grid grid-cols-2 gap-4">
          {audiencePresets.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedAudience?.type === 'preset' && selectedAudience?.preset?.id === preset.id;
            
            return (
              <div
                key={preset.id}
                className="bg-white rounded-lg p-6 border-2 cursor-pointer transition-all hover:shadow-md"
                style={{
                  borderColor: isSelected ? '#CB376D' : '#E5E7EB',
                  backgroundColor: isSelected ? '#CB376D05' : 'white'
                }}
                onClick={() => handleSelectPreset(preset)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#F4F5F9' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: '#313166' }} />
                  </div>
                  {isSelected && (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#CB376D' }}
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#313166' }}>
                  {preset.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {preset.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold" style={{ color: '#313166' }}>
                    {preset.count.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">customers</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Custom Filters */
        <div className="space-y-6">
          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#313166' }}>
                Active Filters
              </h3>
              <div className="space-y-3">
                {Object.entries(filters).map(([filterType, values]: [string, any]) => (
                  <div key={filterType}>
                    <div className="text-sm font-medium text-gray-700 mb-2 capitalize">
                      {filterType}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value: any) => (
                        <Badge
                          key={value}
                          variant="secondary"
                          style={{
                            backgroundColor: '#313166',
                            color: 'white'
                          }}
                          className="cursor-pointer"
                          onClick={() => handleRemoveFilter(filterType, value)}
                        >
                          {value}
                          <X className="w-3 h-3 ml-2" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {selectedAudience?.count && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estimated Audience</span>
                    <span className="text-2xl font-semibold" style={{ color: '#313166' }}>
                      {selectedAudience.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filter Options */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#313166' }}>
              Add Filters
            </h3>
            <div className="space-y-4">
              {Object.entries(filterOptions).map(([filterType, options]) => (
                <div key={filterType}>
                  <div className="text-sm font-medium text-gray-700 mb-2 capitalize">
                    {filterType.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {options.map((option) => {
                      const isActive = filters[filterType]?.includes(option);
                      return (
                        <Button
                          key={option}
                          variant="outline"
                          size="sm"
                          onClick={() => 
                            isActive 
                              ? handleRemoveFilter(filterType, option)
                              : handleAddFilter(filterType, option)
                          }
                          style={{
                            borderColor: isActive ? '#CB376D' : '#E5E7EB',
                            backgroundColor: isActive ? '#CB376D10' : 'white',
                            color: isActive ? '#CB376D' : '#313166'
                          }}
                        >
                          {isActive && <Plus className="w-3 h-3 mr-1 rotate-45" />}
                          {!isActive && <Plus className="w-3 h-3 mr-1" />}
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#313166' }}>
              Advanced Filters
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Loyalty Points
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Any</option>
                  <option>Greater than 100</option>
                  <option>Greater than 500</option>
                  <option>Greater than 1000</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Last Visit
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Any time</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Eye,
  Clock,
  XCircle,
  BarChart3
} from 'lucide-react';
import { Badge } from '../ui/badge';

export function AutomationAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const stats = {
    totalRuns: 1285,
    uniqueCustomers: 1180,
    messagesSent: 1245,
    delivered: 1230,
    read: 945,
    failed: 15,
    deliveryRate: 98.8,
    readRate: 76.6,
    avgResponseTime: '2m 34s'
  };

  const dailyStats = [
    { date: 'Apr 10', sent: 42, delivered: 41, read: 35 },
    { date: 'Apr 11', sent: 38, delivered: 38, read: 29 },
    { date: 'Apr 12', sent: 45, delivered: 44, read: 38 },
    { date: 'Apr 13', sent: 51, delivered: 50, read: 41 },
    { date: 'Apr 14', sent: 48, delivered: 47, read: 39 },
    { date: 'Apr 15', sent: 44, delivered: 44, read: 36 },
    { date: 'Apr 16', sent: 39, delivered: 38, read: 31 },
  ];

  const recentActivity = [
    { 
      id: 1, 
      customer: 'Priya Sharma', 
      phone: '+91 98765 43210', 
      status: 'read', 
      time: '5 minutes ago',
      template: 'Welcome Message'
    },
    { 
      id: 2, 
      customer: 'Rahul Kumar', 
      phone: '+91 98765 43211', 
      status: 'delivered', 
      time: '12 minutes ago',
      template: 'Welcome Message'
    },
    { 
      id: 3, 
      customer: 'Anjali Patel', 
      phone: '+91 98765 43212', 
      status: 'read', 
      time: '23 minutes ago',
      template: 'Welcome Message'
    },
    { 
      id: 4, 
      customer: 'Vikram Singh', 
      phone: '+91 98765 43213', 
      status: 'failed', 
      time: '1 hour ago',
      template: 'Welcome Message',
      error: 'Invalid phone number'
    },
    { 
      id: 5, 
      customer: 'Sneha Gupta', 
      phone: '+91 98765 43214', 
      status: 'read', 
      time: '2 hours ago',
      template: 'Welcome Message'
    },
  ];

  const maxValue = Math.max(...dailyStats.map(d => d.sent));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: '#313166' }}>
            Performance Analytics
          </h2>
          <p className="text-gray-600">
            Track the performance and engagement of your automation.
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[
            { id: '7d' as const, label: '7 Days' },
            { id: '30d' as const, label: '30 Days' },
            { id: '90d' as const, label: '90 Days' },
            { id: 'all' as const, label: 'All Time' }
          ].map(range => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className="px-4 py-2 rounded-md text-sm font-medium transition-all"
              style={{
                backgroundColor: timeRange === range.id ? '#313166' : 'white',
                color: timeRange === range.id ? 'white' : '#313166',
                border: `1px solid ${timeRange === range.id ? '#313166' : '#E5E7EB'}`
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#CB376D15' }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: '#CB376D' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Total Runs</div>
              <div className="text-2xl font-semibold" style={{ color: '#313166' }}>
                {stats.totalRuns.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-green-600">↑ 12%</span> from last period
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#2563EB15' }}
            >
              <Users className="w-6 h-6" style={{ color: '#2563EB' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Unique Customers</div>
              <div className="text-2xl font-semibold" style={{ color: '#313166' }}>
                {stats.uniqueCustomers.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-green-600">↑ 8%</span> from last period
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#16A34A15' }}
            >
              <CheckCircle className="w-6 h-6" style={{ color: '#16A34A' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Delivery Rate</div>
              <div className="text-2xl font-semibold" style={{ color: '#313166' }}>
                {stats.deliveryRate}%
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {stats.delivered} of {stats.messagesSent} messages
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#7C3AED15' }}
            >
              <Eye className="w-6 h-6" style={{ color: '#7C3AED' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Read Rate</div>
              <div className="text-2xl font-semibold" style={{ color: '#313166' }}>
                {stats.readRate}%
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {stats.read} messages read
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <div className="col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: '#313166' }}>
              Daily Performance
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#CB376D' }} />
                <span className="text-gray-600">Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#16A34A' }} />
                <span className="text-gray-600">Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#2563EB' }} />
                <span className="text-gray-600">Read</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {dailyStats.map((day) => (
              <div key={day.date}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-16 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1 flex gap-1">
                    {/* Sent */}
                    <div 
                      className="h-8 rounded transition-all relative group"
                      style={{ 
                        backgroundColor: '#CB376D',
                        width: `${(day.sent / maxValue) * 100}%`,
                        minWidth: '2px'
                      }}
                    >
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {day.sent} sent
                      </div>
                    </div>
                    {/* Delivered */}
                    <div 
                      className="h-8 rounded transition-all relative group"
                      style={{ 
                        backgroundColor: '#16A34A',
                        width: `${(day.delivered / maxValue) * 100}%`,
                        minWidth: '2px'
                      }}
                    >
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {day.delivered} delivered
                      </div>
                    </div>
                    {/* Read */}
                    <div 
                      className="h-8 rounded transition-all relative group"
                      style={{ 
                        backgroundColor: '#2563EB',
                        width: `${(day.read / maxValue) * 100}%`,
                        minWidth: '2px'
                      }}
                    >
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {day.read} read
                      </div>
                    </div>
                  </div>
                  <div className="w-12 text-sm font-semibold text-right" style={{ color: '#313166' }}>
                    {day.sent}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#313166' }}>
              Quick Stats
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Messages Sent</span>
                  <span className="font-semibold" style={{ color: '#313166' }}>
                    {stats.messagesSent}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: '#CB376D',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Delivered</span>
                  <span className="font-semibold text-green-600">
                    {stats.delivered}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: '#16A34A',
                      width: `${(stats.delivered / stats.messagesSent) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Read</span>
                  <span className="font-semibold text-blue-600">
                    {stats.read}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: '#2563EB',
                      width: `${(stats.read / stats.messagesSent) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Failed</span>
                  <span className="font-semibold text-red-600">
                    {stats.failed}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: '#DC2626',
                      width: `${(stats.failed / stats.messagesSent) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#D9770615' }}
              >
                <Clock className="w-6 h-6" style={{ color: '#D97706' }} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
                <div className="text-xl font-semibold" style={{ color: '#313166' }}>
                  {stats.avgResponseTime}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#313166' }}>
            Recent Activity
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#F4F5F9' }}>
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Template</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium" style={{ color: '#313166' }}>
                      {activity.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {activity.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {activity.template}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor:
                          activity.status === 'read' ? '#2563EB15' :
                          activity.status === 'delivered' ? '#16A34A15' :
                          '#DC262615',
                        color:
                          activity.status === 'read' ? '#2563EB' :
                          activity.status === 'delivered' ? '#16A34A' :
                          '#DC2626',
                        border: 'none'
                      }}
                    >
                      {activity.status === 'read' && <Eye className="w-3 h-3 mr-1" />}
                      {activity.status === 'delivered' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {activity.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </Badge>
                    {activity.error && (
                      <div className="text-xs text-red-600 mt-1">{activity.error}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {activity.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Smartphone, Send, TestTube, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { TriggerConfig, ConditionConfig, ActionConfig } from '../AutomationBuilder';

interface AutomationPreviewProps {
  automationName: string;
  audience: any;
  trigger: TriggerConfig | null;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
}

const whatsappTemplates = [
  { 
    id: 't1', 
    name: 'Welcome Message', 
    content: 'Hi {{name}}! 👋 Welcome to our store. We\'re excited to have you here! Reply HELP for assistance anytime.' 
  },
  { 
    id: 't2', 
    name: 'Birthday Wishes', 
    content: '🎉 Happy Birthday {{name}}! 🎂 Here\'s a special gift for you - use code BDAY20 for 20% off your next purchase!' 
  },
  { 
    id: 't3', 
    name: 'Price Inquiry Response', 
    content: 'Thanks for your interest! Our products range from ₹500 to ₹5000. Visit our store or website to see our full catalog. Need help? Just ask!' 
  },
  { 
    id: 't4', 
    name: 'Thank You Message', 
    content: 'Thank you for visiting us today, {{name}}! We hope you had a great experience. Share your feedback or questions anytime.' 
  },
  { 
    id: 't5', 
    name: 'Loyalty Update', 
    content: 'Great news {{name}}! 🌟 You now have {{points}} loyalty points. Redeem them on your next visit for exclusive rewards!' 
  },
];

export function AutomationPreview({ 
  automationName, 
  audience, 
  trigger, 
  conditions, 
  actions 
}: AutomationPreviewProps) {
  const [testPhone, setTestPhone] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleSendTest = () => {
    if (!testPhone) return;
    
    setTestStatus('sending');
    setTestMessage('');
    
    // Simulate sending
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        setTestStatus('success');
        setTestMessage(`Test message sent successfully to ${testPhone}`);
      } else {
        setTestStatus('error');
        setTestMessage('Failed to send test message. Please check the phone number and try again.');
      }
      
      setTimeout(() => {
        setTestStatus('idle');
        setTestMessage('');
      }, 5000);
    }, 2000);
  };

  const getTemplateContent = (templateId?: string) => {
    if (!templateId) return '';
    const template = whatsappTemplates.find(t => t.id === templateId);
    return template?.content || '';
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: '#313166' }}>
          Preview & Test
        </h2>
        <p className="text-gray-600">
          Review your automation flow and send a test message before activating.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Flow Summary */}
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#313166' }}>
              Automation Summary
            </h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Automation Name</div>
                <div className="font-semibold" style={{ color: '#313166' }}>
                  {automationName}
                </div>
              </div>

              {/* Audience */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Target Audience</div>
                <div className="font-semibold" style={{ color: '#313166' }}>
                  {audience?.type === 'preset' 
                    ? audience.preset.name 
                    : 'Custom Audience'}
                </div>
                <div className="text-sm text-gray-500">
                  {audience?.count?.toLocaleString() || 0} customers
                </div>
              </div>

              {/* Trigger */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Trigger</div>
                <div className="font-semibold" style={{ color: '#313166' }}>
                  {trigger?.name || 'No trigger selected'}
                </div>
                <div className="text-sm text-gray-500">
                  {trigger?.category} event
                </div>
              </div>

              {/* Conditions */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Conditions</div>
                {conditions.length > 0 ? (
                  <div className="space-y-2">
                    {conditions.map((condition, index) => (
                      <div 
                        key={condition.id}
                        className="text-sm p-2 rounded"
                        style={{ backgroundColor: '#F4F5F9' }}
                      >
                        {index > 0 && <span className="text-gray-500 mr-2">AND</span>}
                        <span className="font-medium">{condition.field}</span>
                        {' '}<span className="text-gray-600">{condition.operator}</span>{' '}
                        <span className="font-medium">{condition.value?.toString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No conditions</div>
                )}
              </div>

              {/* Actions */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Actions</div>
                {actions.length > 0 ? (
                  <div className="space-y-2">
                    {actions.map((action, index) => {
                      const template = whatsappTemplates.find(t => t.id === action.templateId);
                      return (
                        <div 
                          key={action.id}
                          className="text-sm p-2 rounded border border-green-200"
                          style={{ backgroundColor: '#16A34A10' }}
                        >
                          {index > 0 && <div className="text-gray-500 text-xs mb-1">THEN</div>}
                          <div className="font-medium text-green-800">
                            Send: {template?.name}
                          </div>
                          {action.delay !== 'immediate' && (
                            <div className="text-xs text-gray-600 mt-1">
                              Delay: {action.delay}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No actions</div>
                )}
              </div>
            </div>
          </div>

          {/* Test Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TestTube className="w-5 h-5" style={{ color: '#313166' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#313166' }}>
                Send Test Message
              </h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Test Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={testStatus === 'sending'}
                />
              </div>

              <Button
                onClick={handleSendTest}
                disabled={!testPhone || testStatus === 'sending'}
                className="w-full"
                style={{
                  background: testPhone && testStatus !== 'sending'
                    ? 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)'
                    : '#E5E7EB',
                  color: testPhone && testStatus !== 'sending' ? 'white' : '#9CA3AF',
                  border: 'none'
                }}
              >
                {testStatus === 'sending' ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>

              {testMessage && (
                <div 
                  className="flex items-start gap-2 p-3 rounded-md text-sm"
                  style={{
                    backgroundColor: testStatus === 'success' ? '#16A34A15' : '#DC262615',
                    color: testStatus === 'success' ? '#16A34A' : '#DC2626'
                  }}
                >
                  {testStatus === 'success' ? (
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{testMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: WhatsApp Preview */}
        <div>
          <div 
            className="rounded-lg p-6"
            style={{ backgroundColor: '#313166' }}
          >
            <div className="flex items-center gap-2 mb-4 text-white">
              <Smartphone className="w-5 h-5" />
              <h3 className="text-lg font-semibold">WhatsApp Preview</h3>
            </div>
            
            {/* Phone Mockup */}
            <div 
              className="mx-auto rounded-3xl p-3 shadow-2xl"
              style={{ 
                backgroundColor: '#1f1f1f',
                maxWidth: '380px'
              }}
            >
              {/* Phone Screen */}
              <div 
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: '#0a0a0a',
                  aspectRatio: '9/19.5'
                }}
              >
                {/* WhatsApp Header */}
                <div 
                  className="p-3 flex items-center gap-3"
                  style={{ backgroundColor: '#075e54' }}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold">
                    V
                  </div>
                  <div className="flex-1 text-white">
                    <div className="font-semibold">Vadik Business</div>
                    <div className="text-xs opacity-80">online</div>
                  </div>
                </div>

                {/* Chat Area */}
                <div 
                  className="p-4 min-h-[400px]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #0d1418 0px, #0d1418 10px, #0e1519 10px, #0e1519 20px)'
                  }}
                >
                  {actions.length > 0 ? (
                    <div className="space-y-3">
                      {actions.map((action, index) => {
                        const content = getTemplateContent(action.templateId);
                        const sampleContent = content
                          .replace(/\{\{name\}\}/g, 'John')
                          .replace(/\{\{points\}\}/g, '250');
                        
                        return (
                          <div key={action.id} className="flex justify-end">
                            <div 
                              className="rounded-lg p-3 max-w-[85%]"
                              style={{ backgroundColor: '#005c4b' }}
                            >
                              <div className="text-white text-sm whitespace-pre-wrap">
                                {sampleContent}
                              </div>
                              <div className="text-right text-xs mt-1 opacity-70 text-gray-300">
                                12:00 PM
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      Add actions to see preview
                    </div>
                  )}
                </div>

                {/* WhatsApp Input */}
                <div 
                  className="p-2 flex items-center gap-2"
                  style={{ backgroundColor: '#1f2c33' }}
                >
                  <div 
                    className="flex-1 rounded-full px-4 py-2 text-sm"
                    style={{ backgroundColor: '#2a3942', color: '#8696a0' }}
                  >
                    Type a message
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#00a884' }}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-white/70 text-sm">
              This is how your message will appear on WhatsApp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Plus, X, MessageSquare, Clock, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { TriggerConfig, ConditionConfig, ActionConfig } from '../AutomationBuilder';

interface FlowBuilderProps {
  trigger: TriggerConfig;
  conditions: ConditionConfig[];
  actions: ActionConfig[];
  onConditionsChange: (conditions: ConditionConfig[]) => void;
  onActionsChange: (actions: ActionConfig[]) => void;
}

const conditionFields = [
  { id: 'isOptedIn', label: 'Customer is opted in', type: 'boolean' },
  { id: 'loyaltyPoints', label: 'Loyalty points', type: 'number' },
  { id: 'lastVisit', label: 'Last visit', type: 'date' },
  { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { id: 'source', label: 'Source', type: 'select', options: ['Walk-in', 'Online', 'Referral'] },
];

const operators = {
  boolean: ['equals'],
  number: ['greater than', 'less than', 'equals'],
  date: ['within last', 'before', 'after'],
  select: ['equals', 'not equals']
};

const whatsappTemplates = [
  { id: 't1', name: 'Welcome Message', category: 'Onboarding', status: 'Approved' },
  { id: 't2', name: 'Birthday Wishes', category: 'Engagement', status: 'Approved' },
  { id: 't3', name: 'Price Inquiry Response', category: 'Support', status: 'Approved' },
  { id: 't4', name: 'Thank You Message', category: 'Engagement', status: 'Approved' },
  { id: 't5', name: 'Loyalty Update', category: 'Rewards', status: 'Approved' },
];

const delayOptions = [
  { id: 'immediate', label: 'Send Immediately' },
  { id: '5m', label: 'Wait 5 minutes' },
  { id: '1h', label: 'Wait 1 hour' },
  { id: '1d', label: 'Wait 1 day' },
  { id: '3d', label: 'Wait 3 days' },
  { id: '7d', label: 'Wait 7 days' },
];

export function FlowBuilder({ 
  trigger, 
  conditions, 
  actions, 
  onConditionsChange, 
  onActionsChange 
}: FlowBuilderProps) {
  const [showConditionBuilder, setShowConditionBuilder] = useState(false);
  const [showActionBuilder, setShowActionBuilder] = useState(false);
  const [newCondition, setNewCondition] = useState<Partial<ConditionConfig>>({});
  const [newAction, setNewAction] = useState<Partial<ActionConfig>>({ type: 'send_template', delay: 'immediate' });

  const handleAddCondition = () => {
    if (newCondition.field && newCondition.operator) {
      onConditionsChange([
        ...conditions,
        {
          id: Date.now().toString(),
          field: newCondition.field,
          operator: newCondition.operator,
          value: newCondition.value
        }
      ]);
      setNewCondition({});
      setShowConditionBuilder(false);
    }
  };

  const handleRemoveCondition = (id: string) => {
    onConditionsChange(conditions.filter(c => c.id !== id));
  };

  const handleAddAction = () => {
    if (newAction.type && (newAction.templateId || newAction.message)) {
      onActionsChange([
        ...actions,
        {
          id: Date.now().toString(),
          type: newAction.type,
          templateId: newAction.templateId,
          message: newAction.message,
          delay: newAction.delay || 'immediate'
        }
      ]);
      setNewAction({ type: 'send_template', delay: 'immediate' });
      setShowActionBuilder(false);
    }
  };

  const handleRemoveAction = (id: string) => {
    onActionsChange(actions.filter(a => a.id !== id));
  };

  const selectedField = conditionFields.find(f => f.id === newCondition.field);
  const availableOperators = selectedField ? operators[selectedField.type as keyof typeof operators] : [];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: '#313166' }}>
          Build Your Flow
        </h2>
        <p className="text-gray-600">
          Add conditions to filter your audience and configure the WhatsApp action to send.
        </p>
      </div>

      {/* Flow Canvas */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Trigger Block */}
        <div className="flex flex-col items-center mb-6">
          <div 
            className="bg-white rounded-lg p-6 border-2 w-full max-w-md text-center"
            style={{ borderColor: '#CB376D' }}
          >
            <div className="text-sm text-gray-600 mb-1">When this happens</div>
            <div className="text-lg font-semibold" style={{ color: '#313166' }}>
              {trigger.name}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {trigger.category} Trigger
            </div>
          </div>
          
          {/* Connector */}
          <div className="w-px h-12 bg-gray-300 my-2" />
        </div>

        {/* Conditions Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" style={{ color: '#313166' }} />
                <h3 className="font-semibold" style={{ color: '#313166' }}>
                  Conditions (Optional)
                </h3>
              </div>
              {!showConditionBuilder && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConditionBuilder(true)}
                  style={{ color: '#CB376D', borderColor: '#CB376D' }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Condition
                </Button>
              )}
            </div>

            {/* Existing Conditions */}
            {conditions.map((condition, index) => (
              <div key={condition.id}>
                <div 
                  className="bg-gray-50 rounded-lg p-4 mb-2 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: '#313166' }}>
                        {conditionFields.find(f => f.id === condition.field)?.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {condition.operator} {condition.value !== undefined && condition.value !== null ? condition.value.toString() : ''}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveCondition(condition.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {index < conditions.length - 1 && (
                  <div className="text-center text-sm text-gray-500 my-2">AND</div>
                )}
              </div>
            ))}

            {/* Condition Builder */}
            {showConditionBuilder && (
              <div 
                className="rounded-lg p-4 mb-2 border-2"
                style={{ borderColor: '#CB376D', backgroundColor: '#CB376D05' }}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Field
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newCondition.field || ''}
                      onChange={(e) => setNewCondition({ ...newCondition, field: e.target.value, operator: undefined, value: undefined })}
                    >
                      <option value="">Select field...</option>
                      {conditionFields.map(field => (
                        <option key={field.id} value={field.id}>{field.label}</option>
                      ))}
                    </select>
                  </div>

                  {newCondition.field && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Operator
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newCondition.operator || ''}
                        onChange={(e) => setNewCondition({ ...newCondition, operator: e.target.value })}
                      >
                        <option value="">Select operator...</option>
                        {availableOperators.map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newCondition.field && newCondition.operator && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Value
                      </label>
                      {selectedField?.type === 'select' ? (
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={newCondition.value || ''}
                          onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                        >
                          <option value="">Select value...</option>
                          {selectedField.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : selectedField?.type === 'boolean' ? (
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={newCondition.value?.toString() || ''}
                          onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value === 'true' })}
                        >
                          <option value="">Select...</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : (
                        <input
                          type={selectedField?.type === 'number' ? 'number' : 'text'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={newCondition.value || ''}
                          onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                          placeholder="Enter value..."
                        />
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddCondition}
                      disabled={!newCondition.field || !newCondition.operator}
                      style={{
                        background: newCondition.field && newCondition.operator
                          ? 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)'
                          : '#E5E7EB',
                        color: newCondition.field && newCondition.operator ? 'white' : '#9CA3AF',
                        border: 'none'
                      }}
                    >
                      Add Condition
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowConditionBuilder(false);
                        setNewCondition({});
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {conditions.length === 0 && !showConditionBuilder && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No conditions added. This automation will run for all customers in the selected audience.
              </div>
            )}
          </div>

          {/* Connector */}
          <div className="w-px h-12 bg-gray-300 my-2" />
        </div>

        {/* Actions Section */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" style={{ color: '#313166' }} />
                <h3 className="font-semibold" style={{ color: '#313166' }}>
                  WhatsApp Action
                </h3>
              </div>
              {actions.length === 0 && !showActionBuilder && (
                <Button
                  size="sm"
                  onClick={() => setShowActionBuilder(true)}
                  style={{
                    background: 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Action
                </Button>
              )}
            </div>

            {/* Existing Actions */}
            {actions.map((action, index) => {
              const template = whatsappTemplates.find(t => t.id === action.templateId);
              const delay = delayOptions.find(d => d.id === action.delay);
              
              return (
                <div key={action.id}>
                  <div 
                    className="bg-green-50 rounded-lg p-4 mb-2 border-2 border-green-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-green-600" />
                          <div className="text-sm font-medium text-green-900">
                            Send WhatsApp Template
                          </div>
                        </div>
                        <div className="text-sm font-semibold" style={{ color: '#313166' }}>
                          {template?.name || action.message}
                        </div>
                        {template && (
                          <div className="text-xs text-gray-600 mt-1">
                            {template.category}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAction(action.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {action.delay !== 'immediate' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded px-3 py-2">
                        <Clock className="w-4 h-4" />
                        {delay?.label}
                      </div>
                    )}
                  </div>
                  {index < actions.length - 1 && (
                    <div className="text-center text-sm text-gray-500 my-2">THEN</div>
                  )}
                </div>
              );
            })}

            {/* Action Builder */}
            {showActionBuilder && (
              <div 
                className="rounded-lg p-4 mb-2 border-2"
                style={{ borderColor: '#CB376D', backgroundColor: '#CB376D05' }}
              >
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Select Template
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newAction.templateId || ''}
                      onChange={(e) => setNewAction({ ...newAction, templateId: e.target.value })}
                    >
                      <option value="">Choose a WhatsApp template...</option>
                      {whatsappTemplates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Timing
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newAction.delay || 'immediate'}
                      onChange={(e) => setNewAction({ ...newAction, delay: e.target.value })}
                    >
                      {delayOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddAction}
                      disabled={!newAction.templateId}
                      style={{
                        background: newAction.templateId
                          ? 'linear-gradient(135deg, #CB376D 0%, #A72962 100%)'
                          : '#E5E7EB',
                        color: newAction.templateId ? 'white' : '#9CA3AF',
                        border: 'none'
                      }}
                    >
                      Add Action
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowActionBuilder(false);
                        setNewAction({ type: 'send_template', delay: 'immediate' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {actions.length === 0 && !showActionBuilder && (
              <div className="text-center py-6 text-gray-500 text-sm">
                Add at least one action to complete your automation flow.
              </div>
            )}

            {actions.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowActionBuilder(true)}
                className="w-full mt-2"
                style={{ color: '#CB376D', borderColor: '#CB376D' }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Another Action
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { MessageCircle, Tag, UserPlus, Calendar, CheckCircle2, Webhook, Activity } from 'lucide-react';
import { TriggerConfig } from '../AutomationBuilder';

interface TriggerSelectorProps {
  selectedTrigger: TriggerConfig | null;
  onTriggerChange: (trigger: TriggerConfig) => void;
}

const triggers = [
  {
    id: 'incoming_message',
    category: 'WhatsApp',
    name: 'Incoming Message',
    icon: 'message-circle',
    description: 'Triggered when a customer sends a WhatsApp message.',
    example: 'Customer sends "price" or asks a support question.',
    useCase: 'Auto-reply, support routing, keyword-based response.',
    color: '#16A34A'
  },
  {
    id: 'keyword_match',
    category: 'WhatsApp',
    name: 'Keyword Match',
    icon: 'tag',
    description: 'Triggered when an incoming message contains a specific keyword.',
    example: 'Keywords like price, order, delivery, birthday, discount.',
    useCase: 'Instant keyword automation and FAQ flows.',
    color: '#2563EB'
  },
  {
    id: 'new_customer',
    category: 'Customer',
    name: 'New Customer',
    icon: 'user-plus',
    description: 'Triggered when a new customer is added to the system.',
    example: 'Send welcome and opt-in flow automatically.',
    useCase: 'Welcome journey, first message, onboarding.',
    color: '#CB376D'
  },
  {
    id: 'scheduled_time',
    category: 'Time',
    name: 'Scheduled Time',
    icon: 'calendar',
    description: 'Triggered at a specific date and time.',
    example: 'Birthday reminder, festival reminder, sale campaign.',
    useCase: 'Scheduled campaigns, reminder flows, timed nudges.',
    color: '#D97706'
  },
  {
    id: 'message_delivered',
    category: 'Event',
    name: 'Message Delivered',
    icon: 'check-circle-2',
    description: 'Triggered when a WhatsApp message is delivered successfully.',
    example: 'Send a follow-up after delivery confirmation.',
    useCase: 'Post-delivery journeys and next-step messaging.',
    color: '#059669'
  },
  {
    id: 'webhook',
    category: 'External',
    name: 'Webhook',
    icon: 'webhook',
    description: 'Triggered from an external API or webhook event.',
    example: 'Website form submission or CRM update starts the flow.',
    useCase: 'External system integration.',
    color: '#7C3AED'
  },
  {
    id: 'customer_activity',
    category: 'Customer',
    name: 'Customer Activity',
    icon: 'activity',
    description: 'Triggered when customer attributes or activity changes.',
    example: 'Loyalty points updated, visit tracked, opt-in changed.',
    useCase: 'Behaviour-based automation and re-engagement.',
    color: '#DC2626'
  }
];

const iconMap = {
  'message-circle': MessageCircle,
  'tag': Tag,
  'user-plus': UserPlus,
  'calendar': Calendar,
  'check-circle-2': CheckCircle2,
  'webhook': Webhook,
  'activity': Activity
};

export function TriggerSelector({ selectedTrigger, onTriggerChange }: TriggerSelectorProps) {
  const categories = Array.from(new Set(triggers.map(t => t.category)));

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: '#313166' }}>
          Choose a Trigger
        </h2>
        <p className="text-gray-600">
          Start with the event that should launch your automation. Select the trigger that best matches your use case.
        </p>
      </div>

      {/* Triggers by Category */}
      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#313166' }}>
            {category} Triggers
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {triggers
              .filter(t => t.category === category)
              .map((trigger) => {
                const Icon = iconMap[trigger.icon as keyof typeof iconMap];
                const isSelected = selectedTrigger?.id === trigger.id;
                
                return (
                  <div
                    key={trigger.id}
                    className="bg-white rounded-lg p-6 border-2 cursor-pointer transition-all hover:shadow-md"
                    style={{
                      borderColor: isSelected ? trigger.color : '#E5E7EB',
                      backgroundColor: isSelected ? `${trigger.color}05` : 'white'
                    }}
                    onClick={() => onTriggerChange(trigger)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${trigger.color}15` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: trigger.color }} />
                      </div>
                      {isSelected && (
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: trigger.color }}
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#313166' }}>
                      {trigger.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {trigger.description}
                    </p>

                    <div 
                      className="text-xs p-3 rounded-md mb-3"
                      style={{ backgroundColor: '#F4F5F9' }}
                    >
                      <div className="font-medium mb-1" style={{ color: '#313166' }}>
                        Example:
                      </div>
                      <div className="text-gray-600">
                        {trigger.example}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Use Case:</span> {trigger.useCase}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Selected Trigger Summary */}
      {selectedTrigger && (
        <div 
          className="bg-white rounded-lg p-6 border-2 mt-6"
          style={{ borderColor: '#CB376D', backgroundColor: '#CB376D05' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#CB376D15' }}
            >
              {(() => {
                const Icon = iconMap[selectedTrigger.icon as keyof typeof iconMap];
                return <Icon className="w-5 h-5" style={{ color: '#CB376D' }} />;
              })()}
            </div>
            <div>
              <div className="text-sm text-gray-600">Selected Trigger</div>
              <div className="font-semibold" style={{ color: '#313166' }}>
                {selectedTrigger.name}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Click "Next Step" to configure conditions and actions for this trigger.
          </p>
        </div>
      )}
    </div>
  );
}
