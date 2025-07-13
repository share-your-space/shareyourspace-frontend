import { Company, Startup } from '@/types/organization';
import { Space, SpaceImage, BrowsableSpace } from '@/types/space';
import { Notification } from '@/types/notification';
import { User, Invitation, InvitationStatus } from '@/types/auth';
import { UserProfile } from '@/types/userProfile';
import { UserRole, ContactVisibility, StartupStage } from '@/types/enums';
import { Conversation, ChatMessageData } from '@/types/chat';
import { Connection } from '@/types/connection';


export const mockUsers: User[] = [
    {
        id: 'user-1',
        email: 'corporate.admin@example.com',
        role: UserRole.CORP_ADMIN,
        full_name: 'Admin User',
        profile_picture_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=500&fit=crop',
        company_id: 'comp-1',
        company_name: 'Innovate Inc.',
        is_active: true,
        status: 'ACTIVE',
    },
    {
        id: 'user-2',
        email: 'corporate.member@example.com',
        role: UserRole.CORP_MEMBER,
        full_name: 'Member User',
        profile_picture_url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=500&h=500&fit=crop',
        company_id: 'comp-1',
        company_name: 'Innovate Inc.',
        is_active: true,
        status: 'ACTIVE',
    },
    {
        id: 'user-3',
        email: 'jane.doe@example.com',
        role: UserRole.FREELANCER,
        full_name: 'Jane Doe',
        profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
        is_active: true,
        status: 'ACTIVE',
    },
    {
        id: 'user-4',
        email: 'john.smith@example.com',
        role: UserRole.STARTUP_MEMBER,
        full_name: 'John Smith',
        profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
        company_id: 'startup-2',
        company_name: 'QuantumLeap AI',
        is_active: true,
        status: 'ACTIVE',
    },
    {
        id: 'user-5',
        email: 'startup.admin@example.com',
        role: UserRole.STARTUP_ADMIN,
        full_name: 'Startup Admin',
        profile_picture_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=500&fit=crop',
        company_id: 'startup-2',
        company_name: 'QuantumLeap AI',
        is_active: true,
        status: 'ACTIVE',
    },
    {
        id: 'user-6',
        email: 'sysadmin@example.com',
        role: UserRole.SYS_ADMIN,
        full_name: 'System Administrator',
        profile_picture_url: 'https://images.unsplash.com/photo-1580894732444-8ec5341a54ba?w=500&h=500&fit=crop',
        is_active: true,
        status: 'ACTIVE',
    }
];

export const mockConnections: Connection[] = [
    {
        id: 'conn-1',
        requester_id: 'user-3',
        recipient_id: 'user-1',
        status: 'pending',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        requester: mockUsers.find(u => u.id === 'user-3')!,
        recipient: mockUsers.find(u => u.id === 'user-1')!,
    },
    {
        id: 'conn-2',
        requester_id: 'user-1',
        recipient_id: 'user-4',
        status: 'pending',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        requester: mockUsers.find(u => u.id === 'user-1')!,
        recipient: mockUsers.find(u => u.id === 'user-4')!,
    },
    {
        id: 'conn-3',
        requester_id: 'user-5',
        recipient_id: 'user-1',
        status: 'accepted',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        requester: mockUsers.find(u => u.id === 'user-5')!,
        recipient: mockUsers.find(u => u.id === 'user-1')!,
    },
    {
        id: 'conn-4',
        requester_id: 'user-1',
        recipient_id: 'user-2',
        status: 'accepted',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        requester: mockUsers.find(u => u.id === 'user-1')!,
        recipient: mockUsers.find(u => u.id === 'user-2')!,
    }
];

