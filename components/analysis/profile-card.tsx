'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, Brain, MapPin, Briefcase, GraduationCap, Heart, 
  TrendingUp, BookOpen, Compass, Users, Shield, Lightbulb,
  Target, Home, Fingerprint
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DetailedSection {
  title: string;
  conclusion: string;
  evidence: string[];
  confidence: string;
}

interface PersonalityData {
  myersBriggs?: {
    type: string;
    reasoning: string;
  };
  bigFive?: {
    openness: string;
    conscientiousness: string;
    extraversion: string;
    agreeableness: string;
    neuroticism: string;
  };
}

interface ProfileData {
  demographics: { label: string; value: string }[];
  mindset: { label: string; value: string }[];
  personality: PersonalityData | null;
  detailedAnalysis: DetailedSection[];
}

interface JSONProfileResponse {
  demographics?: {
    ageLifeStage?: string;
    educationLevel?: string;
    professionalField?: string;
    geographicLocation?: string;
    familyStatus?: string;
  };
  mindset?: {
    politicsValues?: string;
    riskTolerance?: string;
    learningStyle?: string;
    informationDiet?: string;
    lifeArc?: string;
  };
  personality?: {
    myersBriggs?: {
      type: string;
      reasoning: string;
    };
    bigFive?: {
      openness: string;
      conscientiousness: string;
      extraversion: string;
      agreeableness: string;
      neuroticism: string;
    };
  };
  detailedAnalysis?: {
    title: string;
    conclusion: string;
    evidence: string[];
    confidence: string;
  }[];
}

function parseProfile(content: string): ProfileData | null {
  try {
    let jsonStr = content;
    
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }
    
    const parsed: JSONProfileResponse = JSON.parse(jsonStr);
    
    if (parsed.demographics || parsed.mindset || parsed.detailedAnalysis || parsed.personality) {
      const demographics: { label: string; value: string }[] = [];
      const mindset: { label: string; value: string }[] = [];
      
      if (parsed.demographics) {
        if (parsed.demographics.ageLifeStage) demographics.push({ label: 'Age & Life Stage', value: parsed.demographics.ageLifeStage });
        if (parsed.demographics.educationLevel) demographics.push({ label: 'Education Level', value: parsed.demographics.educationLevel });
        if (parsed.demographics.professionalField) demographics.push({ label: 'Professional Field', value: parsed.demographics.professionalField });
        if (parsed.demographics.geographicLocation) demographics.push({ label: 'Geographic Location', value: parsed.demographics.geographicLocation });
        if (parsed.demographics.familyStatus) demographics.push({ label: 'Family Status', value: parsed.demographics.familyStatus });
      }
      
      if (parsed.mindset) {
        if (parsed.mindset.politicsValues) mindset.push({ label: 'Politics & Values', value: parsed.mindset.politicsValues });
        if (parsed.mindset.riskTolerance) mindset.push({ label: 'Risk Tolerance', value: parsed.mindset.riskTolerance });
        if (parsed.mindset.learningStyle) mindset.push({ label: 'Learning Style', value: parsed.mindset.learningStyle });
        if (parsed.mindset.informationDiet) mindset.push({ label: 'Information Diet', value: parsed.mindset.informationDiet });
        if (parsed.mindset.lifeArc) mindset.push({ label: 'Life Arc', value: parsed.mindset.lifeArc });
      }
      
      return {
        demographics,
        mindset,
        personality: parsed.personality || null,
        detailedAnalysis: parsed.detailedAnalysis || [],
      };
    }
  } catch {
    console.log('JSON parsing failed for profile, falling back to markdown');
  }
  
  return null;
}

