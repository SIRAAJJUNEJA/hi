
import { Session } from './types';

export const INITIAL_SESSIONS: Session[] = [
  {
    id: '1',
    title: 'The Science Behind Successful Marketing',
    category: 'Economics',
    timeLabel: 'LIVE @ 6:00 PM',
    status: 'LIVE',
    mentorName: 'Arjun Mehta',
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
    title: 'Scalability Patterns in Distributed Systems',
    category: 'Engineering',
    timeLabel: 'LIVE NOW',
    status: 'NOW',
    mentorName: 'Rohan Das',
    mentorInst: 'BITS Pilani',
    mentorTitle: 'Cloud Architect Alumni',
    mentorBio: 'Rohan is a veteran systems engineer who has designed infrastructure for multi-million user platforms. He specializes in Kubernetes orchestration and event-driven architectures.',
    avatarUrl: 'https://picsum.photos/seed/rohan/100/100',
    description: 'A deep dive into high-availability architecture and horizontal scaling strategies.',
    longDescription: 'When "it works on my machine" is no longer enough. This technical masterclass explores the architectural patterns required to support massive concurrent user growth. We will cover the CAP theorem in practice, load balancing strategies, database sharding, and the pitfalls of microservices. Expect a rigorous discussion on latency vs. throughput and the economics of cloud resource management.',
    zoomLink: 'https://zoom.us/j/323456789',
    relatedSessionIds: ['1', '5']
  },
  {
    id: '4',
    title: 'The Psychology of Choice: Behavioral Architecture',
    category: 'Economics',
    timeLabel: 'JAN 25, 2:00 PM',
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
    title: 'User-Centric Ethics in Product Ecosystems',
    category: 'Design',
    timeLabel: 'JAN 26, 11:00 AM',
    status: 'UPCOMING',
    mentorName: 'Kevin Zheng',
    mentorInst: 'Stanford d.school',
    mentorTitle: 'Interaction Design Lead',
    mentorBio: 'Kevin is a designer and technologist focused on humane technology. He leads design workshops at Stanford and consults for ethics-first tech startups.',
    avatarUrl: 'https://picsum.photos/seed/kevin/100/100',
    description: 'Balancing commercial objectives with ethical design frameworks in modern SaaS.',
    longDescription: 'Design is never neutral. As product creators, every interaction we build carries moral weight. This session provides a framework for evaluating the long-term human impact of design decisions. We will discuss dark patterns, algorithmic transparency, and the transition from "human-centered" to "humanity-centered" design. A must-attend for aspiring product managers, designers, and founders.',
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
