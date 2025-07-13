import { Company } from '@/types/company';
import { Space, SpaceImage } from '@/types/space';
import { Notification } from '@/types/notification';
import { User } from '@/types/auth';
import { UserProfile } from '@/types/userProfile';
import { UserRole, ContactVisibility } from '@/types/enums';

export const mockUsers: User[] = [
    {
        id: 1,
        email: 'corporate.admin@example.com',
        role: UserRole.CORP_ADMIN,
        is_active: true,
        is_verified: true,
        profile: {
            id: 1,
            user_id: 1,
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
    },
    {
        id: 2,
        email: 'corporate.member@example.com',
        role: UserRole.CORP_MEMBER,
        is_active: true,
        is_verified: true,
        profile: {
            id: 2,
            user_id: 2,
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
    },
    {
        id: 3,
        email: 'jane.doe@example.com',
        role: UserRole.FREELANCER,
        is_active: true,
        is_verified: true,
        profile: {
            id: 3,
            user_id: 3,
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
    },
    {
        id: 4,
        email: 'john.smith@example.com',
        role: UserRole.STARTUP_MEMBER,
        is_active: true,
        is_verified: true,
        profile: {
            id: 4,
            user_id: 4,
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
    },
    {
        id: 5,
        email: 'startup.admin@example.com',
        role: UserRole.STARTUP_ADMIN,
        is_active: true,
        is_verified: true,
        profile: {
            id: 5,
            user_id: 5,
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
    },
    {
        id: 6,
        email: 'sysadmin@example.com',
        role: UserRole.SYS_ADMIN,
        profile: {
            id: 6,
            user_id: 6,
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
        },
        company_id: null,
        startup_id: null,
    }
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    user_id: 1,
    type: 'connection_request',
    message: 'Jane Doe wants to connect with you.',
    is_read: false,
    is_actioned: false,
    created_at: new Date().toISOString(),
    related_entity_id: 1,
    reference: 'connection_1',
    link: '/users/3',
    sender: {
        id: 3,
        first_name: 'Jane',
        last_name: 'Doe',
        profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop',
    },
    requesting_user: mockUsers.find(u => u.id === 3),
  },
  {
    id: 2,
    user_id: 1,
    type: 'new_message',
    message: 'You have a new message from John Smith.',
    is_read: false,
    is_actioned: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    related_entity_id: 2,
    reference: 'chat_2',
    link: '/chat',
    sender: {
        id: 4,
        first_name: 'John',
        last_name: 'Smith',
        profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
    },
  },
  {
    id: 3,
    user_id: 1,
    type: 'system_update',
    message: 'Welcome to the new ShareYourSpace platform!',
    is_read: true,
    is_actioned: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    related_entity_id: null,
    reference: 'system_welcome',
    link: '/',
    sender: {
        id: 0,
        first_name: 'System',
        last_name: 'Admin',
        profile_image_url: 'https://images.unsplash.com/photo-1580894732444-8ec5341a54ba?w=500&h=500&fit=crop',
    },
  },
];

export const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'Innovate Inc.',
    description: 'A leading tech company specializing in AI and machine learning solutions.',
    website: 'https://innovateinc.com',
    industry_focus: ['Artificial Intelligence', 'SaaS'],
    looking_for: ['Software Engineers', 'Data Scientists'],
    profile_image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop',
    type: 'Company',
  },
];

export const mockStartups: Company[] = [
    {
        id: 2,
        name: 'QuantumLeap AI',
        description: 'A cutting-edge startup pushing the boundaries of quantum computing and AI.',
        website: 'https://quantumleap.ai',
        industry_focus: ['Quantum Computing', 'AI'],
        looking_for: ['Quantum Physicists', 'AI Researchers'],
        profile_image_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop',
        type: 'Startup',
    },
];

const createSpaceImage = (id: number, url: string): SpaceImage => ({
    id,
    image_url: url,
});

export const mockSpaces: Space[] = [
    {
        id: 1,
        name: 'InnovateHub Downtown',
        address: '123 Main St, Anytown, USA',
        amenities: ['High-speed WiFi', 'Conference Rooms', 'Coffee & Tea', 'Event Space'],
        images: [
            createSpaceImage(1, 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop'),
            createSpaceImage(2, 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop'),
            createSpaceImage(3, 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop'),
        ],
        company_id: 1,
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
        id: 2,
        name: 'TechPark Silicon Valley',
        address: '456 Innovation Dr, Techville, USA',
        amenities: ['24/7 Access', 'Private Offices', 'Networking Events', 'Parking'],
        images: [
            createSpaceImage(4, 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop'),
            createSpaceImage(5, 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=800&auto=format&fit=crop'),
        ],
        company_id: 1,
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

export const mockInvitations: Invitation[] = [
  {
    id: 1,
    email: 'new.member@startup.io',
    role: UserRole.STARTUP_MEMBER,
    status: InvitationStatus.PENDING,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    expires_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days from now
    startup_id: 1,
    approved_by_admin: {
      id: 'user-startup-admin',
      full_name: 'Startup Admin',
    },
  },
  {
    id: 2,
    email: 'another.dev@startup.io',
    role: UserRole.STARTUP_MEMBER,
    status: InvitationStatus.PENDING,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    startup_id: 1,
    approved_by_admin: {
      id: 'user-startup-admin',
      full_name: 'Startup Admin',
    },
  },
  {
    id: 3,
    email: 'expired.user@startup.io',
    role: UserRole.STARTUP_MEMBER,
    status: InvitationStatus.EXPIRED,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    expires_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    startup_id: 1,
    approved_by_admin: {
      id: 'user-startup-admin',
      full_name: 'Startup Admin',
    },
  },
];
