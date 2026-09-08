// Type declarations for shell 3.0.8 modules omitted from its public declarations.
declare module '@shell/store/store-types' {
  export const STORE: { CLUSTER: string; RANCHER: string; MANAGEMENT: string };
  export const BLANK_CLUSTER: '_';
}

declare module '@shell/components/nav/WindowManager/composables/useTabsHandler.ts' {
  export default function useTabsHandler(): { onTabClose: (id: string) => void };
}

declare module '@shell/components/nav/WindowManager/composables/useDimensionsHandler.ts' {
  import type { Position } from '@shell/types/window-manager';
  export default function useDimensionsHandler(options: { position: Position }): {
    setDimensions: (args: { width?: number; height?: number }) => void;
  };
}

declare module '@shell/components/nav/WindowManager/composables/useResizeHandler.ts' {
  import type { Position } from '@shell/types/window-manager';
  export default function useResizeHandler(options: {
    position: Position;
    setDimensions: (args: { width?: number; height?: number }) => void;
  }): { mouseResizeXStart: (event: MouseEvent | TouchEvent) => void };
}