export const mockUserProfiles: { [key: string]: UserProfile } = {
    'user-1': {
        id: 'profile-1',
        user_id: 'user-1',
        role: UserRole.CORP_ADMIN,
        first_name: 'Admin',
        last_name: 'User',
        full_name: 'Admin User',
        title: 'Lead Administrator',
        bio: 'Experienced corporate administrator with a passion for efficient workspace management and fostering collaborative environments.',
        profile_picture_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=500&fit=crop',
        cover_photo_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200&auto=format&fit=crop',
        skills_expertise: ['Workspace Management', 'Team Leadership', 'Operational Efficiency'],
        industry_focus: ['Technology', 'Corporate Services'],
        tools_technologies: ['Microsoft Office Suite', 'Asana', 'Slack'],
        linkedin_profile_url: 'https://linkedin.com/in/adminuser',
        contact_info_visibility: ContactVisibility.CONNECTIONS,
    },
    'user-2': {
        id: 'profile-2',
        user_id: 'user-2',
        role: UserRole.CORP_MEMBER,
        first_name: 'Member',
        last_name: 'User',
        full_name: 'Member User',
        title: 'Marketing Specialist',
        bio: 'Marketing professional at Innovate Inc., focused on digital campaigns and brand growth.',
        profile_picture_url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=500&h=500&fit=crop',
        cover_photo_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
        skills_expertise: ['Digital Marketing', 'SEO', 'Content Creation'],
        industry_focus: ['Technology', 'Marketing'],
        tools_technologies: ['Google Analytics', 'HubSpot', 'Canva'],
        linkedin_profile_url: 'https://linkedin.com/in/memberuser',
        contact_info_visibility: ContactVisibility.CONNECTIONS,
    },
    'user-3': {
        id: 'profile-3',
        user_id: 'user-3',
        role: UserRole.FREELANCER,
        first_name: 'Jane',
        last_name: 'Doe',
        full_name: 'Jane Doe',
        title: 'UX/UI Designer',
        bio: 'A creative freelance designer with a knack for crafting beautiful and intuitive user experiences. Open to new collaborations!',
        profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
        cover_photo_url: 'https://images.unsplash.com/photo-1558346547-4439467bd1d5?q=80&w=1200&auto=format&fit=crop',
        skills_expertise: ['UX Design', 'UI Design', 'Figma', 'Prototyping'],
        industry_focus: ['Web Design', 'Mobile Apps'],
        tools_technologies: ['Figma', 'Adobe XD', 'Sketch'],
        linkedin_profile_url: 'https://linkedin.com/in/janedoe',
        contact_info_visibility: ContactVisibility.PUBLIC,
    },
    'user-4': {
        id: 'profile-4',
        user_id: 'user-4',
        role: UserRole.STARTUP_MEMBER,
        first_name: 'John',
        last_name: 'Smith',
        full_name: 'John Smith',
        title: 'Software Engineer',
        bio: 'Passionate software engineer at QuantumLeap AI, working on the next generation of intelligent applications.',
        profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
        cover_photo_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop',
        skills_expertise: ['Python', 'React', 'Node.js', 'AWS'],
        industry_focus: ['Artificial Intelligence', 'SaaS'],
        tools_technologies: ['Docker', 'Kubernetes', 'Terraform'],
        linkedin_profile_url: 'https://linkedin.com/in/johnsmith',
        contact_info_visibility: ContactVisibility.CONNECTIONS,
    },
    'user-5': {
        id: 'profile-5',
        user_id: 'user-5',
        role: UserRole.STARTUP_ADMIN,
        first_name: 'Startup',
        last_name: 'Admin',
        full_name: 'Startup Admin',
        title: 'CEO & Co-Founder',
        bio: 'Leading QuantumLeap AI to revolutionize the tech industry. Always looking for talented individuals to join our team.',
        profile_picture_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&h=500&fit=crop',
        cover_photo_url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop',
        skills_expertise: ['Leadership', 'Fundraising', 'Product Management'],
        industry_focus: ['AI', 'Quantum Computing'],
        tools_technologies: ['Jira', 'Notion', 'Pitch'],
        linkedin_profile_url: 'https://linkedin.com/in/startupadmin',
        contact_info_visibility: ContactVisibility.PUBLIC,
    },
    'user-6': {
        id: 'profile-6',
        user_id: 'user-6',
        role: UserRole.SYS_ADMIN,
        first_name: 'System',
        last_name: 'Administrator',
        full_name: 'System Administrator',
        title: 'Platform Overlord',
        bio: 'Keeping the digital gears of ShareYourSpace turning smoothly. I see all.',
        profile_picture_url: 'https://images.unsplash.com/photo-1580894732444-8ec5341a54ba?w=500&h=500&fit=crop',
        cover_photo_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop',
        skills_expertise: ['System Administration', 'Database Management', 'Security'],
        industry_focus: ['Platform Technology'],
        tools_technologies: ['AWS', 'Docker', 'PostgreSQL'],
        linkedin_profile_url: 'https://linkedin.com/in/sysadmin',
        contact_info_visibility: ContactVisibility.PRIVATE,
    }
};


