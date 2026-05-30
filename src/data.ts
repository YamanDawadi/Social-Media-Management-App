import { SocialPost, SocialStory, Conversation, AICopilotTone } from './types';

export const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    platform: 'instagram',
    author: 'Design Studio LLC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Introducing the Aurora Workspace Suite. Crafted for creators who find solace in midnight design sprints and dark mode workspaces. Minimalism meets performance. 🌌✨\n\nWhat environment detail do you prioritize most?',
    mediaUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    timestamp: '2 hours ago',
    likes: 1243,
    commentsCount: 5,
    shares: 89,
    views: 8400,
    tags: ['design', 'productivity', 'minimalism'],
    comments: [
      {
        id: 'comment-1-1',
        author: 'elena_codes',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        content: 'Is there a Linux client planned, or is it macOS only at launch? It looks absolutely stunning.',
        timestamp: '1 hour ago',
        likes: 14,
        sentiment: 'positive'
      },
      {
        id: 'comment-1-2',
        author: 'marcus_arc',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        content: 'I love the color palette but please tell me we can adjust the sidebar spacing. On smaller screens it might look cramped.',
        timestamp: '45 mins ago',
        likes: 3,
        sentiment: 'neutral'
      },
      {
        id: 'comment-1-3',
        author: 'hater_dan',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        content: 'Another overhyped subscription app we dont need. Ill stick to my plain text files, thanks.',
        timestamp: '20 mins ago',
        likes: 0,
        sentiment: 'negative'
      },
      {
        id: 'comment-1-4',
        author: 'rebecca.design',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
        content: 'Wow, the dark glassmorphism looks clean! Can we sign up for the early beta right now?',
        timestamp: '10 mins ago',
        likes: 8,
        sentiment: 'positive'
      }
    ]
  },
  {
    id: 'post-2',
    platform: 'linkedin',
    author: 'Design Studio LLC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'We are thrilled to announce that our remote-first design workspace has officially hit 50,000 active users global! 🌍\n\nTransitioning to full remote work taught us that physical distance is easily bridged by cohesive visual tooling. Our focus remains high-fidelity workspace setups and feedback-driven iteration. Thank you to our amazing community! #remotework #designthinking #growth',
    mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    timestamp: '5 hours ago',
    likes: 421,
    commentsCount: 3,
    shares: 42,
    views: 12300,
    tags: ['remotework', 'designthinking', 'growth'],
    comments: [
      {
        id: 'comment-2-1',
        author: 'Sarah Jenkins, VP of Core',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        content: 'Huge milestone! Your tools redesigned our team workflows back in Q3. Highly deserved growth.',
        timestamp: '4 hours ago',
        likes: 18,
        sentiment: 'positive'
      },
      {
        id: 'comment-2-2',
        author: 'Devon Carter',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
        content: 'Is there a team dashboard showing user analytics and workspace utilization? Need this for billing calculations.',
        timestamp: '2 hours ago',
        likes: 5,
        sentiment: 'neutral'
      },
      {
        id: 'comment-2-3',
        author: 'Chloe Patel',
        avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&auto=format&fit=crop&q=80',
        content: 'The billing dashboard has been bugged for a week now, my invoice still hasn’t generated. Who can I contact?',
        timestamp: '1 hour ago',
        likes: 1,
        sentiment: 'negative'
      }
    ]
  },
  {
    id: 'post-3',
    platform: 'twitter',
    author: 'Design Studio LLC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'Why does your teams layout look like a 2012 forum? Dynamic grids, native markdown support, and nested canvas blocks. This is what modern work looks like. Streamlined and lightning fast. ⚡️ Let us know 👇',
    mediaType: 'text',
    timestamp: '10 hours ago',
    likes: 832,
    commentsCount: 3,
    shares: 204,
    views: 31000,
    tags: ['devtools', 'uxdesign'],
    comments: [
      {
        id: 'comment-3-1',
        author: 'pixel_purist',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80',
        content: 'Native markdown is such a simple but life-changing feature. Thank you for doing it correctly!',
        timestamp: '8 hours ago',
        likes: 31,
        sentiment: 'positive'
      },
      {
        id: 'comment-3-2',
        author: 'tomas.json',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
        content: 'Does this mean keyboard shortcuts are fully customizable? Sometimes canvas bindings collide with devtools.',
        timestamp: '6 hours ago',
        likes: 12,
        sentiment: 'neutral'
      },
      {
        id: 'comment-3-3',
        author: 'clunky_soft',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
        content: 'The desktop app takes up nearly 1.2GB of RAM on my machine. Please optimize instead of adding grids.',
        timestamp: '5 hours ago',
        likes: 22,
        sentiment: 'negative'
      }
    ]
  }
];

