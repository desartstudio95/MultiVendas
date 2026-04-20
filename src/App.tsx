/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { UserProfile } from './types';
import { Toaster, toast } from 'sonner';
import { 
  Home as HomeIcon, 
  LayoutGrid, 
  PlusCircle, 
  MessageCircle, 
  User as UserIcon,
  Search,
  ShoppingCart,
  LogOut,
  ChevronRight,
  Package,
  Settings,
  ShieldCheck,
  Mail,
  Facebook,
  Instagram,
  ExternalLink,
  Eye,
  EyeOff,
  Menu,
  X,
  Heart,
  Camera,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

// Pages
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import AdminPage from './pages/AdminPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import HowToBuyPage from './pages/HowToBuyPage';
import SecurityPage from './pages/SecurityPage';

import { auth, db } from './lib/firebase';
import { uploadProfilePhoto } from './lib/storage';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

function Layout({ children, userProfile, user, setUser, setUserProfile }: { 
  children: React.ReactNode, 
  userProfile: UserProfile | null, 
  user: any | null,
  setUser: (val: any) => void,
  setUserProfile: (val: any) => void
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = userProfile?.role === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      toast.success('Sessão encerrada com sucesso');
      navigate('/');
    } catch (error) {
      console.error("Logout error", error);
      toast.error("Erro ao encerrar sessão");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/categories?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      toast.success('Inscrito com sucesso!', {
        description: 'Você receberá as melhores ofertas em breve.'
      });
      setNewsletterEmail('');
    }
  };

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/categories', icon: LayoutGrid, label: 'Categorias' },
    { path: '/chat', icon: MessageCircle, label: 'Mensagens' },
    { path: '/profile', icon: UserIcon, label: 'Perfil' },
  ];

  if (isAdmin) {
    navItems.splice(2, 0, { path: '/portal-admin-secreto', icon: PlusCircle, label: 'Publicar', isAction: true } as any);
    navItems.push({ path: '/portal-admin-secreto', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 md:pb-0">
      {/* Top Navbar (Desktop) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">Multi<span className="text-green-600">Vendas</span></span>
          </Link>
        </div>

        <div className="flex-1 max-w-md mx-4 md:mx-8 hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Pesquisar produtos..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-green-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2">
              <Link 
                to="/portal-admin-secreto"
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors border border-green-100"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Anúncio</span>
              </Link>
              <Link 
                to="/portal-admin-secreto"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Painel Admin</span>
              </Link>
            </div>
          )}
          {userProfile ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{userProfile.displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
              </div>
              <img src={userProfile.photoURL} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
              <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 transition-colors hidden md:block">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth"
              className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-3/4 max-w-sm bg-white z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="text-xl font-bold text-gray-900">Multi<span className="text-green-600">Vendas</span></span>
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar produtos..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    const isAction = (item as any).isAction;
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                          isAction ? "bg-green-600 text-white shadow-md shadow-green-200" :
                          isActive ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {userProfile && (
                <div className="mt-auto p-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={userProfile.photoURL} alt="" className="w-10 h-10 rounded-full border border-gray-200" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{userProfile.displayName}</p>
                      <p className="text-xs text-gray-500 capitalize">{userProfile.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-24 md:pb-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="https://i.ibb.co/v6YJhrxm/acb0ea53-2e32-4685-977e-839f9d0da065.png" alt="MultiVendas Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">Multi<span className="text-green-600">Vendas</span></span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              A loja virtual mais confiável de Moçambique. Encontre os melhores produtos com segurança e tecnologia.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/" className="hover:text-green-600 transition-colors">Início</Link></li>
              <li><Link to="/categories" className="hover:text-green-600 transition-colors">Categorias</Link></li>
              <li><Link to="/chat" className="hover:text-green-600 transition-colors">Mensagens</Link></li>
              <li><Link to="/profile" className="hover:text-green-600 transition-colors">Minha Conta</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/como-comprar" className="hover:text-green-600 transition-colors">Como comprar</Link></li>
              <li><Link to="/seguranca" className="hover:text-green-600 transition-colors">Segurança</Link></li>
              <li><Link to="/termos" className="hover:text-green-600 transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Receba as melhores ofertas direto no seu e-mail.</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                required
                className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">Ok</button>
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-100 mt-12 pt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
          <Link to="/portal-admin-secreto" className="hover:text-gray-500 transition-colors">©</Link> 2026 MultiVendas • Todos os direitos reservados
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50 flex md:hidden items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isAction = (item as any).isAction;

          if (isAction) {
            return (
              <Link 
                key={item.label}
                to={item.path}
                className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full shadow-lg shadow-green-200 -mt-6 border-4 border-white"
              >
                <Icon className="w-6 h-6" />
              </Link>
            );
          }

          return (
            <Link 
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-green-600" : "text-gray-400"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function AuthRequiredView({ setUserProfile, setUser }: { setUserProfile: (profile: UserProfile | null) => void, setUser: (user: any) => void }) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(null);
  const [resetEmailSentTo, setResetEmailSentTo] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (!profileDoc.exists()) {
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Usuário',
          email: user.email || '',
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          role: user.email === 'isacruimugabe@gmail.com' ? 'admin' : 'client',
          createdAt: new Date().toISOString(),
          emailVerified: user.emailVerified
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        setUserProfile(newProfile);
      }
      toast.success('Entrou com Google!');
    } catch (error: any) {
      console.error("Google login error", error);
      toast.error(error.message || 'Erro ao entrar com Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;

    if (authMode === 'forgot-password') {
      handleForgotPassword();
      return;
    }

    if (authMode === 'register' && password !== repeatPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsSigningIn(true);

    try {
      if (authMode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // Send verification email
        await sendEmailVerification(user);
        
        let finalPhotoURL = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;
        
        // Upload photo to storage if exists
        if (photoFile) {
          try {
            finalPhotoURL = await uploadProfilePhoto(user.uid, photoFile);
          } catch (storageError) {
            console.error("Storage upload error", storageError);
            toast.error("Erro ao subir foto, usando avatar padrão.");
          }
        }
        
        // Save user info to Firestore as requested
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: displayName || 'Usuário',
          email: user.email || '',
          photoURL: finalPhotoURL,
          role: email === 'isacruimugabe@gmail.com' ? 'admin' : 'client',
          createdAt: new Date().toISOString(),
          emailVerified: false
        };
        await setDoc(doc(db, 'users', user.uid), newProfile);
        
        // Sign out to prevent automatic login before verification
        await signOut(auth);
        
        setVerificationSentTo(email);
        toast.success('Link de verificação enviado!');
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;

        if (!user.emailVerified) {
          // Check if profile exists and add if missing even if not verified yet
          const profileDoc = await getDoc(doc(db, 'users', user.uid));
          if (!profileDoc.exists()) {
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || 'Usuário',
              email: user.email || '',
              photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
              role: user.email === 'isacruimugabe@gmail.com' ? 'admin' : 'client',
              createdAt: new Date().toISOString(),
              emailVerified: false
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
          }

          // If login is successful but email is not verified
          await sendEmailVerification(user);
          await signOut(auth);
          setVerificationSentTo(email);
          toast.warning('E-mail não verificado. Enviamos um novo link.');
          return;
        }

        // Check and sync profile for verified user
        const profileDoc = await getDoc(doc(db, 'users', user.uid));
        if (!profileDoc.exists()) {
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'Usuário',
            email: user.email || '',
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            role: user.email === 'isacruimugabe@gmail.com' ? 'admin' : 'client',
            createdAt: new Date().toISOString(),
            emailVerified: true
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setUserProfile(newProfile);
        }
        
        toast.success('Bem-vindo de volta!');
      }
    } catch (error: any) {
      console.error("Auth error", error);
      
      if (authMode === 'login') {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          toast.error("Email or Password Incorrect");
        } else {
          toast.error(error.message || 'Erro ao entrar');
        }
      } else if (authMode === 'register') {
        if (error.code === 'auth/email-already-in-use') {
          toast.error("User already exists. Sign in?");
          setAuthMode('login');
        } else {
          toast.error(error.message || 'Erro ao criar conta');
        }
      } else {
        toast.error(error.message || 'Erro de autenticação');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Por favor, insira seu e-mail');
      return;
    }

    setIsSigningIn(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSentTo(email);
      toast.success('Link de redefinição enviado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar e-mail de redefinição');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (resetEmailSentTo) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-green-100/50 space-y-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">E-mail Enviado</h2>
          <p className="text-gray-500 text-sm font-medium">
            We sent you a password change link to <span className="text-green-600 font-bold">{resetEmailSentTo}</span>.
          </p>
          <button 
            onClick={() => {
              setResetEmailSentTo(null);
              setAuthMode('login');
            }}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (verificationSentTo) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-green-100/50 space-y-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Verifique seu e-mail</h2>
          <p className="text-gray-500 text-sm font-medium">
            Enviamos um e-mail de verificação para <span className="text-green-600 font-bold">{verificationSentTo}</span>. 
            Verifique-o e faça o login para acessar sua conta.
          </p>
          <button 
            onClick={() => {
              setVerificationSentTo(null);
              setAuthMode('login');
            }}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-green-100/50 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-600 mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            {authMode === 'login' ? 'Bem-vindo de volta' : authMode === 'register' ? 'Crie sua conta' : 'Recuperar Senha'}
          </h2>
          <p className="text-gray-500 text-sm font-medium">
            {authMode === 'login' 
              ? 'Entre para acessar suas mensagens e perfil.' 
              : authMode === 'register' 
                ? 'Junte-se à maior loja virtual de Moçambique.'
                : 'Insira seu e-mail para receber um link de redefinição.'}
          </p>
        </div>

        {/* Auth Tabs */}
        {authMode !== 'forgot-password' && (
          <div className="flex p-1 bg-gray-50 rounded-2xl">
            <button 
              onClick={() => setAuthMode('login')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                authMode === 'login' ? "bg-white text-green-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              LOGIN
            </button>
            <button 
              onClick={() => setAuthMode('register')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                authMode === 'register' ? "bg-white text-green-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
              )}
            >
              CADASTRO
            </button>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Nome Completo</label>
              <input 
                type="text" 
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome completo" 
                className="w-full px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" 
              className="w-full px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          {authMode !== 'forgot-password' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between ml-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha</label>
                {authMode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setAuthMode('forgot-password')}
                    className="text-[10px] font-bold text-green-600 hover:text-green-700 uppercase tracking-widest mr-4"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          {authMode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Repetir Senha</label>
              <div className="relative">
                <input 
                  type={showRepeatPassword ? "text" : "password"} 
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full px-6 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showRepeatPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          {authMode === 'login' && (
            <div className="flex items-center ml-4 mt-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-50 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs font-medium text-gray-600">
                Manter-me conectado
              </label>
            </div>
          )}
          <button 
            type="submit"
            disabled={isSigningIn}
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {isSigningIn ? 'Processando...' : (authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Criar Conta' : 'Get Reset Link')}
          </button>

          {authMode !== 'forgot-password' && (
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-4 text-gray-400">Ou continue com</span>
              </div>
            </div>
          )}

          {authMode !== 'forgot-password' && (
            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full py-4 bg-white border border-gray-100 text-gray-700 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          )}

          {authMode === 'forgot-password' && (
            <button 
              type="button"
              onClick={() => setAuthMode('login')}
              className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest"
            >
              Voltar para Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function RestrictedAreaView({ title, message }: { title?: string, message?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
        <ShieldCheck className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{title || 'Área Restrita'}</h2>
      <p className="text-gray-500 max-w-md mb-8 font-medium">
        {message || 'Esta seção é exclusiva para usuários cadastrados. Por favor, faça login ou crie uma conta para continuar.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link 
          to="/auth" 
          className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
        >
          Entrar agora
        </Link>
        <Link 
          to="/" 
          className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function MaintenanceView() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-8 border-4 border-white shadow-xl animate-bounce">
        <Wrench className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Estamos em <span className="text-orange-500">Manutenção</span></h1>
      <p className="text-gray-500 max-w-md text-lg font-medium leading-relaxed mb-8">
        O MultiVendas está passando por atualizações rápidas para melhorar sua experiência. Voltaremos em breve!
      </p>
      <div className="flex gap-4">
        <div className="px-6 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-xs font-bold text-gray-400 uppercase tracking-widest">
          #MultiVendas2024
        </div>
      </div>
      <div className="absolute bottom-8 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
        © 2024 MultiVendas · Tecnologia & Comércio
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    // Listen for maintenance mode
    const configUnsubscribe = onSnapshot(doc(db, 'config', 'app'), 
      (doc) => {
        if (doc.exists()) {
          setIsMaintenance(doc.data().maintenance || false);
        }
      },
      (error) => {
        console.warn("Maintenance mode check could not be completed (likely permissions). Defaulting to active.", error);
      }
    );

    const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser && authUser.emailVerified) {
        setUser(authUser);
        try {
          const profileDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (profileDoc.exists()) {
            setUserProfile(profileDoc.data() as UserProfile);
          } else {
            // Fallback sync if listener triggers before handleEmailAuth finishes
            const fallbackProfile: UserProfile = {
              uid: authUser.uid,
              displayName: authUser.displayName || 'Usuário',
              email: authUser.email || '',
              photoURL: authUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.uid}`,
              role: authUser.email === 'isacruimugabe@gmail.com' ? 'admin' : 'client',
              createdAt: new Date().toISOString(),
              emailVerified: authUser.emailVerified
            };
            setUserProfile(fallbackProfile);
          }
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      configUnsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Carregando MultiVendas...</p>
        </div>
      </div>
    );
  }

  if (isMaintenance && userProfile?.role !== 'admin') {
    return (
      <Router>
        <MaintenanceView />
        <Toaster position="top-center" />
      </Router>
    );
  }

  return (
    <Router>
      <Layout userProfile={userProfile} user={user} setUser={setUser} setUserProfile={setUserProfile}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthRequiredView setUserProfile={setUserProfile} setUser={setUser} />} />
          <Route path="/chat" element={user ? <ChatPage userProfile={userProfile} /> : <RestrictedAreaView title="Mensagens Restritas" message="Somente usuários cadastrados podem enviar e receber mensagens no MultiVendas." />} />
          <Route path="/profile" element={user ? <ProfilePage userProfile={userProfile} /> : <AuthRequiredView setUserProfile={setUserProfile} setUser={setUser} />} />
          <Route path="/portal-admin-secreto" element={userProfile?.role === 'admin' ? <AdminPage /> : <Navigate to="/" />} />
          <Route path="/termos" element={<TermsOfUsePage />} />
          <Route path="/como-comprar" element={<HowToBuyPage />} />
          <Route path="/seguranca" element={<SecurityPage />} />
        </Routes>
      </Layout>
      <Toaster position="top-center" />
    </Router>
  );
}
