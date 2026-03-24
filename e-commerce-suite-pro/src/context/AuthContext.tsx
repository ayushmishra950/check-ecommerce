// import React, { createContext, useContext, useState, useCallback } from 'react';
// import { User } from '@/types';

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Mock users for demo
// const mockUsers: Record<string, User & { password: string }> = {
//   'user@demo.com': {
//     id: '1',
//     name: 'John Customer',
//     email: 'user@demo.com',
//     role: 'user',
//     password: 'demo123'
//   },
//   'admin@demo.com': {
//     id: '2',
//     name: 'Sarah Admin',
//     email: 'admin@demo.com',
//     role: 'admin',
//     password: 'admin123'
//   },
//   'super@demo.com': {
//     id: '3',
//     name: 'Mike Superadmin',
//     email: 'super@demo.com',
//     role: 'superadmin',
//     password: 'super123'
//   }
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);

//   const login = useCallback(async (email: string, password: string): Promise<boolean> => {
//     const mockUser = mockUsers[email];
//     if (mockUser && mockUser.password === password) {
//       const { password: _, ...userWithoutPassword } = mockUser;
//       setUser(userWithoutPassword);
//       return true;
//     }
//     return false;
//   }, []);

//   const logout = useCallback(() => {
//     setUser(null);
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };











import React, { createContext, useContext, useState, useCallback } from 'react'
import { User } from '@/types'
import { loginUser } from "@/services/service"
import { useToast } from '@/hooks/use-toast'


type LoginResult = {
  success: boolean;
  user?: User;
  message?: string;
};
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage on initial load
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    let obj = { email, password }
    try {
      const response = await loginUser(obj);
      console.log(response)
      if (response.status === 200) {
        const { accessToken } = response.data
        localStorage.setItem('accessToken', accessToken)

        const userInfo: User = {
          id: response?.data?.admin?._id,
          name: response?.data?.admin?.name,
          email: response?.data?.admin?.email,
          role: response?.data?.admin?.role,
          shopId: response?.data?.admin?.shopId,
          createdBy: response?.data?.admin?.createdBy
        }
        setUser(userInfo)
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        toast({ title: "Welcome back!.", description: response?.data?.message });
        return { success: true, user: userInfo };
      }
      else {
        const msg = response?.data?.message || "Login failed";
        toast({ title: "Login Failed", description: msg, variant: "destructive" });
        return { success: false, message: msg };
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message || "Something went wrong";
      console.error("Login failed:", msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
      return { success: false, message: msg };
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken');
    window.location.href = "/login"
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
