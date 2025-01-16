declare module 'next/dynamic' {
  import { ComponentType } from 'react';

  export default function dynamic<T>(
    dynamicOptions: () => Promise<{ default: ComponentType<T> }>,
    options?: {
      loading?: ComponentType;
      ssr?: boolean;
    }
  ): ComponentType<T>;
} 