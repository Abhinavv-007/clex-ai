import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Background from './Background';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function Layout() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <Background />
      <SiteHeader />

      <main className="flex-1 px-6 pb-14 pt-28 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid items-start gap-6 lg:grid-cols-[280px,minmax(0,1fr)]">
            <Sidebar />
            <section className="min-w-0 space-y-6">
              <Outlet />
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
