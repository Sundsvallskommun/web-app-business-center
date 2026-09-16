import 'dayjs/locale/sv';
import '../../tailwind.scss';
import MyAppLayout from '../layouts/app/layout.component';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MyAppLayout>{children}</MyAppLayout>;
}
