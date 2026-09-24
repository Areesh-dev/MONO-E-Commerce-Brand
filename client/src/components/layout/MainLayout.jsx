import AIChatbot from '../ai/AIChatbot';
import Footer from './Footer';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <Navbar />
      <main id="main-content" className="flex-1"><Outlet /></main>
      <Footer />
      <AIChatbot />
    </div>
  );
}