import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ToastNotification from './ToastNotification';

export default function AppLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ToastNotification />
    </>
  );
}