export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-1',
    type: 'connection_request',
    message: 'Jane Doe wants to connect with you.',
    is_read: false,
    created_at: new Date().toISOString(),
    related_entity_id: 'user-3',
    link: '/users/user-3',
    sender: mockUsers.find(u => u.id === 'user-3')!,
  },
  {
    id: 'notif-2',
    user_id: 'user-1',
    type: 'new_message',
    message: 'You have a new message from John Smith.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    related_entity_id: 'convo-2',
    link: '/chat',
    sender: mockUsers.find(u => u.id === 'user-4')!,
  },
  {
    id: 'notif-3',
    user_id: 'user-1',
    type: 'system_update',
    message: 'Welcome to the new ShareYourSpace platform!',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    related_entity_id: null,
    link: '/',
    sender: mockUsers.find(u => u.id === 'user-6')!,
  },
];

export const mockOrganizations: (Company | Startup)[] = [
  {
    id: 'comp-1',
    name: 'Innovate Inc.',
    description: 'A leading tech company specializing in AI and machine learning solutions.',
    website: 'https://innovateinc.com',
    industry_focus: ['Artificial Intelligence', 'SaaS'],
    profile_image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop',
    type: 'Company',
  },
  {
    id: 'startup-2',
    name: 'QuantumLeap AI',
    description: 'A cutting-edge startup pushing the boundaries of quantum computing and AI.',
    website: 'https://quantumleap.ai',
    industry_focus: ['Quantum Computing', 'AI'],
    profile_image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop',
    type: 'Startup',
    mission: 'To build the future of computation.',
    stage: StartupStage.SEED,
  },
];

export const mockCompanies: Company[] = mockOrganizations.filter(org => org.type === 'Company') as Company[];
export const mockStartups: Startup[] = mockOrganizations.filter(org => org.type === 'Startup') as Startup[];

const createSpaceImage = (id: string, url: string): SpaceImage => ({
    id,
    image_url: url,
});

