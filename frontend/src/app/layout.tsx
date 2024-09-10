import 'dayjs/locale/se';
import '../../tailwind.scss';
import MyAppLayout from '../components/app/layout.component';

export default function Index({ children }) {
  return <MyAppLayout>{children}</MyAppLayout>;
}
