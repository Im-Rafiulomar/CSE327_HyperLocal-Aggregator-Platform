
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product, Seller } from "./mock-data";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
async function api<T>(path:string, init?:RequestInit):Promise<T>{
  const r=await fetch(`${API}${path}`,{...init,headers:{"Content-Type":"application/json",...(init?.headers||{})}});
  const body=await r.json().catch(()=>null); if(!r.ok) throw new Error(body?.message||"Backend request failed"); return body;
}
export type CartLine={productId:string;sellerId:string;qty:number};
export type Order={id:string;date:string;items:{productId:string;qty:number;price?:number;sellerId?:string}[];total:number;payment:string;status:number;seller:string;orderId?:string};
export type AppNotification={id:string;type:string;title:string;titleBn:string;time:string};
export type BackendUser={id:string;name:string;email:string;role:"customer"|"seller";coins:number;wishlist:string[];viewed:string[];phone?:string;area?:string};

type Store={
 products:Product[]; sellers:Seller[]; cart:CartLine[]; wishlist:string[]; orders:Order[]; notifications:AppNotification[]; coins:number; viewed:string[]; user:BackendUser|null; loading:boolean;
 addToCart:(productId:string,sellerId:string,qty?:number)=>void; setQty:(productId:string,qty:number)=>void; removeFromCart:(productId:string)=>void; clearCart:()=>void;
 toggleWishlist:(productId:string)=>void; placeOrder:(payment:string,total:number)=>Promise<string>; markViewed:(productId:string)=>void; pushNotification:(n:Omit<AppNotification,"id"|"time">)=>void; spendCoins:(n:number)=>boolean;
};
const Ctx=createContext<Store|null>(null);

export function StoreProvider({children}:{children:ReactNode}){
 const [products,setProducts]=useState<Product[]>([]),[sellers,setSellers]=useState<Seller[]>([]),[cart,setCart]=useState<CartLine[]>([]),[wishlist,setWishlist]=useState<string[]>([]),[orders,setOrders]=useState<Order[]>([]),[coins,setCoins]=useState(0),[viewed,setViewed]=useState<string[]>([]),[notifications,setNotifications]=useState<AppNotification[]>([]),[user,setUser]=useState<BackendUser|null>(null),[loading,setLoading]=useState(true);

 useEffect(()=>{Promise.all([api<{items:Product[]}>("/products"),api<Seller[]>("/sellers"),api<BackendUser>("/demo-user")]).then(async([p,s,u])=>{setProducts(p.items);setSellers(s);setUser(u);setWishlist(u.wishlist||[]);setViewed(u.viewed||[]);setCoins(u.coins||0);const c=await api<CartLine[]>(`/users/${u.id}/cart`);setCart(c);const o=await api<any[]>(`/users/${u.id}/orders`);setOrders(o.map(x=>({...x,id:x.orderId})));}).catch(console.error).finally(()=>setLoading(false));},[]);

 const syncCart=useCallback((next:CartLine[])=>{setCart(next);if(user)api(`/users/${user.id}/cart`,{method:"PUT",body:JSON.stringify({items:next})}).catch(console.error)},[user]);
 const addToCart=useCallback((productId:string,sellerId:string,qty=1)=>{const found=cart.find(x=>x.productId===productId);const next=found?cart.map(x=>x.productId===productId?{...x,qty:x.qty+qty,sellerId}:x):[...cart,{productId,sellerId,qty}];syncCart(next)},[cart,syncCart]);
 const setQty=useCallback((id:string,qty:number)=>syncCart(cart.map(x=>x.productId===id?{...x,qty}:x).filter(x=>x.qty>0)),[cart,syncCart]);
 const removeFromCart=useCallback((id:string)=>syncCart(cart.filter(x=>x.productId!==id)),[cart,syncCart]);
 const clearCart=useCallback(()=>syncCart([]),[syncCart]);
 const toggleWishlist=useCallback((id:string)=>{if(!user)return;api<{wishlist:string[]}>(`/users/${user.id}/wishlist`,{method:"POST",body:JSON.stringify({productId:id})}).then(r=>setWishlist(r.wishlist)).catch(console.error)},[user]);
 const markViewed=useCallback((id:string)=>{setViewed(v=>[id,...v.filter(x=>x!==id)].slice(0,8));if(user)api(`/users/${user.id}/viewed`,{method:"POST",body:JSON.stringify({productId:id})}).catch(console.error)},[user]);
 const pushNotification=useCallback((n:Omit<AppNotification,"id"|"time">)=>setNotifications(x=>[{...n,id:"n-"+Date.now(),time:"just now"},...x]),[]);
 const placeOrder=useCallback(async(payment:string,total:number)=>{if(!user)throw new Error("Demo user is not available.");const order=await api<any>("/orders",{method:"POST",body:JSON.stringify({userId:user.id,items:cart,total,payment,seller:cart[0]?.sellerId||"s1"})});setOrders(o=>[{...order,id:order.orderId},...o]);setCart([]);setCoins(c=>c+Math.round(total/50));pushNotification({type:"order",title:`Order #${order.orderId} confirmed`,titleBn:`অর্ডার #${order.orderId} নিশ্চিত`});return order.orderId},[user,cart,pushNotification]);
 const spendCoins=(n:number)=>{if(coins<n)return false;setCoins(c=>c-n);return true};
 const value=useMemo(()=>({products,sellers,cart,wishlist,orders,notifications,coins,viewed,user,loading,addToCart,setQty,removeFromCart,clearCart,toggleWishlist,placeOrder,markViewed,pushNotification,spendCoins}),[products,sellers,cart,wishlist,orders,notifications,coins,viewed,user,loading,addToCart,setQty,removeFromCart,clearCart,toggleWishlist,placeOrder,markViewed,pushNotification]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore(){const c=useContext(Ctx);if(!c)throw new Error("useStore must be used inside StoreProvider");return c}
export const cartTotal=(cart:CartLine[],products:Product[]=[])=>
 cart.reduce((sum,l)=>{const p=products.find(x=>x.id===l.productId);const o=p?.offers.find(x=>x.sellerId===l.sellerId)||p?.offers[0];return sum+(o?.price||0)*l.qty},0);
