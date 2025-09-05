import { RepresentingMode } from './app';

export interface Announcement {
  id: number;
  title: string;
  text: string;
  urlTitle: string;
  url: string;
  image?: string;
  imageAlt?: string;
  modes?: RepresentingMode[];
}
