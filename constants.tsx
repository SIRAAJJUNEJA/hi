
import { Session } from './types';

export const INITIAL_SESSIONS: Session[] = [
  {
    id: '1',
    title: 'The Science Behind Successful Marketing',
    category: 'Economics',
    timeLabel: 'LIVE @ 6:00 PM',
    status: 'LIVE',
    mentorName: 'Arjun Metani',
    mentorInst: 'IIT Delhi',
    mentorTitle: 'Senior Research Scholar',
    mentorBio: 'Arjun is a doctoral candidate specializing in microeconomic theory and its applications in digital commerce. His research focuses on non-cooperative games in platform economies.',
    avatarUrl: 'https://picsum.photos/seed/arjun/100/100',
    description: 'Analyzing how competitive equilibrium models are being redefined by the digital economy.',
    longDescription: 'This session delves into the intricate dynamics of strategic interaction within volatile emerging markets. We will explore how classical Nash Equilibrium models hold up—or break down—when faced with the rapid digitization of trade and asymmetric information in South Asian and African markets. Participants will engage with real-world case studies from FinTech disruptors and platform-based marketplaces.',
    zoomLink: 'https://zoom.us/j/123456789',
    relatedSessionIds: ['4', '5']
  },
  {
    id: '2',
    title: 'Advanced Narrative Construction for MBA Interviews',
    category: 'Career',
    timeLabel: 'JAN 24, 4:00 PM',
    status: 'UPCOMING',
    mentorName: 'Sarah Williams',
    mentorInst: 'IIM Ahmedabad',
    mentorTitle: 'MBA Excellence Fellow',
    mentorBio: 'Sarah is an IIM-A scholar with a background in Literature and Management. She has successfully mentored over 50 students through the rigorous admissions processes of global top-tier business schools.',
    avatarUrl: 'https://picsum.photos/seed/sarah/100/100',
    description: 'Deconstructing the art of storytelling to navigate high-stakes admission panels.',
    longDescription: 'In high-stakes interviews, your story is your most potent asset. This workshop focuses on deconstructing your personal and professional trajectory to identify the "golden thread" of your narrative. We move beyond standard STAR methods to explore narrative psychology, ensuring your contributions are not just listed, but felt by the panel. Ideal for candidates targeting Global MBA and Executive Education programs.',
    zoomLink: 'https://zoom.us/j/223456789',
    relatedSessionIds: ['5']
  },
  {
    id: '3',
    title: 'Global Equity Derivatives 101',
    category: 'Economics',
    timeLabel: 'LIVE NOW',
    status: 'NOW',
    mentorName: 'Siraaj Juneja',
    mentorInst: 'Delhi University',
    mentorTitle: 'Founder',
    mentorBio: 'Siraaj Juneja is the founder of Gyaan.one and a scholar at IIM Ahmedabad, specializing in global equity derivatives, quantitative finance, and portfolio structuring.',
    avatarUrl: 'https://picsum.photos/seed/siraaj/100/100',
    description: 'Deconstructing the mechanics, valuation, and hedging strategies of global equity derivatives.',
    longDescription: 'This comprehensive masterclass provides a foundational look into the world of global equity derivatives. We will explore option pricing models, delta hedging mechanics, structured products, and how derivatives are used by institutional investors to manage portfolio risk in highly volatile markets.',
    zoomLink: 'https://zoom.us/j/323456789',
    relatedSessionIds: ['1', '5']
  },
  {
    id: '4',
    title: 'The Psychology of Choice: Behavioral Architecture',
    category: 'Economics',
    timeLabel: 'AUGUST 12, 2:00 PM',
    status: 'UPCOMING',
    mentorName: 'Elena Rossi',
    mentorInst: 'London School of Economics',
    mentorTitle: 'Postdoctoral Fellow',
    mentorBio: 'Elena is a behavioral economist investigating nudge theory in consumer finance. Her work has been published in the Journal of Economic Perspectives.',
    avatarUrl: 'https://picsum.photos/seed/elena/100/100',
    description: 'Unpacking the cognitive biases that drive financial decision-making in retail markets.',
    longDescription: 'Why do we make irrational choices even when we have all the data? This session explores the intersection of cognitive psychology and economics. We will examine "choice architecture" and how subtle nudges impact everything from personal savings to global investment trends. Participants will learn how to identify their own heuristics and the ethical implications of using behavioral insights in product design.',
    zoomLink: 'https://zoom.us/j/423456789',
    relatedSessionIds: ['1', '5']
  },
  {
    id: '5',
    title: 'Consulting Firms & Creativity inside',
    category: 'Design',
    timeLabel: 'JAN 26, 11:00 AM',
    status: 'UPCOMING',
    mentorName: 'Yuvaan Shah',
    mentorInst: 'ISB Hyderabad',
    mentorTitle: 'Strategy & Innovation Scholar',
    mentorBio: 'Yuvaan is a scholar at ISB Hyderabad focusing on strategy consulting, design thinking, and creative problem-solving frameworks inside leading global consulting firms.',
    avatarUrl: 'https://picsum.photos/seed/yuvaan/100/100',
    description: 'Exploring structured strategy consulting and creative problem-solving inside leading firms.',
    longDescription: 'This session explores how top-tier management consulting firms leverage design thinking, structured problem solving, and creative frameworks to crack ambiguous business challenges. Learn how consultants approach complex corporate transformations and blend analytical rigor with human-centered creativity.',
    zoomLink: 'https://zoom.us/j/523456789',
    relatedSessionIds: ['4', '2']
  }
];

export const COLORS = {
  primary: '#1A2238',
  accent: '#7FB5B5',
  secondary: '#C5A059',
  bg: '#FDFBF7'
};
