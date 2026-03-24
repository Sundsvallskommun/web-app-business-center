import { Conversation } from '@/data-contracts/case-data/data-contracts';

export function findExternalConversation(conversations: Conversation[]): Conversation {
  return conversations.find(c => c.type === 'EXTERNAL');
}

export function filterExternalConversation(conversations: Conversation[]): Conversation[] {
  return conversations.filter(c => c.type === 'EXTERNAL');
}
