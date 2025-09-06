
export interface Transformation {
  title: string;
  prompt: string;
  icon: string; // Material Symbols icon name
}

export interface GeneratedContent {
  imageUrl: string | null;
  text: string | null;
}
