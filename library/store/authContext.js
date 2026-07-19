"use client"

import { createContext } from "react"
import { auth } from "@/library/firebase/api"
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth"
import { useAuthState } from "react-firebase-hooks/auth"

// 1. Membuat context dengan nilai default
export const authContext = createContext({
    user: null,
    loading: false,
    googleLoginHandler: async () => {},
    logout: async () => {}
})

export default function AuthContextProvider({ children }) {
    // 2. Mengambil state login user saat ini menggunakan hooks
    const [user, loading] = useAuthState(auth)

    // 3. Inisialisasi Google Auth Provider (tanpa memasukkan argumen 'auth')
    const googleProvider = new GoogleAuthProvider()

    // 4. Fungsi untuk menangani login menggunakan Google Pop-up
    const googleLoginHandler = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            // Menangkap error jika user sengaja menutup/membatalkan pop-up login
            if (error.code === 'auth/popup-closed-by-user') {
                console.log("Login dibatalkan oleh pengguna (Pop-up ditutup).");
                return; // Keluar dengan aman tanpa melempar error runtime ke UI
            }
            
            // Melempar error selain pembatalan user (misal: masalah jaringan) agar bisa dilacak
            throw error;
        }
    }

    // 5. Fungsi untuk log out
    const logout = () => {
        signOut(auth);
    }

    // 6. Menyusun value yang akan disalurkan ke komponen anak (children)
    const values = {
        user, 
        loading,
        googleLoginHandler,
        logout
    }

    return (
        <authContext.Provider value={values}>
            {children}
        </authContext.Provider>
    )
}