import Main from './main.component';

export default function MainLayout({ children }) {
  return (
    <div className="main-container">
      <Main>{children}</Main>
    </div>
  );
}
