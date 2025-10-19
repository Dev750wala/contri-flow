/**
 * Programming language colors based on GitHub's language colors
 * Reference: https://github.com/ozh/github-colors
 */

export const LANGUAGE_COLORS: Record<string, string> = {
  // Web Technologies
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Sass: '#a53b70',
  Less: '#1d365d',
  
  // Blockchain & Smart Contracts
  Solidity: '#aa6746',
  Rust: '#dea584',
  Move: '#4a5568',
  Cairo: '#ff4a00',
  Vyper: '#2980b9',
  
  // Backend Languages
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Erlang: '#B83998',
  Haskell: '#5e5086',
  Clojure: '#db5855',
  
  // Shell & Scripting
  Shell: '#89e051',
  Bash: '#89e051',
  PowerShell: '#012456',
  Lua: '#000080',
  Perl: '#0298c3',
  
  // Data & Config
  JSON: '#292929',
  YAML: '#cb171e',
  TOML: '#9c4221',
  XML: '#0060ac',
  Markdown: '#083fa1',
  
  // Database
  SQL: '#e38c00',
  PLpgSQL: '#336790',
  PLSQL: '#dad8d8',
  
  // Mobile
  Dart: '#00B4AB',
  'Objective-C': '#438eff',
  
  // Other
  R: '#198CE7',
  Julia: '#a270ba',
  Jupyter: '#DA5B0B',
  WebAssembly: '#04133b',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  
  // Default fallback
  default: '#858585'
};

/**
 * Get color for a programming language
 * @param language - The programming language name
 * @returns The hex color code for the language
 */
export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || LANGUAGE_COLORS.default;
}

/**
 * Language type definition
 */
export interface Language {
  name: string;
  color: string;
}

/**
 * Create a language object with the appropriate color
 * @param name - The language name
 * @returns A Language object with name and color
 */
export function createLanguage(name: string): Language {
  return {
    name,
    color: getLanguageColor(name)
  };
}
