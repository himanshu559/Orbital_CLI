
// "use client";

// import { Button } from "@/components/ui/button";
// import { Spinner } from "@/components/ui/spinner";
// import { authClient } from "@/lib/auth-client";
// import Image from "next/image";
// import { useRouter } from "next/navigation";


// export default function Home() {

//   const {data,isPending} = authClient.useSession();
//   const router = useRouter();

//   if(isPending){
//     return(
//       <div className="flex flex-col justify-center items-center h-screen">
//         <Spinner/>
//       </div>
//     )
//   }

//   if(!data?.session && !data?.user){
//     router.push("/sign-in");
//   }
//   return (
//     <div className="flex flex-col justify-center items-center min-h-screen bg-background font-sans">

//      <div className="w-full max-w-md px-4 ">
//       <div className="space-y-8">
//         {/* Profile HeaderCard */}
//         <div className="border-dashed border-zinc-700 border-2 rounded-2xl p-8 bg-zinc-900/50 backdrop-blur-sm">
//         {/* Avatar */}
//         <div className="flex justify-center mb-6">
//           <div className="relative">
//             <img src={data?.user?.image || "/vercel.svg"} alt={data?.user?.name || "User"} width={120} height={120} className="rounded-full border-2 border-dashed border-zinc-600 object-cover"/>
//             <div className="absolute -button-2 -right-2 w-6 h-6 bg-emerald-600 rounded-full border border-zinc-900"></div>

//           </div>

//         </div>
//         {/* User Info */}
//        <div className="space-y-3 text-center">
//         <h1 className="text-3xl font-bold text-zinc-50 truncate "> WelCome , {data?.user?.name || "User"}

//         </h1>
//         <p className="text-sm text-zinc-400">Authenticated user</p>
//        </div>
//         </div>
//         {/* user detail Card */}
//         <div className="border-2 border-dashed border-zinc-700 rounded-2xl bg-zinc-900/50 backdrop-blur-sm space-x-4"> 
//           <div className="space-y-4">
//             <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide ">Email Address
//             </p>
//             <p className="text-lg text-zinc-200 font-medium break-all">
//                 {data?.user?.email}
//               </p>
//           </div>
//         </div>
// {/* Sign Out Button */}
// <Button onClick={()=>{
//   authClient.signOut({
//     fetchOptions:{
//       onError:(ctx)=>console.log(ctx),
//       onSuccess:()=>{
//         router.push("/sign-in");
//       },
//     }
//   })
// }} className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">Sign-Out

// </Button>
//       </div>

//      </div>
//     </div>
//   );
// }

"use client";
import TextType from "@/components/TextType"
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  // ✅ FIX: Redirect inside useEffect, not during render
  useEffect(() => {
    if (!isPending && !data?.session && !data?.user) {
      router.push("/sign-in");
    }
  }, [data, isPending, router]);

  if (isPending) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Prevent flashing content before redirect
  if (!data?.session && !data?.user) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-background font-sans">
      <div className="w-full max-w-md px-4">
        <div className="space-y-8">

          <div className="border-dashed border-zinc-700 border-2 rounded-2xl p-8 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={data?.user?.image || "/vercel.svg"}
                  alt={data?.user?.name || "User"}
                  width={120}
                  height={120}
                  className="rounded-full border-2 border-dashed border-zinc-600 object-cover"
                />
                <div className="absolute -button-2 -right-2 w-6 h-6 bg-emerald-600 rounded-full border border-zinc-900"></div>
              </div>
            </div>

            <div className="space-y-3 text-center">
              {/* <h1 className="text-3xl font-bold text-zinc-50 truncate">
                Welcome, {data?.user?.name || "User"}
              </h1> */}
              <TextType 
  text={["Welcome",  data?.user?.name || "User"]}
  typingSpeed={75}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="|"
  variableSpeed={false}
  onSentenceComplete={() => {}}
/>
              <p className="text-sm text-zinc-400">Authenticated user</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-zinc-700 rounded-2xl bg-zinc-900/50 backdrop-blur-sm space-x-4">
            <div className="space-y-4 m-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Email Address
              </p>
              <p className="text-lg text-zinc-200 font-medium break-all">
                {data?.user?.email}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onError: (ctx) => console.log(ctx),
                  onSuccess: () => router.push("/sign-in"),
                },
              });
            }}
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Sign-Out
          </Button>

        </div>
      </div>
    </div>
  );
}
