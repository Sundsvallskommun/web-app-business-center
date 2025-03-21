import 'dayjs/locale/se';
import '../../tailwind.scss';
import MyAppLayout from '../layouts/app/layout.component';

export default function Layout({ children }) {
  return <MyAppLayout>{children}</MyAppLayout>;
}