function getIconForLabel(label: string): React.ReactNode {
  const labelLower = label.toLowerCase();
  
  if (labelLower.includes('age') || labelLower.includes('life stage')) return <User className="w-4 h-4" />;
  if (labelLower.includes('education')) return <GraduationCap className="w-4 h-4" />;
  if (labelLower.includes('professional') || labelLower.includes('career')) return <Briefcase className="w-4 h-4" />;
  if (labelLower.includes('geographic') || labelLower.includes('location')) return <MapPin className="w-4 h-4" />;
  if (labelLower.includes('family')) return <Home className="w-4 h-4" />;
  if (labelLower.includes('politic') || labelLower.includes('value')) return <Heart className="w-4 h-4" />;
  if (labelLower.includes('risk')) return <TrendingUp className="w-4 h-4" />;
  if (labelLower.includes('learning')) return <Lightbulb className="w-4 h-4" />;
  if (labelLower.includes('information') || labelLower.includes('diet')) return <BookOpen className="w-4 h-4" />;
  if (labelLower.includes('life arc') || labelLower.includes('trajectory')) return <Compass className="w-4 h-4" />;
  if (labelLower.includes('personality') || labelLower.includes('trait')) return <Brain className="w-4 h-4" />;
  if (labelLower.includes('lifestyle') || labelLower.includes('interest')) return <Compass className="w-4 h-4" />;
  if (labelLower.includes('social') || labelLower.includes('relationship')) return <Users className="w-4 h-4" />;
  if (labelLower.includes('spiritual') || labelLower.includes('faith')) return <Shield className="w-4 h-4" />;
  if (labelLower.includes('goal') || labelLower.includes('ambition')) return <Target className="w-4 h-4" />;
  if (labelLower.includes('ethical') || labelLower.includes('societal')) return <Heart className="w-4 h-4" />;
  if (labelLower.includes('philosophical')) return <Lightbulb className="w-4 h-4" />;
  
  return <BookOpen className="w-4 h-4" />;
}

