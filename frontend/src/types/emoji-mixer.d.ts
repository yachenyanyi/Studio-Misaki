declare module 'emoji-mixer' {
  export default function getEmojiMixUrl(
    leftEmoji: string, 
    rightEmoji: string, 
    detailedErrors?: boolean, 
    oldToNew?: boolean
  ): string;
  
  export function toUnicode(input: string, oldToNew?: boolean): string;
  export function checkSupported(emoji: string, oldToNew?: boolean): any;
}