export const INITIAL_STORIES: SocialStory[] = [
  {
    id: 'story-1',
    platform: 'instagram',
    author: 'Design Studio LLC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    mediaType: 'image',
    timestamp: '3 hours ago',
    views: 457,
    reactions: [
      { emoji: '🔥', count: 124 },
      { emoji: '❤️', count: 87 },
      { emoji: '😮', count: 12 }
    ],
    replies: [
      {
        id: 'reply-1-1',
        author: 'olivia_wilder',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80',
        content: 'Stunning colors! Is this wallpaper available? 😍',
        timestamp: '2 hours ago',
        likes: 0
      },
      {
        id: 'reply-1-2',
        author: 'ben_stack',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
        content: 'Wait, is that a sneak peek of the mobile canvas update?',
        timestamp: '1 hour ago',
        likes: 0
      }
    ]
  },
  {
    id: 'story-2',
    platform: 'instagram',
    author: 'Design Studio LLC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    mediaType: 'image',
    timestamp: '8 hours ago',
    views: 712,
    reactions: [
      { emoji: '🔥', count: 98 },
      { emoji: '😂', count: 2 },
      { emoji: '❤️', count: 142 }
    ],
    replies: [
      {
        id: 'reply-2-1',
        author: 'curious.cat',
        avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&auto=format&fit=crop&q=80',
        content: 'When does the beta signups close? I want my whole team in.',
        timestamp: '7 hours ago',
        likes: 0
      }
    ]
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    platform: 'instagram',
    contactName: 'Elena Rostova',
    contactHandle: 'elena_codes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Is there a Linux client planned, or is it macOS only at launch?',
    timestamp: '1 hour ago',
    unread: true,
    messages: [
      {
        id: 'msg-1-1',
        sender: 'contact',
        content: 'Hey there! Absolute fan of your design shots. I saw the announcement of the Aurora Workspace Suite.',
        timestamp: '1 hour ago'
      },
      {
        id: 'msg-1-2',
        sender: 'contact',
        content: 'Is there a Linux client planned, or is it macOS only at launch? It looks absolutely stunning.',
        timestamp: '1 hour ago'
      }
    ],
    context: {
      type: 'post',
      id: 'post-1',
      title: 'Aurora Workspace Suite post'
    }
  },
  {
    id: 'conv-2',
    platform: 'instagram',
    contactName: 'Olivia Wilder',
    contactHandle: 'olivia_wilder',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Stunning colors! Is this wallpaper available? 😍',
    timestamp: '2 hours ago',
    unread: false,
    messages: [
      {
        id: 'msg-2-1',
        sender: 'contact',
        content: 'Stunning colors! Is this wallpaper available? 😍',
        timestamp: '2 hours ago'
      }
    ],
    context: {
      type: 'story',
      id: 'story-1',
      title: 'Midnight abstract slide',
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
    }
  },
  {
    id: 'conv-3',
    platform: 'linkedin',
    contactName: 'Chloe Patel',
    contactHandle: 'chloep_dev',
    avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Let me check on that, thank you for replying so fast.',
    timestamp: '1 hour ago',
    unread: false,
    messages: [
      {
        id: 'msg-3-1',
        sender: 'contact',
        content: 'Hi, I posted under your remote-work announcement. The billing page has been failing with a Stripe gateway error for a week. We need to download last months invoice for taxes.',
        timestamp: '2 hours ago'
      },
      {
        id: 'msg-3-2',
        sender: 'user',
        content: 'Hello Chloe! I am so sorry for the billing issues. We are currently patching the Stripe gateway. Let me manually extract your Q1 invoice and email it over. Can you share your registered workspace email?',
        timestamp: '1 hour ago'
      },
      {
        id: 'msg-3-3',
        sender: 'contact',
        content: 'Oh that would be amazing! My team accounts email is admin@syntech-labs.work. Let me check on that, thank you for replying so fast.',
        timestamp: '1 hour ago'
      }
    ],
    context: {
      type: 'post',
      id: 'post-2',
      title: '50k global users celebration post'
    }
  },
  {
    id: 'conv-4',
    platform: 'twitter',
    contactName: 'Daniel Clunky',
    contactHandle: 'clunky_soft',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'The desktop app takes up nearly 1.2GB of RAM on my machine.',
    unread: true,
    timestamp: '5 hours ago',
    messages: [
      {
        id: 'msg-4-1',
        sender: 'contact',
        content: 'Why is your grid renderer leaking memory? The desktop app takes up nearly 1.2GB of RAM on my machine. Please optimize instead of adding grids.',
        timestamp: '5 hours ago'
      }
    ],
    context: {
      type: 'post',
      id: 'post-3',
      title: '2012 Forum vs Modern Blocks tweet'
    }
  },
  {
    id: 'conv-5',
    platform: 'instagram',
    contactName: 'Carlos Rivera',
    contactHandle: 'carlos_ux',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Hola! Me encanta el Aurora Workspace, pero quería saber si tienen el manual en Español.',
    unread: true,
    timestamp: '15 mins ago',
    messages: [
      {
        id: 'msg-5-1',
        sender: 'contact',
        content: 'Hola! Me encanta el Aurora Workspace Suite, pero quería saber si tienen el manual en Español o si darán soporte localizado para empresas en Sudamérica. Muchas gracias!',
        timestamp: '15 mins ago'
      }
    ],
    context: {
      type: 'post',
      id: 'post-1',
      title: 'Aurora Workspace Suite post'
    }
  },
  {
    id: 'conv-6',
    platform: 'facebook',
    contactName: 'Yuki Tanaka',
    contactHandle: 'yuki_dev',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'こんにちは！アプリのUIデザインが素晴らしくとても気に入っています。Linux向けのクライアントはいつリリースされますか？',
    unread: true,
    timestamp: '8 mins ago',
    messages: [
      {
        id: 'msg-6-1',
        sender: 'contact',
        content: 'こんにちは！アプリのUIデザインが素晴らしくとても気に入っています。Linux向けのクライアントはいつリリースされますか？ライセンスの価格体系も知りたいです。',
        timestamp: '8 mins ago'
      }
    ],
    context: {
      type: 'post',
      id: 'post-1',
      title: 'Aurora Workspace Suite post'
    }
  },
  {
    id: 'conv-7',
    platform: 'twitter',
    contactName: 'Furious Buyer',
    contactHandle: 'furious_buyer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Class action lawsuit for broken billing. Total scam. Boycott this company!',
    unread: true,
    timestamp: '3 mins ago',
    messages: [
      {
        id: 'msg-7-1',
        sender: 'contact',
        content: 'Our company has decided to pursue a class action lawsuit for broken billing. This app is a total scam. They keep charging our credit card and the support desk remains completely silent! We are calling to boycott this company immediately!',
        timestamp: '3 mins ago'
      }
    ],
    context: {
      type: 'post',
      id: 'post-2',
      title: '50k global celebration post'
    }
  }
];

export const TONE_PRESETS: AICopilotTone[] = [
  {
    id: 'enthusiastic',
    name: 'Enthusiastic',
    emoji: '✨',
    instruction: 'Write with absolute warm excitement, appreciation, emojis, helpful energy, and forward-looking action. Make the follower feel valued.'
  },
  {
    id: 'professional',
    name: 'Professional',
    emoji: '💼',
    instruction: 'Be structured, respectful, polite, clear, structured, and focused on resolution/business requirements. Avoid overly casual slang or excessive emojis.'
  },
  {
    id: 'empathetic',
    name: 'Empathetic',
    emoji: '❤️',
    instruction: 'For frustrated users - align with them, state sincere apologies, reassure that you are prioritizing their issues, and show absolute responsiveness to their pain.'
  },
  {
    id: 'witty',
    name: 'Witty & Casual',
    emoji: '🎯',
    instruction: 'Be lighthearted, cheeky, smart, keep it brief, humoring, and highly memorable. Great for high-engagement Twitter/X style marketing.'
  }
];