function getConfidenceBadgeColor(confidence: string): string {
  switch (confidence.toLowerCase()) {
    case 'high':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getBigFiveColor(level: string): string {
  const levelLower = level.toLowerCase();
  if (levelLower.startsWith('high')) return 'bg-blue-500';
  if (levelLower.startsWith('medium') || levelLower.startsWith('moderate')) return 'bg-yellow-500';
  if (levelLower.startsWith('low')) return 'bg-gray-400';
  return 'bg-blue-500';
}

function getBigFiveWidth(level: string): string {
  const levelLower = level.toLowerCase();
  if (levelLower.startsWith('high')) return 'w-[85%]';
  if (levelLower.startsWith('medium') || levelLower.startsWith('moderate')) return 'w-[50%]';
  if (levelLower.startsWith('low')) return 'w-[25%]';
  return 'w-[50%]';
}

function DetailedSectionCard({ section }: { section: DetailedSection }) {
  const icon = getIconForLabel(section.title);
  
  return (
    <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <h3 className="font-bold text-xl text-foreground">{section.title}</h3>
          </div>
          {section.confidence && (
            <Badge className={`text-sm font-medium ${getConfidenceBadgeColor(section.confidence)}`}>
              {section.confidence} confidence
            </Badge>
          )}
        </div>
        
        {section.conclusion && (
          <div className="mb-4 pl-11">
            <p className="text-base text-foreground leading-relaxed">{section.conclusion}</p>
          </div>
        )}
        
        {section.evidence && section.evidence.length > 0 && (
          <div className="pl-11">
            <p className="text-sm font-bold text-foreground/60 uppercase tracking-wide mb-3">
              Supporting Evidence
            </p>
            <ul className="space-y-2">
              {section.evidence.map((item, i) => (
                <li key={i} className="text-base text-foreground/80 leading-relaxed flex gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DemographicItem({ label, value }: { label: string; value: string }) {
  const icon = getIconForLabel(label);
  
  return (
    <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg border border-border/50">
      <div className="text-primary mt-0.5">{icon}</div>
      <div>
        <p className="text-base font-semibold text-foreground">{label}</p>
        <p className="text-base text-foreground/80">{value}</p>
      </div>
    </div>
  );
}

function PersonalityCard({ personality }: { personality: PersonalityData }) {
  const bigFiveTraits = [
    { key: 'openness', label: 'Openness', description: 'Curiosity & creativity' },
    { key: 'conscientiousness', label: 'Conscientiousness', description: 'Organization & discipline' },
    { key: 'extraversion', label: 'Extraversion', description: 'Social energy' },
    { key: 'agreeableness', label: 'Agreeableness', description: 'Cooperation & empathy' },
    { key: 'neuroticism', label: 'Neuroticism', description: 'Emotional sensitivity' },
  ];
  
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
          <Fingerprint className="w-6 h-6 text-primary" />
          Personality Inference
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Can AI guess your personality type from books alone?
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Myers-Briggs */}
        {personality.myersBriggs && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl font-black text-primary">
                {personality.myersBriggs.type}
              </div>
              <div className="text-base font-medium text-foreground/70">Myers-Briggs Type</div>
            </div>
            <p className="text-base text-foreground/80 leading-relaxed">
              {personality.myersBriggs.reasoning}
            </p>
          </div>
        )}
        
        {/* Big Five */}
        {personality.bigFive && (
          <div className="pt-5 border-t border-border">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="w-6 h-6 text-primary" />
              <h4 className="text-xl font-bold text-foreground">Big Five Personality Traits</h4>
            </div>
            <div className="space-y-5">
              {bigFiveTraits.map(trait => {
                const value = personality.bigFive?.[trait.key as keyof typeof personality.bigFive];
                if (!value) return null;
                
                // Extract just the level (High/Medium/Low) from the value
                const level = value.split(' - ')[0] || value.split(':')[0] || value;
                const explanation = value.includes(' - ') ? value.split(' - ').slice(1).join(' - ') : 
                                   value.includes(':') ? value.split(':').slice(1).join(':') : '';
                
                return (
                  <div key={trait.key}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-base font-bold text-foreground">{trait.label}</span>
                        <span className="text-sm text-foreground/60 ml-2">({trait.description})</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{level}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${getBigFiveColor(level)} ${getBigFiveWidth(level)} rounded-full transition-all`} />
                    </div>
                    {explanation && (
                      <p className="text-base text-foreground/75 mt-2 leading-relaxed">{explanation.trim()}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProfileCardProps {
  content: string;
}

export function ProfileCard({ content }: ProfileCardProps) {
  const profileData = useMemo(() => parseProfile(content), [content]);
  
  if (profileData) {
    return (
      <div className="space-y-6">
        {/* AI Inference Intro */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <p className="text-base text-foreground/80 leading-relaxed">
            <span className="font-semibold text-primary">AI Inference Experiment:</span> Based on your reading patterns, 
            here&apos;s what the AI guessed about you. How accurate is it?
          </p>
        </div>
        
        {/* Personality - Show first as it's the new highlight */}
        {profileData.personality && (profileData.personality.myersBriggs || profileData.personality.bigFive) && (
          <PersonalityCard personality={profileData.personality} />
        )}
        
        {/* Demographics */}
        {profileData.demographics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <User className="w-6 h-6 text-blue-500" />
                AI&apos;s Guess About You
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Inferred from your reading patterns — may be wildly off!
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {profileData.demographics.map((item, i) => (
                  <DemographicItem key={i} label={item.label} value={item.value} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Mindset */}
        {profileData.mindset.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <Brain className="w-6 h-6 text-purple-500" />
                Mindset & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {profileData.mindset.map((item, i) => (
                  <DemographicItem key={i} label={item.label} value={item.value} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Detailed Analysis */}
        {profileData.detailedAnalysis.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Detailed Analysis</h2>
                <p className="text-base text-muted-foreground">
                  In-depth insights across {profileData.detailedAnalysis.length} dimensions
                </p>
              </div>
            </div>
            
            <div className="grid gap-4">
              {profileData.detailedAnalysis.map((section, index) => (
                <DetailedSectionCard key={index} section={section} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Fallback: Display raw markdown
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-bold">
          <User className="w-6 h-6 text-primary" />
          Reader Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </CardContent>
    </Card>
  );
}
