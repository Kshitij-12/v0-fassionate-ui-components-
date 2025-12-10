declare module "next-themes" {
  import * as React from "react";
  export type Theme = string | undefined;
  export type ThemeProviderProps = {
    children?: React.ReactNode;
    attribute?: string;
    value?: { light: string; dark: string } | string;
    defaultTheme?: Theme;
    enableSystem?: boolean;
  };
  export const ThemeProvider: React.FC<ThemeProviderProps>;
  export const useTheme: () => {
    theme?: string;
    setTheme: (t: string) => void;
    systemTheme?: string;
  };
  export default ThemeProvider;
}
