import type { Content, NewContent } from '../database/schema';

export type ContentStatus = 'draft' | 'published';

export interface ContentData {
  [key: string]: unknown;
}

export interface MenuItem {
  label: string;
  path: string;
  children?: MenuItem[];
}

export type Menu = MenuItem[];

export interface ContentTemplate {
  name: string;
  schema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ContentOperations {
  create(data: NewContent): Promise<Content>;
  update(slug: string, data: Partial<NewContent>): Promise<Content>;
  delete(slug: string): Promise<void>;
  get(slug: string): Promise<Content | null>;
  list(options?: {
    status?: ContentStatus;
    template?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: Content[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  publish(slug: string): Promise<Content>;
  unpublish(slug: string): Promise<Content>;
  updateMenu(slug: string, menu: Menu | null): Promise<Content>;
} 

export type FieldType = 'text' | 'number' | 'image' | 'array' | 'object' | 'markdown' | 'date' | 'boolean' | 'select';

export interface BaseContent {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: ContentStatus;
  template: string;
  data: string;
  slug: string;
  menu?: {
    visible: boolean;
    parentId?: string | null;
    order?: number | null;
    label?: string | null;
  };
}

export interface CustomField {
  name: string;
  type: FieldType;
  value: any;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  requiredFields: {
    [key: string]: {
      type: FieldType;
      validation?: {
        required?: boolean;
        min?: number;
        max?: number;
        pattern?: string;
        options?: string[];
      };
    };
  };
}

// Content Types
export interface PortfolioItem extends BaseContent {
  title: string;
  description: string;
  category: 'web' | 'mobile' | 'design';
  thumbnail: string;
  customFields?: {
    clientName?: string;
    projectDuration?: string;
    techStack?: string[];
    testimonial?: {
      author: string;
      text: string;
      role: string;
    };
    gallery?: string[];
    metrics?: Record<string, string | number>;
    features?: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
}

export interface Service extends BaseContent {
  name: string;
  shortDescription: string;
  icon: string;
  customFields?: {
    processSteps?: Array<{
      title: string;
      description: string;
      duration?: string;
    }>;
    pricing?: {
      plans: Array<{
        name: string;
        price: number;
        features: string[];
      }>;
    };
    technologies?: Array<{
      name: string;
      logo: string;
      expertise: 'beginner' | 'intermediate' | 'expert';
    }>;
  };
}

export interface TeamMember extends BaseContent {
  name: string;
  role: string;
  avatar: string;
  customFields?: {
    bio?: string;
    skills?: string[];
    socialLinks?: Record<string, string>;
    projects?: string[];
    achievements?: string[];
  };
}

export interface CaseStudy extends BaseContent {
  title: string;
  summary: string;
  thumbnail: string;
  customFields?: {
    challenge?: string;
    solution?: string;
    results?: Record<string, string | number>;
    testimonials?: Array<{
      text: string;
      author: string;
      role: string;
    }>;
    timeline?: Array<{
      date: string;
      milestone: string;
      description?: string;
    }>;
  };
}

export interface Page extends BaseContent {
  title: string;
  content: string;
  customFields?: {
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      ogImage?: string;
    };
    sections?: Array<{
      type: string;
      content: any;
    }>;
    sidebar?: {
      enabled: boolean;
      widgets: Array<{
        type: string;
        content: any;
      }>;
    };
  };
} 


interface ContentRow {
  id: string;
  template: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  data: string | Record<string, any>;
  slug: string;
  menu_visible?: number;
  menu_parent_id?: string;
  menu_order?: number;
  menu_label?: string;
}

interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  fields: string;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  parentId?: string | null;
  order?: number;
  children?: MenuItem[];
  template?: string;
}
