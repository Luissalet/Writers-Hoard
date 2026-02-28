import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import GlobalSearch from '../common/GlobalSearch';

export default function MainLayout() {
  return (
    <div className="h-screen w-screen flex overflow-hidden grain-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
      <GlobalSearch />
    </div>
  );
}
