export interface CareerCoachProfile {
  skills?: string[];
  experience?: string;
  education?: string;
  location?: string;
  fullName?: string;
}

export function buildCareerCoachFallback(
  message: string,
  profile?: CareerCoachProfile,
): { response: string; parsedWithAi: false } {
  const normalized = message.toLowerCase();
  const skills = profile?.skills?.filter(Boolean) ?? [];
  const skillsText = skills.length ? skills.slice(0, 5).join(', ') : 'your current skills';
  const location = profile?.location || 'The Gambia';
  const name = profile?.fullName?.split(' ')[0];

  let response: string;

  if (/(cv|resume|curriculum)/i.test(normalized)) {
    response = `Keep your CV to one or two pages with clear sections: contact info, summary, skills, experience, and education. Highlight ${skillsText} near the top and tailor each version to the role you want in ${location}.`;
  } else if (/(interview|prepare|preparation)/i.test(normalized)) {
    response =
      'Research the company, prepare three achievement examples using the STAR method, and practice answers for "Tell me about yourself" and "Why this role?". Arrive early and bring copies of your CV.';
  } else if (/(skill|learn|training|course)/i.test(normalized)) {
    response = `Build on ${skillsText} with short online courses and a small portfolio project. Check the Training section on JobMatch for courses linked to skills employers ask for in ${location}.`;
  } else if (/(job|work|apply|career|role)/i.test(normalized)) {
    response = name
      ? `${name}, focus on roles that match ${skillsText}. Browse published jobs, upload your CV for better match scores, and apply where your profile aligns with required skills.`
      : `Focus on roles that match ${skillsText}. Browse published jobs, upload your CV for better match scores, and apply where your profile aligns with required skills.`;
  } else if (/(salary|pay|negotiat)/i.test(normalized)) {
    response =
      'Research typical pay for the role in your market before interviews. When negotiating, focus on your skills, results, and value — and ask about growth opportunities if the base offer is fixed.';
  } else {
    response = `I can help with CV tips, interview prep, skills, and job search strategy in ${location}. Based on ${skillsText}, start by completing your profile, uploading your CV, and applying to roles with strong match scores.`;
  }

  return { response, parsedWithAi: false };
}

export function buildLearningRoadmapFallback(
  goal: string,
  profile?: CareerCoachProfile,
): { response: string; roadmap: Record<string, unknown>; parsedWithAi: false } {
  const skills = profile?.skills?.filter(Boolean) ?? [];
  const currentSkills = skills.length ? skills : ['Communication', 'Problem solving'];

  return {
    response: `Here is a starter roadmap to become a ${goal}.`,
    parsedWithAi: false,
    roadmap: {
      goal,
      summary: `A practical path toward ${goal}, building on ${currentSkills.slice(0, 3).join(', ')}.`,
      estimated_timeline: '3-6 months',
      steps: [
        {
          step: 1,
          title: 'Strengthen core skills',
          skills_to_learn: currentSkills.slice(0, 2),
          duration: '4 weeks',
          resources: ['JobMatch training courses', 'Free online tutorials'],
        },
        {
          step: 2,
          title: 'Build portfolio evidence',
          skills_to_learn: ['Portfolio projects', 'Communication'],
          duration: '6 weeks',
          resources: ['GitHub portfolio', 'Volunteer or freelance projects'],
        },
        {
          step: 3,
          title: 'Apply with intent',
          skills_to_learn: ['Interview preparation', 'CV tailoring'],
          duration: '2 weeks',
          resources: ['JobMatch job listings', 'AI Career Coach'],
        },
      ],
    },
  };
}