export const mockSpaces: Space[] = [
    {
        id: 'space-1',
        name: 'InnovateHub Downtown',
        address: '123 Main St, Anytown, USA',
        amenities: [{id: 'amenity-1', name: 'High-speed WiFi'}, {id: 'amenity-2', name: 'Conference Rooms'}, {id: 'amenity-3', name: 'Coffee & Tea'}, {id: 'amenity-4', name: 'Event Space'}],
        image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop',
        images: [
            createSpaceImage('img-1', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop'),
            createSpaceImage('img-2', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop'),
            createSpaceImage('img-3', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop'),
        ],
        company_id: 'comp-1',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_workstations: 50,
        headline: 'The best place to innovate',
        house_rules: ["No smoking", "Keep common areas clean"],
        vibe: ["Creative", "Productive"],
        opening_hours: "Mon-Fri: 9am - 6pm",
        key_highlights: ["Rooftop terrace", "Weekly networking events"],
        neighborhood_description: "Located in the bustling downtown district, surrounded by cafes and restaurants."
    },
    {
        id: 'space-2',
        name: 'TechPark Silicon Valley',
        address: '456 Innovation Dr, Techville, USA',
        amenities: [{id: 'amenity-5', name: '24/7 Access'}, {id: 'amenity-6', name: 'Private Offices'}, {id: 'amenity-7', name: 'Networking Events'}, {id: 'amenity-8', name: 'Parking'}],
        image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
        images: [
            createSpaceImage('img-4', 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop'),
            createSpaceImage('img-5', 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=800&auto=format&fit=crop'),
        ],
        company_id: 'comp-1',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_workstations: 100,
        headline: 'Where tech giants are born',
        house_rules: ["Respect quiet zones", "Clean up after yourself"],
        vibe: ["Innovative", "Fast-paced"],
        opening_hours: "24/7",
        key_highlights: ["On-site gym", "Access to mentors"],
        neighborhood_description: "In the heart of Silicon Valley, close to major tech companies."
    }
];

export const mockBrowsableSpaces: BrowsableSpace[] = mockSpaces.map(space => ({
  ...space,
  description: space.headline || 'A great place to work and collaborate.',
  interest_status: null,
  company_name: mockOrganizations.find(o => o.id === space.company_id)?.name || 'Unknown Company',
  available_workstations: Math.floor(space.total_workstations * Math.random()),
}));


export const mockInvitations: Invitation[] = [
  {
    id: 'inv-1',
    email: 'new.member@startup.io',
    role: UserRole.STARTUP_MEMBER,
    status: InvitationStatus.PENDING,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
    company_id: 'startup-2',
    approved_by_admin: {
      id: 'user-5',
      full_name: 'Startup Admin',
    },
  },
  {
    id: 'inv-2',
    email: 'another.dev@startup.io',
    role: UserRole.STARTUP_MEMBER,
    status: InvitationStatus.PENDING,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    company_id: 'startup-2',
    approved_by_admin: {
      id: 'user-5',
      full_name: 'Startup Admin',
    },
  },
  {
    id: 'inv-3',
    email: 'expired.user@startup.io',
    role: UserRole.STARTUP_MEMBER,
    status: InvitationStatus.EXPIRED,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    company_id: 'startup-2',
    approved_by_admin: {
      id: 'user-5',
      full_name: 'Startup Admin',
    },
  },
];

const currentUser = mockUsers[0]; // Corporate Admin
const otherUsers = [mockUsers[1], mockUsers[2], mockUsers[3], mockUsers[4]];

const generateMockMessages = (conversationId: string, user1: User, user2: User): ChatMessageData[] => {
    return [
        {
            id: `msg-${conversationId}-1`,
            conversation_id: conversationId,
            sender_id: user2.id,
            recipient_id: user1.id,
            content: `Hey ${user1.full_name}! Just checking in.`,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            is_deleted: false,
            sender: user2,
        },
        {
            id: `msg-${conversationId}-2`,
            conversation_id: conversationId,
            sender_id: user1.id,
            recipient_id: user2.id,
            content: `Hi ${user2.full_name}! All good here. How about you?`,
            created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
            is_deleted: false,
            sender: user1,
        },
        {
            id: `msg-${conversationId}-3`,
            conversation_id: conversationId,
            sender_id: user2.id,
            recipient_id: user1.id,
            content: "Doing great, thanks for asking! Just working on the new project.",
            created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
            is_deleted: false,
            sender: user2,
        }
    ];
};

export const mockConversations: Conversation[] = otherUsers.map((otherUser, index) => {
    const conversationId = `convo-${index + 1}`;
    const messages = generateMockMessages(conversationId, currentUser, otherUser);
    return {
        id: conversationId,
        participants: [currentUser, otherUser],
        other_user: otherUser,
        last_message: messages[messages.length - 1],
        unread_count: index === 0 ? 2 : 0,
        messages: messages,
        isLoadingMessages: false,
        hasMoreMessages: true,
        messagesFetched: true,
    };
});
