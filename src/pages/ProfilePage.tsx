import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, logout, verifyEmail, deleteUser, OperationType, handleFirestoreError } from '../firebase';
import { Order, UserProfile, Product, Notification } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  User as UserIcon, 
  Package, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ShieldCheck, 
  CreditCard, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  MessageCircle,
  PlusCircle,
  Trash2,
  Mail,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function ProfilePage({ userProfile }: { userProfile: UserProfile | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('notifications');
  const [loading, setLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState(userProfile?.displayName || '');
  const [editPhotoURL, setEditPhotoURL] = useState(userProfile?.photoURL || '');

  const isEmailVerified = auth.currentUser?.emailVerified;

  useEffect(() => {
    if (userProfile) {
      setEditDisplayName(userProfile.displayName);
      setEditPhotoURL(userProfile.photoURL);
    }
  }, [userProfile]);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await verifyEmail(auth.currentUser);
      toast.success('E-mail enviado!', {
        description: 'Verifique sua caixa de entrada para o link de confirmação.'
      });
    } catch (error: any) {
      console.error("Error resending verification:", error);
      const errorMessage = typeof error === 'string' ? error : (error.message || 'Tente novamente em alguns instantes.');
      toast.error('Falha ao enviar e-mail', {
        description: errorMessage
      });
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (userProfile) {
      // Notifications listener
      const notificationUserIds = [userProfile.uid];
      if (userProfile.role === 'admin' || userProfile.email === 'isacruimugabe@gmail.com') {
        notificationUserIds.push('admin');
      }

      const notificationsQ = query(
        collection(db, 'notifications'),
        where('userId', 'in', notificationUserIds)
      );

      const unsubscribeNotifications = onSnapshot(notificationsQ, (snapshot) => {
        const notificationsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as Notification[];
        setNotifications(notificationsData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      });

      return () => {
        unsubscribeNotifications();
      };
    }
  }, [userProfile]);

  if (!userProfile) return null;

  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'delivered': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    
    setIsUpdating(true);
    try {
      const userDocRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userDocRef, {
        displayName: editDisplayName,
        photoURL: editPhotoURL
      });
      toast.success('Perfil atualizado com sucesso!');
      setActiveTab('notifications');
    } catch (error) {
      console.error("Error updating profile:", error);
      handleFirestoreError(error, OperationType.UPDATE, `users/${userProfile.uid}`);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userProfile || !auth.currentUser) return;
    
    const confirmDelete = window.confirm('TEM CERTEZA? Esta ação é irreversível e todos os seus dados serão excluídos permanentemente.');
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      // 1. Delete Firestore document
      const userDocRef = doc(db, 'users', userProfile.uid);
      await deleteDoc(userDocRef);
      
      // 2. Delete Auth user
      await deleteUser(auth.currentUser);
      
      toast.success('Sua conta foi excluída com sucesso.');
      logout();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Ação sensível', {
          description: 'Por favor, saia e entre novamente para confirmar sua identidade antes de excluir a conta.'
        });
      } else {
        toast.error('Erro ao excluir conta');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Email Verification Warning - Only for users with email */}
      {auth.currentUser?.email && !isEmailVerified && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <Mail className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-orange-900 font-bold">Verifique seu e-mail</p>
              <p className="text-sm text-orange-700">Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada para desbloquear todos os recursos.</p>
            </div>
          </div>
          <button 
            onClick={handleResendVerification}
            disabled={isResending}
            className="px-6 py-3 bg-orange-600 text-white rounded-2xl text-sm font-bold hover:bg-orange-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isResending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Reenviar Link
          </button>
        </motion.div>
      )}

      {/* Profile Header */}
      <section className="relative bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <img 
              src={userProfile.photoURL} 
              alt={userProfile.displayName} 
              className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
            />
            <div className="absolute bottom-1 right-1 w-10 h-10 bg-green-600 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{userProfile.displayName}</h1>
              <div className="flex items-center gap-2 mx-auto md:mx-0">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {userProfile.role}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verificado
                </span>
              </div>
            </div>
            <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              {userProfile.email}
            </p>

            {(userProfile.role === 'admin' || userProfile.email === 'isacruimugabe@gmail.com') && (
              <div className="pt-4">
                <Link 
                  to="/portal-admin-secreto"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:-translate-y-1 active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  Publicar Novo Anúncio
                </Link>
              </div>
            )}
            
            <div className="flex items-center justify-center md:justify-start gap-8 pt-4">
              <div className="text-center md:text-left">
                <p className="text-2xl font-black text-gray-900">0</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avaliações</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200",
                activeTab === 'settings' ? "bg-green-600 text-white" : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              <Settings className="w-5 h-5" />
              Configurações
            </button>
            <button 
              onClick={logout}
              className="px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Menu / Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 px-2">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <button 
              onClick={() => setActiveTab('notifications')}
              className={cn(
                "p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-md bg-white group relative",
                activeTab === 'notifications' ? "ring-2 ring-purple-500" : ""
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-purple-50 text-purple-600")}>
                <Bell className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-gray-900">Notificações</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-4 right-4 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-md bg-white group",
                activeTab === 'settings' ? "ring-2 ring-orange-500" : ""
              )}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-orange-50 text-orange-600">
                <UserIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-xs text-gray-900">Dados Pessoais</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {activeTab === 'notifications' ? (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-lg font-bold text-gray-900">Notificações</h2>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => notifications.forEach(n => markNotificationAsRead(n.id))}
                      className="text-xs font-bold text-purple-600 hover:underline"
                    >
                      Marcar todas como lidas
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-white rounded-3xl border border-gray-100 animate-pulse"></div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <motion.div 
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "bg-white p-6 rounded-3xl border shadow-sm flex items-start gap-4 group transition-all",
                          notif.read ? "border-gray-100 opacity-75" : "border-purple-200 ring-1 ring-purple-100"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                          notif.type === 'message' ? "bg-blue-50 text-blue-600" : 
                          notif.type === 'order' ? "bg-green-50 text-green-600" : 
                          "bg-purple-50 text-purple-600"
                        )}>
                          {notif.type === 'message' ? <MessageCircle className="w-6 h-6" /> : 
                           notif.type === 'order' ? <Package className="w-6 h-6" /> : 
                           <Bell className="w-6 h-6" />}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {new Date(notif.createdAt).toLocaleDateString('pt-MZ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">{notif.message}</p>
                          
                          <div className="flex items-center gap-4 pt-2">
                            {!notif.read && (
                              <button 
                                onClick={() => markNotificationAsRead(notif.id)}
                                className="text-[10px] font-bold text-purple-600 uppercase tracking-widest hover:underline"
                              >
                                Marcar como lida
                              </button>
                            )}
                            <button 
                              onClick={() => deleteNotification(notif.id)}
                              className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-600 flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Excluir
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                      <Bell className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-900 font-bold">Nenhuma notificação</p>
                      <p className="text-sm text-gray-500">Você está em dia com todas as suas atividades.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight">Configurações do Perfil</h2>
                      <p className="text-sm text-gray-500 font-medium">Atualize suas informações pessoais.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Nome de Exibição</label>
                      <input 
                        type="text" 
                        required
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Seu nome"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">URL da Foto de Perfil</label>
                      <input 
                        type="url" 
                        required
                        value={editPhotoURL}
                        onChange={(e) => setEditPhotoURL(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="https://exemplo.com/foto.jpg"
                      />
                    </div>

                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={isUpdating}
                        className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isUpdating && <RefreshCw className="w-4 h-4 animate-spin" />}
                        Salvar Alterações
                      </button>
                    </div>
                  </form>

                  <div className="pt-8 border-t border-gray-100">
                    <div className="bg-red-50 p-6 rounded-3xl space-y-4">
                      <div className="flex items-center gap-3 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        <h3 className="font-bold">Zona de Perigo</h3>
                      </div>
                      <p className="text-sm text-red-700">Ao excluir sua conta, todos os seus dados, pedidos e mensagens serão removidos permanentemente. Esta ação não pode ser desfeita.</p>
                      <button 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="w-full py-3 bg-white text-red-600 border border-red-200 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        {isDeleting ? 'Excluindo...' : 'Excluir Minha Conta Permanentemente'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
